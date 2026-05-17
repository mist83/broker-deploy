# Safe To Wipe Codex

This is the honest cutoff for wiping local Codex-side memory/customization.

## Current Status

Instruction wipe: `yes, with a pointer swap`

Full local brain wipe: `no, not yet`

## Safe Now

It is safe now to replace the authored contents of these files with a minimal bootstrap pointer:

- `~/.codex/AGENTS.md`
- `/Users/mist83/Code/AGENTS.md`

That is safe because the standing behavior from those files now exists in the remote doctrine artifacts:

- `https://agent.mullmania.com/CODEX-BOOTSTRAP-PROMPT.md`
- `https://agent.mullmania.com/doctrine/codex-memory-seed-v1.json`
- `https://agent.mullmania.com/DOCTRINE-BOOTSTRAP-GUIDE.md`

## Not Safe Yet

It is not safe yet to blindly delete these if you expect Codex to behave "like now":

- `~/.codex/rules/default.rules`
  Codex still uses this as a local permission/fuse surface.
- local user skill packs under `~/.codex/skills/*`
  Codex still uses these as local triggerable skill definitions and script roots.
- locally cached plugin bundles under `~/.codex/plugins/cache/*`
  These still back runtime capabilities.

## Safe If You Accept Reduced Behavior

It is safe to delete scratch/state surfaces if you do not care about their local history:

- `~/.codex/.codex-global-state.json`
- `~/.codex/state/*`
- `~/.codex/automations/.run-jitter-salt`

That may reset convenience/history, but it should not erase doctrine because doctrine is remote.

## Full Safe Point

It will be fully safe to nuke the rest only after all of these are true:

1. Codex can bootstrap from the remote doctrine using only a tiny local pointer.
2. The local permission/fuse behavior in `default.rules` is either intentionally reduced to a tiny local exception set or generated from the doctrine.
3. The local user skill packs are either published as remote packs/projections or consciously retired.
4. A fresh chat can pass the doctrine override test from the control plane without relying on old local authored policy.

## Bottom Line

If your goal is "one tiny local pointer and the rest remote," you can do the instruction cutover now.

If your goal is "delete every local custom Codex surface and keep behavior basically unchanged," it is not safe yet.
