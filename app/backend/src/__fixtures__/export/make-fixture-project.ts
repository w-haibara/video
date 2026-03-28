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

/** Two tracks — top clip with crop + scale + position + rotation to reveal bottom clip.
 *  Verifies transparency compositing with all transform properties combined. */
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
