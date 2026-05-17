# AI Decision Points

Golden Apple should stay deterministic by default. AI enters only at explicit ambiguity points, with a narrow task, timestamp, frame, context, and an override schema.

The goal is:

```text
deterministic process finds ambiguity
  -> emits decision packet
  -> AI suggests one specific answer
  -> human approves or nudges only that answer
  -> deterministic process continues
```

The human is not doing production work. The human is resolving ambiguity.

## Generate A Packet

```bash
golden-apple-decisions input.mp4 \
  --subtitles subtitles.srt \
  --out output/decisions \
  --samples 8
```

This writes:

- `output/decisions/decisions.json`
- `output/decisions/OVERRIDES.example.json`
- `output/decisions/frames/*.jpg`

## Current Decision Kinds

- `panel_role`: classify a keyframe as establishing, dialogue, reaction, action, insert, or discard.
- `crop_subject`: choose a subject crop as normalized `x,y,w,h`.
- `speech_bubble_anchor`: choose a speaker anchor and bubble side for a subtitle cue.

Each point contains:

- `timestamp_sec`
- `frame_path`
- subtitle context when available
- a narrow `ai_task`
- a `human_prompt`
- an `override_schema`

## Why This Shape

The renderer should not ask an AI to “make this good.” That is too vague.

The renderer should ask:

- “Which visible person is speaking at 12.4s?”
- “Is this frame a reaction shot or an establishing shot?”
- “Where should the speech bubble anchor go?”
- “Is this low-motion span safe to collapse into one panel?”

Those are small enough for AI to answer and for a human to approve quickly.

## Scenes

`decisions.json` also carries a `scenes` array. These are real cut-detected spans
(HSV color-histogram chi-squared on ~5 fps samples, merged to a 1.0s minimum),
not the uniformly spaced AI keyframes in `points`. Scenes are contiguous, cover
the full duration, and each carries a midpoint keyframe written to the same
`frames/` directory:

```json
"scenes": [
  { "ordinal": 1, "in_s": 0.0,  "out_s": 12.34, "label": "scene 01", "keyframe_path": "frames/scene-01-6.17s.jpg" },
  { "ordinal": 2, "in_s": 12.34, "out_s": 27.50, "label": "scene 02", "keyframe_path": "frames/scene-02-19.92s.jpg" }
]
```

The downstream storyboard Lambda's `clips` API consumes a parallel shape — one
`jq` hop and you're rearranging the movie:

```bash
# Cross-product: golden-apple scenes → storyboard rearrange
jq '{clips: .scenes | map({video_url: "https://example.com/source.mp4", in_s, out_s, label})}' \
   output/decisions/decisions.json > storyboard-request.json
```

The `points` field is unaffected. Callers that only consume AI decision points
keep working unchanged.

## Future Hook

The next step is letting render commands accept an overrides file:

```bash
golden-apple-panel input.mp4 output.mp4 --decisions output/decisions/approved.json
```

The command should consume only validated fields from approved overrides. Free-form AI prose should never directly drive rendering.

