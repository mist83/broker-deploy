# Codex Local Runtime Inventory

This is the current local Codex-side surface that still exists on the operator machine.

Treat it as migration inventory, not future source of truth.

## Active Local Instruction Surfaces

- `~/.codex/AGENTS.md`
  Global Codex instructions. This should collapse to a bootstrap pointer only.
- `/Users/mist83/Code/AGENTS.md`
  Workspace-family instructions for repos under `/Users/mist83/Code`. This should collapse to a bootstrap pointer only.

## Active Local Permission And Fuse Surface

- `~/.codex/rules/default.rules`
  Large local prefix-allow list. This is a runtime permission/fuse surface, not doctrine. It is still locally authoritative today.

## Active Local User Skill Packs

These are still local runtime inputs today:

- `canonize`
- `coordinate`
- `frontend-skill`
- `heimdall-announce`
- `imagegen`
- `itchy-brain`
- `marionette-protocol`
- `mark-defunct`
- `mullmania-frontend-demo-swarm`
- `playwright`
- `playwright-interactive`
- `remote-site-screenshot`
- `roomup`
- `screenshot`
- `shipit`
- `sora`
- `ui-mullmania-migrator`
- `wrap-executable-ui`

## Runtime-Provided Local Bundles

These are local runtime dependencies, but not authored doctrine:

- `~/.codex/skills/.system`
- `~/.codex/skills/codex-primary-runtime`
- curated plugin caches under `~/.codex/plugins/cache/*`
  Current bundle names: `computer-use`, `build-macos-apps`, `build-web-apps`, `game-studio`, `github`, `gmail`

## Scratch And State Surfaces

These exist locally but are not standing doctrine:

- `~/.codex/.codex-global-state.json`
- `~/.codex/state/*`
- `~/.codex/automations/.run-jitter-salt`
- prompt history and UI state inside Codex app storage

These are disposable only if you do not need their scratch data anymore.

## Interpretation

- Safe to collapse the two `AGENTS.md` files to a bootstrap pointer once the remote doctrine preserves their standing behavior.
- Not safe to delete `default.rules` if you expect the same local permission/fuse behavior.
- Not safe to delete the local user skill packs if you expect the same named skill triggers and local scripts to keep working.
- Not necessary to preserve scratch/state files unless you still rely on their transient data.
