import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { appendFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

// speed — make replies faster, MEASURABLY, with a gear-shift feel.
//
// Gears:  HOME = whatever you launched with (your cruising gear; no "strong" assumption).
//   simple prompt   → DOWNSHIFT: fast model + low thinking + terse reply
//   complex prompt  → UPSHIFT:   strong model + high thinking
//   neutral/unknown → return to HOME
//
// Tiers are cost-ranked from your AUTHED models (no hand-maintained list):
//   strong = priciest reasoning-capable, fast = ~PCT percentile. Self-updating.
// Meter logs TTFT + total + tokens per turn to JSONL (mode on/off) so we can prove it.

const LOG_DIR = join(homedir(), ".local", "state", "pi-speed");
const LOG = join(LOG_DIR, "metrics.jsonl");
// Your named tier anchors, resolved against the LIVE authed registry (no hardcoded
// provider strings; graceful fallback). strong = deep reasoning, fast = fast coding.
// `avoid` drops the flex tier (cheaper but SLOWER — wrong for a fast gear).
// `prefer` picks a provider when a model id is served by several; else cheapest wins.
// `prefer` lists provider names from YOUR authed registry, cheapest-first tiebreak.
// Set these to whatever your `--models` shows; the examples below are generic.
const STRONG_SPEC = { id: /claude-opus-4-8/, prefer: ["anthropic"] as string[], avoid: undefined as RegExp | undefined };
const FAST_SPEC = { id: /glm-5\.2|gpt-5\.(5|6)/, prefer: ["fireworks", "openai", "openai-1m"] as string[], avoid: /flex/ };

const TERSE =
  "\n\nFAST MODE this turn: lead with the answer, no preamble, no restating the question. " +
  "Skip the Understanding-Pass quiz, the AI Confidence Score, and the 'What I might be wrong about' section. " +
  "Shortest reply that fully answers. Fewest tool calls; batch independent ones.";

type Band = "simple" | "complex" | "offer" | "neutral";
const COMPLEX = /\b(review|design|architect|debug|root.?cause|trace|refactor|analy[sz]e|compare|plan|why does|race condition|security|trade.?off)\b/i;
const SIMPLE = /^\s*(what|where|which|list|show|print|how many|is |are |does )|(\brename\b|\btypo\b|\bformat\b|\blint\b|\bbump\b|\brun (the )?tests?\b|\bgit (status|log|diff)\b)/i;

export function band(prompt: string): Band {
  const p = prompt.trim();
  if (COMPLEX.test(p)) return "complex";
  if (SIMPLE.test(p) && p.length < 140) return "simple";
  if (p.length < 90) return "offer";
  return "neutral";
}

const cost = (m: any) => m?.cost?.output ?? 0;
const same = (a: any, b: any) => a && b && a.provider === b.provider && a.id === b.id;

export default function (pi: ExtensionAPI) {
  let enabled = true;
  let fast: any = null, strong: any = null;
  let homeModel: any = null, homeThinking: string | null = null;
  const recent: any[] = [];

  // per-turn
  let t0 = 0, ttft = 0, outTok = 0, reasonTok = 0, active = false;
  let turnMode = "off", turnBand: Band = "neutral", turnModel = "", turnThinking = "", turnPrompt = "";

  try { mkdirSync(LOG_DIR, { recursive: true }); } catch {}

  function pickTier(ctx: any, spec: { id: RegExp; prefer: string[]; avoid?: RegExp }) {
    let ms = ctx.modelRegistry.getAvailable().filter((m: any) => spec.id.test(m.id));
    if (spec.avoid) ms = ms.filter((m: any) => !spec.avoid!.test(m.provider));
    if (!ms.length) return undefined;
    for (const p of spec.prefer) {                    // narrow to a preferred provider if present
      const inProv = ms.filter((m: any) => m.provider === p);
      if (inProv.length) { ms = inProv; break; }
    }
    return ms.sort((a: any, b: any) => cost(a) - cost(b))[0]; // cheapest within the chosen set
  }

  function resolveTiers(ctx: any) {
    if (fast && strong) return;
    fast = pickTier(ctx, FAST_SPEC);
    strong = pickTier(ctx, STRONG_SPEC);
  }

  function captureHome(ctx: any) {
    if (!homeModel && ctx.model) homeModel = ctx.model;
    if (homeThinking === null) homeThinking = pi.getThinkingLevel();
  }

  async function shiftTo(ctx: any, target: any, think: string, label: string) {
    if (target && ctx.model && !same(target, ctx.model)) {
      const arrow = cost(target) < cost(ctx.model) ? "⬇ downshift" : "⬆ upshift";
      const ok = await pi.setModel(target);
      if (ok) ctx.ui.notify(`${arrow} → ${target.id} (${label})`, "info");
    }
    pi.setThinkingLevel(think as any);
    turnThinking = think;
    turnModel = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "unknown";
    ctx.ui.setStatus("speed", `⚙ ${label}·${think}·${(ctx.model?.id ?? "?")}`);
  }

  pi.registerCommand("speed", {
    description: "Speed meter: on | off | (no arg → recent turns)",
    handler: async (args, ctx) => {
      const a = args.trim();
      if (a === "on") { enabled = true; ctx.ui.notify("speed: on", "info"); return; }
      if (a === "off") { enabled = false; ctx.ui.setStatus("speed", undefined); ctx.ui.notify("speed: off (meter only)", "info"); return; }
      if (!recent.length) { ctx.ui.notify("speed: no turns yet", "info"); return; }
      ctx.ui.notify("recent:\n" + recent.slice(-10).map((r) =>
        `${r.mode}/${r.band} ttft=${r.ttft_ms}ms total=${(r.total_ms/1000).toFixed(1)}s out=${r.out_tok} ${r.thinking} ${r.model.split("/").pop()}`
      ).join("\n"), "info");
    },
  });

  pi.on("session_start", async (_e, ctx) => { captureHome(ctx); resolveTiers(ctx); });

  function finalize() {
    if (!active) return;
    active = false;
    const rec = {
      ts: new Date().toISOString(), mode: turnMode, band: turnBand, prompt: turnPrompt,
      model: turnModel, thinking: turnThinking, ttft_ms: ttft, total_ms: Date.now() - t0,
      out_tok: outTok, reason_tok: reasonTok,
      tps: outTok ? +(outTok / ((Date.now() - t0) / 1000)).toFixed(1) : 0,
    };
    recent.push(rec);
    try { appendFileSync(LOG, JSON.stringify(rec) + "\n"); } catch {}
  }

  pi.on("before_agent_start", async (event, ctx) => {
    finalize(); // flush any prior turn whose agent_settled never fired (drop-proof)
    captureHome(ctx); resolveTiers(ctx);
    turnMode = enabled ? "on" : "off";
    turnPrompt = (event.prompt ?? "").replace(/\s+/g, " ").slice(0, 60);
    let inject: any = undefined;

    if (!enabled) {
      turnBand = "neutral";
      turnModel = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "unknown";
      turnThinking = pi.getThinkingLevel();
    } else {
      turnBand = band(event.prompt ?? "");
      if (turnBand === "offer") {
        turnBand = (await ctx.ui.confirm("Quick mode?", "Looks quick — faster, shorter reply?")) ? "simple" : "neutral";
      }
      if (turnBand === "simple") { await shiftTo(ctx, fast, "low", "fast"); inject = { systemPrompt: event.systemPrompt + TERSE }; }
      else if (turnBand === "complex") { await shiftTo(ctx, strong, "medium", "strong"); }
      else { await shiftTo(ctx, homeModel, homeThinking ?? pi.getThinkingLevel(), "home"); }
    }

    // Anchor the meter AFTER shifts/confirm so we measure model latency, not human/dialog time.
    t0 = Date.now(); ttft = 0; outTok = 0; reasonTok = 0; active = true;
    return inject;
  });

  pi.on("message_update", async () => { if (active && ttft === 0) ttft = Date.now() - t0; });

  pi.on("message_end", async (event: any) => {
    const u = event?.message?.usage;
    if (u) { outTok += u.output ?? 0; reasonTok += u.reasoning ?? 0; }
  });

  pi.on("agent_settled", async () => finalize());
  pi.on("session_shutdown", async () => finalize()); // flush the last turn on exit
}
