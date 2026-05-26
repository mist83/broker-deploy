---
name: films
description: Produce a polished narrated demo film for one or many Mullmania repos using the canonical Marionette pipeline at /Users/mist83/Code/project-and/tests/marionette/. Each film is 45-90s, voice='Brian' (British), cinematized with title card, establishing shot, music bed, and closing card, uploaded to s3://mullmania.com/project-and/films/cinema/, and the candidate's docs/frontdoor.json is patched. TRIGGER when the operator says anything like "make a film for X", "/films", "record an oscar cut for X Y Z", "make demo films for these candidates", "cinema cut for <repo>", or names 1-N repos and asks for movies/demos/sizzle reels. For 2+ candidates, spawn one parallel Agent per repo. DO NOT TRIGGER for documentation tasks, screenshot-only requests, or static poster work that does not need video.
---

# films

Produce a 45-90s narrated, cinematized demo film for one Mullmania repo's live URL. The pipeline lives at `/Users/mist83/Code/project-and/tests/marionette/`. Storyboard (`https://storyboard.mullmania.com`) is the narration/audio render service behind this style of proof. This skill is a thin orchestration layer around the pipeline — the pipeline code is the source of truth.

## Cold-start preflight (do every time)

Read these three files in full before authoring anything:

- `/Users/mist83/Code/project-and/tests/marionette/marionette.cjs` — framework: `goto/click/fill/dragWidget`, cursor overlay, S3 + storyboard upload
- `/Users/mist83/Code/project-and/tests/marionette/film-01-sales-daily.cjs` — model your film cjs on this exact shape
- `/Users/mist83/Code/project-and/tests/marionette/cinematize.cjs` — post-processor: title card, establishing shot, music bed, closing card

Verify env: `aws`, `ffmpeg`, `python3` + `PIL`, `node`, real Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, sites' playwright-core at `/Users/mist83/Code/sites/node_modules/playwright-core`.

**Do not install playwright fresh. Do not roll your own headless recorder.** The pipeline uses the user's real Chrome and the existing playwright-core install.

## Resolving candidates

The operator gives you N repo names, paths, or frontdoor URLs. Normalise each to:

- `repoPath`: `/Users/mist83/Code/<name>`
- `frontdoor`: `<repoPath>/docs/frontdoor.json` — must exist; if it's a stub (only repo/name/title fields), author a full one from a sibling like `/Users/mist83/Code/json-tools/docs/frontdoor.json` BEFORE recording
- `liveUrl`: from the frontdoor (`liveUrl`, falling back to `mullmaniaUrl`)

**Pre-flight per candidate, BEFORE authoring beats:**

```bash
curl -fsSI <liveUrl>     # must return 200; if 404, STOP and report
```

If the site is gated (CloudFront 404 because `isPublic: false` in the catalog), the operator key at `/Users/mist83/Code/sites/out/sites-api.json` can flip it. Do this only when needed and surface every flip in the report's `side_effects`.

## Per-candidate recipe

Pick film number (next free `film-NN-*` in `tests/marionette/`), title, subtitle, music key/mode (see palette below). Then:

**1. Read the candidate** (~10 min): README, the publishDir entry, identify ONE golden flow a first-time visitor should see. Verify selectors against the live HTML (`curl <liveUrl>` and inspect).

**2. Author the film cjs** at `/Users/mist83/Code/project-and/tests/marionette/film-NN-<name>.cjs` in the EXACT shape of `film-01-sales-daily.cjs`:

```js
#!/usr/bin/env node
const { Marionette } = require('./marionette.cjs');
(async () => {
  const result = await Marionette.run({
    name: 'film-NN-<name>',
    voice: 'Brian',
    baseUrl: '<liveUrl>',
    prelude_ms: 1500,
    outro_ms: 2500,
    beats: [
      { narration: '<short British-narrator-friendly sentence>', do: async (m) => { await m.goto('/'); }, pauseAfter: 2400 },
      // ...6-12 beats total
    ],
  });
  console.log(JSON.stringify(result, null, 2));
})();
```

Beats are realistic, not marketing-speak. Selectors must exist on the live page.

Narration and music defaults:

