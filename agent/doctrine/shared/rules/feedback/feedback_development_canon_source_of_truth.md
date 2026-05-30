---
name: Recipes live on katai, capabilities on ineed — use them, don't recreate
description: GLOBAL — for repos under mist83/, the standing "how we build X" recipes live on the katai board (katai.mullmania.com) and the "what already exists" capability shelf lives on ineed (ineed.mullmania.com). Use them instead of recreating those rules locally. The former development-canon.mullmania.com site is retired.
type: feedback
originSessionId: doctrine-unification-2026-04-27
---
For repos under `mist83/`, the shared engineering canon is the source of truth for repo and workflow policy — use it instead of re-deriving rules locally. The canon was split when `development-canon.mullmania.com` was retired (2026-05-29); it now lives in three places.

## Where it lives now

- **How we build X / recipes / how to make a plan → the katai board: `https://katai.mullmania.com`.** Each kata is a proven, dry-runnable "how to build X" recipe with baked-in gotchas (e.g. `add-realtime-signalargh`, `pair-phones-to-a-tv`, `deploy-a-site`, `audit-an-app`, `start-a-new-app`). Machine-readable at `katai.mullmania.com/katai.json`.
- **What already exists / capabilities → the ineed shelf: `https://ineed.mullmania.com`.** A reuse-first capability index: map a need to the deployed thing that already does it before building a primitive. Machine-readable at `ineed.mullmania.com/ineed.json`.
- **Durable repo/workflow doctrine → the agent brain** (this doctrine, composed from `agent.mullmania.com`). Standing behavior rules live here, not on the boards.

## Rule

- Before building a primitive, check the ineed shelf; before building "X", look for a katai kata.
- Treat katai + ineed + this doctrine as the source of truth for repo and workflow policy.
- Do not recreate these rules ad hoc in local platform files.
- When a new rule feels global and durable, put it where it belongs: durable doctrine → the brain; a "how to build X" recipe → a new kata on katai; a reusable capability → a row on the ineed shelf. Don't sprinkle it into one runtime.

## Why

The whole point of the control plane is to stop carrying parallel local rule piles. The katai board owns recipes, the ineed shelf owns capabilities, and the brain owns durable doctrine. Use them.
