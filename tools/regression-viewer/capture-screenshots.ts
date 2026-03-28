/**
 * Capture full-page screenshots of all regression viewer pages.
 *
 * Prerequisites: regression viewer running on localhost:3001
 *   bun run view:regression &
 *
 * Usage:
 *   bunx playwright screenshot-pages   # (not used — this script is run directly)
 *   bun run tools/regression-viewer/capture-screenshots.ts
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = `http://localhost:${process.env.PORT || "3001"}`;
const OUT_DIR = path.resolve(import.meta.dir, "screenshots");

async function main() {
  // Verify viewer is reachable
  try {
    await fetch(`${BASE_URL}/api/exports`);
  } catch {
    console.error("Regression viewer is not running. Start it first: bun run view:regression");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  /** Navigate to url, force-load all lazy images/videos, then screenshot. */
  async function captureFullPage(url: string, outPath: string) {
    await page.goto(url, { waitUntil: "networkidle" });

    // Force all lazy-loaded images and videos to load by removing loading="lazy"
    // and setting eager src, then wait for them to complete.
    await page.evaluate(async () => {
      const mediaElements = document.querySelectorAll<HTMLImageElement | HTMLVideoElement>(
        'img[loading="lazy"], video[loading="lazy"]',
      );
      for (const el of mediaElements) {
        el.removeAttribute("loading");
        // Re-trigger load by reassigning src
        const src = el.getAttribute("src");
        if (src) {
          el.removeAttribute("src");
          el.setAttribute("src", src);
        }
      }

      // Wait for all images to finish loading
      const images = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        images.map(
          (img) =>
            img.complete ||
            new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );

      // Wait for all videos to have enough data to show a frame
      const videos = Array.from(document.querySelectorAll("video"));
      await Promise.all(
        videos.map(
          (v) =>
            v.readyState >= 2 ||
            new Promise<void>((resolve) => {
              v.addEventListener("loadeddata", () => resolve(), { once: true });
              v.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );
    });

    await page.screenshot({ path: outPath, fullPage: true });
  }

  // Fetch test case lists from API
  const [exports, snapshots] = await Promise.all([
    fetch(`${BASE_URL}/api/exports`).then((r) => r.json()) as Promise<{ name: string }[]>,
    fetch(`${BASE_URL}/api/snapshots`).then((r) => r.json()) as Promise<{ name: string }[]>,
  ]);

  // Capture export pages
  const exportsDir = path.join(OUT_DIR, "exports");
  await mkdir(exportsDir, { recursive: true });

  for (const tc of exports) {
    const url = `${BASE_URL}/exports/${encodeURIComponent(tc.name)}`;
    await captureFullPage(url, path.join(exportsDir, `${tc.name}.png`));
    console.log(`  exports/${tc.name}.png`);
  }

  // Capture snapshot pages
  const snapshotsDir = path.join(OUT_DIR, "snapshots");
  await mkdir(snapshotsDir, { recursive: true });

  for (let i = 0; i < snapshots.length; i++) {
    const url = `${BASE_URL}/snapshots/${i}`;
    const slug = String(i).padStart(2, "0");
    await captureFullPage(url, path.join(snapshotsDir, `${slug}.png`));
    console.log(`  snapshots/${slug}.png`);
  }

  await browser.close();
  console.log(`Done: ${exports.length} exports + ${snapshots.length} snapshots`);
}

main();
