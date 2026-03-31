/**
 * Capture compositor frames for a fixture project using Playwright.
 *
 * Uses the CompositorTestPage which renders via CanvasCompositor directly,
 * bypassing the PreviewPlayer DOM-based renderer.
 *
 * Requires the dev server running on http://localhost:5173 (frontend)
 * and http://localhost:3000 (backend).
 */
import { type Browser } from "playwright";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";

const API_BASE = "http://localhost:3000";
const FRONTEND_BASE = "http://localhost:5173";

export type CompositorCaptureOptions = {
  fixture: string;
  outputDir: string;
  /** Frames per second to capture (default: 10, matching export tests) */
  fps?: number;
  /** If true, skip cleanup of the fixture project on the server */
  keepProject?: boolean;
  /** Reuse an existing browser instance instead of launching a new one */
  browser?: Browser;
};

export type CompositorCaptureResult = {
  fixture: string;
  projectId: string;
  frameCount: number;
  canvasWidth: number;
  canvasHeight: number;
  contentDurationMs: number;
  fps: number;
  outputDir: string;
};

/**
 * Create a fixture project via the test-fixtures API and return its metadata.
 */
async function setupFixture(fixture: string) {
  const res = await fetch(`${API_BASE}/api/test/fixtures`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fixture }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to create fixture "${fixture}": ${res.status} ${body}`);
  }
  return res.json() as Promise<{
    id: string;
    fixture: string;
    canvasWidth: number;
    canvasHeight: number;
    durationMs: number;
    sequenceEndMs: number;
    fps: number;
  }>;
}

/**
 * Delete a fixture project via the test-fixtures API.
 */
async function cleanupFixture(projectId: string) {
  await fetch(`${API_BASE}/api/test/fixtures/${projectId}`, { method: "DELETE" });
}

/**
 * Capture all compositor frames for a fixture and save them as PNGs.
 */
export async function captureCompositorFrames(
  opts: CompositorCaptureOptions,
): Promise<CompositorCaptureResult> {
  const { fixture, outputDir } = opts;

  // 1. Setup fixture project on server
  const meta = await setupFixture(fixture);
  const fps = opts.fps ?? meta.fps;
  const frameIntervalMs = 1000 / fps;
  // Use sequenceEndMs (last clip end) to match export frame count
  const contentDurationMs = meta.sequenceEndMs || meta.durationMs;
  const totalFrames = Math.ceil(contentDurationMs / frameIntervalMs);

  // 2. Prepare output directory
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  // 3. Get or launch browser
  const ownBrowser = !opts.browser;
  const { chromium } = await import("playwright");
  const browser = opts.browser ?? await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: meta.canvasWidth + 40, height: meta.canvasHeight + 40 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    // 4. Capture frames — navigate to the exact time for each frame to avoid
    //    stale video source state when clips change between seeks.
    for (let i = 0; i < totalFrames; i++) {
      const timeMs = i * frameIntervalMs;

      // Navigate with the target time as initial param (ensures fresh source setup)
      await page.goto(
        `${FRONTEND_BASE}/compositor-test?project=${meta.id}&t=${timeMs}`,
        { waitUntil: "networkidle" },
      );

      // Wait for compositor to be ready (project loaded + media elements loaded)
      await page.waitForFunction(() => window.__compositorTest?.ready === true, {
        timeout: 15000,
      });

      // Wait for frame stability (video seek + render + paint)
      await page.waitForFunction(
        () => window.__compositorTest?.frameStable === true,
        { timeout: 10000 },
      );

      // Screenshot the canvas element
      const canvas = page.locator('[data-testid="compositor-canvas"]');
      await canvas.waitFor({ state: "visible", timeout: 5000 });

      const frameNum = String(i + 1).padStart(4, "0");
      const framePath = path.join(outputDir, `frame_${frameNum}.png`);
      await canvas.screenshot({ path: framePath });
    }

    return {
      fixture,
      projectId: meta.id,
      frameCount: totalFrames,
      canvasWidth: meta.canvasWidth,
      canvasHeight: meta.canvasHeight,
      contentDurationMs,
      fps,
      outputDir,
    };
  } finally {
    await context.close();
    if (ownBrowser) {
      await browser.close();
    }

    if (!opts.keepProject) {
      await cleanupFixture(meta.id);
    }
  }
}
