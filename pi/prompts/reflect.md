---
description: Reflect on a past pi session — extract lessons, find where Mark can be cut out of the loop
argument-hint: "[session-id-or-path]"
---
Reflect on a pi session to make the next one faster, cheaper, and more autonomous.
This is a retrospective on **how Mark and the agent worked together**, not a redo of the task.

## 1. Load the session

Run the three session views and confirm they picked the intended file:

```bash
~/.local/bin/pi-reflect-stats "${1:-}"
~/.local/bin/pi-session-speed "${1:-}"       # ⚠ >5min = likely idle, not compute
~/.local/bin/pi-reflect-transcript "${1:-}"
```

Read the whole transcript. Do not skim — the lessons live in friction, corrections, and repeated instructions.

## 2. Analyze across these axes

Build on `~/.local/recurring/reflection/session-context.md`; don't re-derive known truths. Use stats for quantitative axes and the transcript for qualitative ones. Be specific — cite the turn or command, not "communication could improve."

- **Faster? (the headline lever.)** Round-trips dominate wall-clock. Check tool-calls-per-prompt (`pi-session-speed`): 10–23/prompt is the norm and mostly avoidable. Look for serial reads/greps that should've been one parallel turn or one shell call (`cat`/`rg`/`wg`), re-reading the same files, hunting for a file/diff that could've been primed up front, and `tool_errors`/redone work. Ignore idle time (⚠ turns) — that's Mark thinking, not the agent.
- **Terser?** Output length is the #2 driver and model-agnostic. Any wall-of-text, restated question, or preamble that violated terse-by-default? Cite it.
- **Thinking level right?** Only matters on reasoning-model turns (check `reasoning` tokens). High thinking on mechanical work = wasted latency. Reasoning tokens near 0 means it wasn't a factor.
- **Right model? (rarely the lever — de-emphasize.)** Model choice was measured at ~0 payoff for Mark's real work; don't chase it as a headline. Only flag the clear case: a reasoning model grinding through purely mechanical work where a fast model (`fireworks/glm-5.2`) would've done — note it for the retrospective model-timing habit, not as a fix to auto-route.
- **Cheaper?** Cost hotspots. Low `cache_read` ratio means context kept getting invalidated — why? Oversized context loads?
- **Context / skill / extension gap?** Did the agent lack a fact it had to be told, re-derive something, or get corrected on a convention? That's a candidate edit to an `AGENTS.md`, a `~/.local/**/session-context.md`, or a skill. Did a missing tool/command force manual toil (candidate extension or script)?
- **IP boundary.** Did this session produce portable, employer-free IP (prompt, script, extension, config) not yet in my dotfiles repo? If so, propose versioning it per the IP boundary in `AGENTS.md`.
- **Different choices by Mark?** Where did Mark's phrasing, ordering, or missing up-front context cost a detour? What one instruction, given at the start, would have saved the most?
- **Where can Mark be cut out of the loop?** The headline. List each point where the agent stopped for Mark. For each: was the stop *necessary* (an externally-visible action or a genuine judgment call per AGENTS.md) or *avoidable* (info the agent could have found, a decision it could have defaulted)? Avoidable stops are the automation backlog.

## 3. Output

Dense, skimmable, honest — apply the information-design skill. No filler, no praise padding.

1. **Scorecard** — one line each, ranked by lever: Round-trips · Terseness · Thinking · Autonomy · Cost (Model only if it clearly mattered), each with a 🟢/🟡/🔴 and a ≤10-word verdict.
2. **Top 3 lessons** — ranked by payoff. Each: what happened (cite the turn) → the fix.
3. **Concrete edits** — actual proposed diffs/additions to specific context files, skills, or scripts. Wait for approval before writing any of them (steering files are Mark's).
4. **Cut-out-of-loop list** — avoidable stops, each with the rule or default that would remove it.

End with the Understanding Pass quiz (2–3 questions) and the AI Confidence Score per Mark's AGENTS.md.
