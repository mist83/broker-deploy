Run the bookmark/breadcrumb protocol — evidence-backed end-of-chat triage. One protocol, one response shape, every chat.

Usage: `/bookmark`, `/bm`, `/breadcrumb`, or `/bp` — same thing.

## Procedure

Execute `feedback_breadcrumb_protocol` verbatim. The full protocol lives at:

https://agent.mullmania.com/doctrine/shared/rules/feedback/feedback_breadcrumb_protocol.md

Before answering, finish bounded closure work if this is nearly a natural stopping point: verification, commit/push where appropriate, deploy/live check, proof recording/upload, manifest sync, source-chat link capture, and the per-repo proof breadcrumb (`.proof.json` or equivalent).

If the protocol was already completed in this chat and no meaningful state changed afterward, do not invent new unattended work or make duplicate proof. Reuse the existing bookmark/proof and say the operator is spinning wheels inside the fixed three-line response.

After a successful bookmark/breadcrumb, treat the chat as chapter-closed. If the operator later asks for a new substantial feature or next chapter in this same chat, do not start automatically. Remind them this chat is already bookmarked and recommend opening a fresh chat with the bookmark/proof/resume trail. Continue in the polluted chat only after explicit verbal authorization such as `continue here` or `use this chat anyway`.

The response shape is fixed: exactly three lines. Each line leads with `✅` (yes) or `🚨` (no), then the label, then **yes** / **no**, em-dash, concise reason or proof URL.

```
✅ bookmark:        yes — <durable resume trail captured>
✅ visual evidence: yes — <videos.mullmania.com proof URL or explicit fallback>
✅ safe to close:   yes — <verified, chapter closed, no chat-only state>
```

No header, no preamble, no recap, no extra emoji beyond the three line markers, no follow-up question, no fourth line. If any line is **no**, swap that line's `✅` for `🚨` and name the single most blocking gap.

For natural stopping points, create or attach proof evidence. Accepted proof is **either** a real usage video **or at least 6 hosted screenshots** that walk the key states/interactions (initial → primary action → a state change → result); six or more hosted shots are a full `visual evidence: yes`, not a fallback. If you choose the video form, it should be real usage, not a slow snapshot reel: drive the changed software or feature through Playwright/browser/app automation where practical, target roughly 30 FPS and 30-60 seconds for normal feature proof, and show meaningful interaction or state change. When video proof is required or chosen and no task-specific style says otherwise, make it narrated instead of silent: explain the premise/action/result as it happens, use dry concise humor, add only rare extra voices when the repo naturally supports roles, and use generated/licensed lo-fi techno or outrun-style music with a crescendo and beat drop aligned to meaningful state changes. Use the Storyboard/films pipeline when available; if capture or audio is hand-rolled, preserve the exact recipe/request in the breadcrumb. Inspect the final video before upload or `visual evidence: yes`: watch it when practical, or sample representative frames plus metadata, and reject choppy, laggy, confusing, slideshow-style, mostly blank/loading, or non-explanatory proof. Treat recording as product QA: if recording exposes broken or awkward software, fix the product within scope and re-record instead of hiding it with a staged route. If the task already produced a useful video artifact, use that. If there is no meaningful visual surface, do not make random video for video's sake; use the strongest hosted fallback and label it as fallback. Upload proof under `s3://mullmania.com/videos/proof/<repo>/<slug>.mp4`, with a poster frame and provenance sidecar, then `cd /Users/mist83/Code/videos.mullmania.com && node scripts/sync-manifest.mjs --publish`. Update/create the source repo's `.proof.json` breadcrumb with the repo feed, cross-cut proof feed, dashboard, flipbook, latest deposit pointer, chronological fields (`timeline_at`, source, precision when known), and `created_by_chat` provenance. Repeat `created_by_chat` on every video, poster, screenshot, evidence page, sidecar, feed milestone, or fallback asset object so a separated asset still points back to the exact chat that created it. If the runtime cannot expose a navigable chat URL, record the exact runtime/thread/session/archive locator; if no exact pointer can be captured, `bookmark: yes` is not allowed. Verify `https://videos.mullmania.com/?tag=<repo>#feed` or the direct video URL before marking `visual evidence: yes`.

When the chat had an `/overdrive` session, the 12-item overdrive homework (chapters shipped + SHAs, tests that fail without the fix, suite green, stability runs, RegressionTestCount bumped, snapshots refreshed, pushed, deployed + live-verified, cross-cutting runs, combinatorial flags, deferred items captured, no refactors / no contract breaks / no silent dep upgrades / no aesthetic drift) must be honestly verified BEFORE stamping `safe to close: yes`. That checklist is internal homework — it does not appear in the response. The operator is scrolling for the bottom line; the bottom line is three lines.

If the rule URL is unreachable, stop visibly. Do not improvise the protocol.

ARGUMENTS: $ARGUMENTS
