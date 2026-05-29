# Stylizer recipe — what works, what doesn't

Catalog of what got tried while making the book renderer look like a real comic
instead of a Photoshop filter. Future agents working on this repo: read this
before tweaking `_comic_stylize` in `src/golden_apple/book.py`.

## The winning recipe (H7)

`pyrMeanShiftFiltering(sp=35, sr=85, maxLevel=2)` → 4-color k-means with
saturation gain 1.65 → Sobel-magnitude edge mask at the 97th percentile →
drop connected components < 0.02% of the frame → dilate 2x with a 3x3 kernel.

Halftone-in-shadows is supported behind a flag but **off by default** — in
woodland / low-light scenes the source already has huge dark regions, so the
"only shade where the original was dark" rule still triggers everywhere and
the dot pattern obliterates the flats. Halftone is a tool for bright scenes
where shadows are localized.

## What was tried and rejected

The two contact sheets in `output/bakeoff-bbb.png` and `output/bakeoff-v2.png`
are the receipts. Brief summary:

* **XDoG ink (the first attempt)** — extended difference-of-gaussians draws a
  line at every gradient. Looks like crosshatched static, not comic linework.
  Reject for natural / textured footage.
* **Adaptive-threshold edges** — same problem as XDoG. Every leaf becomes an
  edge. Reject.
* **cv2.stylization alone** — softens too much; needs a sparse silhouette
  ink layer added (recipes B and F).
* **Snap-to-fixed-CMYK palette** (red/yellow/blue/cream) — broke colors. All
  source clusters mapped to ≤2 swatches, image went monochrome. Reject as
  written; could work with a *learned* palette per scene but that's bigger.
* **k-means without mean-shift** — per-pixel quantization gives speckle
  inside what should be flat regions. Mean-shift before k-means is what
  gives you real flats.

## Why this works

* **Mean-shift is region-aware**, k-means is per-pixel. Mean-shift collapses
  similar neighbors into the same color BEFORE k-means picks the palette, so
  k-means is choosing from already-flat regions. That's what makes the output
  read as "drawn" instead of "filtered photo."
* **Sobel-percentile (not adaptive-threshold) edges** ink only the strongest
  ~3% of gradients. In a busy frame that's still hundreds of pixels, but
  they form coherent silhouettes instead of leaf-noise dots.
* **Connected-component filter** kills tiny ink specks (codec noise, fine
  texture) that survive the percentile threshold but don't form silhouettes.
* **Bold dilation** of the surviving edges (2 iterations, 3x3) gives the
  chunky linework characteristic of inked comics, not pencil sketch.

## Levers if you tune it

The CLI exposes nothing yet — all parameters are hard-coded in
`_comic_stylize`. The knobs that matter:

| Knob | What it controls | Range |
| --- | --- | --- |
| `sp` / `sr` in pyrMeanShiftFiltering | Size of flat regions | larger = bigger flats, slower |
| `k` in k-means | Palette size | 3–6 for comic, 8+ goes photographic |
| Saturation `gain` / `lift` | Comic-print color punch | gain 1.4–1.7, lift 15–30 |
| Sobel percentile | How many silhouettes get inked | 93–98; 95 is balanced |
| Min component area | Noise filter floor | 0.0001–0.0005 of frame |
| Dilate iterations | Ink line thickness | 1–3 |

## Open follow-ups

* Halftone needs a smarter trigger — luminance percentile in the **original**
  frame, not absolute < 60. That way a daylight scene with a true small
  shadow gets dots, but a dim woodland scene doesn't get carpet-bombed.
* Subject-vs-background separation would push this further. Run a quick
  saliency or depth pass, lift saturation only on the foreground, leave the
  background slightly desaturated. A real comic does this — colorists pull
  the eye to the subject.
* Try this stylizer in the **video** renderer too. The current
  `comic.py:comic_frame` is what powers the existing wizard, and it still
  uses the rejected XDoG/adaptive-threshold approach.
