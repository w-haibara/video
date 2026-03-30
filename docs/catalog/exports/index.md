# Export Regression Tests

52 export tests.

| # | Test | Description | Frames | Canvas |
|---|------|-------------|--------|--------|
| 1 | [single-video](single-video/index.md) | Single 1s video clip | 10 | 160x90 |
| 2 | [two-clips](two-clips/index.md) | Two sequential video clips (0-1s, 1-2s) | 20 | 160x90 |
| 3 | [image-clip](image-clip/index.md) | Single image clip displayed for 1s | 12 | 160x90 |
| 4 | [text-overlay](text-overlay/index.md) | Text overlay on video | 10 | 160x90 |
| 5 | [crop-transform](crop-transform/index.md) | Video with crop and transform | 10 | 160x90 |
| 6 | [multi-track](multi-track/index.md) | Two-track composite (video + image) | 12 | 160x90 |
| 7 | [overlay-transform](overlay-transform/index.md) | Scaled top clip with transparent bottom clip exposure | 12 | 160x90 |
| 8 | [transition-fade](transition-fade/index.md) | Fade cross-dissolve (300ms) | 18 | 160x90 |
| 9 | [transition-fade-black](transition-fade-black/index.md) | Fade through black (300ms) | 18 | 160x90 |
| 10 | [transition-fade-white](transition-fade-white/index.md) | Fade through white (300ms) | 18 | 160x90 |
| 11 | [transition-slide-left](transition-slide-left/index.md) | Slide left (300ms) | 18 | 160x90 |
| 12 | [transition-slide-right](transition-slide-right/index.md) | Slide right (300ms) | 18 | 160x90 |
| 13 | [transition-slide-up](transition-slide-up/index.md) | Slide up (300ms) | 18 | 160x90 |
| 14 | [transition-slide-down](transition-slide-down/index.md) | Slide down (300ms) | 18 | 160x90 |
| 15 | [transition-wipe-left](transition-wipe-left/index.md) | Wipe left (300ms) | 18 | 160x90 |
| 16 | [transition-wipe-up](transition-wipe-up/index.md) | Wipe up (300ms) | 18 | 160x90 |
| 17 | [transition-zoom-in](transition-zoom-in/index.md) | Zoom in (300ms) | 18 | 160x90 |
| 18 | [transition-push-left](transition-push-left/index.md) | Push left (300ms) | 18 | 160x90 |
| 19 | [blend-opacity](blend-opacity/index.md) | Opacity blend (50% alpha overlay) | 12 | 160x90 |
| 20 | [blend-multiply](blend-multiply/index.md) | Multiply blend (darkens) | 12 | 160x90 |
| 21 | [blend-screen](blend-screen/index.md) | Screen blend (lightens) | 12 | 160x90 |
| 22 | [blend-overlay](blend-overlay/index.md) | Overlay blend (contrast) | 12 | 160x90 |
| 23 | [blend-add](blend-add/index.md) | Add blend (additive light) | 12 | 160x90 |
| 24 | [blend-difference](blend-difference/index.md) | Difference blend (absolute diff) | 12 | 160x90 |
| 25 | [empty-asset-mixed](empty-asset-mixed/index.md) | Video + empty-asset clip (empty skipped) | 10 | 160x90 |
| 26 | [split-clip](split-clip/index.md) | Video clip split into two halves at 500ms | 10 | 160x90 |
| 27 | [muted-track](muted-track/index.md) | Video + muted image track (muted excluded) | 10 | 160x90 |
| 28 | [transition-with-transform](transition-with-transform/index.md) | Fade transition + transform on clip 2 | 18 | 160x90 |
| 29 | [transition-multi-track](transition-multi-track/index.md) | Fade transition on track 1 + image overlay on track 2 | 18 | 160x90 |
| 30 | [blend-mode-transition](blend-mode-transition/index.md) | Fade transition + multiply blend on clip 2 | 18 | 160x90 |
| 31 | [crop-blend](crop-blend/index.md) | Crop + screen blend on top clip | 12 | 160x90 |
| 32 | [title-font-align](title-font-align/index.md) | Title overlay with fontFamily and align | 10 | 160x90 |
| 33 | [keyframe-transform-x](keyframe-transform-x/index.md) | Keyframe animated transform.x (horizontal movement) | 10 | 160x90 |
| 34 | [speed-2x](speed-2x/index.md) | Video clip at 2x speed (500ms) | 6 | 160x90 |
| 35 | [speed-half](speed-half/index.md) | Video clip at 0.5x speed (2000ms) | 20 | 160x90 |
| 36 | [speed-multi-clip](speed-multi-clip/index.md) | Two clips: first at 2x speed, second normal | 15 | 160x90 |
| 37 | [color-correction](color-correction/index.md) | Color correction (brightness + contrast + saturation) | 10 | 160x90 |
| 38 | [color-correction-hue](color-correction-hue/index.md) | Color correction (hue rotation 90deg) | 10 | 160x90 |
| 39 | [color-correction-transform](color-correction-transform/index.md) | Color correction + transform (cross-feature) | 10 | 160x90 |
| 40 | [video-filter-blur-sepia](video-filter-blur-sepia/index.md) | Video filter (blur + sepia) | 10 | 160x90 |
| 41 | [video-filter-grayscale](video-filter-grayscale/index.md) | Video filter (grayscale) | 10 | 160x90 |
| 42 | [video-filter-transform](video-filter-transform/index.md) | Video filter + transform (cross-feature) | 10 | 160x90 |
| 43 | [p5js-rendered](p5js-rendered/index.md) | p5.js sketch rendered from source via Chromium pipeline | 10 | 160x90 |
| 44 | [chroma-key](chroma-key/index.md) | Chroma key (green screen removal) | 10 | 160x90 |
| 45 | [chroma-key-transform](chroma-key-transform/index.md) | Chroma key + transform (cross-feature) | 12 | 160x90 |
| 46 | [pip-corner-br](pip-corner-br/index.md) | PiP preset: corner bottom-right (0.3x) | 12 | 160x90 |
| 47 | [pip-side-by-side](pip-side-by-side/index.md) | PiP preset: side-by-side (0.5x) | 12 | 160x90 |
| 48 | [speed-transition](speed-transition/index.md) | Speed 2x + fade transition (cross-feature) | 14 | 160x90 |
| 49 | [color-correction-video-filter](color-correction-video-filter/index.md) | Color correction + sepia video filter stacked | 10 | 160x90 |
| 50 | [keyframe-color-correction](keyframe-color-correction/index.md) | Keyframe transform.x + color correction (cross-feature) | 10 | 160x90 |
| 51 | [video-filter-transition](video-filter-transition/index.md) | Video filter (grayscale) + fade transition (cross-feature) | 18 | 160x90 |
| 52 | [chroma-key-blend](chroma-key-blend/index.md) | Chroma key + screen blend mode (cross-feature) | 12 | 160x90 |
