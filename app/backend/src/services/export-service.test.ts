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

  test("uses custom export preset", () => {
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
    expect(filter).toContain("scale=1280:720");
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
});
