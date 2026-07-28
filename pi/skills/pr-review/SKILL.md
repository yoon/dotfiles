---
name: pr-review
description: Review PRs thoroughly and take a clear position. Use when the user asks to review PRs, find PRs to review, or work through a review queue.
---

# PR Review

Portable review craft only. Employer/team/repo selection, tooling, logs, and domain heuristics live in `~/.local/recurring/pr-review/session-context.md`, which overrides this skill.

## 1. Load context

Read `~/.local/recurring/pr-review/session-context.md` first.

## 2. Load the PR

- Claim any isolated worktree before reading files.
- Fetch description, diff, comments/reviews, and CI in parallel.
- Re-fetch HEAD before final copy; active PRs move.

## 3. Overview, quiz, then findings

Hold findings until Mark has built his own model — front-loading "bug on line 42" hijacks attention before he knows what the PR is (Litt, "AI HUDs"). Run in order; don't reveal the next phase until Mark drives it:

1. **Overview** — reconstruct why the PR exists (≤3 sentences) plus a `matches`/`stale`/`thin` verdict on the description, then background → intuition → what changed → why in reading order, citing `path:line` as pointers not conclusions. No evaluation; silently buffer anything you notice. Banned here: *bug, wrong, broken, missing, should, concern, issue, careful* and severity markers.
2. **Quiz** — for non-trivial changes, ask 2–3 withheld-answer questions (a traced detail, a failure mode, a why-this-not-that). Mark answers first; if he can't, point him at the `path:line` to re-derive. Proves the model was built before findings appear.
3. **Findings** — release the buffered findings as ranked HUD coordinates, one per line: `path:line → neutral observation → what to check`. Things to look at, not verdicts to accept. Then hand to §6.

Skip the gates for trivial/mechanical PRs (flag removals, dep bumps, bot churn) — go straight to §6.

## 4. Verify, don't infer

- Verify every PR-description claim against the diff.
- Trace at least one detail through callers/callees by hand.
- Cross-check existing patterns/helpers before asking for new code.
- For removals, grep leftovers: references, tests, generated artifacts, stale docs, stale recordings.
- For perf/cache claims, prove the primitive in the smallest runnable setup; test cold and warm paths.
- For macro/helper behavior, trace the expansion/initializer before judging coverage.
- For procedural migrations, load the relevant checklist/skill; diff-reading alone misses config and generated edges.

## 5. Heuristics

**Freshness**
- Re-review only if the reviewed surface changed; “PR updated” can be CI/bot churn.
- After rebase, compare PR-touched files between reviewed SHA and HEAD, not main-to-main.
- On re-review, check whether prior substantive feedback landed in code, tests, or merge-facing docs.

**Bots/AI**
- Confirm bot comments apply to current HEAD before relaying.
- Verify bot regression claims against the actual behavior delta; same contract shape may mean no new risk.
- Bot authorship is neutral: verify substance.

**Asks**
- Prefer one load-bearing ask over many nits.
- Drop throughput-neutral nits.
- Ask for tests only after checking local precedent.
- Re-derive style/default nits against local conventions and data flow.

**Bug shapes**
Check the common failure class: identity dimensions (cache/session/storage/auth), semantic totals (money), narrow error boundaries, macro writer+reader sides, complete flag cleanup, and executable generated/deprecation recordings.

## 6. Draft

- Verdict and review body are one deliverable; don't state approve/block without copy-ready text.
- Always show the PR's GitHub URL in the chat output, even if the copied review body doesn't include it.
- Show the draft and copy it locally; the human submits externally visible actions unless explicitly told otherwise.
- Give inline comments as `path:line`, one at a time.
- Don't hard-wrap prose; let the host wrap.

## 7. Finish

- Record the session tally/log per local context.
- Free isolated worktrees only after the user is done.

## Learning

Promote only employer-free, durable review craft here. Keep employer/domain lessons in local context. Unsure → keep local.
