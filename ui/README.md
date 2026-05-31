# UI Framework

Theme-aware CSS and JS for Mullmania app shells, structured page contracts, and sitemap-driven previews.

**Base URL:** `https://ui.mullmania.com`

## Quick Start

Follow the published global default:

```html
<script src="https://ui.mullmania.com/ui.js"></script>
```

Or follow the published default explicitly:

```html
<link rel="stylesheet" href="https://ui.mullmania.com/active/style.css">
<script src="https://ui.mullmania.com/ui.js" data-ui-theme="active" data-ui-mode="light"></script>
```

## Published Default

- `active-theme.json` is the public manifest for the currently published default.
- Bare `ui.js`, `data-ui-theme="active"`, and `/active/*` all follow that published default.
- Use a concrete theme id like `ocean` or `walmart` when a site should stay pinned.
- `UI.setTheme(theme, { mode })` is local document state only. It does not publish a new global default.
- Publishing the global default happens through `POST /api/theme/active` with `X-Operator-Key`.

## Supported Themes

- `cyberblue` - Theme Builder copy of cyberpink with the hot pink pushed to electric blue.
- `cyberpink` - Neon-heavy synthwave treatment for loud demos and high-energy branded work.
- `editorial` - Typography-led paper-and-ink theme for authored, high-intent surfaces.
- `ghoul` - Acid green and blood red on near-black for dense consoles, TV-room dashboards, and log streams.
- `mockup` - Sketch-like wireframe treatment for concept reviews and low-fidelity product planning.
- `monochrome` - Neutral grayscale system with matching grayscale dark mode.
- `red` - Clean simple-theme surfaces with a red accent.
- `orange` - Clean simple-theme surfaces with an orange accent.
- `yellow` - Clean simple-theme surfaces with a deep-amber accent.
- `green` - Clean simple-theme surfaces with a green accent.
- `blue` - Clean simple-theme surfaces with a blue accent.
- `indigo` - Clean simple-theme surfaces with an indigo accent.
- `violet` - Clean simple-theme surfaces with a violet accent.
- `mac` - Apple/macOS control language.
- `blackwhite` - Strict two-color theme.
- `ocean` - Cool blue system for calmer dashboards and ambient product surfaces.
- `pastelzom` - Light mint, lilac, and candy-pink zombie treatment.
- `precog` - Signal-room palette for timeline, automation, and monitoring surfaces.
- `pumpkin` - Warm rounded theme for approachable product work.
- `simple` - Clean, flat enterprise-utility aesthetic.
- `sunset` - Warmer editorial palette for expressive showcase and storytelling surfaces.
- `terminal` - Sharp monochrome terminal style for command-heavy tools.
- `walmart` - Brand-specific blue and yellow treatment for explicit Walmart-flavored work.
- `windows31` - Sharp gray bevels, blue chrome, and retro desktop styling.

## Supported Modes

- `light`
- `dark`

Theme and mode stay independent.

```html
<script src="https://ui.mullmania.com/ui.js" data-ui-theme="ocean" data-ui-mode="dark"></script>
```

```text
core/layout.css
    ^
    |
theme colors.css
(cyberpink | editorial | mockup | ocean | pumpkin | sunset | walmart)
    ^
    |
html[data-ui-mode="light" | "dark"]
```

## URLs

- `/active-theme.json`
- `/active/style.css`
- `/blackwhite/style.css`
- `/blue/style.css`
- `/cyberblue/style.css`
- `/cyberpink/style.css`
- `/editorial/style.css`
- `/ghoul/style.css`
- `/green/style.css`
- `/indigo/style.css`
- `/mac/style.css`
- `/mockup/style.css`
- `/monochrome/style.css`
- `/ocean/style.css`
- `/orange/style.css`
- `/pastelzom/style.css`
- `/precog/style.css`
- `/pumpkin/style.css`
- `/red/style.css`
- `/simple/style.css`
- `/sunset/style.css`
- `/terminal/style.css`
- `/violet/style.css`
- `/walmart/style.css`
- `/windows31/style.css`
- `/yellow/style.css`
- `/js/ui.js`
- `/preview.html?theme=active&mode=light`
- `/preview.html?theme=mockup&mode=dark`
- `/render.html?theme=active&mode=light`
- `/render.html?source=/contracts/fixtures/operations-dashboard.json`

## Theme Contract

Shared CSS uses semantic tokens only.

- `--color-primary`
- `--color-secondary`
- `--bg-primary`
- `--bg-secondary`
- `--bg-tertiary`
- `--text-primary`
- `--text-secondary`
- `--text-muted`
- `--border-color`
- `--font-family`

Dark mode flows through `data-ui-mode="dark"`. Themes can override it locally, and any theme without a local override inherits the shared dark-token fallback.

## Runtime Contract

