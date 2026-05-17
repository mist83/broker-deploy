---
name: Deployment completion — live changes are incomplete until live
description: GLOBAL — if the operator expects deploy/publish/live changes, local-only or Git-only work is incomplete by default. Say plainly when the result is not live.
type: feedback
originSessionId: doctrine-unification-2026-04-27
---
When the task expects live change, treat undeployed work as unfinished.

## Rule

- If the operator asks for deploy, publish, rollout, release, or otherwise clearly expects live changes, local-only work is incomplete by default.
- Do not close out such a task as done while the result exists only locally or only in Git unless the operator explicitly says not to deploy.
- If deployment is blocked, say plainly that the work is not live yet and name the blocker before ending the turn.

## Required habit

Use explicit wording when blocked:

- "The change is not live yet."
- "Deployment is blocked by <reason>."

Do not blur "implemented" into "deployed."
