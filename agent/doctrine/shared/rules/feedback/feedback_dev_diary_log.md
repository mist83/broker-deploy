---
name: Dev diary log — short narrative entry after every completed task
description: GLOBAL — at the end of every completed task, POST a short JSON entry to the dev-diary API so the operator has a permanent narrative trail with screenshot links alongside Slack and S3.
type: feedback
originSessionId: xbox-achievement-bootstrap-2026-04-30
---
The dev diary at https://dev-diary.mullmania.com is the durable narrative trail for everything you do. After every completed task, append one short JSON entry so the operator has a browsable story of what changed, why, and where the proof lives.

## Rule

- After every completed task — same trigger as `feedback_heimdall_announce` — POST a short entry to the dev-diary API.
- Endpoint: `POST https://dev-diary.mullmania.com/api/entries`
- Auth: `x-dev-diary-token: $DEV_DIARY_TOKEN`. The token lives in the Lambda env (`aws lambda get-function-configuration --function-name dev-diary-api --region us-west-2 --query 'Environment.Variables.DEV_DIARY_TOKEN' --output text`). Cache it in your shell env or fetch on demand.
- One entry per completed task. Not per tool call.
- Body shape (all fields except title are optional but use them when you have the info):

```json
{
  "actor": "claude",
  "repo": "<repo touched, or 'multi' if more than one>",
  "branch": "<git branch if applicable>",
  "commit": "<short sha if you committed>",
  "title": "<imperative one-liner, like a commit message>",
  "summary": "<1-3 sentences: what changed, why, what's verified>",
  "tags": ["<short tags like 'lambda', 'ui', 'doctrine', 'deploy'>"],
  "payload": { "<arbitrary structured detail relevant to the task>" }
}
```

- If you produced a screenshot or any durable image, attach it via `POST /api/entries/<entry-id>/screenshots` with `{ "url": "/media/<repo>/<file>", "label": "..." }`. The `/media/...` path resolves to `images.mullmania.com` at render time.
- Plain neutral language. No marketing copy. No emoji-spam. The dev diary is read like a logbook, not a pitch.
- If the POST fails (network, 401, 5xx), report the failure plainly and continue. Do not pretend the entry was written.

## Why

Slack (heimdall) is conversational — it scrolls past. S3 is the artifact pile — unbrowsable narratively. The dev diary is the third pillar: a permanent timeline the operator can scrub through, with screenshots attached, that survives long after a Slack scroll. Without the entry, real work has no narrative trace anyone but the operator's transcript can replay.

## Scope

All runtimes, all repos, all task kinds. Pairs with `feedback_heimdall_announce` (Slack note) — both fire at the same trigger; neither replaces the other.

## Failure mode

If `DEV_DIARY_TOKEN` is unset, fetch it from the dev-diary Lambda env once and export it in the shell, then retry. Do not silently skip. If the API itself is down, report the failure and proceed — the Slack note still goes out.
