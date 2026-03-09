import { describe, test, expect } from "bun:test";
import type { Project } from "@video/shared";
import { buildExportArgs } from "./export-service";

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
          kind: "video",
          clips: [
            {
              id: "c1",
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
        tracks: [{ id: "t1", kind: "video", clips: [] }],
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
            kind: "video",
            clips: [
              {
                id: "c1",
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

  test("generates concat filter for multiple clips", () => {
    const project = makeProject({
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/v1.mp4", durationMs: 5000, hasAudio: false },
        { id: "v2", kind: "video", originalPath: "assets/v2.mp4", durationMs: 3000, hasAudio: false },
      ],
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
              { id: "c2", assetId: "v2", startMs: 5000, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    expect(filter).toContain("concat=n=2:v=1:a=0");
    expect(filter).toContain("[v0]");
    expect(filter).toContain("[v1]");
  });

  test("generates drawtext filter for text clips", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            kind: "title",
            clips: [
              {
                id: "tc1",
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
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            kind: "audio",
            clips: [
              { id: "ac1", assetId: "a1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000, volume: 0.5 },
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
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            kind: "audio",
            clips: [
              { id: "ac1", assetId: "a1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000, volume: 0.8 },
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

  test("throws for missing asset", () => {
    const project = makeProject({
      assets: [], // no assets
    });
    expect(() => buildExportArgs(project, "/assets", "/out.mp4")).toThrow(
      "Asset not found",
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
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c2", assetId: "v2", startMs: 3000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c3", assetId: "v3", startMs: 6000, durationMs: 3000, inMs: 0, outMs: 3000 },
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
    expect(filter).toContain("concat=n=2:v=1:a=0");
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
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
              { id: "c2", assetId: "v2", startMs: 5000, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
        ],
      },
      settings: { durationMs: 8000, canvasWidth: 1920, canvasHeight: 1080 },
    });
    const args = buildExportArgs(project, "/assets", "/out.mp4");
    const filterIdx = args.indexOf("-filter_complex");
    const filter = args[filterIdx + 1];
    // Both clips included but c2 should be clamped to 3s (8000 - 5000 = 3000ms)
    expect(filter).toContain("concat=n=2:v=1:a=0");
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
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c2", assetId: "v2", startMs: 3000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c3", assetId: "v3", startMs: 6000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c4", assetId: "v4", startMs: 9000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c5", assetId: "v5", startMs: 12000, durationMs: 3000, inMs: 0, outMs: 3000 },
              { id: "c6", assetId: "v6", startMs: 15000, durationMs: 3000, inMs: 0, outMs: 3000 },
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
    expect(filter).toContain("concat=n=2:v=1:a=0");
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
            kind: "video",
            clips: [
              // Clip claims 5s duration but source is only 3s
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
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
            kind: "video",
            clips: [
              // inMs=2000, so only 3s of source remains, but durationMs claims 4s
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 4000, inMs: 2000, outMs: 6000 },
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
            kind: "video",
            clips: [
              // durationMs=5000 but outMs-inMs=3000 (inconsistent)
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 1000, outMs: 4000 },
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
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 3000, inMs: 1000, outMs: 4000 },
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
            kind: "video",
            clips: [
              {
                id: "c1",
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
    // User crop should appear after setpts and before pad
    expect(filter).toContain("crop=800:600:100:50");
    expect(filter).toContain("setpts=PTS-STARTPTS,crop=800:600:100:50,pad=");
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
            kind: "video",
            clips: [
              {
                id: "c1",
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
    // User crop should appear before pad for images
    expect(filter).toContain("crop=640:480:10:20,pad=");
  });

  test("applies crop and transform together in correct order", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              {
                id: "c1",
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
    // Crop should come before canvas pad/crop, transform should come after
    const userCropIdx = filter.indexOf("crop=500:400:100:100");
    const padIdx = filter.indexOf("pad=w='max(iw,");
    const scaleIdx = filter.indexOf("scale=iw*1.5");
    expect(userCropIdx).toBeGreaterThan(-1);
    expect(padIdx).toBeGreaterThan(userCropIdx);
    expect(scaleIdx).toBeGreaterThan(padIdx);
  });

  test("excludes text overlays beyond project duration", () => {
    const project = makeProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
          {
            id: "t2",
            kind: "title",
            clips: [
              {
                id: "tc1",
                assetId: "",
                startMs: 1000,
                durationMs: 2000,
                inMs: 0,
                outMs: 2000,
                text: { value: "Visible" },
              },
              {
                id: "tc2",
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
