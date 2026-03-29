import type { PipelineStep } from "../types";
import { chromiumTool } from "../tools/chromium";
import { join } from "node:path";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

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

      // 2. Output path in assets dir
      const outputDir = join(ctx.projectDir, "assets");
      await mkdir(outputDir, { recursive: true });
      const outputPath = join(outputDir, `${ctx.asset.id}-rendered.mp4`);

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

        // 4. Spawn ffmpeg to receive PNG frames on stdin (image2pipe)
        const ffmpegArgs = [
          "-y",
          "-f",
          "image2pipe",
          "-framerate",
          String(fps),
          "-i",
          "pipe:0",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-preset",
          "fast",
          "-crf",
          "23",
          "-r",
          String(fps),
          "-movflags",
          "+faststart",
          outputPath,
        ];

        const ffmpegProc = Bun.spawn(["ffmpeg", ...ffmpegArgs], {
          stdin: "pipe",
          stdout: "ignore",
          stderr: "pipe",
        });

        // Start draining stderr concurrently to prevent deadlock
        const stderrPromise = ffmpegProc.stderr
          ? new Response(ffmpegProc.stderr).text()
          : Promise.resolve("");

        try {
          // 5. Capture frames and pipe to ffmpeg
          const renderExpression = `
            (function() {
              if (typeof window.__renderFrame === 'function') {
                window.__renderFrame(__frameIndex);
              }
              // Find the first canvas element and return its data URL
              const canvas = document.querySelector('canvas');
              if (!canvas) throw new Error('No canvas element found');
              return canvas.toDataURL('image/png');
            })()
          `;

          const frames = session.captureFrames({
            totalFrames,
            fps,
            renderExpression,
            onProgress: (fraction) => ctx.reportProgress(fraction * 0.9),
          });

          const writer = ffmpegProc.stdin!;
          for await (const pngBuffer of frames) {
            writer.write(pngBuffer);
          }
          writer.end();
        } catch (err) {
          // Kill ffmpeg if frame capture fails to prevent hanging
          try { ffmpegProc.kill(); } catch { /* ignore */ }
          throw err;
        }

        // 6. Wait for ffmpeg to finish
        const [exitCode, stderrText] = await Promise.all([
          ffmpegProc.exited,
          stderrPromise,
        ]);
        if (exitCode !== 0) {
          throw new Error(
            `web-render ffmpeg failed (exit ${exitCode}): ${stderrText}`,
          );
        }

        ctx.reportProgress(1.0);

        // 7. Update asset's originalPath to point to the rendered MP4
        ctx.asset.originalPath = `assets/${ctx.asset.id}-rendered.mp4`;
      } finally {
        await session.close();
      }
    } finally {
      // Clean up temp HTML file in all paths (including Chromium launch failure)
      await rm(tmpHtmlPath, { force: true }).catch(() => {});
    }
  },
};
