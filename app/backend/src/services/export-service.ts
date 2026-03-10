import type { Project, Clip, ExportPreset } from "@video/shared";
import type { Job } from "@video/shared";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { assetsDir, exportDir } from "../utils/paths";
import * as jobQueue from "./job-queue";
import * as projectService from "./project-service";
import { exportHandlerRegistry } from "../lib/export-handler-registry";
import "../lib/export-handlers/index";

export function sanitizeColor(value: string): string {
  // Allow hex (#rgb, #rrggbb, #rrggbbaa), named colors, and color@opacity
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^[a-zA-Z]+(@[0-9.]+)?$/.test(value)) return value;
  return "white";
}

/**
 * Build FFmpeg filter segment for clip position/scale transform.
 * Returns empty string or ",filter1,filter2" to append to existing chain.
 */
export function buildTransformFilter(
  clip: Clip,
  preset: { width: number; height: number },
): string {
  const tx = clip.transform?.x ?? 0;
  const ty = clip.transform?.y ?? 0;
  const scale = clip.transform?.scale ?? 1;

  if (tx === 0 && ty === 0 && scale === 1) return "";

  const parts: string[] = [];

  if (scale !== 1) {
    // Scale relative to center, then pad+crop to exact output size.
    // pad uses max() so it never shrinks below scaled input (fixes scale > 1).
    parts.push(
      `scale=iw*${scale}:ih*${scale}`,
      `pad=w='max(iw,${preset.width})':h='max(ih,${preset.height})':x=(ow-iw)/2:y=(oh-ih)/2:color=black`,
      `crop=${preset.width}:${preset.height}:(iw-${preset.width})/2:(ih-${preset.height})/2`,
    );
  }

  if (tx !== 0 || ty !== 0) {
    // Crop to simulate translate: shift the visible area
    // We first pad with extra space, then crop to the output size at offset
    const padW = preset.width + Math.abs(tx) * 2;
    const padH = preset.height + Math.abs(ty) * 2;
    const cropX = Math.abs(tx) - tx; // if tx>0, shift right -> crop from left
    const cropY = Math.abs(ty) - ty;
    parts.push(
      `pad=${padW}:${padH}:(ow-iw)/2:(oh-ih)/2:color=black`,
      `crop=${preset.width}:${preset.height}:${cropX}:${cropY}`,
    );
  }

  return "," + parts.join(",");
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
  const videoTrack = project.sequence.tracks.find((t) => t.kind === "video");
  const audioTrack = project.sequence.tracks.find((t) => t.kind === "audio");

  if (!videoTrack || videoTrack.clips.length === 0) {
    throw new Error("No video clips to export");
  }

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

  // Sort clips by startMs, filter out clips beyond project duration, and clamp
  const clips = [...videoTrack.clips]
    .sort((a, b) => a.startMs - b.startMs)
    .filter((c) => projectDurationMs == null || c.startMs < projectDurationMs)
    .map((c) => {
      if (projectDurationMs != null && c.startMs + c.durationMs > projectDurationMs) {
        const clampedDuration = projectDurationMs - c.startMs;
        return { ...c, durationMs: clampedDuration, outMs: c.inMs + clampedDuration };
      }
      return c;
    });

  if (clips.length === 0) {
    throw new Error("No video clips to export");
  }

  const ctx = {
    project,
    preset,
    assetsBase,
    inputArgs: [] as string[],
    filterParts: [] as string[],
    inputIndex: 0,
  };

  // 1. Build inputs for each clip via clip handlers
  clips.forEach((clip) => {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    if (!asset) throw new Error(`Asset not found: ${clip.assetId}`);

    const handler = exportHandlerRegistry.getClipHandler(asset.kind);
    if (handler) {
      handler.buildInput(clip, asset, ctx);
    }
  });

  // 2. Concat all video streams
  const concatInputs = clips.map((_, i) => `[v${i}]`).join("");
  ctx.filterParts.push(
    `${concatInputs}concat=n=${clips.length}:v=1:a=0[outv]`,
  );

  // 3. Apply overlay handlers
  let videoOut = "[outv]";
  for (const overlayHandler of exportHandlerRegistry.getOverlayHandlers()) {
    const track = project.sequence.tracks.find((t) => t.kind === overlayHandler.trackKind);
    if (track && track.clips.length > 0) {
      videoOut = overlayHandler.buildOverlay(track.clips, ctx, videoOut);
    }
  }

  // 4. Apply audio handlers
  let audioFilter = "";
  for (const audioHandler of exportHandlerRegistry.getAudioHandlers()) {
    const track = project.sequence.tracks.find((t) => t.kind === audioHandler.trackKind);
    const audioClips = track ? track.clips : [];
    const result = audioHandler.buildAudio(audioClips, ctx, clips);
    if (result) {
      audioFilter = result;
    }
  }

  // 5. Build output args
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
    "-r", String(preset.fps ?? 30),
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

  // Validate
  const videoTrack = project.sequence.tracks.find((t) => t.kind === "video");
  if (!videoTrack || videoTrack.clips.length === 0) {
    throw new Error("No video clips to export");
  }

  // Calculate total duration for progress (clamped to project settings)
  const clipSumMs = videoTrack.clips.reduce(
    (sum, c) => sum + c.durationMs,
    0,
  );
  const totalDurationMs = project.settings?.durationMs
    ? Math.min(clipSumMs, project.settings.durationMs)
    : clipSumMs;

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
