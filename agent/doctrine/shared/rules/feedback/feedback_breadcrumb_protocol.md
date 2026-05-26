---
name: Bookmark protocol — evidence-backed end-of-chat triage
description: GLOBAL — when the operator invokes bookmark/breadcrumb shorthand, finish any reachable stopping-point work, create durable proof evidence when appropriate, then answer with the fixed bookmark checklist.
type: feedback
originSessionId: dance-party-handoff-2026-05-22
---

When this protocol triggers, answer with exactly three lines: `bookmark`, `visual evidence`, and `safe to close`. A `yes` closeout requires a durable resume trail plus hosted proof evidence, preferably a real usage video on `videos.mullmania.com`, and a readable milestone card on `feed.mullmania.com` whenever the feed repo and deploy path are reachable; if the chat is near a natural stopping point, finish bounded verification, commit/push, deploy, proof upload, manifest sync, per-repo proof breadcrumb update, public feed milestone update, and source-chat link capture before answering. The `visual evidence` line should prefer the `feed.mullmania.com/#<milestone-id>` URL because that card is the operator-readable front door to proof, commits, live URLs, breadcrumbs, and chat locators. Every proof asset and fallback asset created by the bookmark must point back to the specific chat that created it so the operator can identify the exact archived chat to reopen. When visual proof is applicable, the video should demonstrate the implemented software or feature in use at roughly 30 FPS for 30-60 seconds, not a slow snapshot reel. The agent must inspect the final video for clarity, smoothness, and explanatory value before marking proof valid; choppy, laggy, confusing, or slideshow-style recordings are failed proof. Proof recording is product QA: if the user-perspective recording exposes broken or awkward software, fix within scope and re-record instead of hiding the defect with a staged route. A successful bookmark closes the chapter: later new-feature work should move to a fresh chat unless the operator gives explicit verbal authorization to continue in the polluted chat. Repeated `bookmark` requests are idempotent: if no meaningful state changed after a successful bookmark, do not invent new unattended work or create new proof; reuse the existing result/feed milestone and tell the operator they are spinning wheels.

The operator orchestrates many chats in parallel as a puppeteer. They cannot delegate which chat they're talking to, so they need a uniform, fast, no-frills "is this chat at a clean stopping point?" check that they can ask every chat the same way.

This is the ONE protocol. Both slash commands (`/bookmark`, `/bm`, `/breadcrumb`, `/bp`) and typed shorthand (`bookmark`, `bm`, `bp`, `crumbs`, `safe to close`, etc.) route here. Same triggers, same response shape, every chat.

The current preferred name is **bookmark**. Breadcrumb remains a legacy alias.

## Trigger

Any of: `/bookmark`, `/bm`, `bookmark protocol`, `bookmark`, `bookmark?`, `bm`, `/breadcrumb`, `/bp`, `breadcrumb protocol`, `bread protocol`, `breadcrumb`, `bp`, `crumbs`, `safe to close`, `safe to close?`, `is this safe to close`, `BP?`. Case-insensitive. Substring match — if the user says "ok bookmark", "bookmark this", "ok bp", or "breadcrumbs?" treat it as the trigger.

Do not require the operator to spell out what they mean. They know. Do not ask for clarification.

## Behavior before answering

This is not only a question. It is a small closing protocol.

Before answering, inspect the current task state. If this is almost a natural stopping point and the remaining work is bounded, finish the missing closure work instead of asking the operator to do it. Examples: run the last verification, commit obvious final changes, deploy when the task expects live behavior, upload proof evidence, sync manifests, update the repo proof breadcrumb, append or update the public feed milestone, capture the current chat URL or exact chat locator, and verify live URLs.

Treat proof recording as product QA. If making the user-perspective proof video exposes broken, laggy, incoherent, or awkward software, do not work around it with a flattering recording. Fix the product within the original request and non-destructive edit constraints, then re-record. If the needed fix is too broad, risky, or requires an operator decision, answer `no` with that blocker.

If reaching a stopping point is not bounded or would require an operator decision, do not guess. Answer `no` with the single blocking gap.

## Repeated invocation / idempotence

This protocol is not a work generator. If the operator invokes `bookmark` again after a successful bookmark and no meaningful task state has changed, do not run new unattended work, do not create another proof video, and do not hunt for new tasks to justify the repeated command.

Instead, reuse the prior durable trail, proof pointer, and feed milestone. Keep the exact three-line response shape, and make the wheel-spinning state obvious in the reason:

