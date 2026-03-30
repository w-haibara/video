# p5js-rendered

p5.js sketch rendered from source via Chromium pipeline

## Project Settings

- Canvas: 160x90
- Duration: 2000ms
- Frames: 10

## Assets

- `p5js1` (p5js, 1000ms) — test-sketch.p5.js

<video src="assets/test-sketch.p5.js" width="160" controls muted title="p5js1 (p5js)"></video>

## p5.js Sketch (`test-sketch.p5.js`)

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

## Clip Details

| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |
|-------|------|------|-------|-------|----------|--------|------------|
| t1 | c1 | p5js | p5js1 | 0ms | 1000ms | 0-1000ms | - |

## Timeline

```
          0s                            0.5s                          1s
t1        [PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPP]
```

## Filmstrip

<img src="frames/frame_0001.png" width="80" title="frame 1"> <img src="frames/frame_0002.png" width="80" title="frame 2"> <img src="frames/frame_0003.png" width="80" title="frame 3"> <img src="frames/frame_0004.png" width="80" title="frame 4"> <img src="frames/frame_0005.png" width="80" title="frame 5"> <img src="frames/frame_0006.png" width="80" title="frame 6"> <img src="frames/frame_0007.png" width="80" title="frame 7"> <img src="frames/frame_0008.png" width="80" title="frame 8"> <img src="frames/frame_0009.png" width="80" title="frame 9"> <img src="frames/frame_0010.png" width="80" title="frame 10">
