---
name: agent-sync
description: Sync the active agent runtime against agent.mullmania.com and verify the public doctrine control plane before relying on local memory wipe or remote-brain cutover. Use when the user says AGENT_SYNC, agent sync, sync your brain, update everything in agent.mullmania.com, make sure you are up to date, or asks whether it is safe to wipe local memory after remote doctrine sync. This skill is runtime-agnostic: identify yourself as Codex, Claude, or another agent runtime in the sync receipt.
---

# AGENT_SYNC

This is the shared remote procedure for keeping an agent runtime aligned with the public doctrine control plane.

Source of truth:

- `https://agent.mullmania.com/doctrine/shared/skills/agent-sync/SKILL.md`
- `https://agent.mullmania.com/doctrine/builder-data-v1.json`
- `https://agent.mullmania.com/api/doctrine/health`
- `https://agent.mullmania.com/api/doctrine/catalog/list`
- `https://agent.mullmania.com/api/doctrine/compose`

The local runtime surface is allowed to be only:

- bootstrap pointer
- generated projection
- fuse / circuit-breaker
- auth / secret boundary
- read-only cache

Never treat a local skill, local `AGENTS.md`, local `CLAUDE.md`, local command file, or local hook as the source of truth if the same behavior should live in `agent.mullmania.com`.

## What AGENT_SYNC must do

1. Identify the runtime.
   - Say whether you are `codex`, `claude`, or another runtime.
   - Record the local runtime surfaces that still exist for that runtime.

2. Verify the public doctrine control plane.
   - Fetch `builder-data-v1.json` (GET, public).
   - `POST /api/doctrine/health` (operator-key-gated — send `x-operator-key` header). Without the key, the endpoint returns an explicit `"Invalid operator key. Send the x-operator-key header"` error; treat that error as a reachability proof. Use the operator key from sites.mullmania.com to confirm content.
   - `POST /api/doctrine/catalog/list` (operator-key-gated — same pattern as `/health`). The public, unauthenticated catalog snapshot is also available at `GET /doctrine/shared-rule-catalog-v1.json` and is the fallback if you don't have the operator key.
   - Call `POST /api/doctrine/compose` for your runtime with `event=task_execution` and a short smoke-test intent. Compose is public — no key required.
   - Hard fail visibly if any endpoint is unreachable. `GET` on the gated endpoints returns `"Unsupported method: GET"`; treat that as a doctrine bug (this SKILL doc is the cure — earlier versions told callers to use GET).

3. Compare local standing behavior against remote doctrine.
   - Treat local customization surfaces as migration input only.
   - Identify durable behavior that is still local-only and should move into remote doctrine.
   - Ignore ephemeral state such as logs, scratch data, or resume ids unless the operator explicitly asks to preserve them.

4. If durable local-only behavior exists, migrate it.
   - Add or update the remote doctrine artifacts in the `agent` repo.
   - Prefer shared doctrine over runtime-specific doctrine when the rule is not truly platform-specific.
   - Keep runtime-specific differences in the thinnest possible overlay.

5. Rebuild and deploy what changed.
   - If the `agent` repo changed, rebuild and deploy `agent.mullmania.com`.
   - If a doctrine consumer such as `valet` changed, rebuild and deploy that surface too when the task expects live behavior.
   - Do not claim success if the changes are only local.

6. Return a wipe-readiness receipt.
   - `remote_doctrine_ok`: yes/no
   - `runtime_identified_as`: `<runtime>`
   - `remote_artifacts_updated`: list
   - `local_surfaces_still_not_safe_to_wipe`: list
   - `safe_to_wipe_instruction_memory`: yes/no
   - `safe_to_wipe_full_local_brain`: yes/no
   - `blockers`: list

## Shared rules

- Prefer shared doctrine for 90% of operator work.
- Only keep runtime-specific projection logic local.
- Fail visibly if doctrine is unavailable.
- No doctrine, no pretending.
- Do not add new ad hoc local source-of-truth files during sync work.

## Expected output shape

Return a short receipt with:

1. what public doctrine endpoints were verified
2. what remote artifacts changed
3. whether the runtime is up to date
4. whether it is safe to wipe instruction memory now
5. whether it is safe to wipe the entire local brain now
6. any live blockers
