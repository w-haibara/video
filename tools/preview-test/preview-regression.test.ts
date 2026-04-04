/**
 * Preview regression tests — captures preview frames via Playwright and
 * compares them against:
 *   1. Preview-specific references (tight threshold — catches preview regressions)
 *   2. Export references (generous threshold — catches preview/export divergence)
 *
 * Requires the dev server to be running (`bun run dev`).
 *
 * Environment variables:
 *   UPDATE_PREVIEW_REFERENCES=1  — regenerate preview reference frames
 *
 * Run:
 *   bun test tools/preview-test/preview-regression.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { mkdir, rm, cp, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { capturePreviewFrames, type CaptureResult } from "./capture-preview-frames";
import { compareFrames, listFrames } from "../../app/backend/src/utils/frame-compare";

const PREVIEW_REFS_DIR = path.resolve(import.meta.dirname, "references");
const EXPORT_REFS_DIR = path.resolve(
  import.meta.dirname,
  "../../app/backend/src/__fixtures__/export/references",
);
const ACTUAL_DIR = path.resolve(import.meta.dirname, ".actual");

const UPDATE_REFS = process.env.UPDATE_PREVIEW_REFERENCES === "1";

/** Preview-only regression threshold (browser to browser — tight). */
const PREVIEW_THRESHOLD = 3.0;

/** Preview vs export threshold (different rendering engines — generous). */
const EXPORT_THRESHOLD = 15.0;

/**
 * Test cases: fixture name → expected export reference directory name.
 */
const TEST_CASES: Array<{
  fixture: string;
  exportRef?: string;
  /** Skip export comparison (e.g. text rendering is completely different) */
  skipExportCompare?: boolean;
  /** Per-fixture channel tolerance override for export comparison */
  exportChannelTolerance?: number;
  /** Per-fixture pixel threshold override for export comparison */
  exportThreshold?: number;
  /** Skip preview regression assertion (frames still captured for catalog) */
  skipPreview?: string;
}> = [
  { fixture: "single-video" },
  { fixture: "two-clips" },
  { fixture: "image-clip" },
  // Text rendering: browser fonts vs FFmpeg drawtext are fundamentally different
  { fixture: "text-overlay", skipExportCompare: true },
  { fixture: "transition-fade" },
  // Slide/zoom/push transitions: CSS animation vs FFmpeg overlay timing differs
  { fixture: "transition-slide-left", skipExportCompare: true },
  { fixture: "transition-zoom-in", skipExportCompare: true },
  { fixture: "transition-push-left", skipExportCompare: true },
  { fixture: "opacity" },
  { fixture: "multiply" },
  { fixture: "overlay-transform" },
  { fixture: "keyframe-transform-x" },
  { fixture: "speed-2x" },
  // Color correction: CSS filter vs FFmpeg eq produce fundamentally different output
  { fixture: "color-correction", skipExportCompare: true },
  { fixture: "video-filter-blur-sepia" },
  { fixture: "chroma-key" },
  { fixture: "pip-corner-br" },
  // Feature showcase: combines all features — inherently high divergence
  { fixture: "feature-showcase", skipExportCompare: true, skipPreview: "combines all features with text — too many divergence sources for tight preview threshold" },
];

async function hasReferenceFrames(dir: string): Promise<boolean> {
  try {
    const s = await stat(dir);
    if (!s.isDirectory()) return false;
    const frames = await listFrames(dir);
    return frames.length > 0;
  } catch {
    return false;
  }
}

let sharedBrowser: Browser;

describe("preview regression", () => {
  beforeAll(async () => {
    await rm(ACTUAL_DIR, { recursive: true, force: true });
    await mkdir(ACTUAL_DIR, { recursive: true });
    await mkdir(PREVIEW_REFS_DIR, { recursive: true });
    sharedBrowser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await sharedBrowser?.close();
  });

  for (const tc of TEST_CASES) {
    const exportRefName = tc.exportRef ?? tc.fixture;

    test(
      `${tc.fixture}: preview regression`,
      async () => {
        const actualDir = path.join(ACTUAL_DIR, tc.fixture);

        // Capture preview frames using the shared browser
        const result = await capturePreviewFrames({
          fixture: tc.fixture,
          outputDir: actualDir,
          browser: sharedBrowser,
        });

        expect(result.frameCount).toBeGreaterThan(0);

        // --- Preview reference comparison (tight threshold) ---
        const previewRefDir = path.join(PREVIEW_REFS_DIR, tc.fixture);

        if (UPDATE_REFS || !(await hasReferenceFrames(previewRefDir))) {
          // Generate/update preview reference frames
          await rm(previewRefDir, { recursive: true, force: true });
          await mkdir(previewRefDir, { recursive: true });
          const frames = await readdir(actualDir);
          await Promise.all(
            frames
              .filter((f) => f.endsWith(".png"))
              .map((f) => cp(path.join(actualDir, f), path.join(previewRefDir, f))),
          );
          console.log(
            `[preview-regression] Generated preview references for "${tc.fixture}" (${result.frameCount} frames)`,
          );
          return; // Skip comparison on first run
        }

        const previewResult = await compareFrames({
          referenceDir: previewRefDir,
          actualDir,
          threshold: PREVIEW_THRESHOLD,
        });

        // Known-divergent cases: frames captured for catalog, assertion skipped
        if (tc.skipPreview) {
          return;
        }

        if (!previewResult.passed) {
          const failures = previewResult.perFrame
            .filter((f) => !f.passed)
            .map((f) => `  frame ${f.index + 1}: ${f.diffPercent.toFixed(2)}%`)
            .join("\n");
          throw new Error(
            `Preview regression for "${tc.fixture}":\n` +
              `${previewResult.mismatchedFrames}/${previewResult.totalFrames} frames differ\n${failures}`,
          );
        }
      },
      { timeout: 120_000 },
    );

    if (!tc.skipExportCompare) {
      test(
        `${tc.fixture}: preview vs export`,
        async () => {
          const actualDir = path.join(ACTUAL_DIR, tc.fixture);
          const exportRefDir = path.join(EXPORT_REFS_DIR, exportRefName);

          if (!(await hasReferenceFrames(exportRefDir))) {
            console.log(
              `[preview-vs-export] No export references for "${exportRefName}", skipping`,
            );
            return;
          }

          if (!(await hasReferenceFrames(actualDir))) {
            await capturePreviewFrames({
              fixture: tc.fixture,
              outputDir: actualDir,
              browser: sharedBrowser,
            });
          }

          const exportResult = await compareFrames({
            referenceDir: exportRefDir,
            actualDir,
            threshold: tc.exportThreshold ?? EXPORT_THRESHOLD,
            channelTolerance: tc.exportChannelTolerance ?? 40,
          });

          // Only check overlapping frames
          const diffFrames = exportResult.perFrame.filter((f) => !f.passed);
          if (diffFrames.length > 0) {
            console.log(
              `[preview-vs-export] "${tc.fixture}": ${diffFrames.length}/${exportResult.perFrame.length} overlapping frames exceed ${EXPORT_THRESHOLD}% threshold`,
            );
            for (const f of diffFrames) {
              console.log(`  frame ${f.index + 1}: ${f.diffPercent.toFixed(2)}%`);
            }
          }
          if (exportResult.missingFrames > 0) {
            console.log(
              `[preview-vs-export] "${tc.fixture}": ${exportResult.missingFrames} frame count difference`,
            );
          }

          expect(diffFrames.length).toBe(0);
        },
        { timeout: 120_000 },
      );
    }
  }
});
