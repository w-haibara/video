import type { Project, Clip, ExportPreset } from "@video/shared";
import type { Job } from "@video/shared";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { assetsDir, exportDir } from "../utils/paths";
import * as jobQueue from "./job-queue";
import * as projectService from "./project-service";

function sanitizeColor(value: string): string {
  // Allow hex (#rgb, #rrggbb, #rrggbbaa), named colors, and color@opacity
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^[a-zA-Z]+(@[0-9.]+)?$/.test(value)) return value;
  return "white";
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

  const preset = project.exportPreset ?? {
    width: 1920,
    height: 1080,
    fps: 30,
    videoBitrate: "8M",
    audioBitrate: "192k",
  };

  // Sort clips by startMs
  const clips = [...videoTrack.clips].sort((a, b) => a.startMs - b.startMs);

  const inputArgs: string[] = [];
  const filterParts: string[] = [];

  // Add inputs for each clip
  clips.forEach((clip, i) => {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    if (!asset) throw new Error(`Asset not found: ${clip.assetId}`);

    const assetPath = path.join(assetsBase, path.basename(asset.originalPath));

    if (asset.kind === "video") {
      inputArgs.push("-i", assetPath);
      // Trim and scale
      const trimStart = clip.inMs / 1000;
      const duration = clip.durationMs / 1000;
      filterParts.push(
        `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS,` +
          `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease,` +
          `pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2[v${i}]`,
      );
    } else if (asset.kind === "image") {
      inputArgs.push("-loop", "1", "-t", String(clip.durationMs / 1000), "-i", assetPath);
      filterParts.push(
        `[${i}:v]scale=${preset.width}:${preset.height}:force_original_aspect_ratio=decrease,` +
          `pad=${preset.width}:${preset.height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`,
      );
    }
  });

  // Concat all video streams
  const concatInputs = clips.map((_, i) => `[v${i}]`).join("");
  filterParts.push(
    `${concatInputs}concat=n=${clips.length}:v=1:a=0[outv]`,
  );

  // Add text overlays (drawtext)
  const textTrack = project.sequence.tracks.find((t) => t.kind === "title");
  let videoOut = "[outv]";
  if (textTrack && textTrack.clips.length > 0) {
    textTrack.clips.forEach((textClip, i) => {
      if (!textClip.text) return;
      const enableStart = textClip.startMs / 1000;
      const enableEnd = (textClip.startMs + textClip.durationMs) / 1000;
      const escapedText = textClip.text.value
        .replace(/'/g, "'\\''")
        .replace(/:/g, "\\:");
      const fontSize = Math.max(8, Math.min(500, Math.round(textClip.text.fontSize ?? 48)));
      const fontColor = sanitizeColor(textClip.text.color ?? "white");
      const bgColor = sanitizeColor(textClip.text.backgroundColor ?? "black@0.5");
      const prevOut = i === 0 ? "[outv]" : `[txt${i - 1}]`;
      const curOut = `[txt${i}]`;

      filterParts.push(
        `${prevOut}drawtext=text='${escapedText}':fontsize=${fontSize}:` +
          `fontcolor=${fontColor}:box=1:boxcolor=${bgColor}:boxborderw=8:` +
          `x=(w-text_w)/2:y=h-th-40:enable='between(t,${enableStart},${enableEnd})'${curOut}`,
      );
      videoOut = curOut;
    });
  }

  // Handle audio
  let audioFilter = "";

  // Check if any video clip has audio
  const hasVideoAudio = clips.some((clip) => {
    const asset = project.assets.find((a) => a.id === clip.assetId);
    return asset?.kind === "video" && asset.hasAudio;
  });

  if (audioTrack && audioTrack.clips.length > 0) {
    const bgmClip = audioTrack.clips[0];
    const bgmAsset = project.assets.find((a) => a.id === bgmClip.assetId);
    if (bgmAsset) {
      const bgmPath = path.join(assetsBase, path.basename(bgmAsset.originalPath));
      const bgmInputIdx = clips.length;
      inputArgs.push("-i", bgmPath);
      const volume = bgmClip.volume ?? 1.0;
      const bgmStart = bgmClip.startMs / 1000;
      const bgmDuration = bgmClip.durationMs / 1000;

      if (hasVideoAudio) {
        // Mix video audio with BGM
        // Only include clips that actually have audio streams
        const audioClipIndices = clips
          .map((clip, i) => {
            const a = project.assets.find((a) => a.id === clip.assetId);
            return a?.kind === "video" && a.hasAudio ? i : -1;
          })
          .filter((i) => i >= 0);

        // For clips without audio, generate silence; for those with audio, use their stream
        const audioParts: string[] = [];
        clips.forEach((clip, i) => {
          const a = project.assets.find((a) => a.id === clip.assetId);
          if (a?.kind === "video" && a.hasAudio) {
            audioParts.push(`[${i}:a]`);
          } else {
            const dur = clip.durationMs / 1000;
            filterParts.push(
              `anullsrc=r=48000:cl=stereo[sil${i}]`,
            );
            filterParts.push(
              `[sil${i}]atrim=duration=${dur}[sa${i}]`,
            );
            audioParts.push(`[sa${i}]`);
          }
        });
        const audioConcat = audioParts.join("");
        filterParts.push(
          `${audioConcat}concat=n=${clips.length}:v=0:a=1[va]`,
        );
        filterParts.push(
          `[${bgmInputIdx}:a]atrim=start=0:duration=${bgmDuration},` +
            `adelay=${Math.round(bgmStart * 1000)}|${Math.round(bgmStart * 1000)},` +
            `volume=${volume}[bgm]`,
        );
        filterParts.push(`[va][bgm]amix=inputs=2:duration=longest[outa]`);
        audioFilter = "[outa]";
      } else {
        filterParts.push(
          `[${bgmInputIdx}:a]atrim=start=0:duration=${bgmDuration},` +
            `adelay=${Math.round(bgmStart * 1000)}|${Math.round(bgmStart * 1000)},` +
            `volume=${volume}[outa]`,
        );
        audioFilter = "[outa]";
      }
    }
  } else if (hasVideoAudio) {
    // Just concat video audio, generating silence for clips without audio
    const audioParts: string[] = [];
    clips.forEach((clip, i) => {
      const a = project.assets.find((a) => a.id === clip.assetId);
      if (a?.kind === "video" && a.hasAudio) {
        audioParts.push(`[${i}:a]`);
      } else {
        const dur = clip.durationMs / 1000;
        filterParts.push(`anullsrc=r=48000:cl=stereo[sil${i}]`);
        filterParts.push(`[sil${i}]atrim=duration=${dur}[sa${i}]`);
        audioParts.push(`[sa${i}]`);
      }
    });
    const audioConcat = audioParts.join("");
    filterParts.push(
      `${audioConcat}concat=n=${clips.length}:v=0:a=1[outa]`,
    );
    audioFilter = "[outa]";
  }

  const filterComplex = filterParts.join(";");

  const args = [
    "-y",
    ...inputArgs,
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

  // Calculate total duration for progress
  const totalDurationMs = videoTrack.clips.reduce(
    (sum, c) => sum + c.durationMs,
    0,
  );

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
      const stderr = proc.stderr
        ? await new Response(proc.stderr).text()
        : "";
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
