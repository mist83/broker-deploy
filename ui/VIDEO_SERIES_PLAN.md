# UI Framework Video Series Plan

This file is the production plan for documenting all of `ui.mullmania.com` on video.

The repo now already ships a baseline proof reel through:

- `docs/demo/proof-plan.json`
- `scripts/render-proof-demo.mjs`
- `docs/demo/manifest.json`

This file is still the editorial series plan for longer walkthroughs and chaptered explanation work.

## Goal

Produce a reusable video series that explains the full `ui.mullmania.com` framework in a way that is:

- truthful to the shipped UI
- easy to update when the framework changes
- split into sane chapters instead of one bloated mega-video
- reusable later for apps that consume the framework

## Non-Goals

Do not do these in this phase:

- no rewriting the shipped proof generator
- no pretending the clip wall is a narrated series by itself
- no fake motion or synthetic UI footage
- no launchpad publishing in this file
- no Sora-generated fake UI scenes

## Core Rule

The authoritative visual source is always the real browser surface.

That means:

- framework explanations come from the live or local framework pages
- consumer-app explanations come from the real app surface
- generated media can only be a clearly non-canonical bumper

## Source Inventory

Use these framework files as the plan backbone:

- `sitemap.json`
- `active/typography.html`
- `tabs/canonical/*`
- `tabs/themes/*`
- `tabs/visual-builder/index.html`
- `tabs/docs/index.html`
- `js/ui.js`
- `llm-docs.md`
- `VIDEO_PROTOCOL.md`

## What Counts As "All Of The UI Framework"

For video coverage, "all" means these five buckets:

1. Core page shell and layout patterns
2. Canonical component and utility patterns
3. Theme system and builder surfaces
4. Runtime modules and JSON/render contracts
5. Developer workflow and consumer guidance

It does not mean listing every selector in CSS line by line.

It does mean showing every meaningful public surface that a human builder would actually copy, load, or rely on.

## Series Shape

Make this a series, not one giant file.

### Video A: Orientation

Purpose:

- explain what `ui.mullmania.com` is
- show the app shell
- show the canonical tab map
- explain how the rest of the series is organized

Target length:

- 3 to 5 minutes

Must cover:

- `index.html` shell
- top-level tabs from `sitemap.json`
- the rule that the browser surface is the source of truth
- the difference between framework video and consumer-app video

### Video B: Structure And Layout

Purpose:

- explain how a page is supposed to be arranged

Target length:

- 5 to 8 minutes

Must cover:

- Page Structure section
- Grid System section
- workspace layout
- single-column layout
- tabs/navigation shell
- spacing between layout choices and actual app composition

Must answer:

- what the page skeleton is
- what layouts the framework wants people to reuse
- how the shell behaves across sections

### Video C: Content And Inputs

Purpose:

- explain the components people actually place on pages

Target length:

- 8 to 12 minutes

Must cover:

- Typography
- Buttons
- Forms
- Cards
- Tables
- Alerts & Badges
- Modals & Toasts

Must answer:

- what classes and primitives are public and stable
- how the components work together
- what patterns are meant to replace ad hoc local UI

### Video D: Full Page Composition

Purpose:

- show how small primitives become complete screens

Target length:

- 5 to 8 minutes

Must cover:

- Detail Pages
- Spacing & Utilities
- Full Pages
- Live Preview

Must answer:

- how to compose a whole app page
- how utility classes support composition without turning into slop
- how the preview/editor flow supports real usage

### Video E: Themes

Purpose:

- explain theme switching without lying about component behavior

Target length:

- 4 to 6 minutes

Must cover:

- active
- walmart
- mockup

Must answer:

- what changes with theme
- what stays constant across themes
- why semantic tokens matter more than hardcoded brand names

### Video F: Builder And Tooling

Purpose:

- explain the builder surfaces and why they exist

Target length:

- 5 to 8 minutes

Must cover:

- Builder colors
- Builder typography
- Builder spacing
- Builder effects
- Visual Builder
- Test Results tab at a high level

Must answer:

- what is reference
- what is generation
- what is proof

### Video G: Runtime And Contracts

Purpose:

- explain the runtime loader and the JSON contract story

Target length:

- 6 to 10 minutes

Must cover:

- `js/ui.js`
- runtime loader model
- theme loading
- shipped JS modules
- `llm-docs.md`
- remote page contract
- `render.html` / contract-safe rendering flow

Must answer:

- how a consumer actually includes the framework
- how the runtime assembles the shared pieces
- where the public contract stops

### Video H: Consumer App Rules

Purpose:

- make future app videos better by teaching the split between framework and app

Target length:

- 4 to 6 minutes

Must cover:

- what a consumer app video should focus on
- how to prove framework usage without hijacking the app story
- the `check-ui-consumer` audit
- the framework-proof beat from `VIDEO_PROTOCOL.md`

