Run the bookmark protocol — evidence-backed end-of-chat triage. This is the preferred name for the legacy breadcrumb protocol.

Usage: `/bookmark` or `/bm`

## Procedure

Execute `feedback_breadcrumb_protocol` verbatim. The full protocol lives at:

https://agent.mullmania.com/doctrine/shared/rules/feedback/feedback_breadcrumb_protocol.md

This command is not just a status question. If the task is close to a natural stopping point, finish bounded closure work first: verification, commit/push where appropriate, deploy/live check, proof recording/upload, and manifest sync.

For natural stopping points, create or attach proof evidence. Preferred proof is a short video uploaded under `s3://mullmania.com/videos/proof/<repo>/<slug>.mp4`, with a poster frame, then `cd /Users/mist83/Code/videos.mullmania.com && node scripts/sync-manifest.mjs --publish`. Verify `https://videos.mullmania.com/?tag=<repo>#feed` or the direct video URL before marking `visual evidence: yes`.

The response shape is fixed: exactly three lines.

```
✅ bookmark:        yes — <durable resume trail captured>
✅ visual evidence: yes — <videos.mullmania.com proof URL or explicit fallback>
✅ safe to close:   yes — <verified, clean, no chat-only state>
```

No header, no preamble, no recap, no follow-up question, no fourth line.

If the rule URL is unreachable, stop visibly. Do not improvise the protocol.

ARGUMENTS: $ARGUMENTS
