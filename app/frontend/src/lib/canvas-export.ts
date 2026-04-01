import { CanvasCompositor, type FrameSources } from "./canvas-compositor";
import type { Project } from "@video/shared";
import {
  Output,
  Mp4OutputFormat,
  BufferTarget,
  CanvasSource,
  canEncodeVideo,
  type VideoEncodingConfig,
} from "mediabunny";

// ── Types ──

export type CanvasExportOptions = {
  project: Project;
  /** Width (default: project canvasWidth) */
  width?: number;
  /** Height (default: project canvasHeight) */
  height?: number;
  /** FPS (default: 30) */
  fps?: number;
  /** Video bitrate in bps (default: 8_000_000) */
  videoBitrate?: number;
  /** Function to get frame source for an assetId at a given time */
  getFrameSource: (
    assetId: string,
    clipTimeMs: number,
  ) => Promise<CanvasImageSource | null>;
  /** Progress callback (0..1) */
  onProgress?: (progress: number) => void;
};

export type CanvasExportResult = {
  blob: Blob;
  durationMs: number;
  frameCount: number;
  width: number;
  height: number;
};

// ── Helpers ──

function getSequenceEndMs(project: Project): number {
  let endMs = 0;
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      const clipEnd = clip.startMs + clip.durationMs;
      if (clipEnd > endMs) endMs = clipEnd;
    }
  }
  return endMs;
}

/**
 * Collect all unique assetIds referenced by clips in the project.
 */
function collectActiveAssetIds(project: Project, timeMs: number): string[] {
  const ids: string[] = [];
  for (const track of project.sequence.tracks) {
    if (track.muted) continue;
    for (const clip of track.clips) {
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs) {
        if (clip.assetId) ids.push(clip.assetId);
      }
    }
  }
  return ids;
}

/**
 * Compute clip-local time (how far into the clip's media we are).
 */
function clipTimeForAsset(
  project: Project,
  assetId: string,
  globalTimeMs: number,
): number {
  for (const track of project.sequence.tracks) {
    for (const clip of track.clips) {
      if (
        clip.assetId === assetId &&
        globalTimeMs >= clip.startMs &&
        globalTimeMs < clip.startMs + clip.durationMs
      ) {
        return clip.inMs + (globalTimeMs - clip.startMs);
      }
    }
  }
  return 0;
}

// ── Main export function ──

export async function exportWithCanvas(
  opts: CanvasExportOptions,
): Promise<CanvasExportResult> {
  const {
    project,
    getFrameSource,
    onProgress,
  } = opts;

  const width = opts.width ?? project.settings.canvasWidth;
  const height = opts.height ?? project.settings.canvasHeight;
  const fps = opts.fps ?? 30;
  const videoBitrate = opts.videoBitrate ?? 8_000_000;

  const endMs = getSequenceEndMs(project);
  if (endMs <= 0) {
    throw new Error("Project has no clips to export");
  }

  const totalFrames = Math.ceil((endMs / 1000) * fps);
  const frameDurationSec = 1 / fps;

  // 1. Create OffscreenCanvas for rendering
  let canvas: OffscreenCanvas | HTMLCanvasElement;
  if (typeof OffscreenCanvas !== "undefined") {
    canvas = new OffscreenCanvas(width, height);
  } else if (typeof document !== "undefined") {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
  } else {
    throw new Error("Neither OffscreenCanvas nor document is available");
  }

  // 2. Create CanvasCompositor
  const compositor = new CanvasCompositor(canvas);

  // 3. Determine video codec — try AVC first, fall back
  let videoCodec: "avc" | "vp9" | "vp8" = "avc";
  const canAvc = await canEncodeVideo("avc", {
    width,
    height,
    bitrate: videoBitrate,
  });
  if (!canAvc) {
    const canVp9 = await canEncodeVideo("vp9", {
      width,
      height,
      bitrate: videoBitrate,
    });
    videoCodec = canVp9 ? "vp9" : "vp8";
  }

  // 4. Configure encoding and muxing
  const encodingConfig: VideoEncodingConfig = {
    codec: videoCodec,
    bitrate: videoBitrate,
    keyFrameInterval: 2, // keyframe every 2 seconds
    hardwareAcceleration: "no-preference",
  };

  const canvasSource = new CanvasSource(canvas, encodingConfig);

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: "in-memory" }),
    target,
  });

  output.addVideoTrack(canvasSource);
  await output.start();

  // 5. Render each frame
  try {
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const timeMs = (frameIndex / fps) * 1000;
      const timestampSec = frameIndex * frameDurationSec;

      // Build FrameSources for this time
      const sources: FrameSources = new Map();
      const assetIds = collectActiveAssetIds(project, timeMs);

      const sourcePromises = assetIds.map(async (assetId) => {
        const clipTimeMs = clipTimeForAsset(project, assetId, timeMs);
        const source = await getFrameSource(assetId, clipTimeMs);
        if (source) {
          sources.set(assetId, source);
        }
      });
      // eslint-disable-next-line no-await-in-loop -- sequential frame rendering is intentional
      await Promise.all(sourcePromises);

      // Render frame onto canvas
      compositor.renderFrame(project, timeMs, sources);

      // Add canvas frame to mediabunny — this handles VideoFrame + encoding internally
      const isKeyFrame = frameIndex % (fps * 2) === 0;
      // eslint-disable-next-line no-await-in-loop -- encoder backpressure requires sequential await
      await canvasSource.add(timestampSec, frameDurationSec, {
        keyFrame: isKeyFrame,
      });

      // Report progress
      if (onProgress) {
        onProgress((frameIndex + 1) / totalFrames);
      }
    }
  } finally {
    compositor.dispose();
  }

  // 6. Finalize output
  await output.finalize();

  // 7. Build result blob
  const buffer = target.buffer;
  if (!buffer) {
    throw new Error("Export failed: no output buffer produced");
  }

  const blob = new Blob([buffer], { type: "video/mp4" });

  return {
    blob,
    durationMs: endMs,
    frameCount: totalFrames,
    width,
    height,
  };
}

