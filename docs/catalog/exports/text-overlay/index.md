# text-overlay

Text overlay on video

## Project Settings

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

## Assets

- `v1` (video, 1000ms) — test-video-1s.mp4

[v1 (video) — test-video-1s.mp4](assets/test-video-1s.mp4)

## Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | tc1 | title | - | 0ms | 1000ms | 0-1000ms | text="Hello" 24px white, bg=black@0.5 |

## Timeline

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

## Filmstrip

<img src="frames/frame_0001.png" width="80" title="frame 1"> <img src="frames/frame_0002.png" width="80" title="frame 2"> <img src="frames/frame_0003.png" width="80" title="frame 3"> <img src="frames/frame_0004.png" width="80" title="frame 4"> <img src="frames/frame_0005.png" width="80" title="frame 5"> <img src="frames/frame_0006.png" width="80" title="frame 6"> <img src="frames/frame_0007.png" width="80" title="frame 7"> <img src="frames/frame_0008.png" width="80" title="frame 8"> <img src="frames/frame_0009.png" width="80" title="frame 9"> <img src="frames/frame_0010.png" width="80" title="frame 10">
