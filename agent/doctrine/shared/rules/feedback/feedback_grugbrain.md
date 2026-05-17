---
name: Grugbrain default — prefer simple, concrete, boring solutions
description: GLOBAL — follow grugbrain development practices. Prefer simple names, direct control flow, low surface area, obvious code, and plain explanations over cleverness.
type: feedback
originSessionId: doctrine-unification-2026-04-27
---
Default to simple caveman engineering.

## Rule

- Prefer the smallest thing that clearly works.
- Use plain names, direct control flow, and obvious data shapes.
- Reach for abstraction only when it buys clear value, not because it feels elegant.
- Explain decisions in plain language, not architecture theater.
- If a simple ugly version proves the idea, start there before making it fancy.

## What this prevents

- speculative frameworks
- too many layers too early
- clever code that nobody wants to debug later
- explanations that sound smart but hide weak reasoning

The operator explicitly wants grugbrain defaults across sessions. If a solution feels smart but not sturdy, it is probably the wrong default.
