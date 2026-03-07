import { describe, test, expect } from "bun:test";
import { ffmpegTool } from "./ffmpeg";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

const FIXTURES = path.resolve(import.meta.dir, "../../../test/fixtures");

describe("ffmpeg (integration)", () => {
  test("checkInstalled does not throw", async () => {
    await ffmpegTool.checkInstalled();
  });

  test("probe returns metadata for video", async () => {
    const result = await ffmpegTool.probe(path.join(FIXTURES, "sample.mp4"));
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThan(0);
    expect(result.codec).toBeDefined();
  });

  test("probe returns metadata for image", async () => {
    const result = await ffmpegTool.probe(path.join(FIXTURES, "sample.jpg"));
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  test("generateThumbnail creates JPEG file", async () => {
    const tmpDir = await mkdtemp(path.join(tmpdir(), "ffmpeg-test-"));
    try {
      const output = path.join(tmpDir, "thumb.jpg");
      await ffmpegTool.generateThumbnail(
        path.join(FIXTURES, "sample.mp4"),
        output,
      );
      expect(await Bun.file(output).exists()).toBe(true);
      expect(Bun.file(output).size).toBeGreaterThan(0);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });

  test("generateProxy creates MP4 file", async () => {
    const tmpDir = await mkdtemp(path.join(tmpdir(), "ffmpeg-test-"));
    try {
      const output = path.join(tmpDir, "proxy.mp4");
      await ffmpegTool.generateProxy(
        path.join(FIXTURES, "sample.mp4"),
        output,
        { isHdr: false },
      );
      expect(await Bun.file(output).exists()).toBe(true);
      expect(Bun.file(output).size).toBeGreaterThan(0);
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  });
});
