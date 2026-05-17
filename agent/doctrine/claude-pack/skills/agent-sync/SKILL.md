---
name: agent-sync
description: Thin trampoline to the shared remote AGENT_SYNC procedure on agent.mullmania.com. Use when the user says AGENT_SYNC, agent sync, sync your brain, update everything in agent.mullmania.com, or asks whether it is safe to wipe local memory after remote doctrine sync.
---

# agent-sync (trampoline)

This local skill is not the source of truth.

Remote source of truth: `https://agent.mullmania.com/doctrine/shared/skills/agent-sync/SKILL.md`

When this skill is used:

1. `WebFetch` the remote skill above.
2. Follow that remote procedure as authoritative.
3. If the remote skill cannot be read, stop visibly and say AGENT_SYNC could not verify doctrine.
