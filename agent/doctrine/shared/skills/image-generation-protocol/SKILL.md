---
name: image-generation-protocol
description: Drop a structured image-generation request into the shared `~/Images/` queue so the supply-side image-gen agent can pick it up, generate the PNG, and save it to the requested absolute target path. TRIGGER when you (or the operator) need new art that does not exist in the project — phrases like "I need an image of X", "request a sprite for Y", "we need a PNG for Z", "drop an asset stub for W", or when you would otherwise hand-write a `request.image.*.md` file in a project. Receive-side automation is a separate image-capable agent the operator runs out-of-band; this skill ONLY enqueues — do not try to generate the PNG yourself. DO NOT TRIGGER for one-off "what would this look like?" mockup discussions, for documentation diagrams, or for re-requests of an asset that already exists in the project's `/assets/built/`.
---

# image-generation-protocol — supply-side image request queue

You are requesting a new image for a project you are working in. The flow is two-sided: you (supply side) drop a request stub into `~/Images/`; a separate image-capable agent (receive side) polls that folder, generates the PNG, saves it to the requested absolute target path, and moves the stub.

## The contract (canonical: `~/Images/IMAGE-GENERATION-PROTOCOL.md`)

**Queue location:** `~/Images/`

**Per-request file:**
- Filename: `request.image.<id>.md` — `<id>` preserves dots (e.g. `request.image.prop.npc.lawnmower_kid.md`)
- One file per requested image
- The body must declare the final ABSOLUTE PNG path via a `Generate \`<path>\`.` line near the top
- No YAML frontmatter required (the receive side parses the Generate line for target path)

**Operator monitoring:** the operator can `ls ~/Images/request.image.*.md` to see pending requests at any time. The presence of a file IS the request.

**Receive-side behavior** (for context — not your job here):
- Polls `~/Images/request.image.*.md` (excluding `processed/` and `failed/` subdirs).
- Reads the `Generate \`<absolute_path>\`.` line for the target path.
- Generates the PNG.
- Writes the PNG to the absolute path verbatim.
- Moves the stub: success → `~/Images/processed/<filename>`, fail → `~/Images/failed/<filename>`.
- Stale-but-pending stubs (>24h) are flagged to the operator, not retried automatically.

## When to invoke this skill

Whenever you would have written a `request.image.<id>.md` file under a project's `/assets/raw/`. The shared `~/Images/` queue REPLACES per-repo stubs entirely — do not write to `/assets/raw/request.image.*.md` anymore.

## Procedure

1. **Pick the absolute target path.** Where should the PNG land in the project repo? Common pattern: `<repo-absolute-path>/assets/raw/<id>.png`. The receive side writes here verbatim — no further mangling. ABSOLUTE paths only — relative paths break the global queue.

2. **Pick the id.** Use dotted-namespace ids that mirror the project's existing asset taxonomy (`prop.npc.lawnmower_kid`, `chrome.control.go`, `bg.cornfield.tile`, etc.). The id is what goes in the filename and the `# request.image.<id>` header.