```
✅ bookmark:        yes — already captured; no new state
✅ visual evidence: yes — <same feed milestone or proof URL>
✅ safe to close:   yes — already safe; spinning wheels
```

If the previous bookmark was **no** and nothing changed, repeat the same blocking gap. If meaningful work happened after the prior bookmark, run the protocol normally.

## Post-bookmark chapter boundary

A successful bookmark means the current chapter can be closed. The bookmark is a shim for future pickup, not permission to keep appending unrelated work into the same context.

After a successful bookmark, if the operator asks for a new feature, unrelated fix, or any substantial next chapter in the same chat, do not start automatically. Reply briefly that this chat is already bookmarked and the cleaner move is to open a new chat with the bookmark/proof/resume trail. Require explicit verbal authorization before continuing in the polluted chat.

Overdrive exception: if the next operator command after a successful bookmark is only `overdrive`, `/overdrive`, `@overdrive`, or another clear Overdrive invocation, treat that Overdrive request itself as authorization to continue. Emit a loud one-line warning with leading `🚨🚨` that the chat was already bookmarked and a new chapter is starting, then run Overdrive instead of blocking. This exists so unattended refinement workflows can chain `bookmark` -> `overdrive` without a second approval prompt.

Acceptable authorization examples: `continue here`, `use this chat anyway`, `authorized to continue in this chat`, `overdrive` after a bookmark, or an equally clear operator statement.

If the operator authorizes continuing, proceed normally, but the old bookmark no longer covers the new chapter. The next `bookmark` after new work must evaluate the new state and create or reuse proof only when appropriate.

Exceptions:

1. A tiny clarification about the already-bookmarked work may be answered directly.
2. A task that truly depends on unrecoverable chat-only context may continue after calling out why this chat context is needed.
3. Emergency repair of a failed bookmark artifact may continue because it belongs to closing the same chapter.

## Response shape (the only valid shape)

Exactly three answers. Each is one line. Each line starts with `✅` (yes) or `🚨` (no), followed by the label, then **yes** or **no**, em-dash, concise reason or proof URL. The leading emoji is the scannable marker — it's what the operator's eye locks onto first.

```
✅ bookmark:        yes — <durable resume trail captured>
✅ visual evidence: yes — <feed.mullmania.com milestone URL, proof URL, or explicit fallback>
✅ safe to close:   yes — <verified, chapter closed, no chat-only state>
```

If any line is **no**, swap that line's leading `✅` for `🚨` and name the specific gap in the reason. Do not list multiple gaps. Pick the most blocking one.

```
✅ bookmark:        yes — resume doc and commits are durable
🚨 visual evidence: no — proof video missing
🚨 safe to close:   no — evidence missing
```

That is the entire response. No header, no preamble, no suggestion, no "want me to fix that?", no offer of next steps, no recap of work, no extra emoji beyond the three line markers, no follow-up question. The operator did not ask for any of those things. They asked whether the chat can be closed with a durable bookmark.

## What "bookmark" means (the substantive check)

All seven must be true:

1. **Canonical source**: every meaningful change is committed in the correct repo. If a canonical remote exists, commits are pushed or the missing push is named as the blocker.
2. **Single source of truth**: no orphan copy of the work in a second repo / second path. Future-me lands in one place.
3. **Next-step trail**: the canonical repo has a README, context sidecar, or pinned doc that tells the next agent (or future operator) exactly what to do to ship the next change. Includes the exact deploy command if there is one.
4. **Deployed = local**: if the work has a live target, the live target matches the canonical source.
5. **Proof pointer**: the closeout answer includes the feed milestone URL or proof evidence URL, or says exactly why proof could not be produced.
6. **Breadcrumb pointer**: the canonical repo has a durable `.proof.json` breadcrumb or equivalent pinned doc pointing at its proof vault/feed and latest deposit, unless the repo is read-only or the proof is intentionally owned elsewhere.
7. **Source-chat pointer**: every proof asset, poster asset, fallback artifact, and breadcrumb deposit created by the bookmark includes a `created_by_chat` pointer with a navigable chat URL when the runtime exposes one, or an exact runtime/thread/session locator when it does not. If neither can be captured, the bookmark is **no** because the operator cannot know which archived chat to reopen.
8. **Feed milestone pointer**: when `~/Code/feed.mullmania.com` and its deploy path are reachable, the bookmark has a newest-first milestone in `data/milestones.json` using schema `feed.mullmania.com/milestone-feed-v1`, deployed to `https://feed.mullmania.com/#<milestone-id>`, and the `visual evidence` line points there first. If this is blocked after bounded effort, name the blocker and include the direct proof fallback.

