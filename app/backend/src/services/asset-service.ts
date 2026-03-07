import type { Asset } from "@video/shared";
import type { PipelineContext } from "../pipeline/types";
import { runPipeline } from "../pipeline";

export function createImportTask(
  projectId: string,
  projectDir: string,
  asset: Asset,
) {
  return async (job: { progress: number }) => {
    const ctx: PipelineContext = {
      asset,
      projectDir,
      projectId,
      shared: new Map(),
      reportProgress: () => {},
    };

    await runPipeline(asset.kind, ctx, (overall) => {
      job.progress = overall;
    });

    // Return the mutated asset for the caller to persist
    return ctx.asset;
  };
}