// ── Worker-based export ──

/** Check if Worker-based export is available */
export function isWorkerExportSupported(): boolean {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof ImageBitmap !== "undefined" &&
    isWebCodecsSupported()
  );
}

/**
 * Export using a Web Worker for encoding.
 *
 * Main thread: renders each frame with CanvasCompositor -> creates ImageBitmap
 * Worker: receives ImageBitmap, encodes with mediabunny, muxes to MP4
 *
 * This keeps the heavy encoding off the main thread for better responsiveness.
 */
export async function exportWithWorker(
  opts: CanvasExportOptions,
): Promise<CanvasExportResult> {
  const { project, getFrameSource, onProgress } = opts;

  const width = opts.width ?? project.settings.canvasWidth;
  const height = opts.height ?? project.settings.canvasHeight;
  const fps = opts.fps ?? 30;
  const videoBitrate = opts.videoBitrate ?? 8_000_000;

  const endMs = getSequenceEndMs(project);
  if (endMs <= 0) {
    throw new Error("Project has no clips to export");
  }

  const totalFrames = Math.ceil((endMs / 1000) * fps);
  const frameDurationSec = 1 / fps;

  // 1. Create canvas for rendering on main thread
  const canvas = new OffscreenCanvas(width, height);
  const compositor = new CanvasCompositor(canvas);

  // 2. Create and initialize the worker
  const worker = new Worker(
    new URL("./export-worker.ts", import.meta.url),
    { type: "module" },
  );

  // Set up message handling
  const workerReady = new Promise<void>((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.type === "ready") {
        worker.removeEventListener("message", onMessage);
        resolve();
      } else if (e.data.type === "error") {
        worker.removeEventListener("message", onMessage);
        reject(new Error(e.data.message));
      }
    };
    worker.addEventListener("message", onMessage);
  });

  worker.postMessage({
    type: "init",
    data: { width, height, fps, videoBitrate },
  });

  await workerReady;

  // 3. Render each frame on main thread and send to worker
  try {
    for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
      const timeMs = (frameIndex / fps) * 1000;
      const timestampSec = frameIndex * frameDurationSec;

      // Build FrameSources for this time
      const sources: FrameSources = new Map();
      const assetIds = collectActiveAssetIds(project, timeMs);

      const sourcePromises = assetIds.map(async (assetId) => {
        const clipTimeMs = clipTimeForAsset(project, assetId, timeMs);
        const source = await getFrameSource(assetId, clipTimeMs);
        if (source) {
          sources.set(assetId, source);
        }
      });
      // eslint-disable-next-line no-await-in-loop -- sequential frame rendering is intentional
      await Promise.all(sourcePromises);

      // Render frame onto canvas
      compositor.renderFrame(project, timeMs, sources);

      // Create ImageBitmap from the rendered canvas (zero-copy transfer to worker)
      // eslint-disable-next-line no-await-in-loop -- sequential frame rendering is intentional
      const bitmap = await createImageBitmap(canvas);

      const isKeyFrame = frameIndex % (fps * 2) === 0;

      // Transfer bitmap to worker (zero-copy)
      worker.postMessage(
        {
          type: "frame",
          data: {
            bitmap,
            timestamp: timestampSec,
            duration: frameDurationSec,
            progress: (frameIndex + 1) / totalFrames,
            keyFrame: isKeyFrame,
          },
        },
        [bitmap],
      );

      // Report progress on main thread too
      if (onProgress) {
        onProgress((frameIndex + 1) / totalFrames);
      }

      // Yield to the main thread periodically to keep UI responsive
      if (frameIndex % 5 === 0) {
        // eslint-disable-next-line no-await-in-loop -- intentional yield
        await new Promise<void>((r) => setTimeout(r, 0));
      }
    }
  } finally {
    compositor.dispose();
  }

  // 4. Flush and wait for result
  const result = await new Promise<Blob>((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.type === "done") {
        worker.removeEventListener("message", onMessage);
        resolve(e.data.blob);
      } else if (e.data.type === "error") {
        worker.removeEventListener("message", onMessage);
        reject(new Error(e.data.message));
      }
    };
    worker.addEventListener("message", onMessage);
    worker.postMessage({ type: "flush" });
  });

  // 5. Terminate worker
  worker.terminate();

  return {
    blob: result,
    durationMs: endMs,
    frameCount: totalFrames,
    width,
    height,
  };
}

/** Check if WebCodecs is available in the current browser */
export function isWebCodecsSupported(): boolean {
  return (
    typeof VideoEncoder !== "undefined" &&
    typeof VideoFrame !== "undefined"
  );
}