- Default narrator voice remains Brian unless the repo clearly calls for another primary voice.
- Write dry, concise, slightly sarcastic narration that tells the viewer what is being proved. It can have a point of view; it cannot lie or hype fake behavior.
- Use multiple voices only rarely, and only when the repo has natural roles or characters. A fighter/game repo can support it; a settings panel usually cannot.
- Choreograph the film so narration, cursor movement, captions, speed changes, and cuts telegraph the next action and the outcome.
- Use generated/licensed lo-fi techno or outrun-style music by default, with a build/crescendo and beat drop aligned to the payoff. Do not use copyrighted music unless the operator supplied rights.
- Use pitch/speed changes sparingly for emphasis, not as random decoration.

**3. Run it**:

```bash
cd /Users/mist83/Code/project-and && node tests/marionette/film-NN-<name>.cjs
```

Marionette uploads the webm to `s3://mullmania.com/project-and/films/`, calls the storyboard Lambda, returns `{ ok, narrated_mp4 }`. If `!ok`, STOP and report.

**4. Cinematize** with a small driver next to the film cjs (or inline):

```js
const { cinematize } = require('./cinematize.cjs');
const final = await cinematize({
  name: 'film-NN-<name>',
  title: '<Title>',
  subtitle: '<subtitle>',
  narratedMp4: '<narrated_mp4_url>',
  musicKey: '<X>',          // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
  musicMode: '<major|minor|drone>',
  establishingScreenshot: '<liveUrl>',
  outDir: '/Users/mist83/Code/project-and/tests/reports/cinema/film-NN-<name>',
});
```

Returns the final cinema mp4 path.

**5. Upload the cinema cut**:

```bash
STAMP=$(date -u +%Y-%m-%dT%H-%M-%SZ)
aws s3 cp "$FINAL" \
  "s3://mullmania.com/project-and/films/cinema/film-NN-<name>-$STAMP.mp4" \
  --content-type video/mp4 --cache-control "public, max-age=86400"
curl -fsSI "https://project-and.mullmania.com/films/cinema/film-NN-<name>-$STAMP.mp4" | head -1
# must be HTTP/2 200
```

**6. Patch the candidate's frontdoor** (`<repoPath>/docs/frontdoor.json`): `hasVideo: true`, `videoUrl: "<public cinema URL>"`, `videoPath: ""` (S3-hosted, not in repo). Mirror in `<repoPath>/docs/demo/manifest.json`. If `posterPath` is empty or `posterKind` is `"generated-placeholder"`, capture a payoff frame from the cinema cut to `<repoPath>/docs/demo/poster.png` and update `posterPath` + `posterKind: "showcase-reel"`.

**7. Branch + commit on the candidate** (no push, no PR):

```bash
git -C <repoPath> checkout -b demo/oscar-<name>
git -C <repoPath> add docs/frontdoor.json docs/demo/manifest.json docs/demo/poster.png 2>/dev/null
git -C <repoPath> commit -m "demo: cinema film via marionette+storyboard, voice=Brian"
```

**8. Branch + commit the film cjs in project-and**:

```bash
git -C /Users/mist83/Code/project-and checkout -b films/oscar-<name>
git -C /Users/mist83/Code/project-and add tests/marionette/film-NN-<name>.cjs
git -C /Users/mist83/Code/project-and commit -m "films: add film-NN-<name>"
git -C /Users/mist83/Code/project-and checkout master
```

**9. STOP. No push. No PR.**

## Multi-repo orchestration

For 2+ candidates, spawn one Agent per repo (`subagent_type=general-purpose`, `run_in_background: true`). Each agent gets a self-contained brief that includes: the per-candidate recipe (steps 1-9 above), per-candidate values (repoPath, liveUrl, title, subtitle, musicKey, musicMode, film number), the hard rules, and the required output envelope.

**Pre-launch cleanup** of any leftover branches from prior runs:

```bash
for r in <candidate names>; do
  default=$(git -C "/Users/mist83/Code/$r" symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')
  [ -z "$default" ] && default=$(git -C "/Users/mist83/Code/$r" branch --list main master | head -1 | tr -d ' *')
  git -C "/Users/mist83/Code/$r" checkout "$default" 2>/dev/null
  for b in $(git -C "/Users/mist83/Code/$r" branch --list 'demo/oscar-*' | tr -d ' *'); do
    git -C "/Users/mist83/Code/$r" branch -D "$b"
  done
done
```