Must answer:

- how to reuse the framework video work later
- how to avoid making every consumer app demo into the same framework lecture

## Optional Deliverables

If time later allows, add these after the main series:

- a 60-second trailer
- a 90-second quick tour
- one chapter-per-theme micro-series
- one chapter-per-component-family micro-series

These are optional.

The main series comes first.

## Planned Chapter Order Inside Each Video

Keep the internal order predictable:

1. where we are
2. what this surface is for
3. what is stable and public
4. one or two truthful interactions
5. what a consumer should copy
6. what not to misuse
7. transition to the next chapter

## Capture Strategy

The framework videos should use route-based navigation wherever possible.

Prefer:

- hash navigation from `sitemap.json`
- deterministic local server
- state jumps when they are truthful
- short, visible actions with enough pause to read

Avoid:

- mouse wandering
- overlong scrolling
- gratuitous cursor decoration
- fake interactions that the surface does not really support

## Visual Rules

The visual rules for recording are:

- record the real framework surface
- keep viewport sizes consistent across a series
- use enough pause time for text-heavy sections
- avoid hard cuts that lose context
- do not animate things just because a video exists

Recommended default capture sizes:

- desktop primary: `1280x720`
- desktop proof/high-detail: `1600x900` or `1920x1080`

## Narration Rules

Narration should sound like a builder explaining a real system, not a marketer.

Keep it:

- plain
- direct
- accurate
- short enough to track what is on screen

Each narration block should answer one of these:

- what is this
- why is it here
- how do you use it
- what rule does it enforce
- what is shared versus local

## Script Authoring Rules

When the scripts are eventually written, keep them small.

One act should have:

- one route
- one point
- one visible action at most
- one narration block

If an act needs more than that, split it.

## Artifact Plan

When implementation happens later, each finished video should have:

- source act script
- narration script
- poster frame choice
- final rendered video
- optional subtitles
- manifest metadata

For publishable outputs, keep the repo contract:

- `docs/demo/demo.webm` or `docs/demo/demo.mp4`
- `docs/demo/poster.png`
- `docs/demo/clips/*.mp4`
- `docs/demo/manifest.json`
- `contracts/fixtures/watch.json`
- `docs/frontdoor.json` updated to match

## Verification Gates

No video should be called done unless it passes these gates.

### Gate 1: Surface Truth

- the page shown is real
- the route exists
- the interaction shown actually works

### Gate 2: Narrative Truth

- the narration matches the screen
- shared behavior is not credited to local code
- local behavior is not credited to the framework

### Gate 3: Coverage Truth

- the planned chapter actually covers the intended bucket
- missing surfaces are named, not silently skipped

### Gate 4: Publish Truth

- demo files exist
- frontdoor metadata matches reality
- launchpad metadata would not point at dead files

## Sequence Plan

Do the work in this order when implementation time comes.

### Phase 1: Lock The Inventory

- confirm `sitemap.json`
- confirm all canonical tabs still map cleanly
- confirm theme tabs and builder tabs
- confirm runtime/contract docs

### Phase 2: Write The Scripts

- write one act script per planned video
- keep acts short
- keep routes deterministic
- mark proof beats explicitly

### Phase 3: Dry Run Capture

- record rough browser passes with no publishing
- fix pacing
- remove brittle interactions

### Phase 4: Narration Pass

- tighten wording after seeing timing on screen
- keep spoken text shorter than the first draft

### Phase 5: Final Capture And Render

- record or rebuild final clips
- render final cuts
- choose poster frames

### Phase 6: Publish

- write demo artifacts
- update metadata
- verify launchpad behavior

## Consumer-App Follow-On Plan

Once the framework series exists, use it as shared context for apps that consume the framework.

The follow-on order should be:

1. framework core
2. framework support tools
3. framework-heavy sample apps
4. normal consumer apps

For consumer apps:

- tell the app story first
- reuse only the relevant framework proof beat
- never replay the whole framework series inside the app demo

## Known Risks

These are the risks to plan around:

- the framework can move while scripts are being prepared
- screenshot-heavy sections can become too slow on video
- dense text pages can lead to over-narration
- themes can cause repetitive footage if cut badly
- a single mega-video would be hard to maintain

## Risk Controls

Use these controls:

- split into chapters
- keep acts route-driven
- keep narration short
- verify against the actual surface before final render
- publish only after metadata is correct

## Definition Of Done

The framework video plan is complete when:

- every major public framework surface has a named video bucket
- each bucket has a target purpose and length
- the capture and narration rules are explicit
- the publish contract is explicit
- the consumer-app follow-on rules are explicit

This plan already satisfies that definition for planning.

## Next Human-Or-Agent Step

When you want to spend tokens on implementation later, the next step is:

- write the act list for Video A and Video B only

That is the smallest useful cut that proves the series shape without committing to the entire rollout at once.
