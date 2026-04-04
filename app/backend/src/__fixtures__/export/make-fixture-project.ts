import type { Project, Clip, Track, Asset, KeyframeTrack } from "@video/shared";

export const CANVAS_W = 160;
export const CANVAS_H = 90;
export const FPS = 10;

const videoAsset: Asset = {
  id: "v1",
  kind: "video",
  originalPath: "assets/test-video-1s.mp4",
  durationMs: 1000,
  width: CANVAS_W,
  height: CANVAS_H,
  hasAudio: false,
};

const imageAsset: Asset = {
  id: "img1",
  kind: "image",
  originalPath: "assets/test-image.png",
  width: CANVAS_W,
  height: CANVAS_H,
};

const audioAsset: Asset = {
  id: "aud1",
  kind: "audio",
  originalPath: "assets/test-audio-1s.mp3",
  durationMs: 1000,
};

const p5jsAsset: Asset = {
  id: "p5js1",
  kind: "p5js",
  originalPath: "assets/test-sketch.p5.js",
  durationMs: 1000,
  width: CANVAS_W,
  height: CANVAS_H,
  hasAudio: false,
};

const p5jsFlowfieldAsset: Asset = {
  id: "p5js-flowfield",
  kind: "p5js",
  originalPath: "assets/test-sketch-flowfield.p5.js",
  durationMs: 1000,
  width: CANVAS_W,
  height: CANVAS_H,
  hasAudio: false,
};

/** p5js asset resolved to its pre-rendered MP4 for direct FFmpeg export */
const p5jsVideoAsset: Asset = {
  id: "p5js1",
  kind: "p5js",
  originalPath: "assets/test-p5js-rendered-1s.mp4",
  durationMs: 1000,
  width: CANVAS_W,
  height: CANVAS_H,
  hasAudio: false,
};

function baseProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "fixture",
    name: "Fixture",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    assets: [videoAsset],
    sequence: { tracks: [] },
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    exportPreset: {
      width: CANVAS_W,
      height: CANVAS_H,
      fps: FPS,
      videoBitrate: "200k",
      audioBitrate: "64k",
    },
    ...overrides,
  };
}

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: "c1",
    clipKind: "video",
    assetId: "v1",
    startMs: 0,
    durationMs: 1000,
    inMs: 0,
    outMs: 1000,
    ...overrides,
  };
}

function makeTrack(clips: Clip[], id = "t1"): Track {
  return { id, clips };
}

/** Single 1-second video clip */
export function makeSingleVideoProject(): Project {
  return baseProject({
    sequence: {
      tracks: [makeTrack([makeClip()])],
    },
  });
}

/** Two sequential video clips (0-1s, 1-2s) */
export function makeTwoClipProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 1000, outMs: 1000 }),
          makeClip({ id: "c2", startMs: 1000, durationMs: 1000, outMs: 1000 }),
        ]),
      ],
    },
  });
}

/** Single image clip displayed for 1 second */
export function makeImageClipProject(): Project {
  return baseProject({
    assets: [imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "image",
            assetId: "img1",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }),
        ]),
      ],
    },
  });
}

/** Text overlay on a video clip */
export function makeTextOverlayProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            {
              id: "tc1",
              clipKind: "title",
              assetId: "",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              text: {
                value: "Hello",
                fontSize: 24,
                color: "white",
                backgroundColor: "black@0.5",
              },
            },
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Video clip with crop and transform */
export function makeCropTransformProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            transform: { x: 10, y: 5, scale: 1, rotation: 0 },
            crop: { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H },
          }),
        ]),
      ],
    },
  });
}

/** Two tracks overlaid — video on track 1, image on track 2 */
export function makeMultiTrackProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "cover",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two tracks — image overlaid with opacity blend mode */
export function makeOpacityProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "opacity",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two tracks — image overlaid with multiply blend mode */
export function makeMultiplyProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "multiply",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two tracks — image overlaid with screen blend mode */
export function makeScreenProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "screen",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two tracks — image overlaid with overlay blend mode */
export function makeOverlayBlendProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "overlay",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two tracks — image overlaid with add blend mode */
export function makeAddProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "add",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two tracks — image overlaid with difference blend mode */
export function makeDifferenceProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              blendMode: "difference",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Helper: Video (red) → Image (blue) with a 300ms transition of the given type.
 *  Clip 1 (video): 0–1000ms, Clip 2 (image): 700–1700ms (300ms overlap). */
