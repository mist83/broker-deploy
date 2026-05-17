# Retired Repo Inventory

This file records small repos that were reviewed and folded into `mist83/agent`.

## 2026-05-04

### `mist83/clone`

- Status: retired.
- Replacement: `mist83/agent`.
- Salvaged: `CUSTOM-CLINE-EXTENSION.md`, a notes-only guide for packaging a custom Cline VS Code extension.
- Not salvaged: generated Mullmania front-door files and deploy workflow, which duplicated standard site publishing scaffolding.

### `mist83/agent-rules`

- Status: migrated/redirected.
- Replacement: `mist83/agent`.
- Salvaged: shared doctrine rules that were already present on `mist83/agent` master at review time, including the stop-when-unproductive rule and tv-telemetry reference.
- Not tombstoned separately: GitHub redirects `mist83/agent-rules` to `mist83/agent`, so a purge push would purge the active repo.

### `mist83/agent-guard-rails`

- Status: retired.
- Replacement: `mist83/agent`.
- Salvaged: no code. The repo was already a placeholder pointing at superseded guard-rail docs.
- Not salvaged: placeholder front-door files and previous `development-canon` tombstone text.
