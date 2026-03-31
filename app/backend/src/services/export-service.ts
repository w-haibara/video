import type { Project, Clip, ExportPreset, Asset, ClipColorCorrection, ClipChromaKey, VideoFilter } from "@video/shared";
import { hasKeyframes, buildKeyframeFilterExpression } from "@video/shared";
import type { Job } from "@video/shared";
import { buildVideoFilterFfmpeg } from "../lib/video-filter-ffmpeg";
export { buildVideoFilterFfmpeg } from "../lib/video-filter-ffmpeg";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { assetsDir, exportDir, projectDir as getProjectDir } from "../utils/paths";
import * as jobQueue from "./job-queue";
import * as projectService from "./project-service";
import { exportHandlerRegistry } from "../lib/export-handler-registry";
import { exportCompositeStrategyRegistry } from "../lib/composite-strategy-registry";
import { transitionExportRegistry } from "../lib/transition-export-registry";
import { generativeAssetHandlerRegistry } from "../lib/generative-asset-handler-registry";
import { RenderCacheManager } from "./render-cache-manager";
import { runPipeline } from "../pipeline";
import type { PipelineContext } from "../pipeline/types";

export function sanitizeColor(value: string): string {
  // Allow hex (#rgb, #rrggbb, #rrggbbaa), named colors, and color@opacity
  if (/^#[0-9a-fA-F]{3,8}$/.test(value)) return value;
  if (/^[a-zA-Z]+(@[0-9.]+)?$/.test(value)) return value;
  return "white";
}

/**
 * Check whether a clip has any non-identity transform (static or animated).
 */
export function hasClipTransform(clip: Clip): boolean {
  const tx = clip.transform?.x ?? 0;
  const ty = clip.transform?.y ?? 0;
  const scale = clip.transform?.scale ?? 1;
  const rotation = clip.transform?.rotation ?? 0;
  const hasStaticTransform = tx !== 0 || ty !== 0 || scale !== 1 || rotation !== 0;
  if (hasStaticTransform) return true;
  // Check for keyframed transform properties
  const tracks = clip.keyframeTracks;
  if (!tracks) return false;
  return hasKeyframes(tracks, "transform.x") ||
    hasKeyframes(tracks, "transform.y") ||
    hasKeyframes(tracks, "transform.scale") ||
    hasKeyframes(tracks, "transform.rotation") ||
    hasKeyframes(tracks, "opacity");
}

/**
 * Build FFmpeg filter segment for clip rotation/scale.
 * Supports keyframe animation for transform.scale and transform.rotation
 * via FFmpeg expressions. Position (x/y) is handled by the overlay filter.
 * Returns comma-prefixed filter chain or empty string.
 */
export function buildTransformFilter(
  clip: Clip,
  _preset: { width: number; height: number },
): string {
  const scale = clip.transform?.scale ?? 1;
  const rotation = clip.transform?.rotation ?? 0;
  const tracks = clip.keyframeTracks;
  const clipStartSec = clip.startMs / 1000;

  const hasAnimatedScale = tracks != null && hasKeyframes(tracks, "transform.scale");
  const hasAnimatedRotation = tracks != null && hasKeyframes(tracks, "transform.rotation");

  const parts: string[] = [];

  if (hasAnimatedRotation) {
    const rotExpr = buildKeyframeFilterExpression(tracks!, "transform.rotation", rotation, clip.durationMs, clipStartSec);
    // Convert degrees to radians in FFmpeg expression
    parts.push(`rotate='(${rotExpr})*PI/180':ow='rotw((${rotExpr})*PI/180)':oh='roth((${rotExpr})*PI/180)':c=black@0`);
  } else if (rotation !== 0) {
    const rad = (rotation * Math.PI) / 180;
    parts.push(`rotate=${rad}:ow=rotw(${rad}):oh=roth(${rad}):c=black@0`);
  }

  if (hasAnimatedScale) {
    const scaleExpr = buildKeyframeFilterExpression(tracks!, "transform.scale", scale, clip.durationMs, clipStartSec);
    parts.push(`scale=w='iw*(${scaleExpr})':h='ih*(${scaleExpr})':eval=frame`);
  } else if (scale !== 1) {
    parts.push(`scale=iw*${scale}:ih*${scale}`);
  }

  if (parts.length === 0) return "";
  return "," + parts.join(",");
}

/**
 * Build FFmpeg filter segment for animated opacity via keyframes.
 * Uses format=yuva420p + lut filter with a time-varying alpha expression.
 * Returns comma-prefixed filter chain or empty string.
 */
export function buildOpacityFilter(clip: Clip): string {
  const tracks = clip.keyframeTracks;
  if (!tracks || !hasKeyframes(tracks, "opacity")) return "";

  const clipStartSec = clip.startMs / 1000;
  const alphaExpr = buildKeyframeFilterExpression(tracks, "opacity", 1.0, clip.durationMs, clipStartSec);

  // If the expression is just "1" (static full opacity), skip
  if (alphaExpr === "1" || alphaExpr === "1.0") return "";

  // Use geq to apply alpha expression; format=yuva420p ensures alpha channel exists
  return `,format=yuva420p,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='clip(${alphaExpr},0,1)*255'`;
}

/**
 * Check whether a clip has non-identity color correction.
 */
export function hasColorCorrection(cc: ClipColorCorrection | undefined): boolean {
  if (!cc) return false;
  return (
    (cc.brightness ?? 0) !== 0 ||
    (cc.contrast ?? 0) !== 0 ||
    (cc.saturation ?? 0) !== 0 ||
    (cc.hue ?? 0) !== 0 ||
    (cc.temperature ?? 0) !== 0
  );
}

/**
 * Build FFmpeg filter segment for clip color correction.
 * Uses `eq` for brightness/contrast/saturation, `hue` for hue rotation,
 * and `colortemperature` for temperature adjustment.
 * Returns comma-prefixed filter chain or empty string.
 */
export function buildColorCorrectionFilter(cc: ClipColorCorrection | undefined): string {
  if (!cc || !hasColorCorrection(cc)) return "";

  const parts: string[] = [];

  // eq filter: brightness, contrast, saturation
  const eqParts: string[] = [];
  const brightness = cc.brightness ?? 0;
  const contrast = cc.contrast ?? 0;
  const saturation = cc.saturation ?? 0;

  // FFmpeg eq: brightness is additive (-1..1), contrast is multiplicative (0..2 where 1=no change),
  // saturation is multiplicative (0..3 where 1=no change)
  if (brightness !== 0) eqParts.push(`brightness=${brightness}`);
  if (contrast !== 0) eqParts.push(`contrast=${1 + contrast}`);
  if (saturation !== 0) eqParts.push(`saturation=${1 + saturation}`);

  if (eqParts.length > 0) {
    parts.push(`eq=${eqParts.join(":")}`);
  }

  // hue filter for hue rotation
  const hue = cc.hue ?? 0;
  if (hue !== 0) {
    parts.push(`hue=h=${hue}`);
  }

  // colortemperature filter for temperature adjustment
  const temperature = cc.temperature ?? 0;
  if (temperature !== 0) {
    // Map -1..1 to ~2000K..12000K (6500K = neutral)
    // temperature -1 -> 2000K (cool), 0 -> 6500K (neutral), 1 -> 12000K (warm)
    const kelvin = Math.round(6500 + temperature * 5500);
    parts.push(`colortemperature=temperature=${kelvin}`);
  }

  if (parts.length === 0) return "";
  return "," + parts.join(",");
}

/**
 * Build FFmpeg filter segment for chroma key (green screen removal).
 * Uses FFmpeg `chromakey` filter.
 * Returns comma-prefixed filter or empty string.
 */
export function buildChromaKeyFilter(ck: ClipChromaKey | undefined): string {
  if (!ck) return "";
  // Sanitize color: must be a valid hex color
  const color = /^#[0-9a-fA-F]{6}$/.test(ck.color) ? ck.color : "0x00ff00";
  // Convert #rrggbb to 0xrrggbb for FFmpeg
  const ffmpegColor = color.replace("#", "0x");
  const similarity = Math.max(0, Math.min(1, ck.similarity));
  const blend = Math.max(0, Math.min(1, ck.blend));
  return `,chromakey=color=${ffmpegColor}:similarity=${similarity}:blend=${blend}`;
}

/**
 * Build overlay position expression for a clip.
 * Clips with transforms are centered then offset by x/y.
 * Clips without transforms use 0:0 (they are already canvas-sized).
 * When keyframe tracks animate transform.x or transform.y, generates
 * time-dependent FFmpeg expressions.
 */
export function buildOverlayPosition(clip: Clip): string {
  if (!hasClipTransform(clip)) return "0:0";
  const tracks = clip.keyframeTracks;
  const staticX = clip.transform?.x ?? 0;
  const staticY = clip.transform?.y ?? 0;

  let xExpr: string;
  let yExpr: string;

  const hasAnimatedX = tracks != null && hasKeyframes(tracks, "transform.x");
  const hasAnimatedY = tracks != null && hasKeyframes(tracks, "transform.y");

  const clipStartSec = clip.startMs / 1000;

  if (hasAnimatedX) {
    const animExpr = buildKeyframeFilterExpression(tracks!, "transform.x", staticX, clip.durationMs, clipStartSec);
    xExpr = `(W-w)/2+(${animExpr})`;
  } else {
    xExpr = staticX === 0 ? "(W-w)/2" : `(W-w)/2+${staticX}`;
  }

  if (hasAnimatedY) {
    const animExpr = buildKeyframeFilterExpression(tracks!, "transform.y", staticY, clip.durationMs, clipStartSec);
    yExpr = `(H-h)/2+(${animExpr})`;
  } else {
    yExpr = staticY === 0 ? "(H-h)/2" : `(H-h)/2+${staticY}`;
  }

  // When keyframe expressions contain commas, use named x='..':y='..' syntax
  // so FFmpeg doesn't parse commas as overlay parameter separators.
  if (hasAnimatedX || hasAnimatedY) {
    return `x='${xExpr}':y='${yExpr}'`;
  }

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
  resolveAssetVideoPathOverride?: (asset: Asset) => string,
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

  // Collect all visual clips from all tracks, with track index.
  // A clip is "visual" if a clip handler is registered for its asset kind.
  // Clips with empty assetId (no asset assigned) are skipped.
  // Muted tracks are excluded from export.
  const allVisualClips: { clip: Clip; trackIndex: number }[] = [];
  project.sequence.tracks.forEach((track, trackIndex) => {
    if (track.muted) return; // Skip muted tracks
    for (const clip of track.clips) {
      if (!clip.assetId) continue;
      const asset = project.assets.find((a) => a.id === clip.assetId);
      if (asset && exportHandlerRegistry.hasClipHandler(asset.kind)) {
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

  const defaultResolve = (asset: Asset) =>
    path.join(assetsBase, path.basename(asset.originalPath));

  const ctx = {
    project,
    preset,
    assetsBase,
    inputArgs: [] as string[],
    filterParts: [] as string[],
    inputIndex: 0,
    clipInputIndices: new Map<string, number>(),
    clipHasTransform: new Map<string, boolean>(),
    resolveAssetVideoPath: resolveAssetVideoPathOverride ?? defaultResolve,
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

  // 3. Pre-compute fade-out info for clips that precede a fade-type transition
  const fadeOutMap = new Map<string, { durationSec: number; clipDurationSec: number; transType: string }>();
  for (const { clip, trackIndex } of clipInfos) {
    const transHandler = clip.transition ? transitionExportRegistry.get(clip.transition.type) : undefined;
    if (!clip.transition || !transHandler?.buildFadeOut) continue;
    const prev = clipInfos.find(
      (ci) =>
        ci.trackIndex === trackIndex &&
        ci.clip.id !== clip.id &&
        ci.clip.startMs < clip.startMs &&
        ci.clip.startMs + ci.clip.durationMs > clip.startMs,
    );
    if (prev) {
      fadeOutMap.set(prev.clip.id, {
        durationSec: clip.transition.durationMs / 1000,
        clipDurationSec: prev.clip.durationMs / 1000,
        transType: clip.transition.type,
      });
    }
  }

  // 4. Overlay all clips onto the base, ordered by track (bottom to top), then by time
  let currentBase = "[base]";
  let overlayIdx = 0;

  for (const { clip, inputLabel } of clipInfos) {
    let effectiveLabel = inputLabel;
    const transType = clip.transition?.type;
    const ptsOffset = clip.startMs / 1000;

    // ── Incoming fade-in (this clip has a transition with buildFadeIn) ──
    const fadeInHandler = transType ? transitionExportRegistry.get(transType) : undefined;
    if (fadeInHandler?.buildFadeIn) {
      const fadeDur = clip.transition!.durationMs / 1000;
      const fadeInLabel = `[vfi${overlayIdx}]`;
      const filter = fadeInHandler.buildFadeIn(inputLabel, fadeInLabel, ptsOffset, fadeDur);
      if (filter) {
        ctx.filterParts.push(filter);
        effectiveLabel = fadeInLabel;
      }
    }

    // ── Outgoing fade-out (next clip on same track has a transition with buildFadeOut) ──
    const fadeOut = fadeOutMap.get(clip.id);
    if (fadeOut) {
      const fadeOutStart = ptsOffset + fadeOut.clipDurationSec - fadeOut.durationSec;
      const fadeOutLabel = `[vfo${overlayIdx}]`;
      const fadeOutHandler = transitionExportRegistry.get(fadeOut.transType);
      const fadeOutFilter = fadeOutHandler?.buildFadeOut?.(effectiveLabel, fadeOutLabel, fadeOutStart, fadeOut.durationSec);
      if (fadeOutFilter) {
        ctx.filterParts.push(fadeOutFilter);
        effectiveLabel = fadeOutLabel;
      }
    }

    // ── Build overlay ──
    const strategy = exportCompositeStrategyRegistry.get(clip.blendMode ?? "cover");
    const startSec = clip.startMs / 1000;
    const endSec = (clip.startMs + clip.durationMs) / 1000;
    const enable = `between(t,${startSec},${endSec})`;
    const outLabel = `[ov${overlayIdx}]`;
    let position = buildOverlayPosition(clip);

    // ── Slide transitions: time-dependent overlay position ──
    // Use x='expr':y='expr' named syntax so colons inside expressions
    // are not parsed as overlay parameter separators.
    const slideHandler = transType ? transitionExportRegistry.get(transType) : undefined;
    if (slideHandler?.buildOverlayPosition) {
      const fadeDur = clip.transition!.durationMs / 1000;
      const slidePos = slideHandler.buildOverlayPosition(startSec, fadeDur, preset);
      if (slidePos) {
        position = slidePos;
      }
    }

    if (strategy) {
      ctx.filterParts.push(
        strategy.buildOverlayFilter(currentBase, effectiveLabel, enable, position, {
          overlayIdx,
          canvasW: preset.width,
          canvasH: preset.height,
          totalDurationSec,
          fps,
        }) + outLabel,
      );
    } else {
      ctx.filterParts.push(
        `${currentBase}${effectiveLabel}overlay=${position}:enable='${enable}'${outLabel}`,
      );
    }

    currentBase = outLabel;
    overlayIdx++;
  }

  let videoOut = currentBase;

  // 4. Apply overlay handlers (text) - collect clips by clipKind from all tracks (skip muted)
  for (const overlayHandler of exportHandlerRegistry.getOverlayHandlers()) {
    const matchingClips = project.sequence.tracks
      .filter((t) => !t.muted)
      .flatMap((t) => t.clips.filter((c) => c.clipKind === overlayHandler.clipKind));
    if (matchingClips.length > 0) {
      videoOut = overlayHandler.buildOverlay(matchingClips, ctx, videoOut);
    }
  }

  // 5. Apply audio handlers - collect clips by clipKind from all tracks (skip muted)
  const allVideoClips = sortedClips.map(({ clip }) => clip);
  let audioFilter = "";
  for (const audioHandler of exportHandlerRegistry.getAudioHandlers()) {
    const matchingClips = project.sequence.tracks
      .filter((t) => !t.muted)
      .flatMap((t) => t.clips.filter((c) => c.clipKind === audioHandler.clipKind));
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

  // Validate - check for visual clips across non-muted tracks (skip empty-asset clips)
  const visualClips = project.sequence.tracks.filter((t) => !t.muted).flatMap((t) =>
    t.clips.filter((c) => {
      if (!c.assetId) return false;
      const asset = project.assets.find((a) => a.id === c.assetId);
      return asset != null && exportHandlerRegistry.hasClipHandler(asset.kind);
    }),
  );
  if (visualClips.length === 0) {
    throw new Error("No video clips to export");
  }

  // Calculate total duration for progress (clamped to project settings)
  const maxEndMs = Math.max(...visualClips.map((c) => c.startMs + c.durationMs));
  const totalDurationMs = project.settings?.durationMs
    ? Math.min(maxEndMs, project.settings.durationMs)
    : maxEndMs;

  // Identify generative assets that need cache warming
  const generativeAssets = project.assets.filter((a) =>
    generativeAssetHandlerRegistry.has(a.kind),
  );

  const job = jobQueue.enqueue(projectId, "export", async (j: Job) => {
    const projDir = getProjectDir(projectId);

    // Phase 1: Warm render cache for generative assets (0–20% progress)
    let cacheManager: RenderCacheManager | undefined;
    if (generativeAssets.length > 0) {
      cacheManager = new RenderCacheManager(projDir);
      await cacheManager.loadManifest();

      for (let i = 0; i < generativeAssets.length; i++) {
        const asset = generativeAssets[i];
        const sourcePath = path.join(projDir, asset.originalPath);
        const cached = await cacheManager.getOrNull(asset.id, sourcePath);

        if (!cached) {
          // Run the full pipeline to render this asset
          const shared = new Map<string, unknown>();
          shared.set("cacheManager", cacheManager);
          const pCtx: PipelineContext = {
            asset: { ...asset },
            projectDir: projDir,
            projectId,
            shared,
            reportProgress: () => {},
            cacheManager,
          };
          await runPipeline(asset.kind, pCtx, () => {});
        }

        j.progress = ((i + 1) / generativeAssets.length) * 0.2;
        j.updatedAt = new Date().toISOString();
      }
    }

    // Phase 2: Build export args with resolveAssetVideoPath
    const resolveAssetVideoPath = (asset: Asset) => {
      if (cacheManager && generativeAssetHandlerRegistry.has(asset.kind)) {
        return cacheManager.renderedMp4Path(asset.id);
      }
      return path.join(assetsBase, path.basename(asset.originalPath));
    };

    const args = buildExportArgs(project, assetsBase, outputPath, resolveAssetVideoPath);

    const proc = Bun.spawn(["ffmpeg", ...args], {
      stdout: "pipe",
      stderr: "pipe",
    });

    // Parse progress (20-100% range)
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
              const exportProgress = Math.min(ms / totalDurationMs, 0.99);
              // Map export progress to 20-100% range
              j.progress = 0.2 + exportProgress * 0.8;
              j.updatedAt = new Date().toISOString();
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
