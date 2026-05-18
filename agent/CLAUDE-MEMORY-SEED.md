# Claude Memory Seed

This is the condensed Claude-side memory prepared for migration into the remote doctrine/control plane. It mirrors `CODEX-MEMORY-SEED.md` for the Claude Code runtime.

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

## Claude Runtime Quirks (informs the projection layer)

The Claude Code harness has surfaces Codex CLI does not. These exist as projection targets only — not as authoring locations.

- The harness auto-includes `~/.claude/CLAUDE.md` and every ancestor `CLAUDE.md` in the system prompt at session start.
- The harness auto-includes `~/.claude/projects/<workdir>/memory/MEMORY.md` (truncated to 200 lines) plus any files it links to.
- Skills declare a `description` line that the harness surfaces in the system prompt; the model invokes a skill via the `Skill` tool, not via a slash.
- Slash commands live in `~/.claude/commands/*.md` and are user-typed; functionally adjacent to skills, different render target only.
- Hooks fire on `PreToolUse` / `PostToolUse` / `Stop` and can block or augment tool calls. They are real executables and a real trust surface.
- MCP servers are persistent processes declared in `~/.claude/.mcp.json`; they are tool routes, not instructions.
- Anthropic prompt caching has roughly a 5-minute TTL. Mid-session brain swaps invalidate it; per-task swaps should batch their re-prompts to amortize the cache miss.

## Runtime Inventory Snapshot

A snapshot of Claude-side surfaces that exist on the operator machine today. This is context for remote-doctrine projection only, not an implementation backlog. Counts and categories, not file contents.

- 1 global instructions file (`~/.claude/CLAUDE.md`): Mullmania development canon reference.
- 1 settings.json with one PostToolUse hook (`mullmania-s3-resync.sh`).
- 1 MCP server (itchy-brain).
- 3 slash commands (`/roomup`, `/shipit`, `/tombstone`).
- 2 user skills (`canonize`, `publish-package`).
- 1 plugin marketplace registration.
- 12 feedback memories (consolidated from 19 on 2026-04-26): standing behavior rules.
- 4 project memories: in-flight context, NOT durable doctrine — these belong to operator scratch, not the remote brain.
- 10 reference memories: pointers to external systems (Itchy Brain, NuGet feed, GHA runner, signal-argh, etc.) — durable doctrine candidates.
- 1 MEMORY.md index that surfaces the rest into context.

The 12 feedback memories and 10 reference memories are the candidates that should land in remote doctrine as instruction packs. The 4 project memories should stay operator-local — they describe in-flight initiatives, not standing behavior.

## Mandatory Standing Behaviors To Preserve

These are durable behaviors the doctrine must encode if we want a fresh Claude session to behave like the configured one. They are listed here as migration intent only; the actual policy artifacts live downstream of doctrine.

- Follow grugbrain development practices.
- Do not hallucinate.
- Apply obvious speech-to-text normalization across repos under `/Users/mist83/Code`.
- Treat `git hub`, `get hub`, `get her`, and `get hug` as `GitHub` when context makes that intent clear.
- Mullmania development canon is the global ruleset for `mist83/*` repos; fetched from `https://development-canon.mullmania.com`. Per-repo behaviors live there, not in this seed.
- If live changes are expected, do not report success while the result exists only locally or only in Git.
- If deployment is blocked, say plainly that the work is not live and name the blocker before closing out.
- Mullmania API/bucket safety contract: API-first writes, per-site `.git`, deletion gates on the shared bucket.
- UI canon contract: read both `ui.[base-url]/llm-docs.md` and the canon style guide before writing markup.
- Closing habit: commit + push + deploy as one bundle when work is verified.
- PM-A2A is the default multi-agent workflow; join the room when another agent is mentioned, post a retrospective before leaving.
- Tombstone protocol via `mist83/graveyard` for retired repos.
- Prefer shared doctrine profiles over runtime-specific restatements when the rule applies equally to Codex and Claude.

## Runtime Slogan

`Remote thinks. Local bounces. Safety is welded on.`
