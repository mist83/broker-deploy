---
name: Breadcrumb protocol — terse end-of-chat triage
description: GLOBAL — when the operator invokes the breadcrumb protocol, respond with exactly two answers (breadcrumbs laid? safe to close?) and nothing else.
type: feedback
originSessionId: dance-party-handoff-2026-05-22
---

The operator orchestrates many chats in parallel as a puppeteer. They cannot delegate which chat they're talking to, so they need a uniform, fast, no-frills "is this chat at a clean stopping point?" check that they can ask every chat the same way.

## Trigger

Any of: `breadcrumb protocol`, `bread protocol`, `bp`, `crumbs`, `safe to close`, `safe to close?`, `is this safe to close`, `BP?`. Case-insensitive. Substring match — if the user says "ok bp" or "breadcrumbs?" treat it as the trigger.

Do not require the operator to spell out what they mean. They know. Do not ask for clarification.

## Response shape (the only valid shape)

Exactly two answers. Each is one line. Each starts with **yes** or **no**, followed by an em-dash, followed by ≤12 words of reason.

```
breadcrumbs laid: yes — <≤12 words>
safe to close:    yes — <≤12 words>
```

If either is **no**, name the specific gap in the ≤12-word reason. Do not list multiple gaps. Pick the most blocking one.

That is the entire response. No header, no preamble, no suggestion, no "want me to fix that?", no offer of next steps, no recap of work, no emoji, no follow-up question. The operator did not ask for any of those things. They asked the two questions.

## What "breadcrumbs laid" means (the substantive check)

All five must be true:

1. **Pushed**: every meaningful commit is on the canonical remote. No local-only work that matters.
2. **Single source of truth**: no orphan copy of the work in a second repo / second path. Future-me lands in one place.
3. **Next-step trail**: the canonical repo has a README, context sidecar, or pinned doc that tells the next agent (or future operator) exactly what to do to ship the next change. Includes the exact deploy command if there is one.
4. **Deployed = local**: if the work has a live target, the live target matches the canonical source.
5. **Retro logged**: a retro note for the most recent completed task is posted (per `feedback_retro_note_log`).

If any of those is false, the answer is **no** and the reason names which one.

## What "safe to close" means

All three must be true:

1. No pending operator question the chat is waiting on the operator to answer.
2. No background process / running task that only exists inside this chat's runtime (foreground server processes are fine — those survive; the question is about chat-bound work).
3. Local working tree is either clean OR the dirty state is intentional and documented in the canonical next-step trail.

If any is false, the answer is **no** and the reason names which one.

## Anti-patterns (do not do)

- Do not turn the breadcrumb check into a status report. The operator gets that from other chats. This is a triage primitive.
- Do not suggest improvements to the operator's workflow when answering. They explicitly said: do not suggest anything to make this part of their life easier. They know what they need.
- Do not be literal-minded about phrasing variants. Any reasonable shorthand for "is this done and can I close" is the trigger.
- Do not add a third line, a follow-up, or a closing remark.
- If you're tempted to write more — don't. The operator is moving fast across many chats. Brevity is the gift.

## Why this rule exists

Direct operator instruction, 2026-05-22, end of the dance-party productionalization session: "I am being a puppeteer for several chats. I am orchestrating them myself, but they are so orthogonal an idea, I cannot delegate this." They built this rule so they can ask every chat the same shorthand question and get a uniform two-line answer.
