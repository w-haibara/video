import type { Project, Clip, Track, Asset } from "@video/shared";

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
  originalPath: "assets/test-video-1s.mp4", // Pre-rendered by pipeline; reuse test video
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
