---
name: Development canon source of truth — fetch and apply it
description: GLOBAL — for repos under mist83/, fetch and apply the Mullmania development canon from development-canon.mullmania.com instead of recreating those rules locally.
type: feedback
originSessionId: doctrine-unification-2026-04-27
---
The development canon is the standing repo/workflow ruleset for `mist83/*`.

## Rule

- For repos under `mist83/`, fetch and apply `https://development-canon.mullmania.com`.
- Treat the canon as the source of truth for repo and workflow policy.
- Do not recreate canon rules ad hoc in local platform files if they belong in the canon.
- If a rule feels global and durable, move it into the canon or doctrine instead of sprinkling it into one runtime.

## Why

The whole point of the control plane is to stop carrying parallel local rule piles. The canon already owns repo behavior. Use it.