Track each candidate in TodoWrite. Aggregate reports as agents complete.

## Music palette

Pick by vibe. `film-01..05` already use C-major, A-minor, F-major, D-minor — try not to duplicate.

- developer tools / clean / productive → D maj, G maj, A maj
- doctrine / serious / canonical → C min, E min
- foundational / atmospheric / between-machines → D drone, B drone
- anticipatory / event / FAB-style hits → E min, B min
- architectural / library → F# min, G min
- sizzle / brand / "watch this" → D# maj, A# maj
- documentary / canon-of-rules → E maj

## Hard rules

- Use the canonical pipeline. No fresh playwright. No homemade recorders.
- **Honest blocker > faked success.** If the live URL is 404, STOP. If the hero interaction can't be triggered, STOP. Don't fake.
- No push, no PR, no `--no-verify`, no `--no-gpg-sign`.
- Be honest in narration — describe the actual interaction.

## Known gotchas (encoded from real-world runs)

- **`gitterd` auto-commits and auto-pushes `/Users/mist83/Code/project-and` master to origin every ~30s.** Workers' staged changes can be swept into `Auto-commit` messages before they branch. Recover non-destructively with `git commit-tree` + `git update-ref` to land your clean commit on `films/oscar-<name>` atop the auto-commit base. Don't rewrite master. If the daemon is racing your ffmpeg pipeline, run cinematize in `/tmp` and only after `aws s3 cp` succeeds, copy the file back into `tests/reports/cinema/` for the commit.
- **Doctrine compose at `https://agent.mullmania.com/api/doctrine/compose` returns 405 / "Invalid operator key"** for unauthenticated POSTs from a worker. Don't burn time on it; the films-pipeline brief is the explicit override.
- **Some candidates are `isPublic: false` in the sites catalog** and CloudFront 404s. Flip via the operator key (above), surface in `side_effects`.
- **Concurrency at scale**: 10+ parallel headless Chromes on macOS can starve each other — `ctx.close()` may hang. Salvage from the finalized webm (cursor bake is lost but selectors + narration survive). Don't relaunch on first hang.
- **Chrome path is hardcoded** in `marionette.cjs` to `/Applications/Google Chrome.app`. If absent, edit `executablePath` rather than installing a different browser.
- **Stub frontdoors** (e.g. `/Users/mist83/Code/ui/docs/frontdoor.json` had only 5 fields) need authoring BEFORE recording. Mirror a sibling's schema and flag every guess in the report.
- **Live URLs that don't render in headless Chrome** (e.g. private CDN scripts ORB-blocked): record what you can and let the narration acknowledge the disabled state — don't fake daemon responses or fake auth.

## Output envelope

Each worker (and the orchestrator's final summary) reports in this shape:

```json
{
  "actorLabel": "<repo>-recorder",
  "status": "ok|blocked|error",
  "producedArtifacts": {
    "cinema_mp4_url": "https://project-and.mullmania.com/films/cinema/film-NN-<name>-<stamp>.mp4",
    "narrated_mp4_url": "https://storyboard.mullmania.com/outputs/<id>.mp4",
    "candidate_branch": "demo/oscar-<name>",
    "project_and_branch": "films/oscar-<name>",
    "film_cjs": "/Users/mist83/Code/project-and/tests/marionette/film-NN-<name>.cjs",
    "duration_s": 0.0,
    "beat_count": 0,
    "poster_added": false,
    "frontdoor_authored": false,
    "side_effects": []
  },
  "blockers": [],
  "narrative": "1-3 sentence summary"
}
```

If `status` is `blocked` or `error`, populate `blockers` with concrete explanations (HTTP codes, selectors that failed, doctrine errors). Never invent artifact URLs.

## Optional: convergence into produce-cinema.cjs

`/Users/mist83/Code/project-and/tests/marionette/produce-cinema.cjs` has a `FILMS` array used to re-cinematize existing narrated MP4s with new music or framing. New films do NOT need to be added there for first-time runs (each film cjs handles its own cinematize+upload), but adding them lets the operator re-cinematize later. Skip unless the operator asks.
