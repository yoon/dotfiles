# Preflight — a HUD for PR review

A PR-review *mode*. Companion to your normal review flow (selection, worktree handling,
draft/submit, heuristics all still apply). Preflight only changes **how findings reach
Mark**: it enforces understanding-before-critique and withholds the anomaly layer until
Mark has built his own model.

Grounded in Geoffrey Litt, "Enough AI copilots! We need AI HUDs" (2025). A copilot yells
"bug on line 42" and hijacks attention before you know what the PR is. A HUD gives you
*senses* — you build understanding and notice problems yourself. Preflight's whole job is
to stop the agent front-loading conclusions.

## Activation

Trigger: Mark says `preflight <PR>` (or "review with preflight", "preflight this").
Absent that, use your normal review flow.

`preflight <PR> @2` (or "start at the walkthrough") opens directly in phase ② when Mark
already knows the context cold — skips the Context gate, keeps the rest.

Skip Preflight for trivial/mechanical PRs (flag removals, dep bumps, generated/bot churn)
— those go straight to the normal flow. Preflight is for detail-muscle PRs where building
the model is the point. If Mark says `skim`, collapse to one line per file and drop the
gates.

## The instrument line

Reprint this at the top of every turn while Preflight is active, so Mark always knows
where he is and — critically — that findings are still held:

```
✈ Preflight · #<pr> · phase <n>/3 <label> · <k> files · <q> open Qs · findings: <held | N ready>
```

`findings: held` in phases ① and ②. It flips to `findings: N ready` only when phase ③
opens. That visible "held" is the HUD discipline made legible.

## The three gates

The agent **stops at each gate** and does not advance — or reveal the next phase's
content — until Mark drives it. One phase per turn.

### ① Context — *why does this PR exist?*

- Reconstruct intent. Prefer the PR description, but when it's thin, stale, or absent,
  derive the "why" from the linked issue/RCA, commit messages, and the shape of the diff.
- Output: **≤3 sentences** of what this PR is actually about, plus a one-word description
  verdict — `matches` / `stale` / `thin` (reconstructed) — and the linked issue/incident
  if any.
- **Nothing about code structure, quality, or bugs.** Then stop at the gate.

### ② Walkthrough — *what changed and why?*

- Literate, ordered narration in sensible **reading order** (not file/alphabetical
  order). Explain each meaningful change and the reason for it. Cite `path:line` so Mark
  can look for himself — pointers, not conclusions.
- Build the model. Still **no evaluation.** If the agent notices a problem, it silently
  appends it to the findings buffer (increment the `findings` count shown as `held`) and
  keeps narrating neutrally. Do not hint, foreshadow, or use a leading tone.
- **Banned in phases ① and ②** (these are copilot tells): *bug, wrong, broken, missing,
  should, concern, issue, problem, careful, watch out, however, but note, red flag,*
  severity labels, and "⚠️"-style markers. If a sentence needs one of these, it belongs
  in the buffer, not on screen. Stop at the gate.

### Quiz gate (between ② and ③) — optional

**Off by default, offered at the boundary.** At the ②→③ gate (end of walkthrough, before the
anomaly layer), the agent adds a one-word nudge — e.g. `next` to see findings, or `quiz` first? —
so the check is always in view without being forced. Mark opts in with `quiz`; skip it
when he just wants the findings. When run, pose **2–3 questions** about the change (a traced detail, a
failure mode, a why-this-not-that). **Withhold the answers.** Mark answers first. If he
can't answer one, point him at the relevant `path:line` — a sense, not the answer — and
let him re-derive before the anomaly layer appears. This is the speed regulator; it
proves the model was built before the squigglies show up. (Same discipline as the
Understanding Pass in `~/.pi/agent/AGENTS.md`.)

### ③ Anomaly layer — *now* the squigglies

- Release the held findings as HUD coordinates, ranked, one per line:
  `path:line → neutral observation → what to check`.
- Deliver as things to *look at*, not verdicts to accept. No severity theater, no
  "you must." Mark forms the position — then hand off to the normal draft-review flow in
  your normal draft-review flow (draft → show → Mark approves → copy to clipboard; Mark
  submits, never the agent).
- Apply the existing heuristics here: verify runtime claims before listing them,
  throughput-neutral nits usually die, one load-bearing ask beats a long list.

## Interaction verbs (what Mark types)

- `next` — advance one gate.
- `hold` — stay in this phase; I'm not done understanding.
- `why` / `show me <X>` — drill into a detail without advancing.
- `back` — return to the previous phase.
- `quiz` — run the optional understanding check before phase ③.
- `findings` — force phase ③ open early. Mark's call to break the discipline, not the
  agent's.
- `skim` — abandon gates, one line per file (for a PR that turned out trivial).

## Why gates, not a wall of output

The failure Preflight fixes: the agent dumps context + walkthrough + bugs in one turn, so
Mark reads the bugs first and never builds an independent model. Gating forces the
sequence and the `held` counter makes the withholding trustworthy — Mark can see findings
exist without seeing them, and chooses when to look.

## Later upgrade (not yet)

If the text instrument line proves too weak, promote it to a real pi TUI widget /
extension (persistent status region instead of a reprinted line). Ship the prompt version
first; build the extension only if this falls short.
