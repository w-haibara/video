import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtemp, rm, mkdir, cp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Project, Asset } from "@video/shared";
import { exportProject } from "./export-runner";
import { extractFrames } from "../utils/frame-extract";
import { compareFrames, listFrames } from "../utils/frame-compare";
import { generativePrepareStep } from "../pipeline/steps/generative-prepare";
import { webRenderStep } from "../pipeline/steps/web-render";
import type { PipelineContext } from "../pipeline/types";
import {
  makeSingleVideoProject,
  makeTwoClipProject,
  makeImageClipProject,
  makeTextOverlayProject,
  makeCropTransformProject,
  makeMultiTrackProject,
  makeOverlayTransformProject,
  makeFadeTransitionProject,
  makeFadeBlackTransitionProject,
  makeFadeWhiteTransitionProject,
  makeSlideLeftTransitionProject,
  makeSlideRightTransitionProject,
  makeSlideUpTransitionProject,
  makeSlideDownTransitionProject,
  makeWipeLeftTransitionProject,
  makeWipeUpTransitionProject,
  makeZoomInTransitionProject,
  makePushLeftTransitionProject,
  makeOpacityProject,
  makeMultiplyProject,
  makeScreenProject,
  makeOverlayBlendProject,
  makeAddProject,
  makeDifferenceProject,
  makeP5jsProject,
  makeSplitClipProject,
  makeEmptyAssetMixedProject,
  makeOnlyEmptyAssetProject,
  makeMutedTrackProject,
  makeTransitionWithTransformProject,
  makeTransitionMultiTrackProject,
  makeBlendModeTransitionProject,
  makeCropBlendProject,
  makeTitleFontAlignProject,
  makeKeyframeTransformXProject,
  makeSpeed2xProject,
  makeSpeedHalfProject,
  makeSpeedMultiClipProject,
  makeColorCorrectionProject,
  makeColorCorrectionHueProject,
  makeColorCorrectionTransformProject,
  makeVideoFilterBlurSepiaProject,
  makeVideoFilterGrayscaleProject,
  makeVideoFilterTransformProject,
  CANVAS_W,
  CANVAS_H,
  FPS,
} from "../__fixtures__/export/make-fixture-project";

const FIXTURES_DIR = path.resolve(__dirname, "../__fixtures__/export");
const ASSETS_DIR = path.join(FIXTURES_DIR, "assets");
const REFERENCES_DIR = path.join(FIXTURES_DIR, "references");

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "export-regression-"));
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

async function hasReferenceFrames(dir: string): Promise<boolean> {
  try {
    return (await listFrames(dir)).length > 0;
  } catch {
    return false;
  }
}

async function runExportRegression(
  testName: string,
  project: Project,
  assetsDir: string = ASSETS_DIR,
) {
  const testDir = path.join(tmpDir, testName);
  const outputPath = path.join(testDir, "output.mp4");
  const actualFramesDir = path.join(testDir, "frames");

  // Export
  await exportProject(project, assetsDir, outputPath);

  // Extract frames
  const frames = await extractFrames({
    inputPath: outputPath,
    outputDir: actualFramesDir,
    fps: FPS,
    width: CANVAS_W,
    height: CANVAS_H,
  });
  expect(frames.length).toBeGreaterThan(0);

  // Reference management
  const refDir = path.join(REFERENCES_DIR, testName);
  const updateRefs = process.env.UPDATE_REFERENCES === "1";

  if (updateRefs || !(await hasReferenceFrames(refDir))) {
    // Generate reference frames
    await rm(refDir, { recursive: true, force: true });
    await mkdir(refDir, { recursive: true });
    await Promise.all(frames.map((frame) =>
      cp(frame, path.join(refDir, path.basename(frame)))
    ));
    console.log(`[regression] Generated reference frames for "${testName}" (${frames.length} frames)`);
    return;
  }

  // Compare with reference
  const result = await compareFrames({
    referenceDir: refDir,
    actualDir: actualFramesDir,
    threshold: 2.0,
  });

  if (!result.passed) {
    const failures = result.perFrame
      .filter((f) => !f.passed)
      .map((f) => `  frame ${f.index}: ${f.diffPercent.toFixed(2)}% diff`)
      .join("\n");
    const msg = [
      `Frame comparison failed for "${testName}"`,
      `  total=${result.totalFrames} matched=${result.matchedFrames} mismatched=${result.mismatchedFrames} missing=${result.missingFrames}`,
      failures,
    ].join("\n");
    expect(result.passed, msg).toBe(true);
  }
}

