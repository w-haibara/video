import { describe, test, expect, afterAll } from "bun:test";
import { webRenderStep } from "./web-render";
import type { PipelineContext } from "../types";
import type { Asset } from "@video/shared";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const TEST_HTML = `<!DOCTYPE html>
<html>
<body style="margin:0">
<canvas id="c" width="320" height="240"></canvas>
<script>
const ctx = document.getElementById('c').getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(0, 0, 320, 240);
window.__ready = true;
window.__renderFrame = function(i) {
  ctx.fillStyle = i % 2 === 0 ? 'red' : 'blue';
  ctx.fillRect(0, 0, 320, 240);
};
</script>
</body>
</html>`;

let tmpProjectDir: string;

afterAll(async () => {
  if (tmpProjectDir) {
    await rm(tmpProjectDir, { recursive: true, force: true }).catch(() => {});
  }
});

describe("webRenderStep", () => {
  test("canHandle returns true only when webRenderHtml is in shared", () => {
    const sharedWith = new Map<string, unknown>([["webRenderHtml", "<html/>"]]);
    const sharedWithout = new Map<string, unknown>();

    const baseCtx = {
      asset: { id: "a", kind: "video", originalPath: "" } as Asset,
      projectDir: "/tmp",
      projectId: "p1",
      reportProgress: () => {},
    };

    expect(webRenderStep.canHandle({ ...baseCtx, shared: sharedWith })).toBe(
      true,
    );
    expect(
      webRenderStep.canHandle({ ...baseCtx, shared: sharedWithout }),
    ).toBe(false);
  });

  test(
    "renders HTML canvas to MP4 with correct resolution and frame count",
    async () => {
      tmpProjectDir = await mkdtemp(join(tmpdir(), "web-render-test-"));

      const asset: Asset = {
        id: "test-asset",
        kind: "video",
        originalPath: "",
      };

      const shared = new Map<string, unknown>();
      shared.set("webRenderHtml", TEST_HTML);
      shared.set("webRenderSettings", {
        width: 320,
        height: 240,
        fps: 10,
        durationMs: 1000,
      });

      const progressValues: number[] = [];
      const ctx: PipelineContext = {
        asset,
        projectDir: tmpProjectDir,
        projectId: "test-project",
        shared,
        reportProgress: (f) => progressValues.push(f),
      };

      await webRenderStep.execute(ctx);

      // Verify asset path was updated
      expect(ctx.asset.originalPath).toBe("assets/test-asset-rendered.mp4");

      // Verify the MP4 file exists
      const outputPath = join(tmpProjectDir, ctx.asset.originalPath);
      const fileStat = await stat(outputPath);
      expect(fileStat.size).toBeGreaterThan(0);

      // Use ffprobe to verify resolution and frame count
      const probeProc = Bun.spawn(
        [
          "ffprobe",
          "-v",
          "quiet",
          "-print_format",
          "json",
          "-show_streams",
          "-show_format",
          outputPath,
        ],
        { stdout: "pipe", stderr: "pipe" },
      );

      const probeStdout = await new Response(probeProc.stdout).text();
      const probeExit = await probeProc.exited;
      expect(probeExit).toBe(0);

      const probeData = JSON.parse(probeStdout);
      const videoStream = probeData.streams?.find(
        (s: { codec_type: string }) => s.codec_type === "video",
      );

      expect(videoStream).toBeDefined();
      expect(videoStream.width).toBe(320);
      expect(videoStream.height).toBe(240);

      // Verify approximate frame count (10 fps * 1s = 10 frames)
      const nbFrames = parseInt(videoStream.nb_frames, 10);
      expect(nbFrames).toBeGreaterThanOrEqual(9);
      expect(nbFrames).toBeLessThanOrEqual(11);

      // Verify progress was reported
      expect(progressValues.length).toBeGreaterThan(0);
      expect(progressValues[progressValues.length - 1]).toBe(1.0);
    },
    30_000,
  );
});