If any of those is false, the answer is **no** and the reason names which one.

## What "visual evidence" means

At a natural stopping point, create or attach a short proof artifact so future-Mike can remember the work visually without rereading the chat. Also create the human-readable feed milestone so the proof is not hidden inside a raw asset URL.

Preferred proof is a short hosted video, but only when it helps future-Mike recognize the completed work. Do not make random videos for video's sake.

Quality bar for applicable software or feature proof:

1. Show real usage of the changed software or feature, not just static screenshots, slow page pans, or a slideshow.
2. Drive the workflow through Playwright, browser automation, app automation, or a comparable real runtime path whenever practical.
3. Target roughly 30 FPS and 30-60 seconds for normal feature proof. Longer is acceptable only when the delivered work is unusually large or the proof video is itself a primary artifact.
4. Exercise the primary path and at least one meaningful state change: click, type, drag, navigate, generate output, save, load, filter, play, or otherwise use the thing that changed.
5. Make the video explanatory for a distracted future viewer: visible product context, visible action, visible outcome, and enough dwell time to understand what happened.
6. If the task already produced a meaningful video artifact, use that artifact instead of recording another proof video.
7. If the task has no meaningful visual surface, do not manufacture a fake video. Use the strongest hosted fallback and label it as fallback in the `visual evidence` line.

Proof QA gate before upload or `visual evidence: yes`:

1. Inspect the final recording, not only the script that produced it. Watch it when practical, or sample representative frames at start/middle/end plus key interactions.
2. Check metadata with `ffprobe` or equivalent: duration, resolution, and frame rate should match the applicable quality bar.
3. Reject proof that is choppy, laggy, mostly blank/loading, too fast to understand, a slideshow, a slow pan over static screenshots, or disconnected from the feature that changed.
4. If the video is poor because the software is poor, fix the software within scope and re-record. Do not hide the defect with a narrower staged route.
5. If clear proof cannot be produced after bounded effort, mark `visual evidence: no` and `safe to close: no`.

Proof film default when video is required or chosen:

1. Do not produce silent proof video by default. Use narration unless the work is genuinely better without it or the runtime blocks audio; if silent, state that as the fallback.
2. Narration must explain what is happening at the moment it happens: the premise, the action, the expected result, and the proof that it worked. Choreograph and telegraph the "plays" so a future human can follow the clip without reading the chat.
3. Default voice: dry, concise, slightly sarcastic operator-friendly narration from the primary voice. Use additional voices rarely and only when the repo or feature naturally has distinct roles (for example, a fighter/game repo can justify character voices). Do not turn every proof into a sketch.
4. Use generated or licensed music only. Default style, unless the repo suggests otherwise: lo-fi techno or outrun bed with a visible build, crescendo, and beat drop aligned to meaningful state changes. No copyrighted tracks unless the operator explicitly supplies rights.
5. Vary the film grammar by repo. Match the app's actual personality: devtool, game, finance app, proof vault, visual toy, or backend API should not all sound the same.
6. Use pitch, speed, pauses, captions, and beat timing sparingly to make key state changes legible, not as random effects.
7. Prefer the shared Storyboard/films pipeline when available; if the proof video needed manual post-processing, leave the recipe or request payload in the durable breadcrumb.
8. For chronological or backfilled work, make the video and its metadata tell the right time story. Use the work date/time as `timeline_at` when known, keep upload/deposit time separately, and label inferred chronology with `timeline_source` and precision instead of making old work look new.

Upload path:

