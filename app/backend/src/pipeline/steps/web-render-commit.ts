import type { PipelineStep } from "../types";
import type { RenderCacheManager } from "../../services/render-cache-manager";

export const webRenderCommitStep: PipelineStep = {
  name: "web-render-commit",

  canHandle: (ctx) =>
    ctx.shared.has("renderedMp4Path") && ctx.cacheManager != null,

  async execute(ctx) {
    const cacheManager = ctx.cacheManager!;
    const renderedMp4Path = ctx.shared.get("renderedMp4Path") as string;
    const sourceHash = ctx.shared.get("sourceHash") as string;

    if (!cacheManager || !renderedMp4Path || !sourceHash) {
      return;
    }

    await cacheManager.commitRender({
      assetId: ctx.asset.id,
      sourceHash,
      renderedPath: renderedMp4Path,
      proxyPath: ctx.asset.proxyPath ?? "",
      thumbnailPath: ctx.asset.thumbnailPath ?? "",
      width: ctx.asset.width ?? 0,
      height: ctx.asset.height ?? 0,
      durationMs: ctx.asset.durationMs ?? 0,
      createdAt: new Date().toISOString(),
    });
  },
};
