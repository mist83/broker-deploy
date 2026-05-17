---
name: Bootstrap quiet by default — no prep chatter unless relevant
description: GLOBAL — keep bootstrap and prep-phase communication terse; no rambling status text or inner-monologue-style chatter unless there is a failure, blocker, or genuinely relevant progress fact.
type: feedback
originSessionId: doctrine-unification-2026-04-27
---
Fast startup matters. Successful bootstrap should be boring.

## Rule

- Do not narrate doctrine fetches, file reads, or prep-phase reasoning when they succeed normally.
- If bootstrap succeeds cleanly, just proceed to the task.
- If bootstrap fails, doctrine is stale, or operator action is required, say that plainly and stop or ask for the override.
- During real work, keep progress updates short and factual. No inner-monologue spill, no verbose preamble, no startup rambling.
- Only surface prep details when they change what the operator needs to know.

## Why

The operator wants a cloud brain with a fast, quiet startup. Prep should not look like a second task before the task.