3. **Compose the stub.** Use the template below. Match the existing project's voice for asset request stubs — read the project's HANDOFF / asset MANIFEST first if you don't know it.

   ```markdown
   # request.image.<id>

   Generate `<absolute target path>`.

   **What:** [one-line subject — concrete, specific, visual]

   **Why:** [what this unlocks in the project — gameplay/UI/marketing]

   **Composition:**
   - [bullet — colors, framing, key visual elements]
   - [bullet]
   - ALWAYS use solid magenta `#ff00ff` for any unused canvas regions (unless the asset is a seamless tile or full-bleed background, in which case skip and note `Tile: BOTH AXES MUST BE SEAMLESS` instead)
   - Subject occupies ~85% of canvas, centered

   **Output:**
   - Size: <e.g. 512x512 — pick to match the geometry that will use it>
   - Background: solid magenta `#ff00ff` (or `not magenta — full-bleed tile` if relevant)
   - Alpha: yes (needs runtime carve) | no (full-bleed)
   - Frames: 1 (or N for sprite sheets — describe sheet layout in the body)

   **Tone notes:** [optional — voice / mood / what would feel WRONG. Tell the receive agent what NOT to draw if the project's voice matters.]
   ```

4. **Write the file** to `~/Images/request.image.<id>.md`. If a file with that exact name exists at any of `~/Images/request.image.<id>.md`, `~/Images/processed/request.image.<id>.md`, or `~/Images/failed/request.image.<id>.md`, version-bump with `.v2` (or `.v3`, etc.) inserted before the `.md` extension and tell the operator about the version bump — re-requests of an existing asset are intentional and the receive side keeps version history that way.

5. **Tell the operator** the request is queued, naming the queue file path and the absolute target path the PNG will land at.

6. **Do NOT block.** Continue the rest of your work assuming the asset will arrive eventually. In the meantime, use a sensible fallback in code: a placeholder colored rectangle, the existing `/assets/built/<id>.png` if a previous version landed, or the magenta source itself. The receive side runs on its own cadence.

## Tone rules for the prompt body

The receive-side agent is a different model that won't have your project context. Write the prompt body as if briefing a freelance illustrator who has never seen the project:

- **Concrete, not flowery.** "A teenage Iowa kid pushing a red push-mower across a dirt road, side profile" passes. "A heartwarming midwestern moment captured in time" fails.
- **Visual specs, not vibes.** Colors, framing, materials, era. Not "evocative" or "cinematic."
- **Reject AI tropes.** Don't say "highly detailed, 4k, masterpiece" — those are Stable-Diffusion / Midjourney prompt-engineering hacks; the receive agent doesn't need them.
- **Tone notes are for the AGENT, not the asset.** "The joke is in the player's behavior, not the kid" tells the receive agent what NOT to draw (a smug or smirking kid). "Affectionate, never mocking" is the project rule and goes in the body if the asset's character matters.

## Common pitfalls

- **Wrong target path.** Putting `<repo>/assets/built/foo.png` is wrong — receive side writes to the path verbatim, but `built/` is for carved/processed PNGs only. Always target `<repo>/assets/raw/foo.png` so the project's existing `scripts/carve.mjs` can do its job after the asset lands.
- **Relative paths.** The receive side runs from `~/Images/` and won't resolve `/assets/raw/foo.png` against the project root. Use ABSOLUTE paths in the Generate line.
- **Sprite sheets.** If `Frames > 1`, also specify the sheet layout in the body ("8 frames left-to-right in a single row, 64×64 each"). The receive agent won't infer it.
- **Magenta-key reminder.** This is non-negotiable for projects that use the carve pipeline. If the asset is a seamless tile or full-bleed background instead, swap the magenta rule for an explicit `Tile: BOTH AXES MUST BE SEAMLESS` (or equivalent) note.
- **Atlas vs single image.** If you actually need a UV-mapped cube atlas (for a textured-box prop), the receive agent needs the unfolded layout — link to the project's `/src/atlas/manifest.ts` or describe the 3×4 layout explicitly in the body.

## What this skill does NOT do

- Generate the PNG. That is the receive side.
- Run `scripts/carve.mjs` (or any project-side post-processing). That is your follow-up after the PNG lands.
- Wire the asset into `game.ts` / loader / CSS. That is your follow-up work after the PNG arrives.
- Track request status. The operator monitors `~/Images/*.md` directly.

## Example

You are working in `/Users/mist83/Code/nelsonville` and need a yellow biplane sprite for the new crop-duster system.

1. Target path: `/Users/mist83/Code/nelsonville/assets/raw/prop.aircraft.crop_duster.png`
2. Id: `prop.aircraft.crop_duster`
3. Filename: `~/Images/request.image.prop.aircraft.crop_duster.md`
4. Body:
   ```markdown
   # request.image.prop.aircraft.crop_duster

   Generate `/Users/mist83/Code/nelsonville/assets/raw/prop.aircraft.crop_duster.png`.

   **What:** A small yellow biplane crop duster, viewed from straight above (top-down silhouette)...
   ...
   ```
5. Tell the operator: "Queued at `~/Images/request.image.prop.aircraft.crop_duster.md`. PNG will land at `/Users/mist83/Code/nelsonville/assets/raw/prop.aircraft.crop_duster.png` when the receive agent picks it up."
6. Continue using the placeholder yellow-rect fallback in code; the asset wires in once it arrives.
