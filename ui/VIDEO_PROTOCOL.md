# UI Video Protocol

This repo now has a repo-local proof generator:

```bash
node /Users/mist83/Code/ui/scripts/render-proof-demo.mjs
```

That command reads `docs/demo/proof-plan.json` and writes these proof artifacts:

- `docs/demo/poster.png`
- `docs/demo/demo.mp4`
- `docs/demo/clips/*.mp4`
- `docs/demo/chapters/*.png`
- `docs/demo/manifest.json`
- `contracts/fixtures/watch.json`

It uses stable shell routes and a real browser, so the output stays tied to the shipped framework instead of hand-recorded guesswork.

For the full series rollout, see `VIDEO_SERIES_PLAN.md`.

## Deterministic Tour Graph

The reusable automation contract is `ui-tour-manifest.json`.

Build it from the sitemap:

```bash
node /Users/mist83/Code/ui/scripts/generate-tour-manifest.mjs
```

Validate it:

```bash
node /Users/mist83/Code/ui/scripts/validate-tour.mjs --sitemap sitemap.json --manifest ui-tour-manifest.json
```

Record it locally:

```bash
node /Users/mist83/Code/ui/scripts/record-tour.mjs --manifest ui-tour-manifest.json --base-url http://127.0.0.1:8080/index.html
```

The manifest is the canonical automation surface. Keyboard navigation is a compatibility proof over the same graph, not the source of truth.

Storyboard remains downstream: it accepts the generated video URL and `docs/tour/storyboard-script.json` markers.

## Decision

Use a browser capture pipeline for the real walkthrough.

Do not use image/video generation to fake the UI itself.

Use Sora only for optional bumper shots if you want a short intro or outro that is clearly not the canonical product surface.

## Source Of Truth

Use these files as the inventory:

- `sitemap.json`
- `active/typography.html`
- `tabs/canonical/*`
- `js/ui.js`
- `llm-docs.md`

Why:

- `sitemap.json` gives the top-level tabs and sidebar items.
- `tabs/canonical/*` is the real component gallery with numbered patterns `1-74`.
- `active/typography.html` is the single long visual reference page.
- `js/ui.js` lists the shipped JS modules and runtime helpers.
- `llm-docs.md` explains the intended consumer model and remote contract flow.

## Stable Routes

The tab system is hash-driven.

That means the recorder can navigate directly instead of depending on brittle click timing:

- `#/canonical/structure`
- `#/canonical/grids`
- `#/canonical/typography`
- `#/canonical/buttons`
- `#/canonical/forms`
- `#/canonical/cards`
- `#/canonical/tables`
- `#/canonical/alerts`
- `#/canonical/modals`
- `#/canonical/detail`
- `#/canonical/spacing`
- `#/canonical/full-page`
- `#/canonical/live-preview`
- `#/themes/walmart`
- `#/themes/walmart`
- `#/themes/mockup`
- `#/builder/colors`
- `#/builder/typography`
- `#/builder/spacing`
- `#/builder/effects`
- `#/visual-builder`
- `#/docs`

If you want the full component story, the canonical tab is the backbone.

## Recommended Capture Modes

### Mode 1: Truthful Browser Walkthrough

Use this for the real "explain everything" version.

Recipe:

1. Serve `/Users/mist83/Code/ui` locally.
2. Drive the app through hash routes from `sitemap.json`.
3. Record the browser with a scripted runner.
4. Generate narration from the same act list.
5. Merge screen video and narration into the final cut.

Use the `demo-for-me` pattern for this mode:

- Scripted acts
- Puppeteer browser actions
- Generated narration text
- Final merge with ffmpeg

This is the best fit when the goal is accuracy.

### Mode 2: Deterministic Stills + Narration

Use this when you want a simpler, safer first pass.

Recipe:

1. Capture one clean screenshot per section or pattern group.
2. Convert narration text to audio.
3. Build slide segments with ffmpeg.
4. Concatenate into one or more videos.

The repo-local proof generator already uses this shape for the shipped proof reel.

This is the best fit when the library changes slowly and you want a durable, low-drama pipeline.

### Mode 3: Synthetic Bumper Only

Use this only for clearly non-canonical intro/outro shots.

Good use:

- Branded opener
- Theme mood montage
- Abstract "design system" bumper

Bad use:

- Explaining component APIs
- Showing real layout behavior
- Claiming the generated UI is the shipped library

## Framework Consumer Apps

The same playbook can be reused for apps that actually use `ui.mullmania.com`.

Treat those as a different capture target than the framework itself.

### Pick The Right Story First

There are three honest video types:

- framework video: explain the library surface, primitives, themes, and contracts
- consumer app video: explain what the app does for a user while noting where the framework helps
- split video: one cut for the app flow, one cut for the framework proof

Do not blur those together unless the repo really is both the framework and the product.

### Consumer App Inputs

For an app that uses the framework, collect these first:

- the real publish surface from `mullmania.site.json` or `site.json`
- `docs/frontdoor.json`
- `docs/demo/manifest.json`
- the live or local URL that matches the shipped browser surface
- proof that the app actually consumes `ui.mullmania.com`

Use the consumer audit before writing the script:

