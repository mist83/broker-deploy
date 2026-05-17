# Architecture

Golden Apple starts as a batch renderer because that is the fastest honest proof of the idea.

## Current Pipeline

```text
input video
  -> decode frames with OpenCV
  -> choose comic or sketch style
  -> comic: posterize colors and apply dark ink masks
  -> sketch: OpenCV pencil-sketch pass, light color wash, paper texture
  -> print: adaptive 16-color palette, unsharp detail, hard ink, crystallized blocks, print dots
  -> optionally add halftone dots for comic style
  -> draw subtitle caption box
  -> encode output video
```

Subtitles are drawn after the frame filter. That keeps captions readable instead of letting edge detection chew up the words.

## VLC-Native Shape

The eventual VLC version should not be a Lua extension. It wants native code.

Likely v1:

- Native VLC video filter module for the comic frame treatment.
- ASS subtitle files for styled comic captions.
- User-facing preset controls for color count, edge strength, saturation, and halftone.

Likely product version:

- Video filter runs before subtitles.
- Custom subtitle overlay runs after filtering.
- Caption renderer supports boxes, bubbles, character colors, and comic action cards.
- GPU shader path handles live playback at real resolutions.

## Boundaries

The batch renderer is allowed to be simple and a little slow. Its job is to tune the look.

The VLC plugin is allowed to be harder only after the visual recipe is worth preserving.
