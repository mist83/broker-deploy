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
6. Pick 3-5 fixes only, highest impact first.
7. Ship each fix as a chapter: code, tests, full suite, commit.
8. After all chapters, run the full suite at least 3 times.
9. Deploy and live-verify if the repo has a deploy contract.
10. Produce durable proof for the work just completed. Proof must match the work: browser/app usage video for visual/user-facing behavior when practical; API transcript, test logs, live URL checks, screenshots, commit SHAs, or other hosted evidence for non-visual work. Prefer a real usage video over still screenshots when the product has a meaningful visual surface. Inspect the proof before claiming it: if it shows broken, awkward, blank, confusing, or unexercised behavior, fix within scope and re-record/re-run instead of hiding the defect.
11. Leave the next `bookmark` command with enough evidence to close unattended: proof URL or fallback evidence, exact commits, deployed URLs, test commands/results, known deferred items, and any `.proof.json`/manifest breadcrumb the repo uses. If proof cannot be made durable, say so and do not present the chapter as fully closed.
12. Report chapters shipped, tests added, major hardenings, deferred items, live URL, commit SHA, and proof artifact(s).

## Standards

No vibes. No generic checklist filler. Every finding needs evidence.

No architectural rewrites unless the operator approves.

No silent dependency upgrades.

No "done" unless verified.

No undeployed success claim when the expected result is live behavior.

No proofless overdrive. The normal unattended cycle is `overdrive` followed by `bookmark`; Overdrive must hand Bookmark real evidence, not vibes or a chat-only summary.

Slow is fine. Slop is not.

ARGUMENTS: $ARGUMENTS
