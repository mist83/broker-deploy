Run the bookmark protocol — evidence-backed end-of-chat triage. This is the preferred name for the legacy breadcrumb protocol.

Usage: `/bookmark` or `/bm`

## Procedure

Execute `feedback_breadcrumb_protocol` verbatim. The full protocol lives at:

https://agent.mullmania.com/doctrine/shared/rules/feedback/feedback_breadcrumb_protocol.md

This command is not just a status question. If the task is close to a natural stopping point, finish bounded closure work first: verification, commit/push where appropriate, deploy/live check, proof recording/upload, and manifest sync.

If `bookmark` was already completed in this chat and no meaningful state changed afterward, do not invent new unattended work or make duplicate proof. Reuse the existing bookmark/proof and say the operator is spinning wheels inside the fixed three-line response.

For natural stopping points, create or attach proof evidence. Preferred proof is a real usage video, not a slow snapshot reel: drive the changed software or feature through Playwright/browser/app automation where practical, target roughly 30 FPS and 30-60 seconds for normal feature proof, and show meaningful interaction or state change. Inspect the final video before upload or `visual evidence: yes`: watch it when practical, or sample representative frames plus metadata, and reject choppy, laggy, confusing, slideshow-style, mostly blank/loading, or non-explanatory proof. If recording exposes broken or awkward software, fix the product within scope and re-record instead of hiding it with a staged route. If the task already produced a useful video artifact, use that. If there is no meaningful visual surface, do not make random video for video's sake; use the strongest hosted fallback and label it as fallback. Upload proof under `s3://mullmania.com/videos/proof/<repo>/<slug>.mp4`, with a poster frame, then `cd /Users/mist83/Code/videos.mullmania.com && node scripts/sync-manifest.mjs --publish`. Verify `https://videos.mullmania.com/?tag=<repo>#feed` or the direct video URL before marking `visual evidence: yes`.

The response shape is fixed: exactly three lines.

```
✅ bookmark:        yes — <durable resume trail captured>
✅ visual evidence: yes — <videos.mullmania.com proof URL or explicit fallback>
✅ safe to close:   yes — <verified, clean, no chat-only state>
```

No header, no preamble, no recap, no follow-up question, no fourth line.

If the rule URL is unreachable, stop visibly. Do not improvise the protocol.

ARGUMENTS: $ARGUMENTS