- `data-ui-theme` accepts `active` plus every concrete theme id in `styles.json`
- `data-ui-mode` accepts `light`, `dark`
- `UI.setTheme(theme, { mode })` updates the current document theme and preserves the current mode unless you pass a new one
- `UI.setTheme()` is local-only and does not publish the global default
- `UI.setMode(mode)` only flips light vs dark
- `GET /active-theme.json` returns the published global default manifest
- `POST /api/theme/active` publishes a new global default when `X-Operator-Key` is present
- `POST /api/theme/create` creates a locked named theme from an existing published theme when `X-Operator-Key` is present
- `preview.html` accepts both `theme` and `mode`
- `render.html` accepts `theme`, `mode`, `source`, `spec`, `spec64`, and `preset`
- `sitemap.json` items can mount `contractSource`, `contract`, `preset`, `componentSource`, or `componentSpec` directly inside the shell
- `sitemap.sidebarPosition` accepts `left` or `right` for all workspace tabs; `tab.sidebarPosition` can override it per tab
- `sitemap.tabNavigation` accepts `top`, `bottom`, or `pager`; this is app-level only because the tab navigation sits outside tab workspaces
- `htmlSource` is legacy compatibility only and should not be the default authoring path
- `visual-builder` is the only shipped `htmlSource` maintenance hatch; everything else in the shell should mount through the shared runtime
- `frontdoor.json` can publish a `canon` block with version, profile, checklist, and proof links; `UI.frontdoor` renders that automatically
- `sitemap.json` can publish `automation.version = 1` and `automation.tour` metadata for deterministic video tours
- `ui-tour-manifest.json` is the normalized tour graph generated from `sitemap.json`; recorders and Storyboard handoff tools consume this instead of guessing app structure
- Sitemap-backed shells automatically receive a final `UI Framework` tab with an about panel, live theme/mode/sidebar controls, renderer links, and the JSON-to-site proof embed
- Emergency opt-out is `frameworkTools: false` in the shell config or sitemap, but canonical sites should leave it on

## Main Surfaces

- `/index.html` - framework shell and tab system
- `/about.html` - framework-owned explanation page linked from every injected `UI Framework` tab
- `/index.html` opens on `Start`, which is the plain browse path for a new user
- `#/watch` - clip wall with one demo clip per shipped route
- `/preview.html` - rendered preview surface for theme and sitemap checks
- `/render.html` - rendered page-contract surface
- `/docs/index.html` - repo frontdoor with proof reel and chapter evidence
- `/docs/index.html?variant=evidence` - proof-first view of artifacts and chapter coverage
- `#/contracts/operations-dashboard` - shell-level contract fixture
- `#/contracts/release-readiness` - shell-level component JSON fixture
- `#/canonical/live-preview` - JSON editor + live iframe preview
- `#/canonical/contract-lab` - page-contract editor + live iframe preview
- `#/docs/theme-builder` - dogfood recipe page for making or remaking themes
- `#/visual-builder` - legacy maintenance hatch for sitemap builder work
- `#/themes/cyberpink`
- `#/themes/editorial`
- `#/themes/mockup`
- `#/themes/ocean`
- `#/themes/pumpkin`
- `#/themes/sunset`
- `#/themes/walmart`

## Notes

- Shared layout rules live in `core/`
- Theme color files define semantic tokens; reusable theme layouts consume those tokens instead of hard-coded colors
- Theme Builder copies should prefer token-only color changes and layout recipe imports over cloned CSS blobs
- The framework is brand-agnostic at the shared layer
- `active` is the fleet-wide default route, not a separate public theme
- Use `contractSource`, `preset`, `componentSource`, or `componentSpec` before `htmlSource`
- Use `render.html` and the contract lab when the page should come from JSON outside the main shell
- Treat direct HTML work as a short-lived maintenance hatch that should be upstreamed back into shared primitives quickly
- Proof media lives in `docs/demo/` and is driven by `docs/demo/proof-plan.json`
- Theme tutorial media lives in `docs/theme-demo/` and is driven by `docs/theme-demo/proof-plan.json`
- `scripts/render-proof-demo.mjs` regenerates the poster, chapter screenshots, per-route clips, stitched video, watch page, and manifest from stable routes
- `scripts/generate-tour-manifest.mjs` regenerates `ui-tour-manifest.json` from the sitemap tour convention
- `scripts/validate-tour.mjs` verifies that the sitemap and tour manifest are automatable without AI
- `scripts/record-tour.mjs` records a deterministic stills-based tour and emits a Storyboard-compatible narration script

## Tests

Run the hermetic local test suite from `tests/`:

```bash
cd /Users/mist83/Code/ui/tests
npm test
```

The test suite starts its own static server on `http://localhost:8080`.

Regenerate proof artifacts:

```bash
node /Users/mist83/Code/ui/scripts/render-proof-demo.mjs
```

Regenerate and validate the deterministic tour graph:

```bash
node /Users/mist83/Code/ui/scripts/generate-tour-manifest.mjs
node /Users/mist83/Code/ui/scripts/validate-tour.mjs --sitemap sitemap.json --manifest ui-tour-manifest.json
```

Record a local tour after starting a static server on `http://127.0.0.1:8080`:

```bash
node /Users/mist83/Code/ui/scripts/record-tour.mjs --manifest ui-tour-manifest.json --base-url http://127.0.0.1:8080/index.html
```

## Related Docs

- `llm-docs.md`
- `VIDEO_PROTOCOL.md`
- `VIDEO_SERIES_PLAN.md`
- `tools/README.md`
