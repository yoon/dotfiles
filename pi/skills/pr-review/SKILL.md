---
name: pr-review
description: Review PRs thoroughly and take a clear position. Use when the user asks to review PRs, find PRs to review, or work through a review queue.
---

# PR Review

> **Portable file — versioned in dotfiles, strictly employer-free.** Only portable review craft that holds at any employer/repo. No employer content: repo/org names, handles, roster, tool/service names, internal URLs/paths, product/project specifics, PR/issue numbers, session data — all live in the session context (§1). Unsure → treat as employer content, leave it out. Canonical: `AGENTS.md → IP boundary`.

Two phases: **selecting** which PR to review is employer-specific (team, ownership, priorities, search query) and lives entirely in the session context; **reviewing** one PR is the portable methodology below.

## 1. Load context first (every time)

Read `~/.local/recurring/pr-review/session-context.md` in full and follow it — it owns selection, repo/tooling/dev-env mechanics, employer-specific heuristics, and the PR log, and **overrides this skill wherever they conflict**.

## 2. Load the PR

- Fetch the description, diff, and existing reviews/comments in parallel.
- If the environment provides isolated worktrees, claim one before reading files or running anything, and start the dev env in the background — never block the review on it.
- (Worktree-isolation + dev-env bring-up mechanics: session context.)

## 3. Build the model before critiquing

Explain the diff first (background → intuition → what changed and why), then a **withheld-answer** quiz before forming a position (Understanding Pass, AGENTS.md). Model first, verdict second.

## 4. Investigate deeply

Don't just read the diff — verify it against the source:

- Read the full diff; verify every PR-description claim against the actual change (descriptions go stale).
- After a removal (flag/method/dep), grep for leftover references and stale artifacts: tests named for the old state, dead single-element loops, hardcoded true/false, stale observability tags, orphaned setup hooks.
- Cross-reference real source for existing patterns and sibling methods; look for duplicate or conflicting PRs.
- For perf PRs, check memoization correctness (`defined?` vs `||=` for nilables, idempotency of shared instances).
- Trace at least one detail through callers/callees by hand. Distinguish "sounds right" from "verified in source." Ask: sustainable fix, or band-aid?
- Prefer existing shared helpers over accepting copy-pasted ones.

## 5. Review heuristics

**Verification**
- Trace one layer deeper before asserting behavior; "I think" is a verification trigger, not a hedge.
- Trace the real resolver/lookup before claiming end-to-end correctness — don't assume a generated id resolves downstream.

**Freshness**
- Re-fetch diff/comments/HEAD before final copy; PRs move while you draft (force-pushes, bot comments).
- After a rebase, compare the PR-touched files between the approved SHA and HEAD, not main-to-main (a full compare buries the real diff under unrelated commits).
- Re-review only if the reviewed surface actually changed.

**Bots & AI**
- Bot/AI review comments may target a stale revision — confirm current HEAD still has the issue before relaying.
- AI/bot-authored PRs: read the linked issue/RCA and verify substance; authorship is neither good nor bad.

**Asks & nits**
- Request changes only with concrete evidence and an actionable fix path; prefer one load-bearing ask over many minor ones.
- Drop throughput-neutral nits (no effect on correctness, rollout, test signal, docs, or debugging) — signal rigor through high-value points, not volume.
- Grep for existing precedent in the same surface before asking for a new test type; zero precedent raises the bar.
- For procedural migrations (dependency managers, schema, codegen), load the relevant skill/checklist before reviewing — diff-reading alone misses config/pinning gaps.

**Recurring bug shapes**
- Cache/session keys must include every authorization dimension, or callers silently poison each other.
- Excluding one adjustment from a money pipeline: start from the existing semantic total and undo only that adjustment; don't rebuild from a lower subtotal (drops taxes/duties/returns).
- Normalize error shapes at the narrowest semantic boundary the contract needs; leave unrelated error paths alone.
- Setup/test macros may select a backend, not just grant access — trace both the enqueue and the read side.
- Rails `rescue_from` catches outside the `around_action` chain: tags set in a handler fire after the ensure block — keep error-path metrics inline or in a `before_action`.

## 6. Draft — the author submits, not the agent

- Draft the review, show it, and auto-copy it to the clipboard (`pbcopy`) without being asked.
- **Never submit, label, or resolve threads yourself.** Wait for explicit approval of both the action (approve / request-changes / comment) and the wording; the user runs the submit.
- Lead with what's good; separate blockers from nits.
- Inline comments: give `path:line`, one at a time. Don't hard-wrap prose — one physical line per paragraph or list item; let the host wrap.

## 7. Cleanup & tally

- Release any isolated worktree/environment when the user is done with the PR (mechanics: session context).
- Keep a running session tally: `| PR | Title | Action |`.

## Learning & promotion

Capture is employer-side by default: a mid-review lesson goes straight into the session context, raw with its evidence — don't edit this skill mid-review. Promote into this skill only as a separate, deliberate act: apply the guardrail above, restate as a general rule, and leave the dated evidence in the session-context log. Can't state it without employer content → not portable; it stays in the session context.
