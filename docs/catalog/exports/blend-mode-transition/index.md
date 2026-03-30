# blend-mode-transition

Fade transition + multiply blend on clip 2

## Project Settings

- Canvas: 160x90
- Duration: 2000ms
- Frames: 18

## Assets

- `v1` (video, 1000ms) — test-video-1s.mp4
- `img1` (image) — test-image.png

<video src="assets/test-video-1s.mp4" width="160" controls muted title="v1 (video)"></video> <img src="assets/test-image.png" width="160" title="img1 (image)">

## Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t1 | c2 | image | img1 | 700ms | 1000ms | 0-1000ms | blend=multiply, transition=fade 300ms |

## Timeline

```
          0s                0.5s             1s                1.5s
t1        [VVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

## Filmstrip

<img src="frames/frame_0001.png" width="80" title="frame 1"> <img src="frames/frame_0002.png" width="80" title="frame 2"> <img src="frames/frame_0003.png" width="80" title="frame 3"> <img src="frames/frame_0004.png" width="80" title="frame 4"> <img src="frames/frame_0005.png" width="80" title="frame 5"> <img src="frames/frame_0006.png" width="80" title="frame 6"> <img src="frames/frame_0007.png" width="80" title="frame 7"> <img src="frames/frame_0008.png" width="80" title="frame 8"> <img src="frames/frame_0009.png" width="80" title="frame 9"> <img src="frames/frame_0010.png" width="80" title="frame 10"> <img src="frames/frame_0011.png" width="80" title="frame 11"> <img src="frames/frame_0012.png" width="80" title="frame 12"> <img src="frames/frame_0013.png" width="80" title="frame 13"> <img src="frames/frame_0014.png" width="80" title="frame 14"> <img src="frames/frame_0015.png" width="80" title="frame 15"> <img src="frames/frame_0016.png" width="80" title="frame 16"> <img src="frames/frame_0017.png" width="80" title="frame 17"> <img src="frames/frame_0018.png" width="80" title="frame 18">
