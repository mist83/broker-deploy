# Memory — pointer only, no local cache

Standing rules and references are NOT cached locally. They live at `https://agent.mullmania.com/doctrine/shared/rules/`.

To see the active rule set for the current task, fetch `https://agent.mullmania.com/api/doctrine/compose` per the instructions in `~/.claude/CLAUDE.md`.

To fetch one specific rule on demand: `WebFetch https://agent.mullmania.com/doctrine/shared/rules/feedback/<id>.md` (or `reference/<id>.md`, `project/<id>.md`).

Catalog of available rule ids: `https://agent.mullmania.com/doctrine/shared-rule-catalog-v1.json`.

Do not write standing policy into this file. This is a trampoline.
