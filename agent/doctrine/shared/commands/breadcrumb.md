Run the breadcrumb protocol — terse end-of-chat triage. One protocol, one response shape, every chat.

Usage: `/breadcrumb` (or `/bp` — same thing)

## Procedure

Execute `feedback_breadcrumb_protocol` verbatim. The full protocol lives at:

https://agent.mullmania.com/doctrine/shared/rules/feedback/feedback_breadcrumb_protocol.md

The response shape is fixed: exactly two lines. Each line leads with `✅` (yes) or `🚨` (no), then the label, then **yes** / **no**, em-dash, ≤12 words of reason.

```
✅ breadcrumbs laid: yes — <≤12 words>
✅ safe to close:    yes — <≤12 words>
```

No header, no preamble, no recap, no extra emoji beyond the two line markers, no follow-up question, no third line. If either is **no**, swap that line's `✅` for `🚨` and name the single most blocking gap.

When the chat had an `/overdrive` session, the 13-item overdrive homework (chapters shipped + SHAs, tests that fail without the fix, suite green, stability runs, RegressionTestCount bumped, snapshots refreshed, pushed, deployed + live-verified, cross-cutting runs, combinatorial flags, retro posted, deferred items captured, no refactors / no contract breaks / no silent dep upgrades / no aesthetic drift) must be honestly verified BEFORE stamping `safe to close: yes`. That checklist is internal homework — it does not appear in the response. The operator is scrolling for the bottom line; the bottom line is two lines.

If the rule URL is unreachable, stop visibly. Do not improvise the protocol.

ARGUMENTS: $ARGUMENTS
