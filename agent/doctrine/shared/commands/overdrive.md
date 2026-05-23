Attack technical debt and harden the existing codebase without refactoring anything that works.

Usage: /overdrive [optional area or focus, e.g. "tests" or "the cinema engine"]

## Mandate

The operator said /overdrive. They are Inigo Montoya. The six-fingered man is technical debt, half-baked features, soft spots, and Boy Scout misses. Your job is to find him and finish him.

The point of this command is NOT to ship new features. It is to make the existing code worthier of the features already in it. Half-implemented flags get finished. Tests that don't actually test get rewritten. Cleanup gaps get closed. Soft spots get hardened. Documentation drifts get reconciled.

Hard limits — these are bright red lines:
- NO architectural refactors. NO breaking contracts. NO ripping out working code. If you find yourself wanting to do a "while we're here" rewrite, stop and ask the operator first.
- Additive only. Where behavior changes, gate it behind a feature flag, defaults OFF, existing path byte-identical.
- Existing tests must stay green at every commit. Not just at the end — at every commit.
- No silent dependency upgrades. No package additions without a reason that fits in one sentence.
- Do not improve aesthetics, copy, or UI styling unless the operator's `/overdrive $ARGUMENTS` explicitly names that area.

## The quality bar

The operator's distribution-2026 framing applies: every change you make should survive a partner CISO review and a live demo without anything embarrassing happening.

When you produce your prioritized fix list (step 4 below), it must look like a real engineer's audit, not a generic checklist. Specifics over vibes. Bad: "improve test coverage." Good: "DocumentVault.RetentionStatus clamps DaysRemaining to ≥ 0, which means any caller relying on the negative-remaining sentinel is silently broken; one caller already shipped with this bug. Fix: stop clamping; update the one call site that misread the contract; add a regression test that pins the negative case."

If you cannot ground a fix in a specific file/line/symptom, it does not belong on the list.

## Procedure

### 1. Orient

