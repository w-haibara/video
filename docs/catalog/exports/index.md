# Export Regression Tests

52 export tests.

| # | Test | Description | Frames | Canvas |
|---|------|-------------|--------|--------|
| 1 | [single-video](single-video/) | Single 1s video clip | 10 | 160x90 |
| 2 | [two-clips](two-clips/) | Two sequential video clips (0-1s, 1-2s) | 20 | 160x90 |
| 3 | [image-clip](image-clip/) | Single image clip displayed for 1s | 12 | 160x90 |
| 4 | [text-overlay](text-overlay/) | Text overlay on video | 10 | 160x90 |
| 5 | [crop-transform](crop-transform/) | Video with crop and transform | 10 | 160x90 |
| 6 | [multi-track](multi-track/) | Two-track composite (video + image) | 12 | 160x90 |
| 7 | [overlay-transform](overlay-transform/) | Scaled top clip with transparent bottom clip exposure | 12 | 160x90 |
| 8 | [transition-fade](transition-fade/) | Fade cross-dissolve (300ms) | 18 | 160x90 |
| 9 | [transition-fade-black](transition-fade-black/) | Fade through black (300ms) | 18 | 160x90 |
| 10 | [transition-fade-white](transition-fade-white/) | Fade through white (300ms) | 18 | 160x90 |
| 11 | [transition-slide-left](transition-slide-left/) | Slide left (300ms) | 18 | 160x90 |
| 12 | [transition-slide-right](transition-slide-right/) | Slide right (300ms) | 18 | 160x90 |
| 13 | [transition-slide-up](transition-slide-up/) | Slide up (300ms) | 18 | 160x90 |
| 14 | [transition-slide-down](transition-slide-down/) | Slide down (300ms) | 18 | 160x90 |
| 15 | [transition-wipe-left](transition-wipe-left/) | Wipe left (300ms) | 18 | 160x90 |
| 16 | [transition-wipe-up](transition-wipe-up/) | Wipe up (300ms) | 18 | 160x90 |
| 17 | [transition-zoom-in](transition-zoom-in/) | Zoom in (300ms) | 18 | 160x90 |
| 18 | [transition-push-left](transition-push-left/) | Push left (300ms) | 18 | 160x90 |
| 19 | [blend-opacity](blend-opacity/) | Opacity blend (50% alpha overlay) | 12 | 160x90 |
| 20 | [blend-multiply](blend-multiply/) | Multiply blend (darkens) | 12 | 160x90 |
| 21 | [blend-screen](blend-screen/) | Screen blend (lightens) | 12 | 160x90 |
| 22 | [blend-overlay](blend-overlay/) | Overlay blend (contrast) | 12 | 160x90 |
| 23 | [blend-add](blend-add/) | Add blend (additive light) | 12 | 160x90 |
| 24 | [blend-difference](blend-difference/) | Difference blend (absolute diff) | 12 | 160x90 |
| 25 | [empty-asset-mixed](empty-asset-mixed/) | Video + empty-asset clip (empty skipped) | 10 | 160x90 |
| 26 | [split-clip](split-clip/) | Video clip split into two halves at 500ms | 10 | 160x90 |
| 27 | [muted-track](muted-track/) | Video + muted image track (muted excluded) | 10 | 160x90 |
| 28 | [transition-with-transform](transition-with-transform/) | Fade transition + transform on clip 2 | 18 | 160x90 |
| 29 | [transition-multi-track](transition-multi-track/) | Fade transition on track 1 + image overlay on track 2 | 18 | 160x90 |
| 30 | [blend-mode-transition](blend-mode-transition/) | Fade transition + multiply blend on clip 2 | 18 | 160x90 |
| 31 | [crop-blend](crop-blend/) | Crop + screen blend on top clip | 12 | 160x90 |
| 32 | [title-font-align](title-font-align/) | Title overlay with fontFamily and align | 10 | 160x90 |
| 33 | [keyframe-transform-x](keyframe-transform-x/) | Keyframe animated transform.x (horizontal movement) | 10 | 160x90 |
| 34 | [speed-2x](speed-2x/) | Video clip at 2x speed (500ms) | 6 | 160x90 |
| 35 | [speed-half](speed-half/) | Video clip at 0.5x speed (2000ms) | 20 | 160x90 |
| 36 | [speed-multi-clip](speed-multi-clip/) | Two clips: first at 2x speed, second normal | 15 | 160x90 |
| 37 | [color-correction](color-correction/) | Color correction (brightness + contrast + saturation) | 10 | 160x90 |
| 38 | [color-correction-hue](color-correction-hue/) | Color correction (hue rotation 90deg) | 10 | 160x90 |
| 39 | [color-correction-transform](color-correction-transform/) | Color correction + transform (cross-feature) | 10 | 160x90 |
| 40 | [video-filter-blur-sepia](video-filter-blur-sepia/) | Video filter (blur + sepia) | 10 | 160x90 |
| 41 | [video-filter-grayscale](video-filter-grayscale/) | Video filter (grayscale) | 10 | 160x90 |
| 42 | [video-filter-transform](video-filter-transform/) | Video filter + transform (cross-feature) | 10 | 160x90 |
| 43 | [p5js-rendered](p5js-rendered/) | p5.js sketch rendered from source via Chromium pipeline | 10 | 160x90 |
| 44 | [chroma-key](chroma-key/) | Chroma key (green screen removal) | 10 | 160x90 |
| 45 | [chroma-key-transform](chroma-key-transform/) | Chroma key + transform (cross-feature) | 12 | 160x90 |
| 46 | [pip-corner-br](pip-corner-br/) | PiP preset: corner bottom-right (0.3x) | 12 | 160x90 |
| 47 | [pip-side-by-side](pip-side-by-side/) | PiP preset: side-by-side (0.5x) | 12 | 160x90 |
| 48 | [speed-transition](speed-transition/) | Speed 2x + fade transition (cross-feature) | 14 | 160x90 |
| 49 | [color-correction-video-filter](color-correction-video-filter/) | Color correction + sepia video filter stacked | 10 | 160x90 |
| 50 | [keyframe-color-correction](keyframe-color-correction/) | Keyframe transform.x + color correction (cross-feature) | 10 | 160x90 |
| 51 | [video-filter-transition](video-filter-transition/) | Video filter (grayscale) + fade transition (cross-feature) | 18 | 160x90 |
| 52 | [chroma-key-blend](chroma-key-blend/) | Chroma key + screen blend mode (cross-feature) | 12 | 160x90 |
