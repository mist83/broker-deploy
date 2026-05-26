# Doctrine Bootstrap Guide

This is the doctrine-first contract for the remote agent brain.

## Goal

The standing instruction should collapse to one thing:

`At the beginning of every chat, read this doctrine.`

Everything else should flow from that doctrine:

- instructions
- skills
- slash commands
- automations
- plugins
- hook behavior
- memory policy
- tool routing
- script vending
- per-task brain selection

## Current Host

- `https://agent.mullmania.com/` is the current live publish surface.
- Doctrine artifacts on that host are intended to be publicly readable. If they are not reachable, treat that as an outage and fail visibly.
- `https://agents.mullmania.com/` does not exist today.
- If the plural host is created later, it should replace or mirror this host. Do not split doctrine across two different sites.

## Source Of Truth Rule

The remote doctrine is the source of truth.

Local files are allowed only when the runtime requires a foothold:

- bootstrap pointer
- signature trust root
- destructive-action circuit breaker
- auth and secret resolution boundaries
- generated runtime projections
- read-only cache

Everything else is remote.

## No Ad Hoc Local Adds

Do not add new source-of-truth behavior directly to:

- `CLAUDE.md`
- `AGENTS.md`
- `.codex/skills/*`
- `.claude/skills/*`
- local slash-command folders
- local automation registries
- local plugin registries
- hook scripts with real policy logic

Those local surfaces may exist only as projections or trampolines generated from the doctrine.

## Bootstrap Contract

Session start should do this:

1. Fetch the bootstrap artifact.
2. Fetch the static doctrine table of contents it points to.
3. Verify signature, hash, and schema.
4. Expand the default shared profiles for the current runtime.
5. Prefer a single compose request that returns a crafted preamble from the selected profiles and task context.
6. Materialize the minimum runtime-specific projections needed by the current agent.
7. Optionally call a narrow dynamic scoping service for task-specific profile selection.

The agent should not invent fallback policy on its own.

## Failure Contract

The doctrine failure mode is:

`fail-visible, gated-continue`

That means:

1. If doctrine load succeeds, proceed normally.
2. If doctrine load fails or verification fails, stop immediately and say so plainly.
3. Do not silently fall back and pretend the doctrine is active.
4. Allow explicit operator override to continue for the current session only.
5. Mark the session as off-book once overridden.

Recommended session states:

- `healthy`
- `degraded_doctrine_unavailable`
- `degraded_doctrine_invalid`
- `degraded_doctrine_unverified`
- `continued_with_operator_override`

## Dynamic Service Boundary

Keep the remote dynamic service narrow.

Good v1 endpoints:

- `POST /scope`
- `POST /compose`
- `POST /dispatch`
- `GET /health`

`/scope` chooses task-scoped profile and memory refs.

`/compose` weaves selected shared profiles and rule ids into one crafted runtime preamble plus citations.

`/dispatch` is for hook trampolines and other fire-and-forget control-plane events.

`/health` is for schema/version compatibility and availability checks.

If a rule needs conditional logic, it belongs in `/scope`, not in the static artifact.

## Memory Rule

Durable memory should be single-writer in v1.

- agents may propose memory writes
- orchestrator approves or rejects them
- agents do not directly co-own the durable remote memory store yet

Synthetic memory must be:

- tagged
- scoped
- expiring
- visibly injected

Never let synthetic memory silently masquerade as organic history.

## Legacy Material Rule

This repo still contains many legacy local rule files.

Treat them as:

- historical inventory
- compatibility inputs
- projections to replace

Do not treat them as the future source of truth.

## Machine-Readable Companions

- Bootstrap artifact: [doctrine/bootstrap-v1.json](./doctrine/bootstrap-v1.json)
- Shared rule catalog: [doctrine/shared-rule-catalog-v1.json](./doctrine/shared-rule-catalog-v1.json)
- Shared profile TOC: [doctrine/profile-toc-v1.json](./doctrine/profile-toc-v1.json)
- Compose API contract: [doctrine/compose-api-v1.json](./doctrine/compose-api-v1.json)
- Human compose guide: [DOCTRINE-COMPOSE-API.md](./DOCTRINE-COMPOSE-API.md)
- Generic agent bootstrap prompt: [AGENT-BOOTSTRAP-PROMPT.md](./AGENT-BOOTSTRAP-PROMPT.md)
- Codex bootstrap prompt: [CODEX-BOOTSTRAP-PROMPT.md](./CODEX-BOOTSTRAP-PROMPT.md)
- Claude instruction pack: [doctrine/claude-instruction-pack-v1.json](./doctrine/claude-instruction-pack-v1.json)
- Codex instruction pack: [doctrine/codex-instruction-pack-v1.json](./doctrine/codex-instruction-pack-v1.json)
- Codex memory seed: [doctrine/codex-memory-seed-v1.json](./doctrine/codex-memory-seed-v1.json)
- Claude memory seed: [doctrine/claude-memory-seed-v1.json](./doctrine/claude-memory-seed-v1.json)
- Codex local runtime inventory: [doctrine/codex-local-runtime-inventory-v1.json](./doctrine/codex-local-runtime-inventory-v1.json)
- Codex wipe status: [SAFE-TO-WIPE-CODEX.md](./SAFE-TO-WIPE-CODEX.md)

The bootstrap artifact resolves the active seed via `sourceOfTruth.memorySeedUrls[<flavor>]` keyed by runtime (`codex`, `claude`) when a runtime-specific seed exists. Generic agents should use `runtime: "agent"` or `runtime: "generic"` in the compose API and consume the same shared profile defaults. The legacy `memorySeedUrl` field is retained for clients that have not learned the per-flavor map yet and points at the Codex seed.

## Test Case

The operator should be able to change global doctrine behavior centrally and observe the effect immediately.

Example test:

- global doctrine says to acknowledge the task transparently and tell a joke instead of doing the requested work
- fresh agents load that behavior at chat start
- agents say plainly that they are following doctrine override behavior
- if doctrine cannot be read, they stop visibly and require override