describe("export regression", () => {
  test("single video clip", async () => {
    await runExportRegression("single-video", makeSingleVideoProject());
  }, 30_000);

  test("two sequential clips", async () => {
    await runExportRegression("two-clips", makeTwoClipProject());
  }, 30_000);

  test("image clip", async () => {
    await runExportRegression("image-clip", makeImageClipProject());
  }, 30_000);

  test("text overlay", async () => {
    await runExportRegression("text-overlay", makeTextOverlayProject());
  }, 30_000);

  test("crop and transform", async () => {
    await runExportRegression("crop-transform", makeCropTransformProject());
  }, 30_000);

  test("multi-track overlay", async () => {
    await runExportRegression("multi-track", makeMultiTrackProject());
  }, 30_000);

  test("overlay with transform (bottom clip visibility)", async () => {
    await runExportRegression("overlay-transform", makeOverlayTransformProject());
  }, 30_000);

  test("fade transition between clips", async () => {
    await runExportRegression("transition-fade", makeFadeTransitionProject());
  }, 30_000);

  test("transition: fade-black", async () => {
    await runExportRegression("transition-fade-black", makeFadeBlackTransitionProject());
  }, 30_000);

  test("transition: fade-white", async () => {
    await runExportRegression("transition-fade-white", makeFadeWhiteTransitionProject());
  }, 30_000);

  test("transition: slide-left", async () => {
    await runExportRegression("transition-slide-left", makeSlideLeftTransitionProject());
  }, 30_000);

  test("transition: slide-right", async () => {
    await runExportRegression("transition-slide-right", makeSlideRightTransitionProject());
  }, 30_000);

  test("transition: slide-up", async () => {
    await runExportRegression("transition-slide-up", makeSlideUpTransitionProject());
  }, 30_000);

  test("transition: slide-down", async () => {
    await runExportRegression("transition-slide-down", makeSlideDownTransitionProject());
  }, 30_000);

  test("transition: wipe-left", async () => {
    await runExportRegression("transition-wipe-left", makeWipeLeftTransitionProject());
  }, 30_000);

  test("transition: wipe-up", async () => {
    await runExportRegression("transition-wipe-up", makeWipeUpTransitionProject());
  }, 30_000);

  test("transition: zoom-in", async () => {
    await runExportRegression("transition-zoom-in", makeZoomInTransitionProject());
  }, 30_000);

  test("transition: push-left", async () => {
    await runExportRegression("transition-push-left", makePushLeftTransitionProject());
  }, 30_000);

  test("blend: opacity", async () => {
    await runExportRegression("blend-opacity", makeOpacityProject());
  }, 30_000);

  test("blend: multiply", async () => {
    await runExportRegression("blend-multiply", makeMultiplyProject());
  }, 30_000);

  test("blend: screen", async () => {
    await runExportRegression("blend-screen", makeScreenProject());
  }, 30_000);

  test("blend: overlay", async () => {
    await runExportRegression("blend-overlay", makeOverlayBlendProject());
  }, 30_000);

  test("blend: add", async () => {
    await runExportRegression("blend-add", makeAddProject());
  }, 30_000);

  test("blend: difference", async () => {
    await runExportRegression("blend-difference", makeDifferenceProject());
  }, 30_000);

  test("split clip (two halves of same source)", async () => {
    await runExportRegression("split-clip", makeSplitClipProject());
  }, 30_000);

  test("empty-asset clip mixed with video (empty skipped)", async () => {
    await runExportRegression("empty-asset-mixed", makeEmptyAssetMixedProject());
  }, 30_000);

  test("only empty-asset clips (should throw)", async () => {
    expect(() => {
      const project = makeOnlyEmptyAssetProject();
      const { buildExportArgs } = require("./export-service");
      buildExportArgs(project, ASSETS_DIR, "/tmp/test-output.mp4");
    }).toThrow("No video clips to export");
  });

  test("muted track excluded from export", async () => {
    await runExportRegression("muted-track", makeMutedTrackProject());
  }, 30_000);

  test("transition with transform cross-feature", async () => {
    await runExportRegression("transition-with-transform", makeTransitionWithTransformProject());
  }, 30_000);

  test("transition + multi-track overlay", async () => {
    await runExportRegression("transition-multi-track", makeTransitionMultiTrackProject());
  }, 30_000);

  test("blend mode + transition cross-feature", async () => {
    await runExportRegression("blend-mode-transition", makeBlendModeTransitionProject());
  }, 30_000);

  test("crop + blend mode cross-feature", async () => {
    await runExportRegression("crop-blend", makeCropBlendProject());
  }, 30_000);

  test("title with fontFamily and align", async () => {
    await runExportRegression("title-font-align", makeTitleFontAlignProject());
  }, 30_000);

  test("speed: 2x video clip", async () => {
    await runExportRegression("speed-2x", makeSpeed2xProject());
  }, 30_000);

  test("speed: 0.5x video clip", async () => {
    await runExportRegression("speed-half", makeSpeedHalfProject());
  }, 30_000);

  test("speed: multi-clip with speed change on first clip", async () => {
    await runExportRegression("speed-multi-clip", makeSpeedMultiClipProject());
  }, 30_000);

  test("keyframe animated transform.x (horizontal movement)", async () => {
    await runExportRegression("keyframe-transform-x", makeKeyframeTransformXProject());
  }, 30_000);

  test("color correction (brightness + contrast + saturation)", async () => {
    await runExportRegression("color-correction", makeColorCorrectionProject());
  }, 30_000);

  test("color correction (hue rotation)", async () => {
    await runExportRegression("color-correction-hue", makeColorCorrectionHueProject());
  }, 30_000);

  test("color correction + transform cross-feature", async () => {
    await runExportRegression("color-correction-transform", makeColorCorrectionTransformProject());
  }, 30_000);

  test("video filter: blur + sepia", async () => {
    await runExportRegression("video-filter-blur-sepia", makeVideoFilterBlurSepiaProject());
  }, 30_000);

  test("video filter: grayscale", async () => {
    await runExportRegression("video-filter-grayscale", makeVideoFilterGrayscaleProject());
  }, 30_000);

  test("video filter + transform cross-feature", async () => {
    await runExportRegression("video-filter-transform", makeVideoFilterTransformProject());
  }, 30_000);

  test("p5.js clip (rendered from sketch)", async () => {
    // 1. Read sketch source and set up a temp project dir with the sketch
    const sketchCode = await readFile(
      path.join(ASSETS_DIR, "test-sketch.p5.js"),
      "utf-8",
    );
    const projDir = path.join(tmpDir, "p5js-rendered-project");
    await mkdir(projDir, { recursive: true });
    await writeFile(path.join(projDir, "sketch.p5.js"), sketchCode);

    // 2. Run p5js pipeline: generative-prepare → web-render
    const asset: Asset = {
      id: "p5js-rendered",
      kind: "p5js",
      originalPath: "sketch.p5.js",
      durationMs: 1000,
      width: CANVAS_W,
      height: CANVAS_H,
    };
    const shared = new Map<string, unknown>([
      ["canvasWidth", CANVAS_W],
      ["canvasHeight", CANVAS_H],
      ["fps", FPS],
      ["durationMs", 1000],
    ]);
    const ctx: PipelineContext = {
      asset,
      projectDir: projDir,
      projectId: "p5js-render-test",
      shared,
      reportProgress: () => {},
    };
    await generativePrepareStep.execute(ctx);
    await webRenderStep.execute(ctx);

    // 3. Build project pointing to the rendered MP4
    //    The rendered MP4 path is stored in shared context
    const renderedMp4Path = ctx.shared.get("renderedMp4Path") as string;
    const project: Project = {
      id: "p5js-render-test",
      name: "p5js render test",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      assets: [ctx.asset],
      sequence: {
        tracks: [{
          id: "t1",
          clips: [{
            id: "c1",
            clipKind: "p5js",
            assetId: "p5js-rendered",
            startMs: 0,
            durationMs: 1000,
            inMs: 0,
            outMs: 1000,
          }],
        }],
      },
      settings: { durationMs: 2000, canvasWidth: CANVAS_W, canvasHeight: CANVAS_H },
      exportPreset: {
        width: CANVAS_W,
        height: CANVAS_H,
        fps: FPS,
        videoBitrate: "200k",
        audioBitrate: "64k",
      },
    };

    // 4. Export using a custom resolveAssetVideoPath that points to the rendered MP4
    const { buildExportArgs } = await import("./export-service");
    const testDir = path.join(tmpDir, "p5js-rendered");
    const outputPath = path.join(testDir, "output.mp4");
    const actualFramesDir = path.join(testDir, "frames");

    const resolveAssetVideoPath = (a: Asset) => {
      if (a.kind === "p5js") return renderedMp4Path;
      return path.join(ASSETS_DIR, path.basename(a.originalPath));
    };
    const args = buildExportArgs(project, ASSETS_DIR, outputPath, resolveAssetVideoPath);

    await mkdir(path.dirname(outputPath), { recursive: true });
    const proc = Bun.spawn(["ffmpeg", ...args], { stdout: "pipe", stderr: "pipe" });
    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text();
      throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
    }

    // Extract frames
    const { extractFrames } = await import("../utils/frame-extract");
    const frames = await extractFrames({
      inputPath: outputPath,
      outputDir: actualFramesDir,
      fps: FPS,
      width: CANVAS_W,
      height: CANVAS_H,
    });
    expect(frames.length).toBeGreaterThan(0);

    // Reference management
    const refDir = path.join(REFERENCES_DIR, "p5js-rendered");
    const updateRefs = process.env.UPDATE_REFERENCES === "1";

    if (updateRefs || !(await hasReferenceFrames(refDir))) {
      await rm(refDir, { recursive: true, force: true });
      await mkdir(refDir, { recursive: true });
      await Promise.all(frames.map((frame) =>
        cp(frame, path.join(refDir, path.basename(frame)))
      ));
      console.log(`[regression] Generated reference frames for "p5js-rendered" (${frames.length} frames)`);
      return;
    }

    const result = await compareFrames({
      referenceDir: refDir,
      actualDir: actualFramesDir,
      threshold: 2.0,
    });

    if (!result.passed) {
      const failures = result.perFrame
        .filter((f) => !f.passed)
        .map((f) => `  frame ${f.index}: ${f.diffPercent.toFixed(2)}% diff`)
        .join("\n");
      expect(result.passed, `Frame comparison failed for "p5js-rendered"\n${failures}`).toBe(true);
    }
  }, 60_000);
});
