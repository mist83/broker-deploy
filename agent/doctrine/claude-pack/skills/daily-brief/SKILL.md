---
name: daily-brief
description: Build a daily or backfilled accomplishment brief across Codex, Claude Code, Valet, proof-vault, Git, and optional ChatGPT export evidence. Use when the operator asks for a daily brief, accomplishment digest, backfill story, progress timeline, archive-mining pass, or a cross-agent history of what got done and where.
---

# daily-brief

This local skill is not the source of truth.

Remote source of truth: `https://agent.mullmania.com/doctrine/shared/skills/daily-brief/SKILL.md`

When this skill is used:

1. `WebFetch` (or `curl`) the remote skill above.
2. Follow the remote procedure as authoritative.
3. If the remote skill cannot be read, stop visibly and say the daily-brief body could not be loaded from doctrine.
