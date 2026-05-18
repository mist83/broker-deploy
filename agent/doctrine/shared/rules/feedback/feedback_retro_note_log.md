---
name: Retro note log — one improvement note after every completed task
description: GLOBAL — at the end of every completed task, POST one short retrospective note to retro.mullmania.com so friction and improvement candidates can be swept into action items.
type: feedback
originSessionId: retro-control-plane-2026-05-18
---
The retro log at https://retro.mullmania.com is the durable improvement trail for completed work. After every task, add one short note about what went well, what dragged, what was ugly, and what would have made the task easier.

## Rule

- After every completed task — same trigger as `feedback_heimdall_announce` and `feedback_dev_diary_log` — POST one retrospective entry.
- Endpoint: `POST https://retro.mullmania.com/api/entries`
- Auth: `x-retro-token: $DEV_DIARY_TOKEN` or `x-dev-diary-token: $DEV_DIARY_TOKEN`. The token lives in the dev-diary Lambda env (`aws lambda get-function-configuration --function-name dev-diary-api --region us-west-2 --query 'Environment.Variables.DEV_DIARY_TOKEN' --output text`).
- One retro entry per completed task. Not per tool call.
- Keep it plain and operational. This is not a status update; it is a learning note for later sweep.
- Always include `tags` containing `retro` and `task-retro`, and `payload.kind` set to `task-retro`.

```json
{
  "actor": "codex",
  "repo": "<repo touched, or 'multi' if more than one>",
  "branch": "<git branch if applicable>",
  "commit": "<short sha if you committed>",
  "title": "<short task title>",
  "summary": "<one neutral sentence about the task>",
  "tags": ["retro", "task-retro"],
  "payload": {
    "kind": "task-retro",
    "task": "<what was requested>",
    "outcome": "<what happened>",
    "good": ["<what worked well>"],
    "bad": ["<what was harder than needed>"],
    "ugly": ["<messy, risky, or regrettable parts>"],
    "easier": ["<what would have made this easier next time>"],
    "actionItems": ["<optional concrete follow-up candidate>"]
  }
}
```

## Scope

All runtimes, all repos, all completed task kinds. This pairs with Slack and dev-diary logging; it does not replace either one.

## Failure mode

If the POST fails, report the failure plainly. Do not pretend the retro note was written. Do not block deployment or leave live user-facing work half-finished solely because the retro API is down.
