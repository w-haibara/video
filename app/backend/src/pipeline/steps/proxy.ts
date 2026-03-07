import { join } from "node:path";
import type { PipelineStep } from "../types";
import { getProbeResult } from "../types";
import { ffmpegTool } from "../tools";

export const proxyStep: PipelineStep = {
  name: "proxy",

  canHandle: (ctx) => ctx.asset.kind === "video",

  async execute(ctx) {
    const probeResult = getProbeResult(ctx);
    const inputPath = join(ctx.projectDir, ctx.asset.originalPath);
    const outputPath = join(
      ctx.projectDir,
      "proxies",
      `${ctx.asset.id}.mp4`,
    );

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

    ctx.asset.proxyPath = `proxies/${ctx.asset.id}.mp4`;
  },
};
