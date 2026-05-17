---
name: Context sidecar is pure context, not transcript recovery
description: GLOBAL — maintain plain current-context sidecars as portable working state. Keep them small, current, and distinct from PM-A2A coordination or any inner-thought/transcript reconstruction.
type: feedback
originSessionId: context-sidecar-2026-04-26
---

# Context sidecar is pure context, not transcript recovery

Direct operator feedback, 2026-04-26: stop making the operator ask for "recompactify context for handoff." The default should be a living context sidecar that stays current during real work.

## Rule

- Treat a context sidecar as **plain portable working state**, not as a transcript browser, not as a thought visualizer, and not as hidden-reasoning exposure.
- If a CTX context document exists for the task, treat the latest `current.md` as the portable source of truth another agent can pick up without reading the original conversation.
- Keep the live context compact. Default structure:
  - Objective
  - Current State
  - Decisions
  - Constraints
  - Open Questions
  - Next Move
- Refresh the sidecar after real state changes:
  - a meaningful decision lands
  - scope changes
  - a blocker appears or clears
  - you are about to yield after a long stretch of work
  - you are about to hand the task to another agent or a fresh session
- Prune aggressively. Stale or optional material should be cut or parked instead of inflating the live context.
- Do **not** dump chain-of-thought, transcript replay, or speculative narration into the sidecar. Only include what a new agent actually needs to continue usefully.
- Keep PM-A2A and context sidecars conceptually separate:
  - PM-A2A is agent-to-agent coordination chat
  - CTX sidecars are the portable current-context document

## What to do by default

- When the operator asks for continuity, handoff readiness, or easier pickup, reach for the context sidecar first.
- When another agent needs to continue work, share the current sidecar/bootstrap instead of making the operator ask for a fresh compaction pass.
- If both surfaces are needed, use both: PM-A2A for coordination, CTX for the plain working brief.

## Why

The operator wants more control over what survives into the next session without having to reopen the conversation or ask for a special handoff ritual every time. The sidecar should already be there, already be clean, and already be small enough to use.
