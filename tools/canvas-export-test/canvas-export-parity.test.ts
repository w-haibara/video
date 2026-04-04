/**
 * Canvas export parity tests — captures CanvasCompositor frames via Playwright
 * and compares them against FFmpeg export reference frames.
 *
 * This validates that the Canvas rendering pipeline produces visually similar
 * output to the FFmpeg export pipeline across ALL export regression fixtures.
 * Since the rendering engines differ (browser Canvas2D vs FFmpeg filter graphs),
 * generous thresholds are used for comparison.
 *
 * Requires the dev server to be running (`bun run dev`).
 *
 * Run:
 *   bun test tools/canvas-export-test/canvas-export-parity.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { captureCompositorFrames } from "../preview-test/capture-compositor-frames";
import { compareFrames, listFrames } from "../../app/backend/src/utils/frame-compare";

const EXPORT_REFS_DIR = path.resolve(
  import.meta.dirname,
  "../../app/backend/src/__fixtures__/export/references",
);
const ACTUAL_DIR = path.resolve(import.meta.dirname, ".actual");

/**
 * Default threshold for Canvas vs FFmpeg comparison.
 * Canvas2D and FFmpeg use different color spaces, interpolation, and
 * compositing algorithms, so we use generous thresholds.
 */
const DEFAULT_THRESHOLD = 15.0; // % of pixels allowed to differ
const DEFAULT_CHANNEL_TOLERANCE = 40; // per-channel (0-255)

/**
 * Comprehensive test case list matching export-regression fixtures.
 *
 * Each entry maps a fixture name (used with the test-fixtures API) to the
 * export reference directory name. Fixtures are skipped when the rendering
 * approach is fundamentally different between Canvas and FFmpeg.
 */
