import { describe, test, expect } from "bun:test";
import type { Project, Clip } from "@video/shared";
import { buildExportArgs, buildTransformFilter, buildOverlayPosition, hasClipTransform } from "./export-service";

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "proj1",
    name: "Test",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    assets: [
      {
        id: "v1",
        kind: "video",
        originalPath: "assets/video1.mp4",
        durationMs: 5000,
        hasAudio: false,
      },
    ],
    sequence: {
      tracks: [
        {
          id: "t1",
          clips: [
            {
              id: "c1",
              clipKind: "video",
              assetId: "v1",
              startMs: 0,
              durationMs: 5000,
              inMs: 0,
              outMs: 5000,
            },
          ],
        },
      ],
    },
    settings: { durationMs: 10000, canvasWidth: 1920, canvasHeight: 1080 },
    ...overrides,
  };
}

describe("buildExportArgs", () => {
  test("generates basic args for single video clip", () => {
    const project = makeProject();
    const args = buildExportArgs(project, "/assets", "/out/export.mp4");

    expect(args).toContain("-y");
    expect(args).toContain("-i");
    expect(args).toContain("/assets/video1.mp4");
    expect(args).toContain("-filter_complex");
    expect(args).toContain("-c:v");
    expect(args).toContain("libx264");
    expect(args).toContain("/out/export.mp4");
  });

  test("throws when no video clips", () => {
    const project = makeProject({
      sequence: { tracks: [] },
    });
    expect(() => buildExportArgs(project, "/assets", "/out.mp4")).toThrow(
      "No video clips to export",
    );
  });

  test("throws when video track is empty", () => {
    const project = makeProject({
      sequence: {
        tracks: [{ id: "t1", clips: [] }],
      },
    });
    expect(() => buildExportArgs(project, "/assets", "/out.mp4")).toThrow(
      "No video clips to export",
    );
  });

  test("handles image clips with -loop 1", () => {
    const project = makeProject({
      assets: [
        { id: "i1", kind: "image", originalPath: "assets/photo.jpg" },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "image",
                assetId: "i1",
                startMs: 0,
                durationMs: 3000,
                inMs: 0,
                outMs: 3000,
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    expect(args).toContain("-loop");
    expect(args).toContain("1");
    expect(args).toContain("-t");
    expect(args).toContain("3");
  });

  test("generates overlay filter for multiple clips", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 3000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
              { id: "c2", clipKind: "video", assetId: "v2", startMs: 5000, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("[v0]");
    expect(filter).toContain("[v1]");
    expect(filter).toContain("overlay=0:0");
    expect(filter).toContain("enable='between(t,0,5)'");
    expect(filter).toContain("enable='between(t,5,8)'");
  });

  test("generates drawtext filter for text clips", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              {
                id: "tc1",
                clipKind: "title",
                assetId: "",
                startMs: 1000,
                durationMs: 2000,
                inMs: 0,
                outMs: 2000,
                text: { value: "Hello", fontSize: 36, color: "#ff0000" },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("drawtext=text='Hello'");
    expect(filter).toContain("fontsize=36");
    expect(filter).toContain("fontcolor=#ff0000");
    expect(filter).toContain("enable='between(t,1,3)'");
  });

  test("handles BGM audio track with volume", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
        { id: "a1", kind: "audio", originalPath: "assets/bgm.mp3", durationMs: 60000 },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              { id: "ac1", clipKind: "audio", assetId: "a1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000, volume: 0.5 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("volume=0.5");
    expect(args).toContain("-c:a");
    expect(args).toContain("aac");
  });

  test("mixes video audio with BGM when hasAudio=true", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: true },
        { id: "a1", kind: "audio", originalPath: "assets/bgm.mp3", durationMs: 60000 },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              { id: "ac1", clipKind: "audio", assetId: "a1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000, volume: 0.8 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("amix=inputs=2");
    expect(filter).toContain("[va]");
    expect(filter).toContain("[bgm]");
  });

  test("uses canvas dimensions when no export preset", () => {
    const project = makeProject({
      settings: { durationMs: 10000, canvasWidth: 1080, canvasHeight: 1080 },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("crop=1080:1080:");
  });

  test("uses custom export preset over canvas dimensions", () => {
    const project = makeProject({
      exportPreset: {
        width: 1280,
        height: 720,
        fps: 24,
        videoBitrate: "4M",
        audioBitrate: "128k",
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("crop=1280:720:");
    expect(args).toContain("24");
  });

  test("includes browser-compatible pixel format and color space options", () => {
    const project = makeProject();
    const args = buildExportArgs(project, "/assets", "/out/export.mp4");

    expect(args).toContain("-pix_fmt");
    expect(args).toContain("yuv420p");
    expect(args).toContain("-colorspace");
    expect(args).toContain("bt709");
    expect(args).toContain("-color_primaries");
    expect(args).toContain("bt709");
    expect(args).toContain("-color_trc");
    expect(args).toContain("bt709");
  });

  test("throws when no assets match any clip handler", () => {
    const project = makeProject({
      assets: [], // no assets — clips are skipped by registry lookup
    });
    expect(() => buildExportArgs(project, "/assets", "/out.mp4")).toThrow(
      "No video clips to export",
    );
  });

  test("excludes clips beyond project settings durationMs", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 3000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 3000, hasAudio: false },
        { id: "v3", kind: "video", originalPath: "assets/v3.mp4", durationMs: 3000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c2", clipKind: "video", assetId: "v2", startMs: 3000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c3", clipKind: "video", assetId: "v3", startMs: 6000, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
      settings: { durationMs: 6000, canvasWidth: 1920, canvasHeight: 1080 },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Only 2 clips should be included (c3 starts at 6000 which equals durationMs)
    const overlayMatches = filter.match(/overlay=0:0/g);
    expect(overlayMatches?.length).toBe(2);
    // v3.mp4 should not appear as input
    expect(args).not.toContain("/assets/v3.mp4");
  });

  test("clamps clip that spans project duration boundary", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 5000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
              { id: "c2", clipKind: "video", assetId: "v2", startMs: 5000, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
        ],
      },
      settings: { durationMs: 8000, canvasWidth: 1920, canvasHeight: 1080 },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Both clips included with overlay compositing
    const overlayMatches = filter.match(/overlay=0:0/g);
    expect(overlayMatches?.length).toBe(2);
    // c2 trim duration should be 3 seconds
    expect(filter).toContain("trim=start=0:duration=3,");
  });

  test("limits total export to project settings durationMs", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 3000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 3000, hasAudio: false },
        { id: "v3", kind: "video", originalPath: "assets/v3.mp4", durationMs: 3000, hasAudio: false },
        { id: "v4", kind: "video", originalPath: "assets/v4.mp4", durationMs: 3000, hasAudio: false },
        { id: "v5", kind: "video", originalPath: "assets/v5.mp4", durationMs: 3000, hasAudio: false },
        { id: "v6", kind: "video", originalPath: "assets/v6.mp4", durationMs: 3000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c2", clipKind: "video", assetId: "v2", startMs: 3000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c3", clipKind: "video", assetId: "v3", startMs: 6000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c4", clipKind: "video", assetId: "v4", startMs: 9000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c5", clipKind: "video", assetId: "v5", startMs: 12000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c6", clipKind: "video", assetId: "v6", startMs: 15000, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
      settings: { durationMs: 6000, canvasWidth: 1920, canvasHeight: 1080 },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Only first 2 clips (0-3s, 3-6s) should be included
    const overlayMatches = filter.match(/overlay=0:0/g);
    expect(overlayMatches?.length).toBe(2);
  });

  test("clamps trim duration to source length to prevent freeze", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 3000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              // Clip claims 5s duration but source is only 3s
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Should be clamped to 3s (source length), not 5s
    expect(filter).toContain("trim=start=0:duration=3,");
  });

  test("clamps trim duration accounting for inMs offset", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              // inMs=2000, so only 3s of source remains, but durationMs claims 4s
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 4000, inMs: 2000, outMs: 6000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Should be clamped to 3s (5000 - 2000 = 3000ms)
    expect(filter).toContain("trim=start=2:duration=3,");
  });

  test("uses outMs-inMs when smaller than durationMs (consistency fix)", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 10000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              // durationMs=5000 but outMs-inMs=3000 (inconsistent)
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 1000, outMs: 4000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Should use outMs-inMs = 3s, not durationMs = 5s
    expect(filter).toContain("trim=start=1:duration=3,");
  });

  test("trims audio to match video for clips with hasAudio", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: true },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 3000, inMs: 1000, outMs: 4000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Audio should be trimmed to match video
    expect(filter).toContain("atrim=start=1:duration=3,asetpts=PTS-STARTPTS");
  });

  test("applies crop filter for video clip with crop settings", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                crop: { x: 100, y: 50, width: 800, height: 600 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // User crop should appear after setpts, no transform so pad+crop to canvas
    expect(filter).toContain("crop=800:600:100:50");
    expect(filter).toContain("setpts=PTS-STARTPTS,crop=800:600:100:50,format=yuva420p,pad=");
  });

  test("does not add extra crop for clip without crop settings", () => {
    const project = makeProject();
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Should only have the canvas crop, not a user crop
    const cropMatches = filter.match(/crop=/g);
    expect(cropMatches?.length).toBe(1); // only canvas center-crop
  });

  test("applies crop filter for image clip with crop settings", () => {
    const project = makeProject({
      assets: [
        { id: "i1", kind: "image", originalPath: "assets/photo.jpg" },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "image",
                assetId: "i1",
                startMs: 0,
                durationMs: 3000,
                inMs: 0,
                outMs: 3000,
                crop: { x: 10, y: 20, width: 640, height: 480 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // User crop should appear before format/pad for images
    expect(filter).toContain("crop=640:480:10:20,format=yuva420p,pad=");
  });

  test("applies crop and transform together in correct order", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                crop: { x: 100, y: 100, width: 500, height: 400 },
                transform: { x: 10, y: 20, scale: 1.5 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // With transform: crop then format then scale (no pad+crop to canvas)
    const userCropIdx = filter.indexOf("crop=500:400:100:100");
    const scaleIdx = filter.indexOf("scale=iw*1.5");
    expect(userCropIdx).toBeGreaterThan(-1);
    expect(scaleIdx).toBeGreaterThan(userCropIdx);
    // No canvas pad+crop — position handled by overlay expression
    expect(filter).toContain("overlay=(W-w)/2+10:(H-h)/2+20");
  });

  test("handles scale > 1 without pad+crop (overlay handles position)", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                transform: { x: 0, y: 0, scale: 2 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Transform clip: scale only, no pad+crop — overlay centers it
    expect(filter).toContain("scale=iw*2:ih*2");
    expect(filter).toContain("overlay=(W-w)/2:(H-h)/2");
  });

  test("handles scale > 1 combined with user crop", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                crop: { x: 100, y: 50, width: 800, height: 600 },
                transform: { x: 0, y: 0, scale: 2 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // User crop then scale (no canvas pad+crop)
    const userCropIdx = filter.indexOf("crop=800:600:100:50");
    const scaleIdx = filter.indexOf("scale=iw*2:ih*2");
    expect(userCropIdx).toBeGreaterThan(-1);
    expect(scaleIdx).toBeGreaterThan(userCropIdx);
  });

  test("handles scale < 1 with overlay centering", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                transform: { x: 0, y: 0, scale: 0.5 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Scale down: no pad+crop, overlay centers
    expect(filter).toContain("scale=iw*0.5:ih*0.5");
    expect(filter).toContain("overlay=(W-w)/2:(H-h)/2");
  });

  test("adds -ignore_unknown for video inputs", () => {
    const project = makeProject();
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const ignoreIdx = args.indexOf("-ignore_unknown");
    const inputIdx = args.indexOf("-i");
    expect(ignoreIdx).toBeGreaterThan(-1);
    expect(inputIdx).toBe(ignoreIdx + 1);
  });

  test("does not add -ignore_unknown for image inputs", () => {
    const project = makeProject({
      assets: [
        { id: "i1", kind: "image", originalPath: "assets/photo.jpg" },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "image", assetId: "i1", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    expect(args).not.toContain("-ignore_unknown");
  });

  test("applies rotation filter for 90 degrees with overlay centering", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                transform: { rotation: 90 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    const expectedRad = (90 * Math.PI) / 180;
    expect(filter).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
    expect(filter).toContain("overlay=(W-w)/2:(H-h)/2");
  });

  test("applies rotation filter for 180 degrees with overlay centering", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              {
                id: "c1",
                clipKind: "video",
                assetId: "v1",
                startMs: 0,
                durationMs: 5000,
                inMs: 0,
                outMs: 5000,
                transform: { rotation: 180 },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    const expectedRad = (180 * Math.PI) / 180;
    expect(filter).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
    expect(filter).toContain("overlay=(W-w)/2:(H-h)/2");
  });

  test("generates overlay filters for multi-track layer compositing", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 10000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 5000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "layer-bg",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000 },
            ],
          },
          {
            id: "layer-fg",
            clips: [
              { id: "c2", clipKind: "video", assetId: "v2", startMs: 2000, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Both clips should be overlaid
    const overlayMatches = filter.match(/overlay=0:0/g);
    expect(overlayMatches?.length).toBe(2);
    // Track ordering: bg clip first (enable 0-10), fg clip second (enable 2-7)
    expect(filter).toContain("enable='between(t,0,10)'");
    expect(filter).toContain("enable='between(t,2,7)'");
  });

  test("handles multi-track with no temporal overlap", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 3000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              { id: "c2", clipKind: "video", assetId: "v2", startMs: 6000, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Both clips included with separate enable windows
    expect(filter).toContain("enable='between(t,0,5)'");
    expect(filter).toContain("enable='between(t,6,9)'");
  });

  test("collects text clips by clipKind across all tracks", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              {
                id: "tc1",
                clipKind: "title",
                assetId: "",
                startMs: 0,
                durationMs: 2000,
                inMs: 0,
                outMs: 2000,
                text: { value: "Title A" },
              },
            ],
          },
          {
            id: "t3",
            clips: [
              {
                id: "tc2",
                clipKind: "title",
                assetId: "",
                startMs: 3000,
                durationMs: 1000,
                inMs: 0,
                outMs: 1000,
                text: { value: "Title B" },
              },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("drawtext=text='Title A'");
    expect(filter).toContain("drawtext=text='Title B'");
  });

  test("collects audio clips by clipKind across all tracks", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
        { id: "a1", kind: "audio", originalPath: "assets/bgm.mp3", durationMs: 60000 },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              { id: "ac1", clipKind: "audio", assetId: "a1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000, volume: 0.5 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Audio clip from a separate track should be collected and processed
    expect(filter).toContain("volume=0.5");
    expect(args).toContain("-c:a");
    expect(args).toContain("aac");
  });

  test("excludes text overlays beyond project duration", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            clips: [
              { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            clips: [
              {
                id: "tc1",
                clipKind: "title",
                assetId: "",
                startMs: 1000,
                durationMs: 2000,
                inMs: 0,
                outMs: 2000,
                text: { value: "Visible" },
              },
              {
                id: "tc2",
                clipKind: "title",
                assetId: "",
                startMs: 4000,
                durationMs: 2000,
                inMs: 0,
                outMs: 2000,
                text: { value: "Hidden" },
              },
            ],
          },
        ],
      },
      settings: { durationMs: 3000, canvasWidth: 1920, canvasHeight: 1080 },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("drawtext=text='Visible'");
    expect(filter).not.toContain("drawtext=text='Hidden'");
    // Visible text should be clamped to end at 3s
    expect(filter).toContain("enable='between(t,1,3)'");
  });
});

describe("buildTransformFilter", () => {
  const preset = { width: 1920, height: 1080 };

  function makeClip(transform?: Clip["transform"]): Clip {
    return {
      id: "c1",
      clipKind: "video",
      assetId: "v1",
      startMs: 0,
      durationMs: 5000,
      inMs: 0,
      outMs: 5000,
      transform,
    };
  }

  test("returns empty string when rotation is 0", () => {
    expect(buildTransformFilter(makeClip({ rotation: 0 }), preset)).toBe("");
  });

  test("returns empty string when rotation is undefined", () => {
    expect(buildTransformFilter(makeClip({}), preset)).toBe("");
    expect(buildTransformFilter(makeClip(undefined), preset)).toBe("");
  });

  test("generates rotate filter for 90 degrees", () => {
    const result = buildTransformFilter(makeClip({ rotation: 90 }), preset);
    const expectedRad = (90 * Math.PI) / 180;
    expect(result).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
  });

  test("generates rotate filter for 180 degrees", () => {
    const result = buildTransformFilter(makeClip({ rotation: 180 }), preset);
    const expectedRad = (180 * Math.PI) / 180;
    expect(result).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
  });

  test("generates rotate filter for 45 degrees", () => {
    const result = buildTransformFilter(makeClip({ rotation: 45 }), preset);
    const expectedRad = (45 * Math.PI) / 180;
    expect(result).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
  });

  test("generates rotate filter for negative angle (-90)", () => {
    const result = buildTransformFilter(makeClip({ rotation: -90 }), preset);
    const expectedRad = (-90 * Math.PI) / 180;
    expect(result).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
  });

  test("combines rotation with scale", () => {
    const result = buildTransformFilter(makeClip({ rotation: 90, scale: 1.5 }), preset);
    const expectedRad = (90 * Math.PI) / 180;
    expect(result).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
    expect(result).toContain("scale=iw*1.5:ih*1.5");
    // Rotation should come before scale
    const rotIdx = result.indexOf("rotate=");
    const scaleIdx = result.indexOf("scale=");
    expect(rotIdx).toBeLessThan(scaleIdx);
  });

  test("does not include translate — x/y handled by overlay", () => {
    const result = buildTransformFilter(makeClip({ rotation: 45, x: 10, y: 20 }), preset);
    const expectedRad = (45 * Math.PI) / 180;
    expect(result).toContain(`rotate=${expectedRad}:ow=rotw(${expectedRad}):oh=roth(${expectedRad}):c=black`);
    // x/y no longer in buildTransformFilter — handled by overlay position
    expect(result).not.toContain("pad=");
    expect(result).not.toContain("crop=");
  });

  test("returns empty for x/y only (no rotation/scale)", () => {
    // x/y alone doesn't produce filters — position handled by overlay
    const result = buildTransformFilter(makeClip({ x: 10, y: 20 }), preset);
    expect(result).toBe("");
  });
});

describe("buildOverlayPosition", () => {
  function makeClip(transform?: Clip["transform"]): Clip {
    return { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000, transform };
  }

  test("returns 0:0 for no transform", () => {
    expect(buildOverlayPosition(makeClip())).toBe("0:0");
    expect(buildOverlayPosition(makeClip({}))).toBe("0:0");
  });

  test("centers for scale only", () => {
    expect(buildOverlayPosition(makeClip({ scale: 0.5 }))).toBe("(W-w)/2:(H-h)/2");
  });

  test("centers with offset for scale + x/y", () => {
    expect(buildOverlayPosition(makeClip({ scale: 0.5, x: 100, y: -50 }))).toBe("(W-w)/2+100:(H-h)/2+-50");
  });

  test("centers for x/y only (position-only transform)", () => {
    expect(buildOverlayPosition(makeClip({ x: 10, y: 20 }))).toBe("(W-w)/2+10:(H-h)/2+20");
  });
});

describe("hasClipTransform", () => {
  function makeClip(transform?: Clip["transform"]): Clip {
    return { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000, transform };
  }

  test("returns false for no transform", () => {
    expect(hasClipTransform(makeClip())).toBe(false);
    expect(hasClipTransform(makeClip({}))).toBe(false);
    expect(hasClipTransform(makeClip({ x: 0, y: 0, scale: 1, rotation: 0 }))).toBe(false);
  });

  test("returns true for any non-identity value", () => {
    expect(hasClipTransform(makeClip({ x: 10 }))).toBe(true);
    expect(hasClipTransform(makeClip({ scale: 0.5 }))).toBe(true);
    expect(hasClipTransform(makeClip({ rotation: 45 }))).toBe(true);
  });
});
