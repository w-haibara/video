import { join } from "node:path";
import type { PipelineStep } from "../types";
import { ffmpegTool } from "../tools";

export const probeStep: PipelineStep = {
  name: "probe",

  canHandle: () => true,

  async execute(ctx) {
    const inputPath = join(ctx.projectDir, ctx.asset.originalPath);
    const result = await ffmpegTool.probe(inputPath);

    ctx.asset.width = result.width;
    ctx.asset.height = result.height;
    ctx.asset.durationMs = result.durationMs;
    ctx.asset.codec = result.codec;
    ctx.asset.rotation = result.rotation;
    ctx.asset.colorSpace = result.colorSpace;
    ctx.asset.hasAudio = result.hasAudio;

    ctx.shared.set("probeResult", result);
  },
};