```bash
cd /Users/mist83/Code/mullmania
npm run check-ui-consumer -- /path/to/repo
```

That catches missing canonical includes, legacy hosts, and obvious local-style drift.

### Consumer App Video Rules

For consumer apps, keep the story app-first.

Good order:

1. show the app's real job
2. walk the main user flow
3. call out framework-backed layout or component choices only when they matter
4. end with proof that the app stays inside the shared UI contract

Bad order:

1. listing every shared button class
2. turning the app demo into a second copy of the framework demo
3. pretending custom local behavior came from the framework

### Consumer App Capture Checklist

- verify the app loads with canonical `ui.mullmania.com` assets
- identify the smallest real workflow worth showing
- prefer route or state jumps over brittle click choreography
- keep one act focused on one user outcome
- if the app has framework-heavy sections, cut away briefly instead of restarting the whole explanation
- end with a short proof pass only if it adds trust

### Consumer App Narration Shape

Keep the separation clear:

- app line: what the user is doing
- framework line: which shared shell, primitive, or theme rule is helping
- local line: what is unique to this app and not reusable framework behavior

### Reusable Framework Proof Beat

When a consumer app needs framework proof, use a short closing beat instead of stuffing framework detail into every act.

That beat should answer:

- does it load canonical shared UI assets
- which shared primitives are obvious on screen
- is the layout clearly using the shared shell instead of custom one-off styling
- does the app stay honest about what is local versus shared

### Consumer App Output Contract

The output contract stays the same as the framework video:

- `docs/demo/demo.webm` or `docs/demo/demo.mp4`
- `docs/demo/poster.png`
- `docs/demo/manifest.json`
- `docs/frontdoor.json` with demo metadata

The difference is editorial, not structural.

## Coverage Plan

If the goal is "the entire library," break it into chapters instead of one giant unbroken reel.

### Video 1: Core Layout And Components

- Page Structure
- Grid System
- Typography
- Buttons
- Forms
- Cards
- Tables
- Alerts & Badges
- Modals & Toasts

### Video 2: Real App Composition

- Detail Pages
- Spacing & Utilities
- Full Pages
- Live Preview
- Docs tab

### Video 3: Themes And Builder

- Active
- Walmart
- Mockup
- Builder colors
- Builder typography
- Builder spacing
- Builder effects

### Video 4: Runtime And Advanced Surfaces

- `ui.js` loader model
- JS modules
- Visual Builder
- JSON contract / render flow
- Remote page contract examples from `llm-docs.md`

## Suggested Narration Shape

Keep the narration honest and mechanical.

Good pattern:

- what the section is
- why it exists
- what classes or API it exposes
- what a consumer should copy
- what rule not to break

Bad pattern:

- marketing fluff
- vague design language
- pretending helper demos are separate products

## Minimum Viable Script Shape

Each act should name one route, one point, and one visible action.

Example shape:

```json
{
  "acts": [
    {
      "name": "Page Structure",
      "narration": "This section defines the base shell: header, tabs, sidebar, content, and the rules for showing one clear app frame.",
      "actions": [
        { "type": "evaluate", "code": "window.location.hash = 'canonical/structure';" },
        { "type": "wait", "duration": 1200 },
        { "type": "screenshot", "filename": "canonical-structure.png" }
      ],
      "pauseAfter": 1500
    }
  ]
}
```

Do not try to explain all `74` numbered patterns one by one in one raw take.

Group them by section and only zoom into the patterns that actually teach a rule.

## Publish Contract

If the finished video should appear in the Mullmania demo catalog, ship these artifacts:

- `docs/demo/demo.webm` or `docs/demo/demo.mp4`
- `docs/demo/poster.png`
- `docs/demo/manifest.json`
- `docs/frontdoor.json` with `videoUrl`, `videoPath`, and `hasVideo: true`

Right now this repo is clip-backed and reel-backed from the same route plan.

## Verification

Before calling the protocol good:

1. Confirm `index.html` serves.
2. Confirm `sitemap.json` loads.
3. Confirm hash routes switch tabs and sidebar content.
4. Confirm each recorded act lands on the expected section.
5. Confirm narration matches what is actually on screen.
6. Confirm the final published manifest points at real demo assets.

## Current State

What already exists:

- stable library inventory
- stable canonical examples
- routeable tab shell
- screenshot-heavy test coverage
- a reusable scripted demo recorder in another local repo
- a reusable stills-to-video pipeline in another local repo
- a catalog contract that already knows how to consume demo video assets

What is still missing:

- optional narration scripts for longer human-facing walkthroughs
- optional recorder wrappers if a future pass wants true motion capture instead of route clips

What is now reusable for consumer apps:

- the truthful browser-first capture rule
- the stills-plus-narration fallback
- the synthetic-bumper-only guardrail
- the app-first storytelling rule for framework consumers
- the framework proof beat for apps built on `ui.mullmania.com`

## Bottom Line

Yes, there is a real protocol available for making full-library explainer videos from `ui.mullmania.com`.

Yes, the repo already ships a single local command that rebuilds the reel, route clips, manifest, and watch page.

The next step is optional polish: narration, longer walkthrough cuts, or true motion capture where that teaches more than route clips.
