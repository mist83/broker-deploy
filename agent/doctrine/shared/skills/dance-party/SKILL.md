---
name: dance-party
description: Build, ship, audit, or improve a dance-party cinema pack at dance-party.mullmania.com/cinema.html?song=<slug>. The operator curates a 3D Three.js music-video cinema viewer; each song is a JSON pack cued to its official YouTube video. TRIGGER when the operator says "/dance-party", "dance party", "make me a dance party for X", drops a YouTube link or Spotify screenshot in a dance-party context, names a song or artist with no other framing, or simply says "dance party" alone (= continue improving the library). DO NOT TRIGGER for unrelated film/video/demo work (that's the films skill), generic 3D requests, or anything outside the dance-party.mullmania.com cinema viewer.
---

# dance-party

You are taking over the dance-party cinema viewer. The operator runs many parallel chats and wants to "kick this into overdrive and walk away" — your job is to deliver a complete, deployed, visually-verified result with minimal back-and-forth.

## What dance-party is

A 3D Three.js cinema viewer at `dance-party.mullmania.com/cinema.html?song=<slug>`. Each song is a "pack" — a JSON file describing scenes (camera, props, dancers, lighting, transitions) cued to timestamps in the official YouTube video. The engine renders the scene; the YouTube iframe plays the audio.

- **Repo:** `mist83/dance-party` on GitHub, locally `/Users/mist83/Code/dance-party/`
- **Engine:** `public/cinema-stage.js` (~2000 lines: actors, dance moves, camera tick, world types, primitives)
- **Player shell:** `public/cinema.js`
- **Packs:** `public/packs/<slug>/pack.json` (42+ packs as of last audit)
- **Scaffolder:** `scripts/new-pack.mjs`
- **Build contract:** `/Users/mist83/Code/dance-party/RUBRIC.md` — the 5-point rule, engine knobs, dance moves, camera shots, anti-patterns. **READ THIS FIRST** every invocation.

## Input modes

The operator invokes this skill with one of:

1. **Song name / artist** as plain text → look up the official YouTube video id (WebSearch), scaffold + hand-tune a pack
2. **YouTube URL** → extract the video id, look up song/artist, scaffold + hand-tune
3. **Image** (screenshot of Spotify, YouTube, album cover) → identify the song from the image, then like mode 1
4. **Multiple songs** (newline-separated, comma-separated, multiple images) → queue, build each in series (or spawn parallel Agent per song if 3+)
5. **No song / just "dance party"** → audit the library and pick the highest-impact open improvement. Do NOT make up new songs.

If the input is ambiguous, ask one short clarifying question.

## The non-negotiable rule

**Visual verification beats code verification.** The preview-tool's headless browser runs at `innerWidth=2` and gives a false-positive read — JSON parses, no errors, camera math advances ≠ "the scene looks good."

Before declaring any work done:

- Use `WebFetch` to confirm the live URL returns 200 and the pack JSON is served
- Tell the operator exactly what URL to open in their real browser and what to look for
- If `mcp__Claude_in_Chrome__*` tools are available, use them to open the deployed URL at full window size and watch a real play-through; report what you saw

The operator's standing complaint about lazy verification: "it's like something is rigged with a slow float fly by and everyone is frozen in motion." If you ship without watching a real browser, expect this complaint to return.

## Workflow for a new song

1. **Get accurate metadata**: YouTube video id, `durationSec` (within 5s), `bpm` (rough). WebSearch the video id — never make one up. Ask if uncertain.
2. **Section structure**: Listen or recall — write down timestamps for intro / verse / pre-chorus / chorus / bridge / outro. Pick THE moment (the song's biggest section). This is required — flat-energy packs fail the rubric.
3. **Pick a distinct theme**: NOT the same store as recent packs. Themes available: `club / garage / void / forest / toybox / highway / arena / village / plastic-beach`. If the song needs a new world type or primitive (boombox, neon-grid, brass-monkey-bottle, etc. — see existing primitives in cinema-stage.js), add it to the engine.
4. **Scaffold**:
   ```
   cd /Users/mist83/Code/dance-party
   node scripts/new-pack.mjs --slug ... --title ... --artist ... \
     --video <YT_ID> --duration <sec> --bpm <n> --theme <theme> \
     --keywords "intro,verse,chorus,bridge,outro" \
     --tagline "..." --force
   ```
5. **Hand-tune the generated `public/packs/<slug>/pack.json`**:
   - Replace generic stage-set wallpaper with theme-specific primitives
   - Mark THE moment scene with `escalation: true`
   - Use `actorMoveMix` per scene so different actors do different things
   - Set `transitionDuration` per song tempo (0.2s metal cuts → 1.6s ballad sweeps)
   - Vary cameras per section (don't use `soundstage` for every scene)
6. **Commit + push** in dance-party:
   ```
   cd /Users/mist83/Code/dance-party
   git add public/packs/<slug>/ [+ engine if changed]
   git commit -m "..."
   git push origin main
   ```
7. **Deploy from brain-farts**:
   ```
   cd /Users/mist83/Code/brain-farts
   npm run deploy:site -- --site dance-party \
     --source-dir /Users/mist83/Code/dance-party/public \
     --allow-github-owned --force --apply
   ```
8. **Verify live**: `curl -sI https://dance-party.mullmania.com/packs/<slug>/pack.json` returns 200.
9. **Tell the operator the deep link**: `https://dance-party.mullmania.com/cinema.html?song=<slug>`. Ask them to watch one full play-through.

## Workflow for improvement work (no song given)

Per the operator's standing target — "Metaverse hype but in a super goofy 3D way" — known open gaps. Pick ONE per turn. Highest-ROI first:

1. **BPM-couple the animation rate.** Pack defines `bpm` but engine doesn't use it for dance-move frequency. A 140-BPM phonk track and a 70-BPM ballad currently animate at the same rate. Multiply move `f` constants by `(bpm / 100)` (or pass `bpm` into `animateActor`).
2. **Beat-lock the camera punches.** Camera FOV punch uses `sin(now * 0.08)` — completely independent of music. Lock to `sin(beatNow * Math.PI / 4)` where `beatNow = now * (bpm / 60)`.
3. **Stabilize auto-bg props.** `_backgroundSeedsFor` uses `Math.random()` so periphery reshuffles every scene change. Seed with `slug + idx` hash so the world is stable per pack.
4. **Auto-sing-to-camera.** Actors face the camera but don't have mouth/jaw animation or shoulder-bounce-on-beat. The "singing to the lens" read is incomplete.
5. **Environmental motion.** Floor/walls/sky are static. Add moving light shafts, drifting particles, banner ripple, ground pulse on beat.
6. **Hero subject.** Subject-bias lookAt picks the nearest actor — essentially random. Add a `scene.hero` tag the pack can set, or pick the actor closest to the scene's prop center.
7. **Goofy actor exaggeration.** Scale jitter is ±15% — may not read as enough crowd variety. Consider ±30% with cartoony head:body ratios.

Do NOT ship a gap fix until you've watched a real-browser play-through and confirmed the change reads.

## Anti-patterns to refuse

- **Stage-set wallpaper** in every scene = same store. Use song-specific primitives.
- **Same camera every scene.** Vary by section.
- **One actorMove for the whole pack.** Mix.
- **Fast cuts on ballads / slow drifts on metal.** Match `transitionDuration` to tempo.
- **"No console errors" treated as "looks good."** It is not.
- **Making up a YouTube video id.** WebSearch. If unconfirmed, ask the operator.

## Engine knob cheat sheet

- `preset`: base atmosphere (`club / garage / void / forest / toybox / highway / arena / village / plastic-beach`)
- `world`: terrain layer (`highway / stage / forest-strip / village / plastic-beach`)
- `actors`: floored at 10 unless `allowEmpty: true`; cap 20
- `actorMove` / `actorMoveMix` (array → per-actor by index)
- `escalation: true` → auto strobe + mirror + ambient bump. ONCE per pack.
- `transitionDuration` (seconds, per-scene cross-fade)
- `instant: true` → hard cut, no fade. Intro only.
- `staticCamera: true` → freeze camera drift for the scene
- `backgroundFill: false` → opt out of auto periphery dressing

## Camera shots

`wide / close / low-angle / overhead / side / behind-dj / spin / driving / chase / stage-front / crowd / rail / crane / boom-in / arc / soundstage`. Each has built-in drift + bob + zoom-punch — see `SHOTS` const in `cinema-stage.js`.

## Dance moves

`bob / sway / gyrate / clap / point / hop / march / wave / kazachok / shake / freeze / headbang / mosh / runway-strut / hotstepper-strut / dab / spin`. See RUBRIC.md for which reads as what.

## Breadcrumb protocol

End every turn with:

- **What you verified vs. what you didn't** (be explicit — the operator is allergic to "ready" claims that aren't actually verified)
- **The live URL** for the operator to open
- **Safe-to-close OR in-flight**: state which. The operator runs many parallel chats.

## When something is out of scope

If the operator asks for something the engine doesn't support (e.g. a new dance move, a new prop, a new world), build it. Engine changes propagate to all 42+ packs at once and are the highest-ROI work. Prefer engine fixes over per-pack edits.
