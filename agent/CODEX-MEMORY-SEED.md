# Codex Memory Seed

This is the condensed Codex-side memory prepared for migration into the remote doctrine/control plane.

## Core Principles

- Remote doctrine is the source of truth.
- Local runtime files are compatibility shims, not authored policy.
- `No doctrine, no pretending.`
- The doctrine failure mode is `fail-visible, gated-continue`.
- Override is session-scoped and should be visibly marked.
- Local safety is welded on even when the remote doctrine is authoritative.

## Current Decisions

- Use `agent.mullmania.com` as the current publish surface until a plural host exists.
- Keep a two-layer remote brain: static signed doctrine artifact plus narrow dynamic service.
- Prefer `shared-rule-catalog-v1.json` + `profile-toc-v1.json` as the shared doctrine core for both Codex and Claude.
- Use orchestrator-owned durable memory in v1.
- Keep cross-agent shared live memory out of v1.
- Keep conditional logic out of the static artifact.
- Treat doctrine artifacts on `agent.mullmania.com` as publicly readable. If they are unavailable, fail visibly and require operator override before continuing.

## Local Surfaces Allowed

- bootstrap pointer
- signature trust root
- destructive-action circuit breaker
- auth and secret resolution boundaries
- generated runtime projections
- read-only doctrine cache

## Local Surfaces Forbidden As Source Of Truth

- custom `CLAUDE.md`
- custom `AGENTS.md`
- custom Codex skill packs
- custom Claude skill packs
- custom local plugin registries
- custom local automation registries
- hook scripts that contain real policy logic

## Codex Runtime Quirks (informs the projection layer)

- Codex sessions currently ingest both `~/.codex/AGENTS.md` and workspace/root `AGENTS.md` when they exist.
- `~/.codex/rules/default.rules` is a local permission/fuse surface, not doctrine.
- User skill packs under `~/.codex/skills/*` are surfaced by name and description; removing them changes what the runtime can trigger by skill name.
- Curated plugin caches under `~/.codex/plugins/cache/*` are runtime tool bundles, not authored doctrine.
- `.codex/state/*`, `.codex/.codex-global-state.json`, and prompt-history state are scratch/history, not standing behavior.
- The live doctrine host should be readable without local secret material. If it is not, the session should stop visibly instead of pretending doctrine was loaded.

## Runtime Inventory Snapshot

This is context for remote-doctrine projection only. It is not an implementation backlog.

- 1 global instructions file: `~/.codex/AGENTS.md`
- 1 workspace-family instructions file: `/Users/mist83/Code/AGENTS.md`
- 1 local permission/fuse rules file: `~/.codex/rules/default.rules`
- 17 user skill packs in `~/.codex/skills/*`:
  `canonize`, `coordinate`, `frontend-skill`, `imagegen`, `itchy-brain`, `marionette-protocol`, `mark-defunct`, `mullmania-frontend-demo-swarm`, `playwright`, `playwright-interactive`, `remote-site-screenshot`, `roomup`, `screenshot`, `shipit`, `sora`, `ui-mullmania-migrator`, `wrap-executable-ui`
- 2 runtime-provided local skill bundles: `.system`, `codex-primary-runtime`
- 6 locally cached plugin bundles: `computer-use`, `build-macos-apps`, `build-web-apps`, `game-studio`, `github`, `gmail`
- 0 user automation definitions today. Only runtime salt exists at `~/.codex/automations/.run-jitter-salt`.
- Several scratch/state files exist under `~/.codex/state/*` and `~/.codex/.codex-global-state.json`. They are not doctrine and are safe to treat as disposable operator scratch unless a specific workflow still uses them.

## Mandatory Standing Behaviors To Preserve

- Follow grugbrain development practices.
- Do not hallucinate.
- Apply obvious speech-to-text normalization across repos under `/Users/mist83/Code`.
- Treat near-misses like `git hub`, `get hub`, `get her`, and `get hug` as `GitHub` when context makes that intent clear.
- Fetch and apply the Mullmania development canon from `https://development-canon.mullmania.com`.
- If live changes are expected, do not report success while the result exists only locally or only in Git.
- If deployment is blocked, say plainly that the work is not live and name the blocker before closing out.
- Treat remote doctrine as source of truth and local files as bootstrap/fuse/projection surfaces only.
- Prefer shared doctrine profiles over runtime-specific restatements when the rule applies equally to Codex and Claude.

## Runtime Slogan

`Remote thinks. Local bounces. Safety is welded on.`
