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
  // Evaluate canHandle lazily before each step (not upfront) because
  // earlier steps may populate ctx.shared with values that later steps depend on.
  let executed = 0;
  for (let i = 0; i < allSteps.length; i++) {
    const step = allSteps[i];
    if (!step.canHandle(ctx)) continue;
    ctx.reportProgress = (fraction) => {
      onProgress?.((executed + fraction) / allSteps.length, step.name);
    };
    onProgress?.(executed / allSteps.length, step.name);
    await step.execute(ctx);
    executed++;
  }
  onProgress?.(1.0, "done");
}
