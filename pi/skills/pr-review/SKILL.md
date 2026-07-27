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

## 3. Build the model before critique

Explain the change first: background → intuition → what changed → why. Then ask a withheld-answer quiz before verdict when the change is non-trivial.

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
- Cache/session/storage keys need every caller/security dimension; cleanup must not broaden key selection.
- Money pipelines: start from the semantic final total and undo one adjustment; don't rebuild from a lower subtotal.
- Normalize errors at the narrowest semantic boundary; test multi-error bundles.
- Test macros may select infrastructure, not just grant access; trace writer and reader sides.
- Feature-gate cleanup: prove the gate exists in production, the kept branch is complete, and removed wrappers carried no public contract bits.
- Authorization/resource checks need selector + grant/scope + exact resource id at enforcement.
- Generated/deprecation recordings are executable expectations; update siblings whose emission source is gone.

## 6. Draft

- Verdict and review body are one deliverable; don't state approve/block without copy-ready text.
- Show the draft and copy it locally; the human submits externally visible actions unless explicitly told otherwise.
- Give inline comments as `path:line`, one at a time.
- Don't hard-wrap prose; let the host wrap.

## 7. Finish

- Record the session tally/log per local context.
- Free isolated worktrees only after the user is done.

## Learning

Promote only employer-free, durable review craft here. Keep employer/domain lessons in local context. Unsure → keep local.
