# crop-blend

Crop + screen blend on top clip

## Project Settings

- Canvas: 160x90
- Duration: 2000ms
- Frames: 12

## Assets

- `v1` (video, 1000ms) — test-video-1s.mp4
- `img1` (image) — test-image.png

[v1 (video) — test-video-1s.mp4](assets/test-video-1s.mp4) ![img1 (image)](assets/test-image.png)

## Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | video | v1 | 0ms | 1000ms | 0-1000ms | - |
| t2 | c2 | image | img1 | 0ms | 1000ms | 0-1000ms | crop(20,10,120x70), blend=screen |

## Timeline

```
          0s                            0.5s                          1s
t1        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
t2        [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

## Filmstrip

<img src="frames/frame_0001.png" width="80" title="frame 1"> <img src="frames/frame_0002.png" width="80" title="frame 2"> <img src="frames/frame_0003.png" width="80" title="frame 3"> <img src="frames/frame_0004.png" width="80" title="frame 4"> <img src="frames/frame_0005.png" width="80" title="frame 5"> <img src="frames/frame_0006.png" width="80" title="frame 6"> <img src="frames/frame_0007.png" width="80" title="frame 7"> <img src="frames/frame_0008.png" width="80" title="frame 8"> <img src="frames/frame_0009.png" width="80" title="frame 9"> <img src="frames/frame_0010.png" width="80" title="frame 10"> <img src="frames/frame_0011.png" width="80" title="frame 11"> <img src="frames/frame_0012.png" width="80" title="frame 12">
