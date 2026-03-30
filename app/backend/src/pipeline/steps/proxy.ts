import { join, dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import type { PipelineStep } from "../types";
import { getProbeResult } from "../types";
import type { RenderCacheManager } from "../../services/render-cache-manager";
import { ffmpegTool } from "../tools";

export const proxyStep: PipelineStep = {
  name: "proxy",

  canHandle: (ctx) => ctx.asset.kind === "video" || (ctx.shared.has("renderedMp4Path") && ctx.asset.kind !== "audio"),

  async execute(ctx) {
    const probeResult = getProbeResult(ctx);

    // Use rendered MP4 as input if available (generative assets)
    const renderedMp4Path = ctx.shared.get("renderedMp4Path") as string | undefined;
    const inputPath = renderedMp4Path ?? join(ctx.projectDir, ctx.asset.originalPath);

    const cacheManager = ctx.cacheManager ?? ctx.shared.get("cacheManager") as RenderCacheManager | undefined;
    let outputPath: string;
    let proxyRelPath: string;

    if (cacheManager) {
      outputPath = cacheManager.absoluteProxyPath(ctx.asset.id);
      proxyRelPath = cacheManager.relativeProxyPath(ctx.asset.id);
      await mkdir(dirname(outputPath), { recursive: true });
    } else {
      outputPath = join(ctx.projectDir, "proxies", `${ctx.asset.id}.mp4`);
      proxyRelPath = `proxies/${ctx.asset.id}.mp4`;
    }

    const totalUs = probeResult.durationMs
      ? probeResult.durationMs * 1000
      : undefined;

    await ffmpegTool.generateProxy(
      inputPath,
      outputPath,
      { isHdr: probeResult.isHdr },
      totalUs
        ? (outTimeUs) => {
            ctx.reportProgress(Math.min(outTimeUs / totalUs, 1));
          }
        : undefined,
    );

    ctx.asset.proxyPath = proxyRelPath;
  },
};
