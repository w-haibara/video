import type { Project, Clip, ExportPreset } from "@video/shared";
import type { Job } from "@video/shared";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { assetsDir, exportDir } from "../utils/paths";
import * as jobQueue from "./job-queue";
import * as projectService from "./project-service";
import { exportHandlerRegistry } from "../lib/export-handler-registry";
import { exportCompositeStrategyRegistry } from "../lib/composite-strategy-registry";

export function sanitizeColor(value: string): string {
  // Allow hex (#rgb, #rrggbb, #rrggbbaa), named colors, and color@opacity
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^[a-zA-Z]+(@[0-9.]+)?$/.test(value)) return value;
  return "white";
}

/**
 * Check whether a clip has any non-identity transform.
 */
export function hasClipTransform(clip: Clip): boolean {
  const tx = clip.transform?.x ?? 0;
  const ty = clip.transform?.y ?? 0;
  const scale = clip.transform?.scale ?? 1;
  const rotation = clip.transform?.rotation ?? 0;
  return tx !== 0 || ty !== 0 || scale !== 1 || rotation !== 0;
}

/**
 * Build FFmpeg filter segment for clip rotation/scale.
 * Position (x/y) is handled by the overlay filter, not here.
 * Returns comma-prefixed filter chain or empty string.
 */
export function buildTransformFilter(
  clip: Clip,
  _preset: { width: number; height: number },
): string {
  const scale = clip.transform?.scale ?? 1;
  const rotation = clip.transform?.rotation ?? 0;

  const parts: string[] = [];

  if (rotation !== 0) {
    const rad = (rotation * Math.PI) / 180;
    parts.push(`rotate=${rad}:ow=rotw(${rad}):oh=roth(${rad}):c=black@0`);
  }

  if (scale !== 1) {
    parts.push(`scale=iw*${scale}:ih*${scale}`);
  }

  if (parts.length === 0) return "";
  return "," + parts.join(",");
}

/**
 * Build overlay position expression for a clip.
 * Clips with transforms are centered then offset by x/y.
 * Clips without transforms use 0:0 (they are already canvas-sized).
 */
export function buildOverlayPosition(clip: Clip): string {
  if (!hasClipTransform(clip)) return "0:0";
  const tx = clip.transform?.x ?? 0;
  const ty = clip.transform?.y ?? 0;
  const xExpr = tx === 0 ? "(W-w)/2" : `(W-w)/2+${tx}`;
  const yExpr = ty === 0 ? "(H-h)/2" : `(H-h)/2+${ty}`;
  return `${xExpr}:${yExpr}`;
}

/**
 * Build FFmpeg arguments for exporting a project.
 * Pure function for testability.
 */
