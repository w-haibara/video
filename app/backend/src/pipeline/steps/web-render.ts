import type { PipelineStep } from "../types";
import type { RenderCacheManager } from "../../services/render-cache-manager";
import { chromiumTool } from "../tools/chromium";
import { join, dirname } from "node:path";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

/**
 * Resolve the mediabunny minified CJS browser bundle path.
 * The CJS bundle wraps everything in `var Mediabunny = (() => { ... })();`
 * so injecting it into a browser page makes `Mediabunny` available as a global.
 */
function resolveMediabunnyBundlePath(): string {
  // require.resolve("mediabunny") points to dist/bundles/mediabunny.cjs
  const cjsPath = require.resolve("mediabunny");
  return cjsPath.replace(/\.cjs$/, ".min.cjs");
}

export type WebRenderSettings = {
  width: number;
  height: number;
  fps: number;
  durationMs: number;
};

export const webRenderStep: PipelineStep = {
  name: "web-render",

  canHandle: (ctx) => ctx.shared.has("webRenderHtml"),

  async execute(ctx) {
    const html = ctx.shared.get("webRenderHtml") as string;
    const settings = ctx.shared.get("webRenderSettings") as WebRenderSettings;

    if (!html || !settings) {
      throw new Error(
        "web-render requires webRenderHtml and webRenderSettings in shared context",
      );
    }

    const { width, height, fps, durationMs } = settings;
    const totalFrames = Math.ceil((durationMs / 1000) * fps);

    // 1. Write HTML to temp file
    const tmpHtmlPath = join(
      tmpdir(),
      `web-render-${ctx.asset.id}-${Date.now()}.html`,
    );

    try {
      await writeFile(tmpHtmlPath, html);

      // 2. Output path — use render-cache when cacheManager is available, otherwise assets dir
      const cacheManager = ctx.cacheManager ?? ctx.shared.get("cacheManager") as RenderCacheManager | undefined;
      let outputPath: string;
      if (cacheManager) {
        outputPath = cacheManager.renderedMp4Path(ctx.asset.id);
        await mkdir(dirname(outputPath), { recursive: true });
      } else {
        const outputDir = join(ctx.projectDir, "assets");
        await mkdir(outputDir, { recursive: true });
        outputPath = join(outputDir, `${ctx.asset.id}-rendered.mp4`);
      }

      // 3. Launch Chromium and navigate
      const session = await chromiumTool.launch({ width, height });

      try {
        await session.navigate(`file://${tmpHtmlPath}`);

        // Wait for page to be ready (the page can set window.__ready = true)
        const maxWaitMs = 10_000;
        const pollInterval = 100;
        let waited = 0;
        while (waited < maxWaitMs) {
          const ready = await session.evaluate<boolean>(
            "typeof window.__ready !== 'undefined' ? window.__ready : true",
          );
          if (ready) break;
          await new Promise((r) => setTimeout(r, pollInterval));
          waited += pollInterval;
        }

        // 4. Inject mediabunny bundle into the page for in-browser encoding
        const bundlePath = resolveMediabunnyBundlePath();
        const bundleSource = await readFile(bundlePath, "utf-8");
        await session.evaluate<void>(bundleSource, { timeoutMs: 30_000 });

        // 5. Initialize WebCodecs encoder inside Chrome via mediabunny
        await session.evaluate<void>(`
          (async () => {
            const { Output, Mp4OutputFormat, BufferTarget, CanvasSource, canEncodeVideo } = Mediabunny;
            const canvas = document.querySelector('canvas');
            if (!canvas) throw new Error('No canvas element found');

            // Determine best available codec for MP4
            let codec = 'avc';
            if (!(await canEncodeVideo('avc'))) {
              if (await canEncodeVideo('vp9')) codec = 'vp9';
              else if (await canEncodeVideo('av1')) codec = 'av1';
              else throw new Error('No supported video codec available for encoding');
            }

            window.__canvasSource = new CanvasSource(canvas, {
              codec,
              bitrate: 8_000_000,
              keyFrameInterval: 1,
            });

            window.__target = new BufferTarget();
            window.__output = new Output({
              format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
              target: window.__target,
            });
            window.__output.addVideoTrack(window.__canvasSource, { frameRate: ${fps} });
            await window.__output.start();
          })()
        `);

        // 6. Capture frames and encode via WebCodecs
        for (let i = 0; i < totalFrames; i++) {
          await session.evaluate<void>(`
            (async () => {
              var __frameIndex = ${i};
              if (typeof window.__renderFrame === 'function') {
                window.__renderFrame(__frameIndex);
              }
              const timestamp = ${i} / ${fps};
              const duration = 1 / ${fps};
              await window.__canvasSource.add(timestamp, duration);
            })()
          `);
          ctx.reportProgress((i + 1) / totalFrames * 0.9);
        }

        // 7. Finalize and retrieve MP4 buffer
        const base64Mp4 = await session.evaluate<string>(`
          (async () => {
            await window.__output.finalize();
            const buffer = window.__target.buffer;
            const bytes = new Uint8Array(buffer);
            // Convert to base64 in chunks to avoid call stack limits
            const chunkSize = 32768;
            let binary = '';
            for (let i = 0; i < bytes.length; i += chunkSize) {
              binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
            }
            return btoa(binary);
          })()
        `, { timeoutMs: 60_000 });

        await writeFile(outputPath, Buffer.from(base64Mp4, "base64"));

        ctx.reportProgress(1.0);

        // 8. Store rendered path in shared context for downstream steps
        ctx.shared.set("renderedMp4Path", outputPath);
        if (cacheManager) {
          // Compute source hash for cache commit
          const { createHash } = await import("node:crypto");
          const { readFile: readFileAsync } = await import("node:fs/promises");
          const sourceData = await readFileAsync(join(ctx.projectDir, ctx.asset.originalPath));
          const sourceHash = createHash("sha256").update(sourceData).digest("hex");
          ctx.shared.set("sourceHash", sourceHash);
        }
      } finally {
        await session.close();
      }
    } finally {
      // Clean up temp HTML file in all paths (including Chromium launch failure)
      await rm(tmpHtmlPath, { force: true }).catch(() => {});
    }
  },
};
