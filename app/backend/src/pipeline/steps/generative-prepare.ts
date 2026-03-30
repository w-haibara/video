import type { PipelineStep } from "../types";
import { generativeAssetHandlerRegistry } from "../../lib/generative-asset-handler-registry";

export const generativePrepareStep: PipelineStep = {
  name: "generative-prepare",

  canHandle: (ctx) => generativeAssetHandlerRegistry.has(ctx.asset.kind),

  async execute(ctx) {
    const handler = generativeAssetHandlerRegistry.get(ctx.asset.kind);
    if (!handler) {
      throw new Error(
        `No generative asset handler registered for kind: ${ctx.asset.kind}`,
      );
    }
    await handler.prepare(ctx);
  },
};