function makeTransitionProject(transitionType: string): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 1000, outMs: 1000 }),
          makeClip({
            id: "c2",
            clipKind: "image",
            assetId: "img1",
            startMs: 700,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
            transition: { type: transitionType, durationMs: 300 },
          }),
        ]),
      ],
    },
  });
}

export function makeFadeTransitionProject(): Project { return makeTransitionProject("fade"); }
export function makeFadeBlackTransitionProject(): Project { return makeTransitionProject("fade-black"); }
export function makeFadeWhiteTransitionProject(): Project { return makeTransitionProject("fade-white"); }
export function makeSlideLeftTransitionProject(): Project { return makeTransitionProject("slide-left"); }
export function makeSlideRightTransitionProject(): Project { return makeTransitionProject("slide-right"); }
export function makeSlideUpTransitionProject(): Project { return makeTransitionProject("slide-up"); }
export function makeSlideDownTransitionProject(): Project { return makeTransitionProject("slide-down"); }
export function makeWipeLeftTransitionProject(): Project { return makeTransitionProject("wipe-left"); }
export function makeWipeUpTransitionProject(): Project { return makeTransitionProject("wipe-up"); }
export function makeZoomInTransitionProject(): Project { return makeTransitionProject("zoom-in"); }
export function makePushLeftTransitionProject(): Project { return makeTransitionProject("push-left"); }

/** Two tracks — top clip with crop + scale + position + rotation to reveal bottom clip.
 *  Verifies transparency compositing with all transform properties combined. */
/** Single p5.js clip (pre-rendered to video) */
export function makeP5jsProject(): Project {
  return baseProject({
    assets: [p5jsAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", clipKind: "p5js", assetId: "p5js1", durationMs: 1000 }),
        ]),
      ],
    },
  });
}

/** p5.js clip with transform (scale + rotation) */
export function makeP5jsTransformProject(): Project {
  return baseProject({
    assets: [p5jsVideoAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "p5js",
            assetId: "p5js1",
            durationMs: 1000,
            transform: { x: 20, y: 10, scale: 0.7, rotation: 15 },
          }),
        ]),
      ],
    },
  });
}

/** p5.js clip + video clip on separate tracks (multi-track overlay) */
export function makeP5jsMultiTrackProject(): Project {
  return baseProject({
    assets: [videoAsset, p5jsVideoAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", clipKind: "video", assetId: "v1", durationMs: 1000 }),
        ], "t1"),
        makeTrack([
          makeClip({
            id: "c2",
            clipKind: "p5js",
            assetId: "p5js1",
            durationMs: 1000,
            blendMode: "opacity",
          }),
        ], "t2"),
      ],
    },
  });
}

/** p5.js clip with fade transition from video */
export function makeP5jsTransitionProject(): Project {
  return baseProject({
    assets: [videoAsset, p5jsVideoAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 1000 }),
          makeClip({
            id: "c2",
            clipKind: "p5js",
            assetId: "p5js1",
            startMs: 700,
            durationMs: 1000,
            transition: { type: "fade", durationMs: 300 },
          }),
        ]),
      ],
    },
  });
}

/** Complex p5.js sketch — Perlin-noise flow field with particle trails.
 *  Tests the Chromium rendering pipeline with dynamic, per-frame drawing. */
export function makeP5jsFlowfieldProject(): Project {
  return baseProject({
    assets: [p5jsFlowfieldAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", clipKind: "p5js", assetId: "p5js-flowfield", durationMs: 1000 }),
        ]),
      ],
    },
  });
}

/** p5.js flow field + video multi-track overlay — complex sketch composited with video */
export function makeP5jsFlowfieldMultiTrackProject(): Project {
  return baseProject({
    assets: [videoAsset, p5jsFlowfieldAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", clipKind: "video", assetId: "v1", durationMs: 1000 }),
        ], "t1"),
        makeTrack([
          makeClip({
            id: "c2",
            clipKind: "p5js",
            assetId: "p5js-flowfield",
            durationMs: 1000,
            blendMode: "screen",
          }),
        ], "t2"),
      ],
    },
  });
}

/** Video clip split into two halves at 500ms (simulates razor tool result). */
export function makeSplitClipProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 500, inMs: 0, outMs: 500 }),
          makeClip({ id: "c2", startMs: 500, durationMs: 500, inMs: 500, outMs: 1000 }),
        ]),
      ],
    },
  });
}

