import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { mkdtemp, rm, mkdir, cp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Project } from "@video/shared";
import { exportProject } from "./export-runner";
import { extractFrames } from "../utils/frame-extract";
import { compareFrames, listFrames } from "../utils/frame-compare";
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
  makeOpacityProject,
  makeMultiplyProject,
  makeScreenProject,
  makeOverlayBlendProject,
  makeAddProject,
  makeDifferenceProject,
  makeP5jsProject,
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
) {
  const testDir = path.join(tmpDir, testName);
  const outputPath = path.join(testDir, "output.mp4");
  const actualFramesDir = path.join(testDir, "frames");

  // Export
  await exportProject(project, ASSETS_DIR, outputPath);

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

  test("p5.js clip (pre-rendered)", async () => {
    await runExportRegression("p5js-clip", makeP5jsProject());
  }, 30_000);
});
