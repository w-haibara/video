import { describe, test, expect } from "bun:test";
import { migrateProject } from "../utils/migration";
import type { Project } from "../types/project";

function makeOldProject(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "proj-1",
    name: "Test",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    assets: [
      { id: "v1", kind: "video", originalPath: "v.mp4", durationMs: 5000 },
      { id: "i1", kind: "image", originalPath: "img.jpg" },
      { id: "a1", kind: "audio", originalPath: "bgm.mp3", durationMs: 60000 },
    ],
    sequence: {
      tracks: [
        {
          id: "t-video",
          kind: "video",
          clips: [
            { id: "c1", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            { id: "c2", assetId: "i1", startMs: 5000, durationMs: 3000, inMs: 0, outMs: 3000 },
          ],
        },
        {
          id: "t-audio",
          kind: "audio",
          clips: [
            { id: "c3", assetId: "a1", startMs: 0, durationMs: 10000, inMs: 0, outMs: 10000 },
          ],
        },
        {
          id: "t-title",
          kind: "title",
          clips: [
            { id: "c4", assetId: "", startMs: 1000, durationMs: 2000, inMs: 0, outMs: 2000, text: { value: "Hello" } },
          ],
        },
      ],
    },
    settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    ...overrides,
  };
}

describe("migrateProject", () => {
  test("converts old Track.kind format to Clip.clipKind", () => {
    const raw = makeOldProject();
    const project = migrateProject(raw);

    expect(project.sequence.tracks[0].clips[0].clipKind).toBe("video");
    expect(project.sequence.tracks[0].clips[1].clipKind).toBe("image");
    expect(project.sequence.tracks[1].clips[0].clipKind).toBe("audio");
    expect(project.sequence.tracks[2].clips[0].clipKind).toBe("title");
  });

  test("removes legacy Track.kind field after migration", () => {
    const raw = makeOldProject();
    const project = migrateProject(raw);

    for (const track of project.sequence.tracks) {
      expect((track as Record<string, unknown>).kind).toBeUndefined();
    }
  });

  test("video track clips without matching asset default to clipKind=video", () => {
    const raw = makeOldProject({
      assets: [],
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              { id: "c1", assetId: "missing", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
            ],
          },
        ],
      },
    });
    const project = migrateProject(raw);
    expect(project.sequence.tracks[0].clips[0].clipKind).toBe("video");
  });

  test("does not modify clips that already have clipKind", () => {
    const raw = makeOldProject({
      sequence: {
        tracks: [
          {
            id: "t1",
            kind: "video",
            clips: [
              { id: "c1", clipKind: "image", assetId: "v1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
            ],
          },
        ],
      },
    });
    const project = migrateProject(raw);
    expect(project.sequence.tracks[0].clips[0].clipKind).toBe("image");
  });

  test("handles project with no tracks", () => {
    const raw = {
      id: "p1",
      name: "Empty",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      assets: [],
      sequence: { tracks: [] },
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    };
    const project = migrateProject(raw);
    expect(project.sequence.tracks).toEqual([]);
  });

  test("handles project with no sequence", () => {
    const raw = {
      id: "p1",
      name: "No Seq",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      assets: [],
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    };
    const project = migrateProject(raw as unknown);
    expect(project).toBeDefined();
  });
});

describe("sourcePath migration", () => {
  test("migrates sourcePath to originalPath for assets with sourcePath", () => {
    const raw = {
      id: "p1",
      name: "Test",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      assets: [
        { id: "p5js1", kind: "p5js", originalPath: "assets/rendered.mp4", sourcePath: "assets/sketch.p5.js" },
      ],
      sequence: { tracks: [] },
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    };
    const project = migrateProject(raw);
    expect(project.assets[0].originalPath).toBe("assets/sketch.p5.js");
    expect((project.assets[0] as Record<string, unknown>).sourcePath).toBeUndefined();
  });

  test("does not modify assets without sourcePath", () => {
    const raw = {
      id: "p1",
      name: "Test",
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: "2025-01-01T00:00:00Z",
      assets: [
        { id: "v1", kind: "video", originalPath: "assets/video.mp4" },
      ],
      sequence: { tracks: [] },
      settings: { durationMs: 30000, canvasWidth: 1920, canvasHeight: 1080 },
    };
    const project = migrateProject(raw);
    expect(project.assets[0].originalPath).toBe("assets/video.mp4");
  });
});

describe("Clip defaults", () => {
  test("Clip.clipKind is set during migration", () => {
    const raw = makeOldProject();
    const project = migrateProject(raw);
    for (const track of project.sequence.tracks) {
      for (const clip of track.clips) {
        expect(clip.clipKind).toBeDefined();
        expect(typeof clip.clipKind).toBe("string");
      }
    }
  });

  test("Clip.blendMode is undefined by default (treated as cover)", () => {
    const raw = makeOldProject();
    const project = migrateProject(raw);
    for (const track of project.sequence.tracks) {
      for (const clip of track.clips) {
        expect(clip.blendMode).toBeUndefined();
      }
    }
  });
});