1. Record the changed live/local surface with Playwright video, browser recording, OS screen capture, or an existing product-specific recorder.
2. Convert to MP4 when practical, preserving or encoding to 30 FPS when the source supports it. Add narration/music through Storyboard or the canonical films pipeline when video proof is the right artifact.
3. Run the proof QA gate above.
4. Upload video to `s3://mullmania.com/videos/proof/<repo>/<slug>.mp4`.
5. Upload a poster frame to the same proof folder.
6. Run `cd /Users/mist83/Code/videos.mullmania.com && node scripts/sync-manifest.mjs --publish`.
7. Update or create `<repo>/.proof.json` with schema `videos.mullmania.com/proof-breadcrumb-v1`, the repo tag, `vault_for_this_repo`, `vault_cross_cut`, `proof_dashboard`, `flipbook`, and a latest deposit entry containing the video URL, poster URL, provenance sidecar URL when available, local source path, deposited timestamp, chronological fields (`timeline_at`, `timeline_source`, `timeline_precision` when known), and `created_by_chat` pointer. Repeat the same `created_by_chat` pointer on every asset object in the deposit so a copied video URL, poster URL, screenshot, evidence page, sidecar, feed milestone, or fallback artifact can still be traced to the exact chat that created it.
8. Append or update the newest-first milestone in `~/Code/feed.mullmania.com/data/milestones.json` using schema `feed.mullmania.com/milestone-feed-v1`. Include the repo, title, summary, proof asset(s), live URL, commit URL, breadcrumb URL, and the same `created_by_chat` information as `chat`.
9. Commit and push the source repo breadcrumb when the repo is writable. Commit, push, deploy, and verify the feed repo when the feed path is reachable. If the source repo cannot own the breadcrumb, place the pointer in the strongest canonical handoff doc and name that location in the bookmark reason.
10. Verify the proof appears through `https://videos.mullmania.com/?tag=<repo>#feed`, the proof dashboard or flipbook when useful, the direct `https://mullmania.com/videos/proof/<repo>/<slug>.mp4` URL, or the feed milestone URL. Prefer the feed milestone URL in the final `visual evidence` line.

If the task has no meaningful visual surface or video capture is blocked by the runtime, create the strongest hosted fallback that exists (screenshots, live URL, commit SHAs, test summary, exact resume instructions). Put that fallback into the feed milestone when reachable so it is readable later. The `visual evidence` line may be **yes** only when that fallback is hosted/durable and the reason makes clear that it is a fallback. Otherwise it is **no** and `safe to close` is also **no**.

## Proof breadcrumbs

The proof repository is `videos.mullmania.com`. It turns objects under `s3://mullmania.com/videos/proof/<repo>/` into the repo feed, the cross-cut `proof` feed, the Proof dashboard, and the Flipbook. The public milestone repository is `feed.mullmania.com`; it turns proof and breadcrumb pointers into large readable cards. A bookmark is not complete just because the proof video exists in S3; the source repo also needs a small breadcrumb that future agents can read without remembering the proof system, and the feed should carry the operator-facing milestone whenever reachable.

## Source-chat links

Every bookmark-created asset needs origin provenance for chat recovery. The operator may archive chats but does not delete them; the breadcrumb must make the exact chat discoverable again.

This is an all-assets rule, not only a repo-level note. Any video, poster, screenshot, generated image, evidence page, feed milestone, DAG/state diagram, JSON sidecar, test transcript, or fallback artifact created during bookmark closeout must include either `created_by_chat` or `chat` on that asset object. If the hosting system supports per-asset sidecars, publish the sidecar next to the asset and link it from the catalog/manifest. If an asset can be separated from `.proof.json`, it still needs its own chat locator.

Chronology is part of provenance. For current work, `timeline_at` may equal the work/deposit day. For backfilled work, use the original work timestamp from chat logs, commits, proof metadata, or deploy metadata when available; otherwise mark the chronology as inferred or unknown. Do not sort a backfilled reel by upload time alone if that would make the story anachronistic.

Capture the strongest current-chat pointer the runtime exposes:

1. Prefer a navigable chat URL or app deep link that opens the exact Codex/Claude/chat thread.
2. If no URL exists, record the runtime name, thread id, session id, conversation id, archive locator, workspace path, and timestamp that uniquely identify the chat in that runtime.
3. If the runtime exposes both a URL and ids, keep both.
4. If the pointer cannot be captured, do not mark `bookmark: yes`; use the missing source-chat pointer as the blocking gap.

Preferred deposit shape:

