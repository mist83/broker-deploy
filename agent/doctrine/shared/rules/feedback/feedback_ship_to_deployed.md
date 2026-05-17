---
name: Ship to deployed — commit + push + deploy is the closing step
description: GLOBAL — once a task is semi-done and locally verified, commit + push + deploy as one bundled habit. "Update workflow/protocol/fix the protocol doc/land this learning" implies commit + deploy + verify, not just edit local files. Local-only changes get lost.
type: feedback
originSessionId: 9d01b121-8837-442b-ab09-8890417ab07b
---
Don't stop at "changes are in the working tree" and wait for a second "ok now deploy" round-trip. Once a task is semi-done and locally verified (build passes, tests pass, preview looks right), close it out with commit + push + deploy as one bundled step.

**Why:** Operator 2026-04-18 after the conversation-multiverse canon-refactor: "do it all please, commit, push, and deploy as a matter of habit, make it a global thing you do, not just for this repo, when you are semi-done with a task." Earlier (2026-04-11) on workflow updates specifically: "when I say update your workflow, I am implying that I want you to update the itchy brain protocol up at github and whatever is deployed as well, I do not want you to only make this change for this local repository, because otherwise the change gets lost." Tired of the half-finished handoff pattern.

## How to apply

- Applies globally to ALL `mist83/*` repos and beyond, unless told otherwise.
- Run the repo's deploy path — `deploy.sh`, the `## Deploy` block in README.md, the canonical Mullmania one-liner (`aws s3 cp s3://mullmania.com-data/_tools/deploy.sh - | bash -s -- apply`), `gh workflow run`, or whatever the repo convention is. Look for deploy instructions before making one up.
- Verify the change is live via a fetch against the deployed URL (or browser-check, per the UI shell rule).
- For any "update the protocol / update the workflow / fix the protocol doc / land this learning / make this permanent" directive specifically: edit local **then** commit to canonical remote **then** push **then** deploy if there's a deployed surface **then** verify. If the change also belongs in Claude memory files, update those IN ADDITION to the canonical source, never INSTEAD OF.
- Respect lane ownership: if a PM-A2A ledger shows another agent owns the deploy lane, relay via PM-A2A and verify rather than racing. Announce in the room when the change lands so other agents see it.
- Skip destructive variants unless explicitly authorized (force push, amending published commits, `--no-verify`). "Habit" covers commit/push/deploy, not the risky variants.
- Skip when the change is truly not ready (tests failing, partial work, hook failures). "Semi-done" means it actually works — not "I gave up halfway."

## Why this matters

Local-only changes evaporate at the end of a session. Other agents can't see them, the deployed state drifts from the source of truth, and the operator has to re-explain the same thing next session. The operator has framed this as a trust failure if missed twice.
