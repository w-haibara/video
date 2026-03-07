import { getPipeline } from "./registry";
import type { AssetKind } from "@video/shared";
import type { PipelineContext } from "./types";

export type ProgressReporter = (overall: number, stepName: string) => void;

export async function runPipeline(
  kind: AssetKind,
  ctx: PipelineContext,
  onProgress?: ProgressReporter,
): Promise<void> {
  const allSteps = getPipeline(kind);
  const applicable = allSteps.filter((s) => s.canHandle(ctx));

  for (let i = 0; i < applicable.length; i++) {
    const step = applicable[i];
    ctx.reportProgress = (fraction) => {
      onProgress?.((i + fraction) / applicable.length, step.name);
    };
    onProgress?.(i / applicable.length, step.name);
    await step.execute(ctx);
  }
  onProgress?.(1.0, "done");
}