/** Video clip alongside an empty-asset clip — empty clip should be skipped during export. */
export function makeEmptyAssetMixedProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            {
              id: "empty1",
              clipKind: "video",
              assetId: "",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
            },
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Only empty-asset clips — export should throw "No video clips" error. */
export function makeOnlyEmptyAssetProject(): Project {
  return baseProject({
    assets: [],
    sequence: {
      tracks: [
        makeTrack([
          {
            id: "empty1",
            clipKind: "video",
            assetId: "",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          },
        ]),
      ],
    },
  });
}

/** Video on track 1, image on muted track 2 — muted track clips should be excluded from export. */
export function makeMutedTrackProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        {
          ...makeTrack(
            [
              makeClip({
                id: "c2",
                clipKind: "image",
                assetId: "img1",
                startMs: 0,
                durationMs: 1000,
                inMs: 0,
                outMs: 1000,
              }),
            ],
            "t2",
          ),
          muted: true,
        },
      ],
    },
  });
}

/** Two clips where clip 2 has both a fade transition and a transform (cross-feature). */
export function makeTransitionWithTransformProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 1000, outMs: 1000 }),
          makeClip({
            id: "c2",
            clipKind: "image",
            assetId: "img1",
            startMs: 700,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
            transition: { type: "fade", durationMs: 300 },
            transform: { x: 10, y: -5, scale: 0.8, rotation: 15 },
          }),
        ]),
      ],
    },
  });
}

/** Track 1 has 2 clips with fade transition, track 2 has image overlay during the transition window. */
export function makeTransitionMultiTrackProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 1000, outMs: 1000 }),
          makeClip({
            id: "c2",
            clipKind: "image",
            assetId: "img1",
            startMs: 700,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
            transition: { type: "fade", durationMs: 300 },
          }),
        ]),
        makeTrack(
          [
            makeClip({
              id: "c3",
              clipKind: "image",
              assetId: "img1",
              startMs: 500,
              durationMs: 500,
              inMs: 0,
              outMs: 500,
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two clips on one track — clip 2 has both a fade transition and multiply blend mode. */
export function makeBlendModeTransitionProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 1000, outMs: 1000 }),
          makeClip({
            id: "c2",
            clipKind: "image",
            assetId: "img1",
            startMs: 700,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
            transition: { type: "fade", durationMs: 300 },
            blendMode: "multiply",
          }),
        ]),
      ],
    },
  });
}

/** Two tracks — top clip has both crop and screen blend mode. */
export function makeCropBlendProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "image",
              assetId: "img1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              crop: { x: 20, y: 10, width: 120, height: 70 },
              blendMode: "screen",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Video + title overlay with fontFamily and align set. */
export function makeTitleFontAlignProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([makeClip()]),
        makeTrack(
          [
            {
              id: "tc1",
              clipKind: "title",
              assetId: "",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              text: {
                value: "Styled Title",
                fontFamily: "Noto Sans JP",
                fontSize: 28,
                align: "right",
                color: "#ff0000",
                backgroundColor: "#000000@0.8",
              },
            },
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Single video clip with keyframe-animated transform.x (moves right over 1 second). */
export function makeKeyframeTransformXProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            transform: { x: 0, y: 0, scale: 0.5, rotation: 0 },
            keyframeTracks: [
              {
                property: "transform.x",
                keyframes: [
                  { timeMs: 0, value: -40 },
                  { timeMs: 1000, value: 40 },
                ],
              },
            ],
          }),
        ]),
      ],
    },
  });
}

/** Single video clip at 2x speed (plays in 500ms instead of 1000ms). */
export function makeSpeed2xProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 500, inMs: 0, outMs: 500, speed: 2 }),
        ]),
      ],
    },
  });
}

/** Single video clip at 0.5x speed (plays in 2000ms instead of 1000ms). */
export function makeSpeedHalfProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000, speed: 0.5 }),
        ]),
      ],
    },
  });
}

/** Two clips: first at 2x speed, second at normal speed — cross-feature with speed + multi-clip. */
export function makeSpeedMultiClipProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 500, inMs: 0, outMs: 500, speed: 2 }),
          makeClip({ id: "c2", startMs: 500, durationMs: 1000, inMs: 0, outMs: 1000 }),
        ]),
      ],
    },
  });
}

/** Single video clip with blur + sepia video filters. */
export function makeVideoFilterBlurSepiaProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            videoFilters: [
              { type: "blur", strength: 0.3 },
              { type: "sepia", strength: 0.7 },
            ],
          }),
        ]),
      ],
    },
  });
}

/** Single video clip with grayscale video filter. */
export function makeVideoFilterGrayscaleProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            videoFilters: [{ type: "grayscale", strength: 1.0 }],
          }),
        ]),
      ],
    },
  });
}

