import { describe, test, expect, afterAll } from "bun:test";
import { p5jsPrepareStep } from "./steps/p5js-prepare";
import { webRenderStep } from "./steps/web-render";
import { ffmpegTool } from "./tools";
import type { PipelineContext } from "./types";
import type { Asset } from "@video/shared";
import { mkdtemp, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runPipeline } from "./runner";
import { RenderCacheManager } from "../services/render-cache-manager";

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

      // Verify the rendered MP4 exists (path stored in shared context)
      const renderedMp4Path = ctx.shared.get("renderedMp4Path") as string;
      expect(renderedMp4Path).toBeDefined();
      const probeResult = await ffmpegTool.probe(renderedMp4Path);

      expect(probeResult.width).toBe(160);
      expect(probeResult.height).toBe(90);
      expect(probeResult.codec).toBeTruthy();
    },
    60_000,
  );

  test(
    "runPipeline('p5js', ...) end-to-end with cache manager",
    async () => {
      const dir = await mkdtemp(join(tmpdir(), "p5js-runner-test-"));
      await writeFile(join(dir, "sketch.p5.js"), SKETCH_CODE);

      const asset: Asset = {
        id: "p5js-runner",
        kind: "p5js",
        originalPath: "sketch.p5.js",
        durationMs: 1000,
      };

      const cacheManager = new RenderCacheManager(dir);
      const ctx: PipelineContext = {
        asset,
        projectDir: dir,
        projectId: "p5js-runner-test",
        shared: new Map<string, unknown>([
          ["canvasWidth", 160],
          ["canvasHeight", 90],
          ["fps", 10],
          ["durationMs", 1000],
        ]),
        reportProgress: () => {},
        cacheManager,
      };

      await runPipeline("p5js", ctx);

      // Verify rendered MP4 exists in cache
      const renderedPath = ctx.shared.get("renderedMp4Path") as string;
      expect(renderedPath).toBeTruthy();
      await expect(stat(renderedPath).then(() => true)).resolves.toBe(true);

      // Verify cache manifest was committed
      await cacheManager.loadManifest();
      const entry = cacheManager.getSync("p5js-runner");
      expect(entry).not.toBeNull();
      expect(entry!.renderedPath).toBe(renderedPath);

      // Verify originalPath was NOT mutated
      expect(asset.originalPath).toBe("sketch.p5.js");

      // Verify proxy was generated
      expect(asset.proxyPath).toContain("render-cache");

      await rm(dir, { recursive: true, force: true }).catch(() => {});
    },
    60_000,
  );
});
