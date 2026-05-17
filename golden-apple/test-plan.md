# Test Plan

Golden Apple should be testable without real movie assets.

## Automated Coverage

- Subtitle parsing accepts indexed and unindexed SRT blocks.
- Subtitle lookup returns the active cue and expires old cues.
- Filter settings reject invalid ranges.
- Posterization measurably reduces per-channel color levels.
- Ink detection finds geometric edges with OpenCV masks.
- Ink application darkens only masked pixels.
- Comic rendering changes a frame and increases dark outline pixels.
- Halftone rendering creates regular local darkening.
- Caption rendering changes the lower frame region much more than a clean upper band.
- Video rendering writes a readable MP4 with expected dimensions and frame count.
- CLI sample generation writes a video and SRT with no external assets.
- CLI render smoke test produces a readable output movie.
- Proof tooling writes a contact sheet and reports numeric frame metrics.

## Manual Proof

```bash
. .venv/bin/activate
scripts/smoke.sh
open output/smoke-comic.mp4
```

The output should look like a small comic-book panel treatment with a yellow caption box at the bottom.

For the live-action proof:

```bash
pip install -e ".[dev,proof]"
scripts/live-human-proof.sh
open output/live-human-proof/live-contact-sheet.jpg
open output/live-human-proof/pencil-live-people.mp4
```
