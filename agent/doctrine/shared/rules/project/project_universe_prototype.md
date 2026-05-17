---
name: Universe prototype (read-only ecosystem observatory)
description: Local prototype at ~/Code/universe/ — deterministic canvas visualization of the mist83/* ecosystem as a themed universe; sibling to scaffold-generator initiative.
type: project
---

# Universe prototype

**Started:** 2026-04-17. Phase-A-through-E walking skeleton, local only, no git init, no deploy.

## What it is

Read-only observatory over `~/Code/*`. Walks 192 dirs, classifies 184 as typed entities (archetypes: canon-source, interactive-site, library, worker, broadcaster, defunct, tombstone, repo), renders as a navigable universe with swappable themes.

**Why:** Mike had a long ChatGPT chat deriving the "universe as visualization" architecture independently. Rather than let it evaporate, scoped and built a Mullmania-native prototype in one session.

**How to apply:** When Mike returns to visualization / DAG composer / "show me the ecosystem" work, start here, not from scratch. Run `node tests/determinism.mjs` first — it's the canary.

## Key facts that are NOT in the code

- **Scored `~/Code/dag` as 4/20, 4/5 fatal flaws → scrap-and-rebuild as sibling, not parent.** `dag` is a user-authored editor; universe is a data-driven observatory. Different primary use cases. Do not let any agent "merge" them without re-reading `~/Code/universe/docs/rubric-scores.md`.
- **10 questions backlogged for Mike** at `~/Code/universe/docs/questions-for-mike.md`. Q1 (where does this live?) and Q3 (first relation kind?) block further work.
- **Hard rule inherited from global memory:** `ui.[base-url]` only, derive base from hostname, no hardcoded brand domains. Universe prototype honors this via `deriveUiBase()` in `src/main.js`.

## Architecture contract (do not violate)

```
source -> canonical model -> layout -> theme -> render
          (truth, frozen)    (place)   (skin)
```

- Themes may not change IDs, topology, or query results
- IDs are `sha256(namespace, kind, name).slice(0,16)` — no randomness
- snapshot_id hashes over canonical content only (no wall-clock, no randomness)
- Layout is deterministic, local-stable (adding one repo does not reflow others)

## Current status

- ✅ Determinism gate passing (sha256 `c67c2ddd...`)
- ✅ Baseline ↔ space theme swap proves translation layer
- ✅ Pulsar behavior on broadcaster archetype (signal-argh)
- ⚠️ Relations array is empty — no edges drawn yet
- ❌ Semantic zoom is one level only
- ❌ Activity layer deferred
- ❌ Not deployed anywhere

## Entry point for future sessions

`~/Code/universe/docs/next-steps.md` contains the phase plan + handoff brief for the next agent.

## Related memories

- `project_scaffold_generator_initiative.md` — eventual end-state meet point (universe becomes write surface for `mullmania.site.json`)
- `feedback_visual_programming_mantra.md` — aesthetic constraints applied (precog theme, Minority Report vibe)
- `feedback_ui_framework_first.md` — ui.[base-url] CSS vars used throughout; no hand-rolled layout CSS
