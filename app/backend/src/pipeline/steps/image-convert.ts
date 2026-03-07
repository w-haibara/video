import { join, extname } from "node:path";
import type { PipelineStep } from "../types";
import { ffmpegTool } from "../tools";

const CONVERTIBLE = new Set([".heic", ".heif"]);

export const imageConvertStep: PipelineStep = {
  name: "image-convert",

  canHandle: (ctx) =>
    ctx.asset.kind === "image" &&
    CONVERTIBLE.has(extname(ctx.asset.originalPath).toLowerCase()),

  async execute(ctx) {
    const inputPath = join(ctx.projectDir, ctx.asset.originalPath);
    const outputPath = join(
      ctx.projectDir,
      "proxies",
      `${ctx.asset.id}.jpg`,
    );
    await ffmpegTool.convertToJpeg(inputPath, outputPath);
    ctx.asset.proxyPath = `proxies/${ctx.asset.id}.jpg`;
  },
};
