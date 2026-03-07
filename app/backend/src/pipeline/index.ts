// Register all steps and pipeline definitions (side effects)
import "./steps";
import "./definitions";

// Re-export public API
export { runPipeline } from "./runner";
export type { ProgressReporter } from "./runner";
export { registerStep, definePipeline, getPipeline } from "./registry";
export type {
  PipelineContext,
  PipelineStep,
  ProbeResult,
  FfmpegTool,
} from "./types";
export { getProbeResult } from "./types";
