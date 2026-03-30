# Editor Operation Snapshots

117 snapshots.

## editor operation regression workflow: add video → add image → move clip → trim 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |
| track-0 | clip-1 | image | i1 | 6000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV]             [IIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: multi-track with text overlay 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | title | - | 1000ms | 2000ms | 0-2000ms | text="Title" 24px white, bg=black@0.5 |
| track-1 | clip-2 | title | - | 4000ms | 1000ms | 0-1000ms | text="Subtitle" 16px yellow |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
track-1               [TTTTTTTTTTTTTTTTTTTTTT]            [TTTTTTTTTT]
```

---

## editor operation regression workflow: cross-track move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | title | - | 0ms | 1000ms | 0-1000ms | text="Overlay" 20px white |
| track-1 | clip-2 | image | i1 | 2000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
track-1   [TTTTTTTTTT]            [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: duration change clamps existing clips 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: update clip properties 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | volume=0.5, transform(20,-10,1.5,45deg), crop(10,10,140x70) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: add and remove clips 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | audio | a1 | 8000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV]                  [AAAAAAAAAA]
```

---

## editor operation regression workflow: left trim adjusts startMs and inMs 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 4000ms | 1000-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0               [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: left and right trim combined 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 500ms | 3000ms | 500-3500ms | - |

### Timeline

```
          0s               1s               2s               3s
track-0            [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: update blendMode 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | blend=cover |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: overlap snap on same-track move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: remove track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: text with fontFamily and align 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | title | - | 0ms | 3000ms | 0-3000ms | text="Styled Title" 32px #ff0000, bg=#000000@0.8 |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

---

## editor operation regression workflow: add clip to specific target track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |
| track-1 | clip-2 | title | - | 0ms | 2000ms | 0-2000ms | text="T" 16px white |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
track-1   [TTTTTTTTTTTTT]                                             
```

---

## editor operation regression workflow: audio clip with volume 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | audio | a1 | 0ms | 10000ms | 0-10000ms | volume=0.3 |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA]
```

---

## editor operation regression workflow: empty-asset video clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: empty-asset clip alongside normal clips 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | image | - | 1000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
track-1               [IIIIIIIIIIIIIIIIIIIIII]                        
```

---

## editor operation regression workflow: move empty-asset clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 3000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0                                       [VVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: trim empty-asset clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s             0.5s           1s             1.5s           2s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: remove empty-asset clip removes empty track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|

### Timeline

```
          0s                            0.5s                          1s
```

---

## editor operation regression workflow: update empty-asset clip properties 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 3000ms | 0-3000ms | transform(10,-5,1.2,30deg) |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: clamp empty-asset clip to duration 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: addEmptyClip to existing track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | - | 6000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]       [VVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: addEmptyClip creates new track when no target 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | - | 1000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s             1s             2s             3s             4s
track-0                  [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: addEmptyClip with title sets text 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | title | - | 0ms | 3000ms | 0-3000ms | text="Text" 48px white, bg=black |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

---

## editor operation regression workflow: addEmptyClip clamped by maxDuration 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 9000ms | 1000ms | 0-1000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0                                                         [VVVV]
```

---

## editor operation regression workflow: addEmptyClip then move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0                                         [VVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: addEmptyClip multiple kinds on same track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 2000ms | 0-2000ms | - |
| track-0 | clip-1 | image | - | 3000ms | 2000ms | 0-2000ms | - |
| track-0 | clip-2 | audio | - | 6000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVV]        [IIIIIIIIIIIII]       [AAAAAAAAAAAAA]
```

---

## editor operation regression workflow: split video clip at midpoint 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: split clip near start 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 100ms | 0-100ms | - |
| track-0 | clip-1 | video | v1 | 100ms | 4900ms | 100-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [[VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: split clip near end 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4900ms | 0-4900ms | - |
| track-0 | clip-1 | video | v1 | 4900ms | 100ms | 4900-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][
```

---

## editor operation regression workflow: split trimmed clip preserves in/out 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 1500ms | 1000-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 1500ms | 2500-4000ms | - |

### Timeline

```
          0s             1s             2s             3s             4s
track-0                  [VVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: split clip with transition clears transition on right 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 4500ms | 1000ms | 0-1000ms | transition=fade 500ms |
| track-0 | clip-2 | image | i1 | 5500ms | 2000ms | 1000-3000ms | - |

### Timeline

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV[IIIIII][IIIIIIIIIIIIII]
```

---

## editor operation regression workflow: split empty-asset clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | - | 0ms | 1500ms | 0-1500ms | - |
| track-0 | clip-1 | video | - | 1500ms | 1500ms | 1500-3000ms | - |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: split then move right part 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 2500ms | 2500-5000ms | - |

### Timeline

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVV]                    [VVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: split clip within transition zone clears transition on left 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 4500ms | 200ms | 0-200ms | - |
| track-0 | clip-2 | image | i1 | 4700ms | 2800ms | 200-3000ms | - |

### Timeline

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV[][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: ripple delete middle clip shifts subsequent 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | audio | a1 | 5000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][AAAAAAAAAAAAAAA]
```

---

## editor operation regression workflow: ripple delete first clip shifts all 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s        0.5s      1s        1.5s      2s        2.5s      3s
track-0   [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: ripple delete last clip (no shift needed) 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: ripple delete only clip removes track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|

### Timeline

```
          0s                            0.5s                          1s
```

---

## editor operation regression workflow: ripple delete multi-track only affects same track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |
| track-1 | clip-1 | title | - | 2000ms | 3000ms | 0-3000ms | text="Overlay" 20px white |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]                        
track-1                           [TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT]
```

---

## editor operation regression workflow: ripple trim right shorter shifts subsequent left 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | image | i1 | 3000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s        1s        2s        3s        4s        5s        6s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: ripple trim right longer shifts subsequent right 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |
| track-0 | clip-1 | image | i1 | 6000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV]             [IIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: ripple trim + ripple delete combined 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | audio | a1 | 3000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][AAAAAAAAAAAAAAAAAAAAAA]
```

---

## editor operation regression workflow: ripple delete first clip when second has transition 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | video | v1 | 3000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII][VVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: ripple delete clip with transition (net shift) 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5500ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]    [VVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: ripple trim with transition on subsequent clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |
| track-0 | clip-1 | image | i1 | 3500ms | 3000ms | 0-3000ms | transition=fade 500ms |

### Timeline

```
          0s       1s       2s        3s       4s       5s       6s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: duplicate video clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: duplicate clip clamped by maxDuration 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 2000ms | 0-2000ms | - |

### Timeline

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: paste clip at playhead on same track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 6000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s         2s         4s         6s         8s         10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV]      [VVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: paste clip on different track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-1 | clip-1 | title | - | 0ms | 2000ms | 0-2000ms | text="Overlay" 20px white |
| track-1 | clip-2 | video | v1 | 3000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]                      
track-1   [TTTTTTTTTTTTT]        [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression workflow: paste attributes from styled clip to plain clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(10,-5,1.5,30deg), crop(0,0,160x90), blend=screen |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | transform(10,-5,1.5,30deg), crop(0,0,160x90), blend=screen |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: duplicate then move the duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 15000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    2s    4s    6s    8s    10s   12s   14s   16s   18s   20s
track-0   [VVVVVVVVVVVVV]                              [VVVVVVVVVVVVV]
```

---

## editor operation regression workflow: copy-paste with transform + blend attributes 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(50,50,2,90deg), blend=overlay |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |
| track-0 | clip-2 | video | v1 | 8000ms | 5000ms | 0-5000ms | transform(50,50,2,90deg), blend=overlay |

### Timeline

```
          0s       2s       4s        6s       8s       10s      12s
track-0   [VVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIII][VVVVVVVVVVVVVVVVVVVVV]
```

---

## editor operation regression multi-select: removeClips removes multiple clips at once 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0                                         [IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression multi-select: moveClips shifts multiple clips by delta 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 6000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s     1s    2s     3s     4s    5s     6s     7s    8s     9s
track-0          [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIII]
```

---

## editor operation regression group: groupClips assigns groupId, ungroupClips clears it 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression group: groupClips assigns groupId, ungroupClips clears it 2

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## track lock & mute regression setTrackLocked then attempt operations 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## track lock & mute regression setTrackLocked then attempt operations 2

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## track lock & mute regression setTrackMuted preserves track state 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## track lock & mute regression setTrackMuted preserves track state 2

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: ripple delete of one clip in a group 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | image | i1 | 0ms | 3000ms | 0-3000ms | - |
| track-0 | clip-1 | audio | a1 | 3000ms | 22000ms | 0-22000ms | - |

### Timeline

```
          0s   2s   4s  6s   8s   10s  12s  14s 16s  18s  20s  22s  24s
track-0   [IIIII][AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA]
```

---

## editor operation regression workflow: removeTransition restores startMs and clears transition 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: setTrackName 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: setTrackColor 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: duplicate clip with transition clears transition on duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | image | i1 | 4500ms | 3000ms | 0-3000ms | transition=fade 500ms |
| track-0 | clip-2 | image | i1 | 7500ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s         2s          4s         6s          8s         10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV[IIIIIIIIIIIIIII][IIIIIIIIIIIIIII]
```

---

## editor operation regression workflow: split then ripple delete one half 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 2500-5000ms | - |
| track-0 | clip-1 | image | i1 | 2500ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s         1s         2s         3s         4s         5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## keyframe tracks regression workflow: clip with keyframeTracks preserves through move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0                                 [VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: clip with keyframeTracks preserves through trim 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |

### Timeline

```
          0s             1s             2s             3s             4s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: clip with keyframeTracks preserves through split 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: clip with keyframeTracks preserves through duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: clip with keyframeTracks preserves through paste 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 10000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s      2s      4s      6s      8s      10s     12s     14s
track-0   [VVVVVVVVVVVVVVVVVV]                    [VVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: pasteAttributes does not copy keyframeTracks 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(10,5,1.5,undefineddeg) |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | transform(10,5,1.5,undefineddeg) |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## keyframe tracks regression workflow: clip with keyframeTracks + transform + blend 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(10,-5,0.8,15deg), blend=screen |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: addKeyframe creates track and adds keyframes 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: addKeyframe replaces at same time 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: removeKeyframe removes single keyframe 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: removeKeyframe removes last kf cleans up track 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: updateKeyframe changes value and easing 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: keyframe ops combined with move and trim 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 1000ms | 4000ms | 0-4000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0               [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: keyframe ops with multiple properties on same clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: set clip speed to 2x 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |

### Timeline

```
          0s          0.5s        1s          1.5s        2s          2.5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: set clip speed to 0.5x 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 10000ms | 0-10000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: change speed multiple times preserves source duration 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: speed change + trim + move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2000ms | 0-2000ms | - |
| track-0 | clip-1 | image | i1 | 3000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s        1s        2s        3s        4s        5s        6s
track-0   [VVVVVVVVVVVVVVVVVV]          [IIIIIIIIIIIIIIIIIIIIIIIIIIII]
```

---

## keyframe tracks regression workflow: add color correction to video clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: color correction preserved through move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 2000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0                    [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: color correction preserved through trim 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |

### Timeline

```
          0s             1s             2s             3s             4s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: color correction preserved through split 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: color correction preserved through duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: color correction + transform + blend mode combined 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(10,-5,0.8,15deg), blend=multiply |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## keyframe tracks regression workflow: reset color correction (set to undefined) 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: add video filters to video clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: video filters preserved through move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 2000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0                    [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: video filters preserved through trim 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 4000ms | 0-4000ms | - |

### Timeline

```
          0s             1s             2s             3s             4s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: video filters preserved through split 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: video filters preserved through duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: video filters + color correction + transform combined 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(10,-5,0.8,15deg), blend=multiply |
| track-0 | clip-1 | image | i1 | 5000ms | 3000ms | 0-3000ms | - |

### Timeline

```
          0s      1s     2s      3s     4s      5s     6s      7s     8s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV][IIIIIIIIIIIIIIIIIIII]
```

---

## keyframe tracks regression workflow: reset video filters (set to undefined) 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: set chroma key on video clip 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: chroma key preserved through split 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: chroma key preserved through duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: chroma key + transform combined 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(20,10,0.6,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: remove chroma key (set to undefined) 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: apply PiP corner-br preset 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(662,368,0.3,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: apply PiP corner-tl preset 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(-662,-368,0.3,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: apply PiP side-by-side preset 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(-480,0,0.5,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: apply PiP top-bottom preset 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(0,-270,0.5,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: PiP preset overwrites existing transform 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(662,368,0.3,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: all four PiP corner presets 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(662,-368,0.3,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: speed preserved through split 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 1250ms | 0-1250ms | - |
| track-0 | clip-1 | video | v1 | 1250ms | 1250ms | 1250-2500ms | - |

### Timeline

```
          0s          0.5s        1s          1.5s        2s          2.5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: speed preserved through duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 0-2500ms | - |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: speed preserved through paste 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | - |
| track-0 | clip-1 | video | v1 | 5000ms | 2500ms | 0-2500ms | - |

### Timeline

```
          0s      1s      2s      3s      4s      5s      6s      7s
track-0   [VVVVVVVVVVVVVVVVVV]                    [VVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: chroma key preserved through move 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 2000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s       1s      2s       3s      4s       5s      6s       7s
track-0                    [VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: chroma key preserved through paste 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | - |
| track-0 | clip-1 | video | v1 | 8000ms | 5000ms | 0-5000ms | - |

### Timeline

```
          0s       2s       4s        6s       8s       10s      12s
track-0   [VVVVVVVVVVVVVVVVVVVVV]              [VVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: PiP preset transform preserved through split 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 2500ms | 0-2500ms | transform(662,368,0.3,0deg) |
| track-0 | clip-1 | video | v1 | 2500ms | 2500ms | 2500-5000ms | transform(662,368,0.3,0deg) |

### Timeline

```
          0s          1s          2s          3s          4s          5s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---

## keyframe tracks regression workflow: PiP preset transform preserved through duplicate 1

### Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| track-0 | clip-0 | video | v1 | 0ms | 5000ms | 0-5000ms | transform(662,368,0.3,0deg) |
| track-0 | clip-1 | video | v1 | 5000ms | 5000ms | 0-5000ms | transform(662,368,0.3,0deg) |

### Timeline

```
          0s    1s    2s    3s    4s    5s    6s    7s    8s    9s    10s
track-0   [VVVVVVVVVVVVVVVVVVVVVVVVVVVV][VVVVVVVVVVVVVVVVVVVVVVVVVVVV]
```

---
