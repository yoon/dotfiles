# Working with coding agents — portable principles

Hard-won, *measured* lessons for making agent sessions faster, cheaper, and more
autonomous. Portable — no employer content. (A machine-local reflection context carries
the environment-specific ledger and open threads; this is the transferable core.)

## What drives wall-clock (ranked by evidence from real deep-work sessions)

1. **Tool round-trips dominate.** Each tool call is a serial round-trip (emit → run →
   read result → continue) — measured 10–23 per prompt, mostly `read`/`bash`. This dwarfs
   every other cost. Levers: parallel tool calls in one turn, shell consolidation
   (`cat`/`rg` in one `bash`), prime context up front so the model doesn't hunt.
2. **Output length.** Terser replies = a big, model-agnostic win on every turn.
3. **Thinking level.** Costs time via hidden reasoning tokens *before* the answer — but
   only on reasoning-model turns. Lower it where deep analysis isn't needed; *displaying*
   thinking is ~free.
4. **Model choice — rarely the lever.** Verified against real work; near-zero payoff.

**Two clocks:** optimize *wall-clock-to-done* (thinking + retries + round-trips + idle),
not per-token throughput. A weaker/cheaper model is faster per token but slower *to done*
if it loops.

## Methodology lessons

- **Measure against real sessions, not toy prompts.** A toy A/B showed 2–8× from auto
  model-switching; on real deep work the downshiftable turns were <1% of time. The
  benchmark lied — the meta-lesson is to measure the *right* thing.
- **Prompt text ≠ task weight.** Short prompts ("try again", "publish the PR") launch deep
  multi-tool work. A prompt-text classifier can't predict work weight — auto-routing on it
  is brittle.
- **Naive wall-clock includes idle/human time** (one "try again" turn spanned 111 min
  idle). Filter or cap before trusting duration numbers.
- **Check for a built-in before building** (laziness rung 1). Time was lost building a
  model multi-select before discovering the harness already shipped one. Grep the
  harness's slash-command list *before* writing an extension.
- **Anchor, don't enumerate.** Resolve named tier anchors (a fast model, a strong model)
  against the live model registry at runtime; never hardcode model lists or cost-rank
  across all providers — "authed" ≠ "callable" (exotic models crash).

## Portable tooling (versioned alongside this note)

- `/reflect` prompt (`pi/prompts/reflect.md`) — retro on how the human and agent worked.
- `pi/bin/pi-reflect-stats` — quantitative pass (models, cost, tool counts, cache ratio).
- `pi/bin/pi-session-speed` — per-turn time/tokens/model; `⚠` flags >5 min turns (likely
  idle). No extension needed.