```json
{
  "video_id": "<slug>",
  "site_src": "https://videos.mullmania.com/proof/<repo>/<slug>.mp4",
  "poster_src": "https://videos.mullmania.com/proof/<repo>/poster-<slug>.png",
  "provenance_src": "https://videos.mullmania.com/proof/<repo>/<slug>.provenance.json",
  "timeline_at": "<ISO-8601 work timestamp or inferred day>",
  "timeline_source": "<chat|commit|proof-metadata|deploy-metadata|filename|inferred|unknown>",
  "timeline_precision": "<timestamp|day|month|unknown>",
  "created_by_chat": {
    "runtime": "codex",
    "url": "<chat URL or app deep link when available>",
    "thread_id": "<thread id when available>",
    "session_id": "<session id when available>",
    "locator": "<exact archive/search locator when URL is unavailable>",
    "captured_at": "<ISO-8601 timestamp>"
  },
  "assets": [
    {
      "kind": "video",
      "url": "https://videos.mullmania.com/proof/<repo>/<slug>.mp4",
      "created_by_chat": { "url": "<same chat URL or locator>" },
      "timeline_at": "<same work timestamp>"
    },
    {
      "kind": "poster",
      "url": "https://videos.mullmania.com/proof/<repo>/poster-<slug>.png",
      "created_by_chat": { "url": "<same chat URL or locator>" },
      "timeline_at": "<same work timestamp>"
    }
  ],
  "deposited_at": "<ISO-8601 timestamp>"
}
```

For non-video fallback proof, use the same rule: the evidence page, screenshot, live URL proof note, test summary, feed milestone, or pinned handoff doc must include `created_by_chat` or `chat` with enough information to reopen the exact originating chat. A repo-level `.proof.json` pointer alone is not enough if the individual asset can be separated from the breadcrumb.

Preferred breadcrumb file:

```json
{
  "schema": "videos.mullmania.com/proof-breadcrumb-v1",
  "tag": "<repo>",
  "vault_for_this_repo": "https://videos.mullmania.com/?tag=<repo>#feed",
  "vault_cross_cut": "https://videos.mullmania.com/?tag=proof#feed",
  "proof_dashboard": "https://videos.mullmania.com/#proof",
  "flipbook": "https://videos.mullmania.com/#flipbook",
  "convention": "Drop any new proof video for this repo at s3://mullmania.com/videos/proof/<repo>/<name>.mp4 with poster-<name>.png and <name>.provenance.json alongside when available. Then run node scripts/sync-manifest.mjs --publish from videos.mullmania.com.",
  "deposits": [
    {
      "video_id": "<slug>",
      "site_src": "https://videos.mullmania.com/proof/<repo>/<slug>.mp4",
      "poster_src": "https://videos.mullmania.com/proof/<repo>/poster-<slug>.png",
      "provenance_src": "https://videos.mullmania.com/proof/<repo>/<slug>.provenance.json",
      "timeline_at": "<ISO-8601 work timestamp or inferred day>",
      "timeline_source": "<chat|commit|proof-metadata|deploy-metadata|filename|inferred|unknown>",
      "timeline_precision": "<timestamp|day|month|unknown>",
      "created_by_chat": {
        "runtime": "codex",
        "url": "<chat URL or app deep link when available>",
        "thread_id": "<thread id when available>",
        "session_id": "<session id when available>",
        "locator": "<exact archive/search locator when URL is unavailable>",
        "captured_at": "<ISO-8601 timestamp>"
      },
      "assets": [
        {
          "kind": "video",
          "url": "https://videos.mullmania.com/proof/<repo>/<slug>.mp4",
          "created_by_chat": { "url": "<same chat URL or locator>" }
        },
        {
          "kind": "poster",
          "url": "https://videos.mullmania.com/proof/<repo>/poster-<slug>.png",
          "created_by_chat": { "url": "<same chat URL or locator>" }
        }
      ],
      "deposited_at": "<ISO-8601 timestamp>"
    }
  ]
}
```

Append the newest deposit first or preserve the repo's existing deposit order if one is already established. This file is the breadcrumb. The hosted proof video is the evidence. The flipbook is a generated view over the same evidence, not a separate source of truth. The `created_by_chat` fields are part of the evidence trail, not optional decoration.

## What "safe to close" means

All five must be true:

1. No pending operator question the chat is waiting on the operator to answer.
2. No background process / running task that only exists inside this chat's runtime (foreground server processes are fine — those survive; the question is about chat-bound work).
3. Local working tree is either clean OR the dirty state is intentional and documented in the canonical next-step trail.
4. Bookmark and visual evidence lines are both **yes**.
5. Bookmark-created assets include source-chat links or exact chat locators.

If any is false, the answer is **no** and the reason names which one.

## /overdrive-context homework (internal — DOES NOT appear in the response)

When the chat had an `/overdrive` session, the agent must honestly verify all of the following BEFORE stamping `safe to close: yes`. These are inputs to the yes/no, not visible output. Do not enumerate them in the response.

