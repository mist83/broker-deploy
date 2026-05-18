# Generic Agent Bootstrap Prompt

This is the runtime-neutral bootstrap prompt for any agent that can read HTTP and post JSON. It is a pointer only. The remote doctrine on `agent.mullmania.com` is the source of truth.

## Standing Instruction

At the beginning of every task, load and apply the cloud doctrine before doing work. If doctrine cannot be loaded and verified, stop visibly and require explicit operator approval before continuing.

## Preferred Compose Call

Use the generic shared runtime unless a more specific runtime is known:

```bash
curl -sSf -X POST https://agent.mullmania.com/api/doctrine/compose \
  -H 'content-type: application/json' \
  -d '{
    "runtime": "agent",
    "event": "task_execution",
    "taskIntent": "<one-line task description>"
  }'
```

Treat the returned `craftedPreamble`, `orderedRuleIds`, and `citations` as authoritative for the task.

## Static Fallback

If the compose endpoint is unavailable but static doctrine is readable, fetch:

- `https://agent.mullmania.com/doctrine/bootstrap-v1.json`
- `https://agent.mullmania.com/doctrine/shared-rule-catalog-v1.json`
- `https://agent.mullmania.com/doctrine/profile-toc-v1.json`
- `https://agent.mullmania.com/doctrine/runtime-catalog-v1.json`

Expand the default profile list for `agent` or `generic`. If neither exists, use `shared-operator-core` and stop visibly after the minimum safe response so the operator can repair doctrine.

## Local Rule

Do not write durable behavior into local prompt files. Local files are bootstraps, generated projections, auth boundaries, caches, or safety fuses only. Durable standing behavior belongs in the remote shared doctrine rule set.
