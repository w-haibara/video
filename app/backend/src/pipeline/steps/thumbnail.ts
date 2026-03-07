import { join } from "node:path";
import type { PipelineStep } from "../types";
import { ffmpegTool } from "../tools";

export const thumbnailStep: PipelineStep = {
  name: "thumbnail",

  canHandle: (ctx) => ctx.asset.kind !== "audio",

  async execute(ctx) {
    const inputPath = join(ctx.projectDir, ctx.asset.originalPath);
    const outputPath = join(
      ctx.projectDir,
      "thumbnails",
      `${ctx.asset.id}.jpg`,
    );
    await ffmpegTool.generateThumbnail(inputPath, outputPath);
    ctx.asset.thumbnailPath = `thumbnails/${ctx.asset.id}.jpg`;
  },
};
