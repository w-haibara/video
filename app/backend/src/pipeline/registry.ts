import type { PipelineStep } from "./types";
import type { AssetKind } from "@video/shared";

const steps = new Map<string, PipelineStep>();
const pipelines = new Map<AssetKind, string[]>();

export function registerStep(step: PipelineStep): void {
  steps.set(step.name, step);
}

export function definePipeline(kind: AssetKind, stepNames: string[]): void {
  pipelines.set(kind, stepNames);
}

export function getPipeline(kind: AssetKind): PipelineStep[] {
  const names = pipelines.get(kind) ?? [];
  return names.map((n) => {
    const s = steps.get(n);
    if (!s) throw new Error(`Step "${n}" not registered`);
    return s;
  });
}
