import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

// route-model — suggest/switch model based on the prompt you type.
// Rules are cheap and local (no classifier LLM call — that would slow every turn).
// Edit TIERS and RULES to taste. `/route` cycles off | offer | auto at runtime.

type Tier = "fast" | "strong";

// Which concrete model each tier maps to. Both on `anthropic` so the API key
// that's already present covers them. Change to your preferred pair.
const TIERS: Record<Tier, { provider: string; id: string }> = {
  fast: { provider: "anthropic", id: "claude-haiku-4-5" },
  strong: { provider: "anthropic", id: "claude-opus-4-8" },
};

// id substrings → current tier, so we can tell if a switch is even needed.
const FAST_IDS = ["haiku", "flash", "lite", "mini", "8b", "instant"];
const STRONG_IDS = ["opus", "gpt-5", "sonnet-5", "-pro", "gemini-3"];

// First matching rule wins. Reasoning-heavy checked before mechanical so
// "explain the rename" routes strong, not fast.
const RULES: { test: RegExp; tier: Tier; why: string }[] = [
  { test: /\b(review|design|architect|root.?cause|debug|why\b|trade.?off|refactor|security|race condition|reason about|figure out|explain)\b/i, tier: "strong", why: "reasoning-heavy" },
  { test: /\b(rename|typo|reword|reformat|format|lint|bump|changelog|add a (log|comment)|run (the )?tests?|git (status|commit|push)|stage|boilerplate)\b/i, tier: "fast", why: "mechanical" },
];

// Pure + exported so it can be unit-tested without a live pi. See the .test.mjs.
export function classify(prompt: string): { tier: Tier; why: string } | null {
  for (const r of RULES) if (r.test.test(prompt)) return { tier: r.tier, why: r.why };
  return null;
}

function currentTier(id: string): Tier | null {
  if (FAST_IDS.some((s) => id.includes(s))) return "fast";
  if (STRONG_IDS.some((s) => id.includes(s))) return "strong";
  return null; // unknown → don't touch it
}

export default function (pi: ExtensionAPI) {
  // Policy: auto-UPSHIFT (fast→strong, silent) so hard prompts never run weak;
  // OFFER-DOWNSHIFT (strong→fast, confirm) so we never silently drop to a weak
  // model on work you thought was hard. Verified: setModel here hits THIS turn.
  let enabled = true;

  pi.registerCommand("route", {
    description: "Toggle prompt-based model routing (on | off; no arg → show)",
    handler: async (args, ctx) => {
      const a = args.trim();
      if (a === "on") enabled = true;
      else if (a === "off") enabled = false;
      ctx.ui.notify(`route-model: ${enabled ? "on" : "off"}`, "info");
    },
  });

  pi.on("before_agent_start", async (event, ctx) => {
    if (!enabled) return;
    const hit = classify(event.prompt ?? "");
    if (!hit) return;

    const cur = ctx.model; // { provider, id }
    const from = cur ? currentTier(cur.id) : null;
    if (!from || from === hit.tier) return; // unknown model, or already right tier

    const target = TIERS[hit.tier];
    const model = ctx.modelRegistry.find(target.provider, target.id);
    if (!model) return; // model not configured; stay put
    const label = `${target.provider}/${target.id}`;

    // Downshift (strong→fast) needs consent; upshift (fast→strong) is automatic.
    if (hit.tier === "fast") {
      const ok = await ctx.ui.confirm(
        "Downshift to fast model?",
        `Prompt looks ${hit.why}. Drop to ${label} for this turn?`,
      );
      if (!ok) return;
    }
    const success = await pi.setModel(model);
    const verb = hit.tier === "strong" ? "upshift" : "downshift";
    ctx.ui.notify(
      success ? `route-model ${verb} → ${label} (${hit.why})` : `route-model: no API key for ${label}`,
      success ? "info" : "error",
    );
  });
}
