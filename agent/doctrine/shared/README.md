# Shared Doctrine Tree

Runtime-agnostic content. Lives once, projected everywhere.

## What lives here

Everything in this directory is rule content, skill bodies, command logic, or hook scripts that are not specific to any one agent runtime. The same file gets fetched by:

- the Claude pack manifest (`/doctrine/claude-instruction-pack-v1.json`)
- the Codex pack manifest (`/doctrine/codex-instruction-pack-v1.json`, when it exists)
- the shared rule catalog (`/doctrine/shared-rule-catalog-v1.json`)
- the shared profile TOC (`/doctrine/profile-toc-v1.json`)
- any future flavor pack (Cursor, Aider, your-cli-here)

Each flavor pack declares its own projection targets — where on the operator machine the file lands, how it gets named, what mode bits it gets. The content itself is shared.

## What does NOT live here

Anything that has a different shape per runtime:

- `CLAUDE.md` (Claude-specific preamble) → lives in `/doctrine/claude-pack/`
- `AGENTS.md` (Codex-specific preamble) → lives in `/doctrine/codex-pack/` (when codex builds one)
- Harness configs (`settings.json`, `.mcp.json`, plugin registries) → flavor-specific
- Memory index files (`MEMORY.md` for Claude's auto-memory, codex's equivalent) → flavor-specific format

If you find yourself writing a file twice — once for Claude, once for Codex, and the *content* is identical — it belongs in this tree.

If the content is shared but the runtime projection is different, keep the file here and let the profile TOC / flavor manifest decide how it gets consumed.

## Layout

```
shared/
  rules/
    feedback/    behavior rules ("don't do X because Y")
    reference/   pointers to external systems (Itchy Brain, NuGet feed, etc.)
    project/     in-flight initiative context (operator scratch — not durable doctrine)
  commands/      slash-command bodies (/roomup, /shipit, /tombstone)
  skills/        skill packs (each is a directory with SKILL.md and any scripts)
  hooks/         executable hook scripts
```

## How a flavor pack consumes this

A flavor manifest item that lives in shared/ has `source: "shared"` and a `url` under `/doctrine/shared/...`. The bootstrap script doesn't care which tree the file came from — it fetches the URL, verifies sha256, and projects it to `projectionTarget` on the operator machine.

When two flavor packs both reference `/doctrine/shared/rules/feedback/feedback_ui_canon_first.md`, they're guaranteed identical. Edit once, both runtimes get the change on next bootstrap.

## Editing rules

1. Edit the file in `shared/`
2. Run `npm run build` (or at minimum `npm run build:doctrine` plus `npm run build:claude-pack`) to refresh the shared catalog, profiles, and manifests with new sha256s
3. Deploy: `bash scripts/deploy.sh apply`
4. Operators re-run their bootstrap to pick up the new content

Do not duplicate a shared rule into a flavor pack. If a rule has a runtime-specific twist, the rule body still lives here; the runtime-specific projection is handled by the flavor pack's manifest, not by forking the file.