export function buildExportArgs(
  project: Project,
  assetsBase: string,
  outputPath: string,
): string[] {
  const canvasW = project.settings.canvasWidth;
  const canvasH = project.settings.canvasHeight;

  const preset = project.exportPreset ?? {
    width: canvasW,
    height: canvasH,
    fps: 30,
    videoBitrate: "8M",
    audioBitrate: "192k",
  };

  // Project duration limit
  const projectDurationMs = project.settings?.durationMs;

  // Collect all visual clips (video/image) from all tracks, with track index
  const allVisualClips: { clip: Clip; trackIndex: number }[] = [];
  project.sequence.tracks.forEach((track, trackIndex) => {
    for (const clip of track.clips) {
      if (clip.clipKind === "video" || clip.clipKind === "image") {
        allVisualClips.push({ clip, trackIndex });
      }
    }
  });

  if (allVisualClips.length === 0) {
    throw new Error("No video clips to export");
  }

  // Filter by project duration and clamp
  const clampedVisualClips = allVisualClips
    .filter(({ clip }) => projectDurationMs == null || clip.startMs < projectDurationMs)
    .map(({ clip, trackIndex }) => {
      if (projectDurationMs != null && clip.startMs + clip.durationMs > projectDurationMs) {
        const clampedDuration = projectDurationMs - clip.startMs;
        return { clip: { ...clip, durationMs: clampedDuration, outMs: clip.inMs + clampedDuration }, trackIndex };
      }
      return { clip, trackIndex };
    });

  if (clampedVisualClips.length === 0) {
    throw new Error("No video clips to export");
  }

  // Calculate total duration for the base canvas
  const maxEndMs = Math.max(...clampedVisualClips.map(({ clip }) => clip.startMs + clip.durationMs));
  const totalDurationSec = (projectDurationMs != null ? Math.min(maxEndMs, projectDurationMs) : maxEndMs) / 1000;

  const ctx = {
    project,
    preset,
    assetsBase,
    inputArgs: [] as string[],
    filterParts: [] as string[],
    inputIndex: 0,
    clipInputIndices: new Map<string, number>(),
    clipHasTransform: new Map<string, boolean>(),
  };

  // 1. Build inputs for each visual clip via clip handlers, sorted by track then time
  const clipInfos: { clip: Clip; trackIndex: number; inputLabel: string }[] = [];

  const sortedClips = [...clampedVisualClips]
    .sort((a, b) => a.trackIndex - b.trackIndex || a.clip.startMs - b.clip.startMs);

  sortedClips.forEach(({ clip, trackIndex }) => {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    if (!asset) throw new Error(`Asset not found: ${clip.assetId}`);

    const handler = exportHandlerRegistry.getClipHandler(asset.kind);
    if (handler) {
      const label = `[v${ctx.inputIndex}]`;
      handler.buildInput(clip, asset, ctx);
      clipInfos.push({ clip, trackIndex, inputLabel: label });
    }
  });

  // 2. Create black base canvas for full duration
  const fps = preset.fps ?? 30;
  ctx.filterParts.push(
    `color=black:s=${preset.width}x${preset.height}:d=${totalDurationSec}:r=${fps},format=yuv420p[base]`,
  );

  // 3. Overlay all clips onto the base, ordered by track (bottom to top), then by time
  let currentBase = "[base]";
  let overlayIdx = 0;

  for (const { clip, inputLabel } of clipInfos) {
    const strategy = exportCompositeStrategyRegistry.get(clip.blendMode ?? "cover");
    const startSec = clip.startMs / 1000;
    const endSec = (clip.startMs + clip.durationMs) / 1000;
    const enable = `between(t,${startSec},${endSec})`;
    const outLabel = `[ov${overlayIdx}]`;
    const position = buildOverlayPosition(clip);

    if (strategy) {
      ctx.filterParts.push(
        strategy.buildOverlayFilter(currentBase, inputLabel, enable, position) + outLabel,
      );
    } else {
      ctx.filterParts.push(
        `${currentBase}${inputLabel}overlay=${position}:enable='${enable}'${outLabel}`,
      );
    }

    currentBase = outLabel;
    overlayIdx++;
  }

  let videoOut = currentBase;

  // 4. Apply overlay handlers (text) - collect clips by clipKind from all tracks
  for (const overlayHandler of exportHandlerRegistry.getOverlayHandlers()) {
    const matchingClips = project.sequence.tracks.flatMap((t) =>
      t.clips.filter((c) => c.clipKind === overlayHandler.clipKind),
    );
    if (matchingClips.length > 0) {
      videoOut = overlayHandler.buildOverlay(matchingClips, ctx, videoOut);
    }
  }

  // 5. Apply audio handlers - collect clips by clipKind from all tracks
  const allVideoClips = sortedClips.map(({ clip }) => clip);
  let audioFilter = "";
  for (const audioHandler of exportHandlerRegistry.getAudioHandlers()) {
    const matchingClips = project.sequence.tracks.flatMap((t) =>
      t.clips.filter((c) => c.clipKind === audioHandler.clipKind),
    );
    const result = audioHandler.buildAudio(matchingClips, ctx, allVideoClips);
    if (result) {
      audioFilter = result;
    }
  }

  // 6. Build output args
  const filterComplex = ctx.filterParts.join(";");

  const args = [
    "-y",
    ...ctx.inputArgs,
    "-filter_complex", filterComplex,
    "-map", videoOut,
  ];

  if (audioFilter) {
    args.push("-map", audioFilter);
    args.push("-c:a", "aac", "-b:a", preset.audioBitrate ?? "192k", "-ar", "48000");
  }

  args.push(
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-colorspace", "bt709",
    "-color_primaries", "bt709",
    "-color_trc", "bt709",
    "-preset", "medium",
    "-crf", "20",
    "-r", String(fps),
    "-movflags", "+faststart",
    "-progress", "pipe:1",
    "-nostats",
    outputPath,
  );

  return args;
}

/**
 * Start an export job for a project.
 */
export async function startExport(
  projectId: string,
  filename: string,
): Promise<{ jobId: string }> {
  const project = await projectService.getProject(projectId);

  const expDir = exportDir(projectId);
  await mkdir(expDir, { recursive: true });

  const outputPath = path.join(expDir, path.basename(filename));
  const assetsBase = assetsDir(projectId);

  // Validate - check for visual clips across all tracks
  const visualClips = project.sequence.tracks.flatMap((t) =>
    t.clips.filter((c) => c.clipKind === "video" || c.clipKind === "image"),
  );
  if (visualClips.length === 0) {
    throw new Error("No video clips to export");
  }

  // Calculate total duration for progress (clamped to project settings)
  const maxEndMs = Math.max(...visualClips.map((c) => c.startMs + c.durationMs));
  const totalDurationMs = project.settings?.durationMs
    ? Math.min(maxEndMs, project.settings.durationMs)
    : maxEndMs;

  const job = jobQueue.enqueue(projectId, "export", async (job: Job) => {
    const args = buildExportArgs(project, assetsBase, outputPath);

    const proc = Bun.spawn(["ffmpeg", ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    // Parse progress
    if (proc.stdout) {
      const reader = proc.stdout.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const match = line.match(/^out_time_us=(\d+)/);
            if (match) {
              const us = parseInt(match[1], 10);
              const ms = us / 1000;
              job.progress = Math.min(ms / totalDurationMs, 0.99);
              job.updatedAt = new Date().toISOString();
            }
          }
        }
      } catch {
        // ignore stream errors
      }
    }

    const exitCode = await proc.exited;
    if (exitCode !== 0) {
      const rawStderr = proc.stderr
        ? await new Response(proc.stderr).text()
        : "";
      const stderr = rawStderr
        .split("\n")
        .filter((line) => !line.includes("Skipping NAL unit"))
        .join("\n");
      throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
    }
  });

  return { jobId: job.id };
}

/**
 * List exported files for a project.
 */
export async function listExports(
  projectId: string,
): Promise<{ filename: string; path: string }[]> {
  const expDir = exportDir(projectId);
  await mkdir(expDir, { recursive: true });
  const entries = await readdir(expDir);
  return entries
    .filter((f) => f.endsWith(".mp4"))
    .map((f) => ({ filename: f, path: path.join(expDir, f) }));
}
