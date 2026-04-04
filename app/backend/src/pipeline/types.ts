import type { Asset } from "@video/shared";
import type { RenderCacheManager } from "../services/render-cache-manager";

/** Context passed to each pipeline step */
export type PipelineContext = {
  asset: Asset;
  projectDir: string;
  projectId: string;
  shared: Map<string, unknown>;
  reportProgress: (fraction: number) => void;
  cacheManager?: RenderCacheManager;
};

/** Interface all steps implement */
export type PipelineStep = {
  name: string;
  canHandle: (ctx: PipelineContext) => boolean;
  execute: (ctx: PipelineContext) => Promise<void>;
};

/** ffprobe result */
export type ProbeResult = {
  width: number;
  height: number;
  durationMs?: number;
  codec: string;
  rotation?: number;
  colorSpace?: string;
  hasAudio?: boolean;
  isHdr?: boolean;
};

/** Media tool abstraction (swappable) */
export type FfmpegTool = {
  probe: (inputPath: string) => Promise<ProbeResult>;
  generateThumbnail: (inputPath: string, outputPath: string) => Promise<void>;
  generateProxy: (
    inputPath: string,
    outputPath: string,
    opts: { isHdr?: boolean },
    onProgress?: (fraction: number) => void,
  ) => Promise<void>;
  convertToJpeg: (inputPath: string, outputPath: string) => Promise<void>;
};

/** Type-safe helper to retrieve probe result from shared context */
export function getProbeResult(ctx: PipelineContext): ProbeResult {
  const r = ctx.shared.get("probeResult");
  if (!r) throw new Error("probe step must run first");
  return r as ProbeResult;
}
