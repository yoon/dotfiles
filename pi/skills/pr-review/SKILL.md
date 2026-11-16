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
- Batch the initial evidence sweep: fetch PR metadata, comments/reviews, CI, full diff, changed-file instructions, direct callers, adapters, and relevant tests in parallel.
- For non-World repositories, make the first checkout sweep collect repository instructions, package/CI scripts, changed source, direct callers, and relevant tests. Run only repository-declared validation; do not invent typecheck or lint commands.
- For type, value-object, or polymorphic-context migrations, search every production consumer of the changed field/key and verify each downstream input contract before the first verdict. Treat incident call sites as examples, not scope.
- Re-read source only when HEAD changed or the first pass left a named uncertainty.
- Before presenting findings, refresh HEAD, comments, and CI, then adversarially recheck signatures and error contracts.

## 3. Verify, don't infer

- Verify every PR-description claim against the diff.
- Trace at least one detail through callers/callees by hand.
- Cross-check existing patterns/helpers before asking for new code.
- For removals, grep leftovers: references, tests, generated artifacts, stale docs, stale recordings.
- For perf/cache claims, prove the primitive in the smallest runnable setup; test cold and warm paths.
- For macro/helper behavior, trace the expansion/initializer before judging coverage.
- For procedural migrations, load the relevant checklist/skill; diff-reading alone misses config and generated edges.

### Blocker proof gate

Before surfacing or drafting a blocking finding, verify:

1. **Trigger** — the suspected failure can occur through the actual implementation.
2. **Propagation** — trace every adapter, Result conversion, rescue, and fallback. Read each hop's entire enclosing method, never from a line offset; a guard one line above the call site voids the finding.
3. **Impact** — identify the concrete caller-visible or user-visible consequence.

When asked to fix a finding, write the failing test first. If it passes, retract before any environment setup.

An unverified link is an investigation task, not a finding.

## 4. Heuristics

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
- Apply a hassle gate before drafting: only ask for work that materially increases correctness confidence. A true observation with no worthwhile action is not a review comment.
- Ask for tests only after checking local precedent.
- Re-derive style/default nits against local conventions and data flow.

**Bug shapes**
Check the common failure class: identity dimensions (cache/session/storage/auth), semantic totals (money), narrow error boundaries, macro writer+reader sides, complete flag cleanup, and executable generated/deprecation recordings.

## Self-authored PRs

Deliver preflight findings directly. Each status turn re-fetches the remote tip, all comments (including replies), reviews, and CI before answering.

## 5. Overview and findings

Build the user's mental model without gating the review behind a quiz. Deliver the overview, findings, and verdict in the same response once verification is complete.

Start with the GitHub PR URL as a link. Explain why the PR exists (≤3 sentences), assess the description as `matches`/`stale`/`thin`, then give a short background → intuition → what changed → why explanation with `path:line` pointers. Follow immediately with the findings and verdict.

For trivial/mechanical PRs (flag removals, dep bumps, bot churn, and display-only refactors that leave execution/results unchanged with focused boundary coverage), skip the walkthrough and go straight to the verdict.

Follow the global self-coaching cadence for a separate learning question. Never withhold findings or verdicts for an answer. A dedicated quiz is opt-in.

## 6. Verdict and draft

- Do not draft copy-ready review comments until the verdict is stable and the blocker proof gate is complete.
- Present verified findings as a ranked list, most load-bearing first, one per line: `path:line → neutral observation → what to check`. Coordinates to look at, not verdicts to accept.
- Give the verdict (approve / request changes / comment), suggestions, and copy-ready review body. If the Overview was skipped, open with the PR's GitHub URL and a one-line recap so the reply still leads with the link and context.
- Show the draft and copy it locally, then stop. Don't offer to submit; submit only when explicitly asked.
- Don't hard-wrap prose; let the host wrap.
- Give inline comments as `path:line`, one at a time.

## 7. Finish

- When the user signals they submitted/approved, first verify that their approval exists on the current HEAD. Only then auto-run both finish steps in the same turn without asking: record the log, then free the isolated worktree. If verification fails, retain the worktree and distinguish an approved verdict from a submitted approval. The user can suppress either per-review; absent that, both are automatic. (Log location/format and worktree tooling per local context.)
- Temporary-checkout cleanup must be idempotent: an absent path is already clean and must not fail logging or completion.

## Learning

Promote only employer-free, durable review craft here. Keep employer/domain lessons in local context. Unsure → keep local.