1. Chapters shipped — titles + commit SHAs known
2. Each chapter has a test that FAILS without the fix (revert-checked)
3. Full suite green on final run
4. Multi-pass stability run (3x/5x) done if the repo convention requires it
5. RegressionTestCount bumped if the repo tracks it
6. Snapshots/goldens refreshed if the repo ships fixtures
7. All chapter commits pushed
8. Deployed AND live-verified on the deployed URL if the repo has one
9. Final cross-cutting suite run ≥3x AFTER all chapters landed
10. Combinatorial run with all new flags ON if multiple flags landed
11. Deferred items list captured (or "nothing deferred" stated)
12. NO refactors, NO contract breaks, NO silent dep upgrades, NO aesthetic drift outside focus arg

If any of these is false, the third line is `🚨 safe to close: no — <single most blocking gap, ≤12 words>`. The 13-item checklist itself stays internal. The operator is scrolling for the bottom line; the bottom line is three lines.

## Anti-patterns (do not do)

- Do not turn the bookmark check into a status report. The operator gets that from other chats. This is a triage primitive.
- Do not enumerate the /overdrive 13-item homework in the response — that's internal verification, not user-visible output.
- Do not suggest improvements to the operator's workflow when answering. They explicitly said: do not suggest anything to make this part of their life easier. They know what they need.
- Do not be literal-minded about phrasing variants. Any reasonable shorthand for "is this done and can I close" is the trigger.
- Do not add a fourth line, a follow-up, or a closing remark.
- If you're tempted to write more — don't. The operator is moving fast across many chats. Brevity is the gift.

## Why this rule exists

Direct operator instruction, 2026-05-22, end of the dance-party productionalization session: "I am being a puppeteer for several chats. I am orchestrating them myself, but they are so orthogonal an idea, I cannot delegate this." They built this rule so they can ask every chat the same shorthand question and get a uniform two-line answer.

Re-affirmed 2026-05-23 when the operator collapsed the verbose `/overdrive`-doneness audit (a 13-item status report) into this single rule: "make it the protocol command a/command or something and merge everything it's all meant for the same shit semantically." One protocol. One response shape. The 13 items survive as internal homework, not as output.

Updated 2026-05-25: the operator renamed the desired shorthand to `bookmark` and required hosted visual/video evidence at natural stopping points: "all I want to do is be able to write the term bookmark and have it have all of this happen automatically ... I want videos and stuff."

Updated 2026-05-25 again: repeated `bookmark` invocations are idempotent. They must not invent unattended work or duplicate proof; they should say the operator is spinning wheels when nothing changed.

Updated 2026-05-25 again: proof videos should be real usage evidence for the operator's future amnesiac self: Playwright/runtime-driven where practical, roughly 30 FPS, 30-60 seconds for normal feature proof, and never random video for video's sake.

Updated 2026-05-25 again: proof video creation is an acceptance test. The agent must inspect the actual final video, reject choppy or non-explanatory recordings, and fix product issues exposed by recording when bounded and non-destructive.

Updated 2026-05-25 again: a successful bookmark closes the chapter. New substantial work after that should start in a fresh chat unless the operator explicitly authorizes continuing in the polluted chat.

Updated 2026-05-25 again: Overdrive is an auto-continue exception after bookmark. If the operator's next command is only `overdrive` or a clear Overdrive invocation, warn loudly with `🚨🚨` and continue instead of asking for another approval.

Updated 2026-05-25 again: bookmark closeout must leave a per-repo proof breadcrumb, usually `.proof.json`, pointing at the `videos.mullmania.com` proof feed, cross-cut proof reel, dashboard, flipbook, and latest deposit. The proof repository is `videos.mullmania.com`; the breadcrumb belongs in the source repo.

Updated 2026-05-25 again: every proof asset and fallback asset created by bookmark must carry a `created_by_chat` pointer so the operator can identify the exact archived chat to unarchive later.

Updated 2026-05-26: bookmark evidence must be made front and center through `feed.mullmania.com` when reachable. The feed milestone is the readable operator-facing trail; `videos.mullmania.com` remains the proof vault, and repo `.proof.json` remains the source breadcrumb.

Updated 2026-05-26 again: asset provenance is per asset, not just per repo. Bookmark-created videos, posters, screenshots, evidence pages, feed cards, DAGs, and fallback objects need source-chat locators, and backfilled or chronological reels must carry non-anachronistic `timeline_at`/source/precision metadata.
