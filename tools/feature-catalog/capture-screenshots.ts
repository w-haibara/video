/**
 * Capture full-page screenshots of all feature catalog pages.
 *
 * Prerequisites: feature catalog running on localhost:3001
 *   bun run catalog &
 *
 * Usage:
 *   bun run catalog:capture
 */

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = `http://localhost:${process.env.PORT || "3001"}`;
const OUT_DIR = path.resolve(import.meta.dir, "screenshots");

const MEDIA_LOAD_TIMEOUT = 10_000;

async function main() {
  // Fetch test case lists (also serves as liveness check)
  let exports: { name: string }[];
  let snapshots: { name: string }[];
  try {
    [exports, snapshots] = await Promise.all([
      fetch(`${BASE_URL}/api/exports`).then((r) => r.json()) as Promise<{ name: string }[]>,
      fetch(`${BASE_URL}/api/snapshots`).then((r) => r.json()) as Promise<{ name: string }[]>,
    ]);
  } catch {
    console.error("Feature catalog is not running. Start it first: bun run catalog");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  /** Navigate to url, force-load all lazy images/videos, then screenshot. */
  async function captureFullPage(url: string, outPath: string) {
    await page.goto(url, { waitUntil: "networkidle" });

    // Force lazy-loaded media to load, with a timeout to avoid hanging on broken resources
    await Promise.race([
      page.evaluate(async () => {
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
            new Promise<void>((resolve) => {
              if (img.complete) { resolve(); return; }
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
            new Promise<void>((resolve) => {
              if (v.readyState >= 2) { resolve(); return; }
              v.addEventListener("loadeddata", () => resolve(), { once: true });
              v.addEventListener("error", () => resolve(), { once: true });
            }),
        ),
      );
    }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("media load timeout")), MEDIA_LOAD_TIMEOUT)),
    ]).catch(() => {}); // proceed with screenshot even on timeout

    await page.screenshot({ path: outPath, fullPage: true });
  }

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
