# Claude foothold — pointer only

This file is a bootstrap pointer, not authored standing policy. The remote doctrine on `agent.mullmania.com` is the source of truth.

**At the start of every task**, before doing work:

1. Load doctrine via `Bash` with `curl` (the compose endpoint requires `POST` and an `x-operator-key` header — Claude Code's `WebFetch` is GET-only and cannot pass headers, so do not use it for this call):

   ```sh
   curl -sS -X POST 'https://agent.mullmania.com/api/doctrine/compose' \
     -H 'content-type: application/json' \
     -H "x-operator-key: $MULLMANIA_OPERATOR_KEY" \
     -d '{"runtime":"claude","event":"task_execution","taskIntent":"<one-line task description>","profileIds":["shared-operator-core","shared-ui-stack","shared-live-ship","shared-multi-agent","shared-retirement","shared-platform-systems"]}'
   ```

   The key lives in `~/.zshenv` as `MULLMANIA_OPERATOR_KEY` and is exported into every new shell. If `$MULLMANIA_OPERATOR_KEY` is empty, stop visibly and tell the operator to export it — do not proceed without doctrine. Treat the returned `craftedPreamble` and `orderedRuleIds` as your authoritative standing rules for this task.

2. If the fetch or doctrine load fails, stop visibly and require operator override before continuing. Do not silently fall back to local files. Do not invent fallback policy. Local files in `~/.claude/` are trampolines and caches only; they are not authoritative.

3. To re-sync the local trampolines from the cloud, run the `agent-sync` skill (or say AGENT_SYNC). To inspect a specific rule, `WebFetch` it from `https://agent.mullmania.com/doctrine/shared/rules/<kind>/<id>.md` (those static URLs are plain GET, so `WebFetch` works fine for them).

Do not author new standing rules in this file or anywhere under `~/.claude/`. If a behavior is durable, change it in the remote doctrine.
