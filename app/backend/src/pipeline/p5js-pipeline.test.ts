import { describe, test, expect, afterAll } from "bun:test";
import { p5jsPrepareStep } from "./steps/p5js-prepare";
import { webRenderStep } from "./steps/web-render";
import { ffmpegTool } from "./tools";
import type { PipelineContext } from "./types";
import type { Asset } from "@video/shared";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SKETCH_CODE = `function setup() {
  createCanvas(160, 90);
}
function draw() {
  background(237, 34, 93);
  fill(255);
  rect(10, 10, frameCount * 5, 30);
}`;

let tmpProjectDir: string;

afterAll(async () => {
  if (tmpProjectDir) {
    await rm(tmpProjectDir, { recursive: true, force: true }).catch(() => {});
  }
});

describe("p5js full pipeline", () => {
  test(
    "sketch -> HTML -> Chromium -> ffmpeg -> MP4",
    async () => {
      tmpProjectDir = await mkdtemp(join(tmpdir(), "p5js-pipeline-test-"));
      await writeFile(join(tmpProjectDir, "sketch.p5.js"), SKETCH_CODE);

      const asset: Asset = {
        id: "p5js-test",
        kind: "p5js",
        originalPath: "sketch.p5.js",
        durationMs: 2000,
      };

      const shared = new Map<string, unknown>([
        ["canvasWidth", 160],
        ["canvasHeight", 90],
        ["fps", 10],
        ["durationMs", 2000],
      ]);

      const ctx: PipelineContext = {
        asset,
        projectDir: tmpProjectDir,
        projectId: "p5js-e2e",
        shared,
        reportProgress: () => {},
      };

      // Step 1: p5js-prepare
      expect(p5jsPrepareStep.canHandle(ctx)).toBe(true);
      await p5jsPrepareStep.execute(ctx);

      expect(shared.has("webRenderHtml")).toBe(true);
      expect(shared.has("webRenderSettings")).toBe(true);

      const html = shared.get("webRenderHtml") as string;
      expect(html).toContain("createCanvas(160, 90)");
      expect(html).toContain("background(237, 34, 93)");

      // Step 2: web-render (Chromium + ffmpeg)
      expect(webRenderStep.canHandle(ctx)).toBe(true);
      await webRenderStep.execute(ctx);

      // Verify the rendered MP4 exists
      const outputPath = join(tmpProjectDir, ctx.asset.originalPath);
      const probeResult = await ffmpegTool.probe(outputPath);

      expect(probeResult.width).toBe(160);
      expect(probeResult.height).toBe(90);
      expect(probeResult.codec).toBeTruthy();
    },
    60_000,
  );
});
