# Overdrive

Harden this repo until the product stops lying about what it is.

You are not here to be polite to weak implementation. You are here to find gaps, prove them with files/lines/runtime behavior, and eliminate the highest-impact ones without wrecking working code.

## Mandate

Treat every incomplete shipped surface as a defect:
- "Coming soon" in a real workflow
- dead buttons, fake links, placeholder screens, mock-only data, and no-op controls
- TODO/FIXME that describes user-visible behavior or correctness risk
- feature flags, routes, settings, endpoints, or docs that imply a feature exists when it does not
- tests that pass without proving the thing users rely on

For each incomplete feature, choose one:
- finish it properly
- hide it behind a default-off flag
- remove the false surface
- document why it is intentionally deferred, only if it is not exposed as working product

Do not chase random novelty. Squeeze the best product out of what the repo is already trying to be.

## Procedure

1. Bootstrap doctrine and repo instructions.
2. Stop if the working tree is dirty unless the operator explicitly told you to continue.
3. Read top-level docs, entry points, public API, main UI flows, tests, deploy contract, and recent commits.
4. Run the product if possible: local, deployed, or both.
5. Build a grounded gap list with file/line/symptom/fix/blast radius.
6. If the work has nontrivial workflow/state complexity, create or update a live DAG/state diagram using the canonical DAG protocol before or during implementation. The graph should show what actually happens, not a decorative architecture poster. Link it from the proof/resume trail when useful.
7. Prefer a durable tool or automated workflow over a one-off manual fix when that is the shortest path to repeatability. If correct requirements make the task automatable, build the button/script/flow that lets a future human or agent finish it, then prove the tool by driving it hands-on through Playwright, browser automation, app automation, or CLI automation.
8. Pick 3-5 fixes only, highest impact first.
9. Ship each fix as a chapter: code, tests, full suite, commit.
10. After all chapters, run the full suite at least 3 times.
11. Deploy and live-verify if the repo has a deploy contract.
12. Produce durable proof for the work just completed. Proof must match the work: browser/app usage video for visual/user-facing behavior when practical; API transcript, test logs, live URL checks, screenshots, commit SHAs, live DAG/state diagram, or other hosted evidence for non-visual work. Prefer a real usage video over still screenshots when the product has a meaningful visual surface. When video proof is required or chosen and no task-specific style says otherwise, do not ship silent video: narrate the premise/action/result, use generated/licensed lo-fi techno or outrun-style music with crescendo and beat drops aligned to meaningful state changes, keep the default voice dry and concise, and use extra voices only rarely when the repo naturally has distinct roles. Inspect the proof before claiming it: if it shows broken, awkward, blank, confusing, silent-without-reason, or unexercised behavior, fix within scope and re-record/re-run instead of hiding the defect.
13. Leave the next `bookmark` command with enough evidence to close unattended: proof URL or fallback evidence, exact commits, deployed URLs, test commands/results, DAG/state diagram URL when created, known deferred items, and any `.proof.json`/manifest breadcrumb the repo uses. If proof cannot be made durable, say so and do not present the chapter as fully closed.
14. Report chapters shipped, tests added, major hardenings, deferred items, live URL, commit SHA, DAG/proof artifact(s), and any automation/tool that now lets a future human finish the work.

## Standards

No vibes. No generic checklist filler. Every finding needs evidence.

No architectural rewrites unless the operator approves.

No silent dependency upgrades.

No "done" unless verified.

No undeployed success claim when the expected result is live behavior.

No proofless overdrive. The normal unattended cycle is `overdrive` followed by `bookmark`; Overdrive must hand Bookmark real evidence, not vibes or a chat-only summary.

No unrepeatable heroics when automation is practical. A working tool with clear requirements and a Playwright/CLI proof beats a clever one-time manual finish.

Slow is fine. Slop is not.

ARGUMENTS: $ARGUMENTS
