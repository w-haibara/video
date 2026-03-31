/**
 * Compositor parity tests — captures CanvasCompositor frames via Playwright
 * and compares them against export reference frames.
 *
 * This proves the Canvas renderer produces the same visual output as the
 * FFmpeg export pipeline, which is the foundation for preview/export
 * unification.
 *
 * Requires the dev server to be running (`bun run dev`).
 *
 * Run:
 *   bun test tools/preview-test/compositor-parity.test.ts
 */
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { chromium, type Browser } from "playwright";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { captureCompositorFrames } from "./capture-compositor-frames";
import { compareFrames, listFrames } from "../../app/backend/src/utils/frame-compare";

const EXPORT_REFS_DIR = path.resolve(
  import.meta.dirname,
  "../../app/backend/src/__fixtures__/export/references",
);
const ACTUAL_DIR = path.resolve(import.meta.dirname, ".compositor-actual");

/**
 * Compositor vs export threshold.
 *
 * This should be tighter than the preview-vs-export threshold (15%) because
 * CanvasCompositor uses similar rendering approaches. Remaining differences:
 * - Video decode color space (browser vs FFmpeg)
 * - Text rendering (Canvas fillText vs FFmpeg drawtext)
 * - Anti-aliasing / sub-pixel differences
 * - Grain/noise effects (random per frame)
 */
const DEFAULT_THRESHOLD = 10.0;

/** Per-channel tolerance before a pixel counts as different. */
// Browser video decoder and FFmpeg decoder produce slightly different YUV→RGB
// conversions (e.g., G channel can differ by ~25).  Once both preview and
// export use browser decode (Phase 10 complete), this can be tightened.
const DEFAULT_CHANNEL_TOLERANCE = 30;

/**
 * Test cases: fixture name and optional overrides.
 *
 * Start with fixtures that have straightforward rendering (no text, no grain)
 * so the comparison is meaningful.
 */
const TEST_CASES: Array<{
  fixture: string;
  /** Export reference directory name (defaults to fixture name) */
  exportRef?: string;
  /** Skip this test case */
  skip?: boolean;
  /** Reason for skip */
  skipReason?: string;
  /** Per-fixture channel tolerance override */
  channelTolerance?: number;
  /** Per-fixture pixel threshold override */
  threshold?: number;
}> = [
  { fixture: "single-video" },
  { fixture: "image-clip" },
  { fixture: "two-clips" },
  { fixture: "opacity", exportRef: "blend-opacity" },
  // Transition: CSS opacity animation vs FFmpeg overlay timing — skip until unified
  { fixture: "transition-fade", skip: true, skipReason: "CSS transition vs FFmpeg overlay" },
  { fixture: "multiply", exportRef: "blend-multiply" },
  { fixture: "overlay-transform" },
  { fixture: "keyframe-transform-x" },
  { fixture: "speed-2x" },
  { fixture: "pip-corner-br" },
  // Text rendering is fundamentally different (Canvas fillText vs FFmpeg drawtext)
  {
    fixture: "text-overlay",
    skip: true,
    skipReason: "text rendering differs between Canvas and FFmpeg",
  },
  // Video filters: ctx.filter vs FFmpeg filter — skip until unified
  { fixture: "video-filter-blur-sepia", skip: true, skipReason: "ctx.filter vs FFmpeg filter" },
  // Color correction: ctx.filter vs FFmpeg eq — skip until unified
  { fixture: "color-correction", skip: true, skipReason: "ctx.filter vs FFmpeg eq" },
  // Chroma key: WebGL shader vs FFmpeg colorkey — decode path differences
  { fixture: "chroma-key" },
  // Feature showcase: combines many features — inherently higher divergence
  {
    fixture: "feature-showcase",
    skip: true,
    skipReason: "combines all features with text — too many divergence sources",
  },
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

describe("compositor parity", () => {
  beforeAll(async () => {
    await rm(ACTUAL_DIR, { recursive: true, force: true });
    await mkdir(ACTUAL_DIR, { recursive: true });
    sharedBrowser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await sharedBrowser?.close();
  });

  for (const tc of TEST_CASES) {
    if (tc.skip) {
      test.skip(`${tc.fixture}: compositor vs export (${tc.skipReason})`, () => {});
      continue;
    }

    const exportRefName = tc.exportRef ?? tc.fixture;

    test(
      `${tc.fixture}: compositor vs export`,
      async () => {
        const exportRefDir = path.join(EXPORT_REFS_DIR, exportRefName);

        if (!(await hasReferenceFrames(exportRefDir))) {
          console.log(
            `[compositor-parity] No export references for "${exportRefName}", skipping`,
          );
          return;
        }

        const actualDir = path.join(ACTUAL_DIR, tc.fixture);

        // Capture compositor frames using the shared browser
        const result = await captureCompositorFrames({
          fixture: tc.fixture,
          outputDir: actualDir,
          browser: sharedBrowser,
        });

        expect(result.frameCount).toBeGreaterThan(0);

        // Compare with export reference frames
        const threshold = tc.threshold ?? DEFAULT_THRESHOLD;
        const channelTolerance = tc.channelTolerance ?? DEFAULT_CHANNEL_TOLERANCE;

        const compareResult = await compareFrames({
          referenceDir: exportRefDir,
          actualDir,
          threshold,
          channelTolerance,
        });

        // Log results for visibility
        const diffFrames = compareResult.perFrame.filter((f) => !f.passed);
        if (diffFrames.length > 0) {
          console.log(
            `[compositor-parity] "${tc.fixture}": ${diffFrames.length}/${compareResult.perFrame.length} frames exceed ${threshold}% threshold (channelTolerance=${channelTolerance})`,
          );
          for (const f of diffFrames) {
            console.log(`  frame ${f.index + 1}: ${f.diffPercent.toFixed(2)}%`);
          }
        }
        if (compareResult.missingFrames > 0) {
          console.log(
            `[compositor-parity] "${tc.fixture}": ${compareResult.missingFrames} frame count difference`,
          );
        }

        // Assert overlapping frames match (ignore frame count differences
        // caused by export vs compositor duration calculation)
        if (diffFrames.length > 0) {
          const failures = diffFrames
            .map((f) => `  frame ${f.index + 1}: ${f.diffPercent.toFixed(2)}%`)
            .join("\n");
          throw new Error(
            `Compositor parity failed for "${tc.fixture}" (threshold=${threshold}%, channelTolerance=${channelTolerance}):\n` +
              `${diffFrames.length}/${compareResult.perFrame.length} overlapping frames differ\n${failures}`,
          );
        }
      },
      { timeout: 120_000 },
    );
  }
});
