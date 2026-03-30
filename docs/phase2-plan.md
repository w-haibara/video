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

## Key Design Decisions Required

### 1. Keyframe Data Model (#65)

The `Keyframe` type must support both numeric properties (position, opacity, volume) and potentially enum properties (filter on/off). Proposed:

```typescript
type Keyframe = {
  timeMs: number;     // relative to clip start
  value: number;      // numeric value at this point
  easing?: EasingType; // interpolation to NEXT keyframe
};

type KeyframeTrack = {
  property: string;    // "transform.x", "transform.scale", "volume", "brightness"
  keyframes: Keyframe[];
};

// On Clip:
keyframeTracks?: KeyframeTrack[];
```

**Decision needed**: Property naming convention. Flat (`"positionX"`) vs. dotted (`"transform.x"`)? Dotted is more readable but requires a path resolver.

### 2. Preview vs. Export Keyframe Evaluation

- **Preview**: JavaScript interpolation in `computeMediaContainerStyle()`, evaluated per animation frame (~60fps)
- **Export**: FFmpeg expressions like `'if(between(t,0,2), 100+50*t, 200)'` or per-segment filter chains

**Decision needed**: Accept visual differences between preview (CSS transforms) and export (FFmpeg filters), or invest in a unified expression evaluator?

**Recommendation**: Accept minor differences. Pixel-perfect preview-export parity is impractical with CSS vs. FFmpeg. Use the same interpolation math but different rendering backends.

### 3. Speed Control & Duration (#13)

Speed change affects clip duration on the timeline:
- 2x speed → half the timeline duration
- 0.5x speed → double the timeline duration

**Decision needed**: Does speed change auto-adjust `durationMs`? Or does the user manually trim?

**Recommendation**: Auto-adjust `durationMs` and `outMs` when speed changes. Store `speed: number` on the clip. Export uses `setpts=PTS/{speed}`.

### 4. Color Correction Approach (#12)

Two options:
- **A. CSS filters in preview, FFmpeg filters in export** — fast preview, potential visual mismatch
- **B. Canvas-based preview with LUT** — accurate preview, more complex

**Recommendation**: Option A for initial implementation. CSS `filter: brightness() contrast() saturate()` maps well to FFmpeg `eq` filter.

### 5. Audio Mixing Architecture (#66)

- **Web Audio API** for preview: `AudioContext` → `GainNode` per source → `DestinationNode`
- **FFmpeg `amix`** for export (already implemented for audio clips)

**Decision needed**: Should audio preview use a single shared `AudioContext` or one per clip?

**Recommendation**: Single shared `AudioContext` with per-clip `GainNode`. Simpler, lower latency, easier to implement global mute.

### 6. Waveform Data (#18)

Waveform data extraction options:
- **A. Server-side**: FFmpeg extracts waveform data, stores as JSON
- **B. Client-side**: Web Audio API `decodeAudioData` + `AnalyserNode`
- **C. Hybrid**: Server extracts downsampled peaks, client renders

**Recommendation**: Option C. Server generates peak data at import time (pipeline step), client renders. Keeps waveform fast at any zoom level.

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