/** Video filter + transform (cross-feature). */
export function makeVideoFilterTransformProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            videoFilters: [{ type: "blur", strength: 0.5 }],
            transform: { x: 10, y: -5, scale: 0.8, rotation: 15 },
          }),
        ]),
      ],
    },
  });
}

/** Single video clip with color correction (brightness + contrast + saturation). */
export function makeColorCorrectionProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            colorCorrection: { brightness: 0.3, contrast: 0.2, saturation: -0.5 },
          }),
        ]),
      ],
    },
  });
}

/** Single video clip with hue rotation. */
export function makeColorCorrectionHueProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            colorCorrection: { hue: 90 },
          }),
        ]),
      ],
    },
  });
}

/** Color correction combined with transform (cross-feature). */
export function makeColorCorrectionTransformProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            colorCorrection: { brightness: 0.2, saturation: 0.5 },
            transform: { x: 10, y: -5, scale: 0.8, rotation: 15 },
          }),
        ]),
      ],
    },
  });
}

export function makeOverlayTransformProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        // Bottom: image (full frame, visible in exposed areas)
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "image",
            assetId: "img1",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }),
        ]),
        // Top: video cropped to 120x60 region, scaled to 0.5, offset from center, rotated 15°
        makeTrack(
          [
            makeClip({
              id: "c2",
              clipKind: "video",
              assetId: "v1",
              startMs: 0,
              durationMs: 1000,
              inMs: 0,
              outMs: 1000,
              crop: { x: 20, y: 15, width: 120, height: 60 },
              transform: { x: 20, y: -10, scale: 0.5, rotation: 45 },
              blendMode: "cover",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Video clip with chroma key (green screen removal). */
export function makeChromaKeyProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
          }),
        ]),
      ],
    },
  });
}

/** Chroma key + transform (cross-feature). */
export function makeChromaKeyTransformProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "image",
            assetId: "img1",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }),
        ]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              chromaKey: { color: "#00ff00", similarity: 0.4, blend: 0.15 },
              transform: { x: 20, y: 10, scale: 0.6, rotation: 0 },
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** PiP preset: corner bottom-right (scale 0.3). */
export function makePipCornerBrProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "image",
            assetId: "img1",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }),
        ]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              transform: {
                x: Math.round((CANVAS_W * 0.7) / 2 - 10),
                y: Math.round((CANVAS_H * 0.7) / 2 - 10),
                scale: 0.3,
                rotation: 0,
              },
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Two clips: clip 1 at 2x speed, clip 2 has fade transition (speed + transition combo). */
export function makeSpeedTransitionProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 500, inMs: 0, outMs: 500, speed: 2 }),
          makeClip({
            id: "c2",
            clipKind: "image",
            assetId: "img1",
            startMs: 200,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
            transition: { type: "fade", durationMs: 300 },
          }),
        ]),
      ],
    },
  });
}

/** One clip with both colorCorrection and videoFilters stacked. */
export function makeColorCorrectionVideoFilterProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            colorCorrection: { brightness: 0.3 },
            videoFilters: [{ type: "sepia", strength: 0.5 }],
          }),
        ]),
      ],
    },
  });
}

/** One clip with keyframe on transform.x AND colorCorrection. */
export function makeKeyframeColorCorrectionProject(): Project {
  return baseProject({
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            transform: { x: 0, y: 0, scale: 0.5, rotation: 0 },
            colorCorrection: { brightness: 0.2, contrast: 0.1 },
            keyframeTracks: [
              {
                property: "transform.x",
                keyframes: [
                  { timeMs: 0, value: -40 },
                  { timeMs: 1000, value: 40 },
                ],
              },
            ],
          }),
        ]),
      ],
    },
  });
}

/** Two clips: clip 2 has both transition and videoFilters (grayscale). */
export function makeVideoFilterTransitionProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        makeTrack([
          makeClip({ id: "c1", startMs: 0, durationMs: 1000, outMs: 1000 }),
          makeClip({
            id: "c2",
            clipKind: "image",
            assetId: "img1",
            startMs: 700,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
            transition: { type: "fade", durationMs: 300 },
            videoFilters: [{ type: "grayscale", strength: 1.0 }],
          }),
        ]),
      ],
    },
  });
}

