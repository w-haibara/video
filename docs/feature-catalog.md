# Feature Catalog — Video Editor

## Table of Contents

### Export Regression Tests (26)

- [single-video](#single-video) — Single 1s video clip
- [two-clips](#two-clips) — Two sequential video clips (0-1s, 1-2s)
- [image-clip](#image-clip) — Single image clip displayed for 1s
- [text-overlay](#text-overlay) — Text overlay on video
- [crop-transform](#crop-transform) — Video with crop and transform
- [multi-track](#multi-track) — Two-track composite (video + image)
- [overlay-transform](#overlay-transform) — Scaled top clip with transparent bottom clip exposure
- [transition-fade](#transition-fade) — Fade cross-dissolve (300ms)
- [transition-fade-black](#transition-fade-black) — Fade through black (300ms)
- [transition-fade-white](#transition-fade-white) — Fade through white (300ms)
- [transition-slide-left](#transition-slide-left) — Slide left (300ms)
- [transition-slide-right](#transition-slide-right) — Slide right (300ms)
- [transition-slide-up](#transition-slide-up) — Slide up (300ms)
- [transition-slide-down](#transition-slide-down) — Slide down (300ms)
- [blend-opacity](#blend-opacity) — Opacity blend (50% alpha overlay)
- [blend-multiply](#blend-multiply) — Multiply blend (darkens)
- [blend-screen](#blend-screen) — Screen blend (lightens)
- [blend-overlay](#blend-overlay) — Overlay blend (contrast)
- [blend-add](#blend-add) — Add blend (additive light)
- [blend-difference](#blend-difference) — Difference blend (absolute diff)
- [p5js-clip](#p5js-clip) — p5.js sketch clip (pre-rendered)
- [empty-asset-mixed](#empty-asset-mixed) — Video + empty-asset clip (empty skipped)
- [split-clip](#split-clip) — Video clip split into two halves at 500ms
- [muted-track](#muted-track) — Video + muted image track (muted excluded)
- [transition-with-transform](#transition-with-transform) — Fade transition + transform on clip 2
- [transition-multi-track](#transition-multi-track) — Fade transition on track 1 + image overlay on track 2

### Editor Operation Snapshots (62)

- [editor operation regression workflow: add video → add image → move clip → trim 1](#editor-operation-regression-workflow-add-video-add-image-move-clip-trim-1)
- [editor operation regression workflow: multi-track with text overlay 1](#editor-operation-regression-workflow-multi-track-with-text-overlay-1)
- [editor operation regression workflow: cross-track move 1](#editor-operation-regression-workflow-cross-track-move-1)
- [editor operation regression workflow: duration change clamps existing clips 1](#editor-operation-regression-workflow-duration-change-clamps-existing-clips-1)
- [editor operation regression workflow: update clip properties 1](#editor-operation-regression-workflow-update-clip-properties-1)
- [editor operation regression workflow: add and remove clips 1](#editor-operation-regression-workflow-add-and-remove-clips-1)
- [editor operation regression workflow: left trim adjusts startMs and inMs 1](#editor-operation-regression-workflow-left-trim-adjusts-startms-and-inms-1)
- [editor operation regression workflow: left and right trim combined 1](#editor-operation-regression-workflow-left-and-right-trim-combined-1)
- [editor operation regression workflow: update blendMode 1](#editor-operation-regression-workflow-update-blendmode-1)
- [editor operation regression workflow: overlap snap on same-track move 1](#editor-operation-regression-workflow-overlap-snap-on-same-track-move-1)
- [editor operation regression workflow: remove track 1](#editor-operation-regression-workflow-remove-track-1)
- [editor operation regression workflow: text with fontFamily and align 1](#editor-operation-regression-workflow-text-with-fontfamily-and-align-1)
- [editor operation regression workflow: add clip to specific target track 1](#editor-operation-regression-workflow-add-clip-to-specific-target-track-1)
- [editor operation regression workflow: audio clip with volume 1](#editor-operation-regression-workflow-audio-clip-with-volume-1)
- [editor operation regression workflow: empty-asset video clip 1](#editor-operation-regression-workflow-empty-asset-video-clip-1)
- [editor operation regression workflow: empty-asset clip alongside normal clips 1](#editor-operation-regression-workflow-empty-asset-clip-alongside-normal-clips-1)
- [editor operation regression workflow: move empty-asset clip 1](#editor-operation-regression-workflow-move-empty-asset-clip-1)
- [editor operation regression workflow: trim empty-asset clip 1](#editor-operation-regression-workflow-trim-empty-asset-clip-1)
- [editor operation regression workflow: remove empty-asset clip removes empty track 1](#editor-operation-regression-workflow-remove-empty-asset-clip-removes-empty-track-1)
- [editor operation regression workflow: update empty-asset clip properties 1](#editor-operation-regression-workflow-update-empty-asset-clip-properties-1)
- [editor operation regression workflow: clamp empty-asset clip to duration 1](#editor-operation-regression-workflow-clamp-empty-asset-clip-to-duration-1)
- [editor operation regression workflow: addEmptyClip to existing track 1](#editor-operation-regression-workflow-addemptyclip-to-existing-track-1)
- [editor operation regression workflow: addEmptyClip creates new track when no target 1](#editor-operation-regression-workflow-addemptyclip-creates-new-track-when-no-target-1)
- [editor operation regression workflow: addEmptyClip with title sets text 1](#editor-operation-regression-workflow-addemptyclip-with-title-sets-text-1)
- [editor operation regression workflow: addEmptyClip clamped by maxDuration 1](#editor-operation-regression-workflow-addemptyclip-clamped-by-maxduration-1)
- [editor operation regression workflow: addEmptyClip then move 1](#editor-operation-regression-workflow-addemptyclip-then-move-1)
- [editor operation regression workflow: addEmptyClip multiple kinds on same track 1](#editor-operation-regression-workflow-addemptyclip-multiple-kinds-on-same-track-1)
- [editor operation regression workflow: split video clip at midpoint 1](#editor-operation-regression-workflow-split-video-clip-at-midpoint-1)
- [editor operation regression workflow: split clip near start 1](#editor-operation-regression-workflow-split-clip-near-start-1)
- [editor operation regression workflow: split clip near end 1](#editor-operation-regression-workflow-split-clip-near-end-1)
- [editor operation regression workflow: split trimmed clip preserves in/out 1](#editor-operation-regression-workflow-split-trimmed-clip-preserves-inout-1)
- [editor operation regression workflow: split clip with transition clears transition on right 1](#editor-operation-regression-workflow-split-clip-with-transition-clears-transition-on-right-1)
- [editor operation regression workflow: split empty-asset clip 1](#editor-operation-regression-workflow-split-empty-asset-clip-1)
- [editor operation regression workflow: split then move right part 1](#editor-operation-regression-workflow-split-then-move-right-part-1)
- [editor operation regression workflow: split clip within transition zone clears transition on left 1](#editor-operation-regression-workflow-split-clip-within-transition-zone-clears-transition-on-left-1)
- [editor operation regression workflow: ripple delete middle clip shifts subsequent 1](#editor-operation-regression-workflow-ripple-delete-middle-clip-shifts-subsequent-1)
- [editor operation regression workflow: ripple delete first clip shifts all 1](#editor-operation-regression-workflow-ripple-delete-first-clip-shifts-all-1)
- [editor operation regression workflow: ripple delete last clip (no shift needed) 1](#editor-operation-regression-workflow-ripple-delete-last-clip-no-shift-needed-1)
- [editor operation regression workflow: ripple delete only clip removes track 1](#editor-operation-regression-workflow-ripple-delete-only-clip-removes-track-1)
- [editor operation regression workflow: ripple delete multi-track only affects same track 1](#editor-operation-regression-workflow-ripple-delete-multi-track-only-affects-same-track-1)
- [editor operation regression workflow: ripple trim right shorter shifts subsequent left 1](#editor-operation-regression-workflow-ripple-trim-right-shorter-shifts-subsequent-left-1)
- [editor operation regression workflow: ripple trim right longer shifts subsequent right 1](#editor-operation-regression-workflow-ripple-trim-right-longer-shifts-subsequent-right-1)
- [editor operation regression workflow: ripple trim + ripple delete combined 1](#editor-operation-regression-workflow-ripple-trim-ripple-delete-combined-1)
- [editor operation regression workflow: ripple delete first clip when second has transition 1](#editor-operation-regression-workflow-ripple-delete-first-clip-when-second-has-transition-1)
- [editor operation regression workflow: ripple delete clip with transition (net shift) 1](#editor-operation-regression-workflow-ripple-delete-clip-with-transition-net-shift-1)
- [editor operation regression workflow: ripple trim with transition on subsequent clip 1](#editor-operation-regression-workflow-ripple-trim-with-transition-on-subsequent-clip-1)
- [editor operation regression workflow: duplicate video clip 1](#editor-operation-regression-workflow-duplicate-video-clip-1)
- [editor operation regression workflow: duplicate clip clamped by maxDuration 1](#editor-operation-regression-workflow-duplicate-clip-clamped-by-maxduration-1)
- [editor operation regression workflow: paste clip at playhead on same track 1](#editor-operation-regression-workflow-paste-clip-at-playhead-on-same-track-1)
- [editor operation regression workflow: paste clip on different track 1](#editor-operation-regression-workflow-paste-clip-on-different-track-1)
- [editor operation regression workflow: paste attributes from styled clip to plain clip 1](#editor-operation-regression-workflow-paste-attributes-from-styled-clip-to-plain-clip-1)
- [editor operation regression workflow: duplicate then move the duplicate 1](#editor-operation-regression-workflow-duplicate-then-move-the-duplicate-1)
- [editor operation regression workflow: copy-paste with transform + blend attributes 1](#editor-operation-regression-workflow-copy-paste-with-transform-blend-attributes-1)
- [editor operation regression multi-select: removeClips removes multiple clips at once 1](#editor-operation-regression-multi-select-removeclips-removes-multiple-clips-at-once-1)
- [editor operation regression multi-select: moveClips shifts multiple clips by delta 1](#editor-operation-regression-multi-select-moveclips-shifts-multiple-clips-by-delta-1)
- [editor operation regression group: groupClips assigns groupId, ungroupClips clears it 1](#editor-operation-regression-group-groupclips-assigns-groupid-ungroupclips-clears-it-1)
- [editor operation regression group: groupClips assigns groupId, ungroupClips clears it 2](#editor-operation-regression-group-groupclips-assigns-groupid-ungroupclips-clears-it-2)
- [track lock & mute regression setTrackLocked then attempt operations 1](#track-lock-mute-regression-settracklocked-then-attempt-operations-1)
- [track lock & mute regression setTrackLocked then attempt operations 2](#track-lock-mute-regression-settracklocked-then-attempt-operations-2)
- [track lock & mute regression setTrackMuted preserves track state 1](#track-lock-mute-regression-settrackmuted-preserves-track-state-1)
- [track lock & mute regression setTrackMuted preserves track state 2](#track-lock-mute-regression-settrackmuted-preserves-track-state-2)
- [editor operation regression workflow: ripple delete of one clip in a group 1](#editor-operation-regression-workflow-ripple-delete-of-one-clip-in-a-group-1)

## Export Regression Tests

### single-video

Single 1s video clip

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/single-video/frame_0010.png" width="80" title="frame 10">

---

### two-clips

Two sequential video clips (0-1s, 1-2s)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 20

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | video | v1 | 1000ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s             0.5s           1s             1.5s           2s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0018.png" width="80" title="frame 18"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0019.png" width="80" title="frame 19"> <img src="../app/backend/src/__fixtures__/export/references/two-clips/frame_0020.png" width="80" title="frame 20">

---

### image-clip

Single image clip displayed for 1s

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `img1` (image) — assets/test-image.png

<img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | image | img1 | 0ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s                            0.5s                          1s
t1        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/image-clip/frame_0012.png" width="80" title="frame 12">

---

### text-overlay

Text overlay on video

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | tc1 | title | - | 0ms | 1000ms | 0-1000ms | text="Hello" 24px white, bg=black@0.5 |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/text-overlay/frame_0010.png" width="80" title="frame 10">

---

### crop-transform

Video with crop and transform

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | transform(10,5,1,0deg), crop(0,0,160x90) |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/crop-transform/frame_0010.png" width="80" title="frame 10">

---

### multi-track

Two-track composite (video + image)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=cover |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/multi-track/frame_0012.png" width="80" title="frame 12">

---

### overlay-transform

Scaled top clip with transparent bottom clip exposure

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | image | img1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | video | v1 | 0ms | 1000ms | 0-1000ms | transform(20,-10,0.5,45deg), crop(20,15,120x60), blend=cover |

**Timeline**

```
          0s                            0.5s                          1s
t1        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
t2        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/overlay-transform/frame_0012.png" width="80" title="frame 12">

---

### transition-fade

Fade cross-dissolve (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=fade 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade/frame_0018.png" width="80" title="frame 18">

---

### transition-fade-black

Fade through black (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=fade-black 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-black/frame_0018.png" width="80" title="frame 18">

---

### transition-fade-white

Fade through white (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=fade-white 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-fade-white/frame_0018.png" width="80" title="frame 18">

---

### transition-slide-left

Slide left (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=slide-left 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-left/frame_0018.png" width="80" title="frame 18">

---

### transition-slide-right

Slide right (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=slide-right 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-right/frame_0018.png" width="80" title="frame 18">

---

### transition-slide-up

Slide up (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=slide-up 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-up/frame_0018.png" width="80" title="frame 18">

---

### transition-slide-down

Slide down (300ms)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=slide-down 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-slide-down/frame_0018.png" width="80" title="frame 18">

---

### blend-opacity

Opacity blend (50% alpha overlay)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=opacity |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/blend-opacity/frame_0012.png" width="80" title="frame 12">

---

### blend-multiply

Multiply blend (darkens)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=multiply |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/blend-multiply/frame_0012.png" width="80" title="frame 12">

---

### blend-screen

Screen blend (lightens)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=screen |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/blend-screen/frame_0012.png" width="80" title="frame 12">

---

### blend-overlay

Overlay blend (contrast)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=overlay |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/blend-overlay/frame_0012.png" width="80" title="frame 12">

---

### blend-add

Add blend (additive light)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=add |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/blend-add/frame_0012.png" width="80" title="frame 12">

---

### blend-difference

Difference blend (absolute diff)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | blend=difference |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/blend-difference/frame_0012.png" width="80" title="frame 12">

---

### p5js-clip

p5.js sketch clip (pre-rendered)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `p5js1` (p5js, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="p5js1 (p5js)"></video>

**p5.js Sketch** (`assets/test-sketch.p5.js`)

```javascript
// Sample p5.js sketch — blue circle on red background
function setup() {
  createCanvas(160, 90);
}

function draw() {
  background(220, 40, 40);
  fill(40, 80, 220);
  noStroke();
  ellipse(width / 2, height / 2, 50, 50);
}
```

<details>
<summary><strong>Generated HTML (passed to Chromium for rendering)</strong></summary>

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>html,body{margin:0;padding:0;overflow:hidden;}</style>
</head>
<body>
<script src="file:///home/alice/ghq/github.com/w-haibara/video/app/backend/vendor/p5.min.js"></script>
<script>
// User sketch code
// Sample p5.js sketch — blue circle on red background
function setup() {
  createCanvas(160, 90);
}

function draw() {
  background(220, 40, 40);
  fill(40, 80, 220);
  noStroke();
  ellipse(width / 2, height / 2, 50, 50);
}


// Rendering control API for web-render step
(function() {
  var _origSetup = typeof setup === 'function' ? setup : function() {};
  var _origDraw = typeof draw === 'function' ? draw : function() {};

  window.setup = function() {
    createCanvas(160, 90);
    _origSetup();
    noLoop();
    window.__ready = true;
  };

  window.__renderFrame = function(frameIndex) {
    // Advance to the target frame by calling draw
    _origDraw();
  };
})();
</script>
</body>
</html>
```

</details>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | p5js | p5js1 | 0ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s                            0.5s                          1s
t1        [PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/p5js-clip/frame_0010.png" width="80" title="frame 10">

---

### empty-asset-mixed

Video + empty-asset clip (empty skipped)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | empty1 | video | - | 0ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/empty-asset-mixed/frame_0010.png" width="80" title="frame 10">

---

### split-clip

Video clip split into two halves at 500ms

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video>

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 500ms | 0-500ms | - |
| t1 | c2 | video | v1 | 500ms | 500ms | 500-1000ms | - |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/split-clip/frame_0010.png" width="80" title="frame 10">

---

### muted-track

Video + muted image track (muted excluded)

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/muted-track/frame_0010.png" width="80" title="frame 10">

---

### transition-with-transform

Fade transition + transform on clip 2

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transform(10,-5,0.8,15deg), transition=fade 300ms |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-with-transform/frame_0018.png" width="80" title="frame 18">

---

### transition-multi-track

Fade transition on track 1 + image overlay on track 2

**Project Settings**

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

**Assets**

- `v1` (video, 1000ms) — assets/test-video-1s.mp4
- `img1` (image) — assets/test-image.png

<video src="../app/backend/src/__fixtures__/export/assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="../app/backend/src/__fixtures__/export/assets/test-image.png" width="160" title="img1 (image)">

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | transition=fade 300ms |
| t2 | c3 | image | img1 | 500ms | 500ms | 0-500ms | - |

**Timeline**

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
t2                          [IIIIIIIIIIIIIII]                         
```

**Filmstrip**

<img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0001.png" width="80" title="frame 1"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0002.png" width="80" title="frame 2"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0003.png" width="80" title="frame 3"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0004.png" width="80" title="frame 4"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0005.png" width="80" title="frame 5"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0006.png" width="80" title="frame 6"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0007.png" width="80" title="frame 7"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0008.png" width="80" title="frame 8"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0009.png" width="80" title="frame 9"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0010.png" width="80" title="frame 10"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0011.png" width="80" title="frame 11"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0012.png" width="80" title="frame 12"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0013.png" width="80" title="frame 13"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0014.png" width="80" title="frame 14"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0015.png" width="80" title="frame 15"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0016.png" width="80" title="frame 16"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0017.png" width="80" title="frame 17"> <img src="../app/backend/src/__fixtures__/export/references/transition-multi-track/frame_0018.png" width="80" title="frame 18">

---

## Editor Operation Snapshots

### editor operation regression workflow: add video → add image → move clip → trim 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |
| track-0 | clip-1 | image | i1 | 6000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV]             [IIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: multi-track with text overlay 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | title | - | 1000ms | 2000ms | 0-2000ms | text="Title" 24px white, bg=black@0.5 |
| track-1 | clip-2 | title | - | 4000ms | 1000ms | 0-1000ms | text="Subtitle" 16px yellow |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
track-1               [TTTTTTTTTTTTTTTTTTTTTT]            [TTTTTTTTTT]
```

---

### editor operation regression workflow: cross-track move 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | title | - | 0ms | 1000ms | 0-1000ms | text="Overlay" 20px white |
| track-1 | clip-2 | image | i1 | 2000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
track-1   [TTTTTTTTTT]            [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: duration change clamps existing clips 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: update clip properties 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | volume=0.5, transform(20,-10,1.5,45deg), crop(10,10,140x70) |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: add and remove clips 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | audio | a1 | 8000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV]                  [AAAAAAAAAA]
```

---

### editor operation regression workflow: left trim adjusts startMs and inMs 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 4000ms | 1000-5000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0               [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: left and right trim combined 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 500ms | 3000ms | 500-3500ms | - |

**Timeline**

```
          0s               1s               2s               3s
track-0            [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: update blendMode 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | blend=cover |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: overlap snap on same-track move 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: remove track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: text with fontFamily and align 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | title | - | 0ms | 3000ms | 0-3000ms | text="Styled Title" 32px #ff0000, bg=#000000@0.8 |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

---

### editor operation regression workflow: add clip to specific target track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |
| track-1 | clip-2 | title | - | 0ms | 2000ms | 0-2000ms | text="T" 16px white |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
track-1   [TTTTTTTTTTTTT]                                             
```

---

### editor operation regression workflow: audio clip with volume 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | audio | a1 | 0ms | 10000ms | 0-10000ms | volume=0.3 |

**Timeline**

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA]
```

---

### editor operation regression workflow: empty-asset video clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: empty-asset clip alongside normal clips 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | image | - | 1000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
track-1               [IIIIIIIIIIIIIIIIIIIIII]                        
```

---

### editor operation regression workflow: move empty-asset clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 3000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0                                       [VVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: trim empty-asset clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s             0.5s           1s             1.5s           2s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: remove empty-asset clip removes empty track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|

**Timeline**

```
          0s                            0.5s                          1s
```

---

### editor operation regression workflow: update empty-asset clip properties 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 3000ms | 0-3000ms | transform(10,-5,1.2,30deg) |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: clamp empty-asset clip to duration 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: addEmptyClip to existing track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | - | 6000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]       [VVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: addEmptyClip creates new track when no target 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | - | 1000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s             1s             2s             3s             4s
track-0                  [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: addEmptyClip with title sets text 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | title | - | 0ms | 3000ms | 0-3000ms | text="Text" 48px white, bg=black |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

---

### editor operation regression workflow: addEmptyClip clamped by maxDuration 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 9000ms | 1000ms | 0-1000ms | - |

**Timeline**

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0                                                         [VVVV]
```

---

### editor operation regression workflow: addEmptyClip then move 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0                                         [VVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: addEmptyClip multiple kinds on same track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 2000ms | 0-2000ms | - |
| track-0 | clip-1 | image | - | 3000ms | 2000ms | 0-2000ms | - |
| track-0 | clip-2 | audio | - | 6000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVV]        [IIIIIIIIIIIII]       [AAAAAAAAAAAAA]
```

---

### editor operation regression workflow: split video clip at midpoint 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: split clip near start 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 100ms | 0-100ms | - |
| track-0 | clip-1 | video | v1 | 100ms | 4900ms | 100-5000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [[VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: split clip near end 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4900ms | 0-4900ms | - |
| track-0 | clip-1 | video | v1 | 4900ms | 100ms | 4900-5000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][
```

---

### editor operation regression workflow: split trimmed clip preserves in/out 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 1500ms | 1000-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 1500ms | 2500-4000ms | - |

**Timeline**

```
          0s             1s             2s             3s             4s
track-0                  [VVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: split clip with transition clears transition on right 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 4500ms | 1000ms | 0-1000ms | transition=fade 500ms |
| track-0 | clip-2 | image | i1 | 5500ms | 2000ms | 1000-3000ms | - |

**Timeline**

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV[IIIIII][IIIIIIIIIIIIII]
```

---

### editor operation regression workflow: split empty-asset clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 1500ms | 0-1500ms | - |
| track-0 | clip-1 | video | - | 1500ms | 1500ms | 1500-3000ms | - |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: split then move right part 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 2500ms | 2500-5000ms | - |

**Timeline**

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVV]                    [VVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: split clip within transition zone clears transition on left 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 4500ms | 200ms | 0-200ms | - |
| track-0 | clip-2 | image | i1 | 4700ms | 2800ms | 200-3000ms | - |

**Timeline**

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV[][IIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: ripple delete middle clip shifts subsequent 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | audio | a1 | 5000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][AAAAAAAAAAAAAAA]
```

---

### editor operation regression workflow: ripple delete first clip shifts all 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: ripple delete last clip (no shift needed) 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: ripple delete only clip removes track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|

**Timeline**

```
          0s                            0.5s                          1s
```

---

### editor operation regression workflow: ripple delete multi-track only affects same track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |
| track-1 | clip-1 | title | - | 2000ms | 3000ms | 0-3000ms | text="Overlay" 20px white |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]                        
track-1                           [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

---

### editor operation regression workflow: ripple trim right shorter shifts subsequent left 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | image | i1 | 3000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s        1s        2s        3s        4s        5s        6s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: ripple trim right longer shifts subsequent right 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |
| track-0 | clip-1 | image | i1 | 6000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV]             [IIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: ripple trim + ripple delete combined 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | audio | a1 | 3000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][AAAAAAAAAAAAAAAAAAAAAA]
```

---

### editor operation regression workflow: ripple delete first clip when second has transition 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | video | v1 | 3000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s          1s          2s          3s          4s          5s
track-0   [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII][VVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: ripple delete clip with transition (net shift) 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5500ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]    [VVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: ripple trim with transition on subsequent clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |
| track-0 | clip-1 | image | i1 | 3500ms | 3000ms | 0-3000ms | transition=fade 500ms |

**Timeline**

```
          0s       1s       2s        3s       4s       5s       6s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: duplicate video clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: duplicate clip clamped by maxDuration 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 2000ms | 0-2000ms | - |

**Timeline**

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: paste clip at playhead on same track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 6000ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s         2s         4s         6s         8s         10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV]      [VVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: paste clip on different track 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | title | - | 0ms | 2000ms | 0-2000ms | text="Overlay" 20px white |
| track-1 | clip-2 | video | v1 | 3000ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]                      
track-1   [TTTTTTTTTTTTT]        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression workflow: paste attributes from styled clip to plain clip 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(10,-5,1.5,30deg), crop(0,0,160x90), blend=screen |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | transform(10,-5,1.5,30deg), crop(0,0,160x90), blend=screen |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: duplicate then move the duplicate 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 15000ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s    2s    4s    6s    8s    10s   12s   14s   16s   18s   20s
track-0   [VVVVVVVVVVVVV]                              [VVVVVVVVVVVVV]
```

---

### editor operation regression workflow: copy-paste with transform + blend attributes 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(50,50,2,90deg), blend=overlay |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |
| track-0 | clip-2 | video | v1 | 8000ms | 5000ms | 0-5000ms | transform(50,50,2,90deg), blend=overlay |

**Timeline**

```
          0s       2s       4s        6s       8s       10s      12s
track-0   [VVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIII][VVVVVVVVVVVVVVVVVVVVV]
```

---

### editor operation regression multi-select: removeClips removes multiple clips at once 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0                                         [IIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression multi-select: moveClips shifts multiple clips by delta 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 6000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0          [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIII]
```

---

### editor operation regression group: groupClips assigns groupId, ungroupClips clears it 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression group: groupClips assigns groupId, ungroupClips clears it 2

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

### track lock & mute regression setTrackLocked then attempt operations 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### track lock & mute regression setTrackLocked then attempt operations 2

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

**Timeline**

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

### track lock & mute regression setTrackMuted preserves track state 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

### track lock & mute regression setTrackMuted preserves track state 2

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

**Timeline**

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

### editor operation regression workflow: ripple delete of one clip in a group 1

**Clip Details**

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | audio | a1 | 3000ms | 22000ms | 0-22000ms | - |

**Timeline**

```
          0s   2s   4s  6s   8s   10s  12s  14s 16s  18s  20s  22s  24s
track-0   [IIIII][AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA]
```

---
