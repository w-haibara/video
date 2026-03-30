import { join, dirname } from "node:path";
import { mkdir } from "node:fs/promises";
import type { PipelineStep } from "../types";
import type { RenderCacheManager } from "../../services/render-cache-manager";
import { ffmpegTool } from "../tools";

export const thumbnailStep: PipelineStep = {
  name: "thumbnail",

  canHandle: (ctx) => ctx.asset.kind !== "audio",

  async execute(ctx) {
    // Use rendered MP4 as input if available (generative assets)
    const renderedMp4Path = ctx.shared.get("renderedMp4Path") as string | undefined;
    const inputPath = renderedMp4Path ?? join(ctx.projectDir, ctx.asset.originalPath);

    const cacheManager = ctx.cacheManager ?? ctx.shared.get("cacheManager") as RenderCacheManager | undefined;
    let outputPath: string;
    let thumbnailRelPath: string;

    if (cacheManager) {
      outputPath = cacheManager.absoluteThumbnailPath(ctx.asset.id);
      thumbnailRelPath = cacheManager.relativeThumbnailPath(ctx.asset.id);
      await mkdir(dirname(outputPath), { recursive: true });
    } else {
      outputPath = join(ctx.projectDir, "thumbnails", `${ctx.asset.id}.jpg`);
      thumbnailRelPath = `thumbnails/${ctx.asset.id}.jpg`;
    }

    await ffmpegTool.generateThumbnail(inputPath, outputPath);
    ctx.asset.thumbnailPath = thumbnailRelPath;
  },
};
