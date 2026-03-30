# Phase 2 Implementation Plan

## Overview

Phase 2 covers two milestone groups:
- **Phase 2: Effects & Animation** (#11-#17) — keyframe animation, color correction, speed control, filters, transitions, chroma key, PiP
- **Phase 3: Audio** (#18-#22) — waveform, volume keyframes, audio detach, effects, level meter

Two prerequisite tasks (#65, #66) gate the majority of P2 work.

## Task Dependency Graph

```
#65 Keyframe基盤 ──┬── #11 Keyframe Animation UI
                   ├── #12 Color Correction
                   ├── #13 Speed Control
                   └── #19 Volume Keyframes (also depends on #66)

#66 プレビュー音声 ──┬── #18 Waveform Display
                    ├── #19 Volume Keyframes (also depends on #65)
                    ├── #20 Audio Detach / Link
                    ├── #21 Audio Effects
                    └── #22 Audio Meter

Independent:
  #14 Video Filters (no keyframe dependency, but benefits from it)
  #15 Additional Transitions (depends on existing transition registry)
  #16 Chroma Key
  #17 PiP Presets (leverages existing transform)
```

## Execution Order

### Stream A: Keyframe & Effects (sequential)

| Order | Issue | Title | Rationale |
|-------|-------|-------|-----------|
| A1 | #65 | Keyframe基盤 | **Critical path.** Blocks #11, #12, #13, #19. Must be first. |
| A2 | #11 | Keyframe Animation UI | Builds on #65. Provides timeline keyframe editor needed by all subsequent keyframe-based features. |
| A3 | #13 | Speed Control / Time Remap | Modifies time mapping (`setpts`). Must land before color/filter since they also use ffmpeg filter chains. |
| A4 | #12 | Color Correction | Uses keyframe tracks for animated brightness/contrast. FFmpeg `eq`/`colorbalance` filters. |
| A5 | #14 | Video Filters | Preset filter stack. Can reuse the keyframe + filter infrastructure from #12. |

### Stream B: Audio (sequential, parallelizable with Stream A)

| Order | Issue | Title | Rationale |
|-------|-------|-------|-----------|
| B1 | #66 | プレビュー音声 | **Critical path for audio.** Blocks all Phase 3 tasks. Can start in parallel with A1. |
| B2 | #18 | Waveform Display | Foundation for visual audio editing. |
| B3 | #19 | Volume Keyframes | Depends on both #65 (keyframes) and #66 (audio preview). Start after A1 and B1 are both done. |
| B4 | #20 | Audio Detach / Link | Independent of keyframes. Can be done after B1. |
| B5 | #21 | Audio Effects | FFmpeg `af` filters. After B1. |
| B6 | #22 | Audio Meter | Web Audio API analyser. After B1. |

### Stream C: Independent features (parallelizable)

| Order | Issue | Title | Rationale |
|-------|-------|-------|-----------|
| C1 | #15 | Additional Transitions | Uses existing `TransitionExportRegistry` pattern. Can start anytime. |
| C2 | #16 | Chroma Key | FFmpeg `chromakey` filter. Independent. |
| C3 | #17 | PiP Presets | Leverages existing transform system. Independent. |

### Recommended Timeline

```
Week 1-2:   A1 (#65 Keyframe基盤) + B1 (#66 プレビュー音声) in parallel
Week 2-3:   A2 (#11 Keyframe UI) + C1 (#15 Transitions) + C2 (#16 Chroma Key)
Week 3-4:   A3 (#13 Speed Control) + B2 (#18 Waveform) + C3 (#17 PiP)
Week 4-5:   A4 (#12 Color Correction) + B3 (#19 Volume Keyframes)
Week 5-6:   A5 (#14 Video Filters) + B4 (#20 Audio Detach) + B5 (#21 Audio Effects)
Week 6:     B6 (#22 Audio Meter)
```

## Design Decisions (Confirmed)

### 1. Keyframe Data Model (#65) — Dotted path

```typescript
type Keyframe = {
  timeMs: number;     // relative to clip start
  value: number;      // numeric value at this point
  easing?: EasingType; // interpolation to NEXT keyframe
};

type KeyframeTrack = {
  property: string;    // dotted path: "transform.x", "transform.scale", "volume", "color.brightness"
  keyframes: Keyframe[];
};

// On Clip:
keyframeTracks?: KeyframeTrack[];
```

Property naming uses **dotted path** convention (`"transform.x"`, `"color.brightness"`). A path resolver maps dotted keys to nested clip properties. Readable, extensible, and groups related properties clearly.

### 2. Preview vs. Export Keyframe Evaluation — Accept differences

- **Preview**: JavaScript interpolation in `computeMediaContainerStyle()`, evaluated per animation frame (~60fps)
- **Export**: FFmpeg expressions like `'if(between(t,0,2), 100+50*t, 200)'` or per-segment filter chains

Same interpolation math, different rendering backends. Pixel-perfect preview-export parity is impractical with CSS vs. FFmpeg. Minor visual differences are acceptable.

### 3. Speed Control & Duration (#13) — Auto-adjust

Speed change **auto-adjusts** `durationMs` and `outMs`:
- 2x speed → `durationMs` halved, `outMs` recalculated
- 0.5x speed → `durationMs` doubled

```typescript
// On Clip:
speed?: number;  // default 1.0

// When speed changes:
clip.durationMs = originalDuration / clip.speed;
clip.outMs = clip.inMs + clip.durationMs;

// Export: setpts=PTS/{speed}
```

### 4. Color Correction Approach (#12) — CSS filter

Preview uses **CSS filters**: `filter: brightness() contrast() saturate() hue-rotate()`.
Export uses **FFmpeg `eq`/`colorbalance` filters** with equivalent parameter mapping.

Fast implementation, good visual approximation. LUT support deferred to a follow-up if needed.

### 5. Audio Mixing Architecture (#66) — Single AudioContext

Single shared `AudioContext` with per-clip `GainNode`:
- One `AudioContext` per editor session
- Each audio/video source gets a `MediaElementSourceNode` → `GainNode` → `DestinationNode`
- Global mute toggles the destination gain
- Export uses existing FFmpeg `amix` filter chain

### 6. Waveform Data (#18) — Hybrid (server peaks + client render)

Server generates downsampled peak data at import time (pipeline step), stored as JSON.
Client renders peaks on a `<canvas>` synchronized with timeline zoom.
Fast at any zoom level without re-decoding audio.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| FFmpeg expression complexity for keyframes | Export may not support all easing types | Limit to linear/step for export initially; use segment-based approach |
| Web Audio API sync with video playback | Audio drift during seek/scrub | Use `video.currentTime` as master clock; resync audio on seek |
| Speed control breaks existing inMs/outMs assumptions | Trim, split, ripple operations need speed-aware math | Add `speed` field to Clip, update all duration calculations |
| Color correction preview-export mismatch | User sees different result in preview vs. export | Document limitations; use similar parameter ranges |
| Test execution time growth | CI becomes slow | Consider parallel test execution or test splitting |

## Testing Strategy

- **Keyframe interpolation**: Extensive unit tests for all easing types with known input/output pairs
- **Export regression**: Add keyframe-animated export test (e.g., clip with moving position)
- **Speed control**: Export regression with 2x speed clip (verify half-duration output)
- **Color correction**: Export regression with brightness/contrast adjustments
- **Audio**: Integration test with Web Audio API mock (or browser test with `xvfb-run`)
- **Cross-feature**: Keyframe + transition, speed + keyframe, color + blend mode combos