Inside the repo root. Run in parallel:
- `git rev-parse --show-toplevel` (confirm a repo; stop if not)
- `git log --oneline -20` (recent shipping rhythm)
- `git status --porcelain` (any uncommitted work — if so, stop and ask the operator what they want done with it)
- `ls` of the root, then **read `ONBOARDING.md` first** (it's the front door — if it exists it tells you the doctrine bootstrap, the test command, the deploy contract, the RegressionTestCount convention if any). Also read every other top-level `*.md` (README, RUBRIC, TECHNICAL-STATUS, CONTRIBUTING, etc.) plus any `docs/` directory index.

If the repo's `ONBOARDING.md` or `CLAUDE.md` says to run a doctrine bootstrap (e.g. the `curl` against the compose Function URL), do that before going further. Standing rules apply throughout.

### 2. Read the actual code

Identify the entry points and read them — not skim, READ. For a web app: the main server file, the main client/engine file, the test harness. For a library: the public API surface and the test fixtures. List the files you read in your eventual report so the operator can verify you didn't shortcut this.

### 3. Use the deployed thing if one exists

If the repo has a live deployment (look for `deploy.sh`, `mullmania.site.json`, an `asset-version.json` link, a frontdoor URL), open it. For visual products (cinema viewers, dashboards, demo sites): open the live site in a real browser at full screen and actually watch it / click through it. Do NOT trust headless preview rendering as a substitute for visual verification — preview tools commonly run at degenerate viewport sizes and lie about what the operator sees.

For API-shaped products: hit the live endpoints with curl and compare against the OpenAPI/snapshot contracts. Look for drift between deployed snapshots and the local source of truth.

### 4. Find the six-fingered man

Enumerate the technical debt. Be specific. Categories to sweep, in priority order:

- **Half-baked features**: feature flags that are wired in but unfinished, endpoints that return shapes nothing consumes, TODO/FIXME with a real claim attached, dead branches that look load-bearing.
- **Soft spots**: missing tests for code paths that exist, tests that "pass" without exercising the behavior (assertion-free, mocked-too-deep, only-happy-path), error paths with no test coverage, race conditions in background services, cleanup gaps in tests that leak state between runs.
- **Contract drift**: deployed JSON snapshots that no longer match the live API, constants that lag the truth they're supposed to mirror, OpenAPI routes that exist in code but not in the doc (or vice versa).
- **Hardening**: input validation gaps, unbounded growth in caches/queues, error responses that leak internal detail, side effects that aren't idempotent where they need to be.
- **Boy Scout**: stale doc files, broken README links, dead config knobs, comments that lie about current behavior, dependency versions that are mid-major behind for no reason.
- **Change-amenability**: places where the next feature is going to land that currently lack a seam (hardcoded paths, baked-in env assumptions, mixed responsibility classes that would split cleanly).

For each candidate, capture: the file/line, the specific symptom, the proposed fix in one sentence, the estimated blast radius (does it touch one file or twenty?).

### 5. Confirm or refute the operator's last known complaint

If the operator gave a focus argument (`/overdrive <something>`), or if `git log` shows a recent retro / commit message / TODO complaining about something, confirm or refute it with what you actually observe. Quote the operator's words verbatim in your report; do not paraphrase a complaint.

### 6. Prioritize before you execute

Produce the ordered fix list — **3 to 5 items, no more**. Highest impact first. Roughly: hardening that prevents an embarrassing demo failure > contract drift that breaks partner integrations > soft spots that already shipped > Boy Scout polish > change-amenability.

3-5 is a real cap, not a suggestion. A focused, deep audit beats a sprawling one. If you have more than 5 candidates, the extras go into a deferred list at the end of the report; they do not get shipped this turn.

Show the list to the operator if you want, OR proceed straight into shipping. The operator pre-authorized "just do it" with this command. Use judgment: if any item has blast radius beyond one or two files, name it and ask before doing it.

### 7. Execute as chapters — exponential

Each fix ships as its own chapter. Use `mcp__ccd_session__mark_chapter` to mark the boundary so the operator can navigate them.

Per chapter:
- Make the change.
- Add or extend tests that pin the fix (the test should fail without your code change — verify by reverting the code change, watching the test go red, then putting the change back).
- Run the full test suite locally. If the repo's convention is multi-pass stability runs (e.g. 3x or 5x for flake detection), do them.
- If the repo tracks a `RegressionTestCount` constant (project-and / wealthops-style drift detector), bump it to match the new test count. Some repos enforce this at build time — running the suite will tell you.
- If the repo ships to a deployed snapshot (deployed JSON, baseline fixtures, golden screenshots), refresh the snapshot and verify the diff is the intended one.
- Commit with a specific message that names what hardened. Push.
- If the repo has a deploy contract, deploy and live-verify on the deployed URL — not just localhost.

**Exponential, not linear.** After chapter N lands, the *whole* suite runs again before chapter N+1 starts. That means chapter 3 catches regressions chapters 1 and 2 may have introduced; chapter 5 catches regressions from 1..4. The cost grows but so does the safety net — that's the point. Green at every commit is non-negotiable.

### 8. Cross-cutting verification

After all chapters land, run the full suite at least 3x for stability. If multiple changes touched independent flags or subsystems, run once more with everything new turned on simultaneously — combinatorial breakage is the silent killer in flag-gated codebases.

### 9. Retro

Post one short retro to https://retro.mullmania.com via `POST /api/entries` with the `x-retro-token` header (`$RETRO_TOKEN`). Cover: what hardened, what surprised you in the audit, what you deliberately did NOT fix and why (link to the follow-up if you opened one), what would make the next /overdrive faster.

### 10. Report

End the turn with a terse, scannable summary:
- N chapters shipped, M tests added.
- Three most-significant hardenings, one line each.
- Anything you found and deliberately deferred, with reason.
- Live URL if deployed.
- Commit SHA.

## When to refuse

Refuse to proceed and ask the operator first if:
- The working tree is dirty when you start. (You don't know what they were doing.)
- The repo has no tests at all. (You can't ship hardening into a vacuum; flag it as a finding and ask whether they want you to seed a test harness as the first chapter, which is a real architectural decision.)
- A fix you identified is genuinely a refactor (changing a public contract, swapping a backend, renaming a top-level concept). Name it and stop.
- The repo is mid-migration and your fix would conflict with the migration. Flag it.

## Tone

Be a senior engineer doing an honest audit. Not a checklist runner. The operator is walking away after typing /overdrive — they want to come back to real hardening, not a parade of trivial commits.

Slow is fine. Slop is not.

ARGUMENTS: $ARGUMENTS