/** Two tracks: upper clip has chromaKey and blendMode. */
export function makeChromaKeyBlendProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "image",
            assetId: "img1",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }),
        ]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
              blendMode: "screen",
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** PiP preset: side-by-side (scale 0.5). */
export function makePipSideBySideProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset],
    sequence: {
      tracks: [
        makeTrack([
          makeClip({
            id: "c1",
            clipKind: "image",
            assetId: "img1",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }),
        ]),
        makeTrack(
          [
            makeClip({
              id: "c2",
              transform: {
                x: Math.round(-CANVAS_W / 4),
                y: 0,
                scale: 0.5,
                rotation: 0,
              },
            }),
          ],
          "t2",
        ),
      ],
    },
  });
}

/** Feature Showcase: ALL features combined — p5js, video, image, audio,
 *  transitions (fade/wipe/zoom/push), keyframes, speed, color correction,
 *  video filters, chroma key, PiP, title overlays. */
export function makeFeatureShowcaseProject(): Project {
  return baseProject({
    assets: [videoAsset, imageAsset, audioAsset, p5jsAsset],
    settings: { durationMs: 12000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
    sequence: {
      tracks: [
        {
          id: "track-main",
          clips: [
            makeClip({
              id: "c-p5-intro", clipKind: "p5js", assetId: "p5js1",
              startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000,
              keyframeTracks: [{ property: "opacity", keyframes: [
                { timeMs: 0, value: 0 }, { timeMs: 500, value: 1, easing: "ease-out" },
              ]}],
            }),
            makeClip({
              id: "c-vid-1",
              startMs: 2500, durationMs: 1000, inMs: 0, outMs: 1000,
              speed: 0.5,
              transition: { type: "fade", durationMs: 500 },
              colorCorrection: { brightness: 0.1, contrast: 0.15, saturation: -0.3 },
              keyframeTracks: [{ property: "transform.x", keyframes: [
                { timeMs: 0, value: -20 }, { timeMs: 1000, value: 20, easing: "ease-in-out" },
              ]}],
            }),
            makeClip({
              id: "c-vid-2",
              startMs: 3200, durationMs: 1000, inMs: 0, outMs: 1000,
              transition: { type: "wipe-left", durationMs: 300 },
              videoFilters: [{ type: "sepia", strength: 0.6 }],
            }),
            makeClip({
              id: "c-img-chroma", clipKind: "image", assetId: "img1",
              startMs: 3900, durationMs: 2000, inMs: 0, outMs: 2000,
              transition: { type: "zoom-in", durationMs: 300 },
              chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
            }),
            makeClip({
              id: "c-p5-outro", clipKind: "p5js", assetId: "p5js1",
              startMs: 5600, durationMs: 3000, inMs: 0, outMs: 3000,
              transition: { type: "push-left", durationMs: 300 },
              videoFilters: [{ type: "grayscale", strength: 0.7 }],
              keyframeTracks: [{ property: "opacity", keyframes: [
                { timeMs: 2000, value: 1 }, { timeMs: 3000, value: 0, easing: "ease-in" },
              ]}],
            }),
          ],
        },
        {
          id: "track-overlay",
          clips: [
            { id: "c-title-intro", clipKind: "title", assetId: "",
              startMs: 500, durationMs: 2000, inMs: 0, outMs: 2000,
              text: { value: "Feature Showcase", fontSize: 14, color: "white", backgroundColor: "black@0.5" } },
            makeClip({
              id: "c-pip-p5", clipKind: "p5js", assetId: "p5js1",
              startMs: 3200, durationMs: 2500, inMs: 0, outMs: 2500,
              transform: { x: 30, y: 20, scale: 0.3, rotation: 0 },
              blendMode: "screen",
            }),
            { id: "c-title-outro", clipKind: "title", assetId: "",
              startMs: 6500, durationMs: 2000, inMs: 0, outMs: 2000,
              text: { value: "The End", fontSize: 18, color: "white", backgroundColor: "black@0.7" } },
          ],
        },
        makeTrack(
          [
            makeClip({ id: "c-aud-1", clipKind: "audio", assetId: "aud1", startMs: 0, durationMs: 1000, inMs: 0, outMs: 1000, volume: 0.7 }),
            makeClip({ id: "c-aud-2", clipKind: "audio", assetId: "aud1", startMs: 3000, durationMs: 1000, inMs: 0, outMs: 1000, volume: 0.5 }),
            makeClip({ id: "c-aud-3", clipKind: "audio", assetId: "aud1", startMs: 6000, durationMs: 1000, inMs: 0, outMs: 1000, volume: 0.3 }),
          ],
          "track-audio",
        ),
      ],
    },
  });
}
