# rhythm-engine

Headless rhythm compilation, playback, and projection utilities shared by `tap-repeater`, `dag`, and the canonical scene viewer example.

## Current Consumers

- `tap-repeater` captures taps, long notes, and drags, then delegates BPM, playback scheduling, and DAG URL payload generation to `rhythm-engine`
- `dag` imports serialized rhythm payloads, projects them into graph space, and animates playback overlays from the same compiled pattern
- `app/examples/scene-viewer` is the canonical scene/Gource-like playback surface and imports `rhythm-engine` source directly

## Modules

- `events` - normalize raw gesture events into a portable rhythm event shape
- `pattern` - compile a normalized pattern, BPM, beat list, and pitch metadata
- `playback` - create deterministic playback cues without owning audio playback
- `projection` - project a pattern into DAG and scene-friendly models
- `serialization` - canonical JSON and base64url-safe rhythm payloads
- `adapters/tap-repeater` - convert raw tap-repeater taps into normalized gesture events
- `adapters/dag` - build a DAG import URL for serialized rhythm patterns

## Public API

```js
import {
  compilePattern,
  createPlaybackSchedule,
  projectPatternToDag,
  projectPatternToScene,
  serializePattern,
  parsePattern
} from './src/index.js';
```

## Testing

```bash
npm test
```

## Syncing Vendored Consumer Copies

If `rhythm-engine`, `dag`, and `tap-repeater` live beside each other under the same parent directory, refresh the browser-vendored copies with:

```bash
npm run sync:consumers
```

That syncs:

- `../dag/src/vendor/rhythm-engine`
- `../tap-repeater/wwwroot/vendor/rhythm-engine`

## Scene Viewer Example

Run the engine-owned scene viewer directly from this repository:

```bash
npm run serve:scene-viewer
```

Open `http://127.0.0.1:8093/app/examples/scene-viewer/`.

In another terminal, verify the viewer against the local engine source:

```bash
npm run test:scene-viewer
```

Run `npm ci` first in a fresh clone so the smoke can import Puppeteer. The viewer test starts its own ephemeral local server, so once dependencies are installed it should pass without any manual setup.

A GitHub Action mirrors that smoke on pushes and pull requests that touch the engine or viewer code, so browser regressions do not have to wait for someone to notice a broken screenshot by eye. What a time to be alive.

## Static Preview

The repo root now has an explicit deploy contract:

- `.` is the static publish target
- `mullmania.site.json` declares the publish path for Mullmania
- `.github/workflows/pages.yml` deploys the same folder to GitHub Pages
- The canonical scene viewer stays at `app/examples/scene-viewer/`