const PARITY_TESTS: Array<{
  /** Fixture name (passed to test-fixtures API) */
  fixture: string;
  /** Export reference directory name (defaults to fixture name) */
  exportRef?: string;
  /** Per-fixture pixel threshold override */
  threshold?: number;
  /** Per-fixture channel tolerance override */
  channelTolerance?: number;
  /** Skip reason (undefined = run the test) */
  skip?: string;
}> = [
  // --- Basic clips ---
  { fixture: "single-video" },
  { fixture: "two-clips" },
  { fixture: "image-clip" },

  // --- Text / title (browser fonts vs FFmpeg drawtext are fundamentally different) ---
  { fixture: "text-overlay", skip: "browser fonts vs FFmpeg drawtext" },
  { fixture: "title-font-align", skip: "browser fonts vs FFmpeg drawtext" },

  // --- Transform / crop ---
  { fixture: "crop-transform" },
  { fixture: "multi-track" },
  { fixture: "overlay-transform" },

  // --- Transitions ---
  { fixture: "transition-fade" },
  { fixture: "transition-fade-black" },
  { fixture: "transition-fade-white" },
  { fixture: "transition-slide-left", skip: "CSS animation vs FFmpeg overlay timing differs" },
  { fixture: "transition-slide-right", skip: "CSS animation vs FFmpeg overlay timing differs" },
  { fixture: "transition-slide-up", skip: "CSS animation vs FFmpeg overlay timing differs" },
  { fixture: "transition-slide-down", skip: "CSS animation vs FFmpeg overlay timing differs" },
  { fixture: "transition-wipe-left" },
  { fixture: "transition-wipe-up" },
  { fixture: "transition-zoom-in", skip: "CSS animation vs FFmpeg overlay timing differs" },
  { fixture: "transition-push-left", skip: "CSS animation vs FFmpeg overlay timing differs" },

  // --- Blend modes ---
  { fixture: "opacity", exportRef: "blend-opacity" },
  { fixture: "multiply", exportRef: "blend-multiply" },
  { fixture: "screen", exportRef: "blend-screen" },
  { fixture: "overlay-blend", exportRef: "blend-overlay" },
  { fixture: "add", exportRef: "blend-add" },
  { fixture: "difference", exportRef: "blend-difference" },

  // --- Cross-feature combos ---
  { fixture: "transition-with-transform" },
  { fixture: "transition-multi-track" },
  { fixture: "blend-mode-transition" },
  { fixture: "crop-blend" },

  // --- Keyframe animation ---
  { fixture: "keyframe-transform-x" },

  // --- Speed ---
  { fixture: "speed-2x" },
  { fixture: "speed-half" },
  { fixture: "speed-multi-clip" },
  { fixture: "speed-transition" },

  // --- Color correction (CSS filter vs FFmpeg eq produce different output) ---
  { fixture: "color-correction", skip: "CSS filter vs FFmpeg eq" },
  { fixture: "color-correction-hue", skip: "CSS filter vs FFmpeg eq" },
  { fixture: "color-correction-transform", skip: "CSS filter vs FFmpeg eq" },
  { fixture: "color-correction-video-filter", skip: "CSS filter vs FFmpeg eq" },
  { fixture: "keyframe-color-correction", skip: "CSS filter vs FFmpeg eq" },

  // --- Video filters ---
  { fixture: "video-filter-blur-sepia" },
  { fixture: "video-filter-grayscale" },
  { fixture: "video-filter-transform" },
  { fixture: "video-filter-transition" },

  // --- Chroma key ---
  { fixture: "chroma-key" },
  { fixture: "chroma-key-transform" },
  { fixture: "chroma-key-blend" },

  // --- Picture-in-picture ---
  { fixture: "pip-corner-br" },
  { fixture: "pip-side-by-side" },

  // --- p5.js rendering ---
  { fixture: "p5js-transform" },
  { fixture: "p5js-multi-track" },
  { fixture: "p5js-transition" },
  { fixture: "p5js-flowfield" },
  { fixture: "p5js-flowfield-multi-track", skip: "screen blend in YUV (FFmpeg) vs RGB (Canvas) produces large chroma divergence on dark p5js palette" },

  // --- Feature showcase (inherently high divergence) ---
  { fixture: "feature-showcase", skip: "combines all features with text — too many divergence sources" },
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

describe("canvas export parity", () => {
  beforeAll(async () => {
    await rm(ACTUAL_DIR, { recursive: true, force: true });
    await mkdir(ACTUAL_DIR, { recursive: true });
    sharedBrowser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await sharedBrowser?.close();
    // Keep actual frames in .actual/ for visual comparison in the feature catalog.
    // The directory is git-ignored. To clean up manually: rm -rf tools/canvas-export-test/.actual
  });

  for (const tc of PARITY_TESTS) {
    const exportRefName = tc.exportRef ?? tc.fixture;

    test(
      `${tc.fixture}: canvas vs export${tc.skip ? ` (known: ${tc.skip})` : ""}`,
      async () => {
        const exportRefDir = path.join(EXPORT_REFS_DIR, exportRefName);

        // Skip if no export reference frames exist yet
        if (!(await hasReferenceFrames(exportRefDir))) {
          console.log(
            `[canvas-export-parity] No export references for "${exportRefName}", skipping`,
          );
          return;
        }

        const actualDir = path.join(ACTUAL_DIR, tc.fixture);

        // Always capture frames — even for known-divergent cases — so
        // the feature catalog can display side-by-side comparisons.
        const result = await captureCompositorFrames({
          fixture: tc.fixture,
          outputDir: actualDir,
          browser: sharedBrowser,
        });

        expect(result.frameCount).toBeGreaterThan(0);

        // Compare against FFmpeg export reference frames
        const threshold = tc.threshold ?? DEFAULT_THRESHOLD;
        const channelTolerance = tc.channelTolerance ?? DEFAULT_CHANNEL_TOLERANCE;

        const compareResult = await compareFrames({
          referenceDir: exportRefDir,
          actualDir,
          threshold,
          channelTolerance,
        });

        // Log comparison details for debugging
        const diffFrames = compareResult.perFrame.filter((f) => !f.passed);
        if (diffFrames.length > 0) {
          console.log(
            `[canvas-export-parity] "${tc.fixture}": ${diffFrames.length}/${compareResult.perFrame.length} frames exceed ${threshold}% threshold`,
          );
          for (const f of diffFrames) {
            console.log(`  frame ${f.index + 1}: ${f.diffPercent.toFixed(2)}%`);
          }
        }
        if (compareResult.missingFrames > 0) {
          console.log(
            `[canvas-export-parity] "${tc.fixture}": ${compareResult.missingFrames} frame count difference (canvas: ${result.frameCount}, export ref: ${compareResult.totalFrames})`,
          );
        }

        // Known-divergent cases: frames are captured above for the catalog,
        // but the comparison assertion is skipped.
        if (tc.skip) {
          return;
        }

        // Assert all overlapping frames match within threshold.
        // Ignore trailing missing frames — FFmpeg often encodes 1-2 extra
        // frames beyond sequenceEndMs due to encoder flush / GOP rounding.
        const pixelMismatches = compareResult.perFrame.filter((f) => !f.passed);
        if (pixelMismatches.length > 0) {
          const failures = pixelMismatches
            .map((f) => `  frame ${f.index + 1}: ${f.diffPercent.toFixed(2)}%`)
            .join("\n");
          throw new Error(
            `Canvas export parity failed for "${tc.fixture}" (threshold: ${threshold}%, channelTolerance: ${channelTolerance}):\n` +
              `${pixelMismatches.length}/${compareResult.perFrame.length} overlapping frames differ\n${failures}`,
          );
        }
      },
      { timeout: 120_000 },
    );
  }
});
