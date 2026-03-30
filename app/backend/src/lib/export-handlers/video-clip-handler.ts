import type { ExportClipHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip, Asset } from "@video/shared";
import { buildTransformFilter, hasClipTransform, buildColorCorrectionFilter } from "../../services/export-service";

export const videoClipHandler: ExportClipHandler = {
  assetKind: "video",
  buildInput(clip: Clip, asset: Asset, ctx: ExportBuildContext): void {
    const assetPath = ctx.resolveAssetVideoPath(asset);

    const speed = clip.speed ?? 1;
    // When speed != 1, source media is consumed faster/slower.
    // We need to trim a longer/shorter portion of the source, then retime.
    // sourceDuration = timelineDuration * speed (how much source media we need)
    let effectiveDurationMs = Math.min(clip.durationMs, clip.outMs - clip.inMs);
    const sourceTrimDurationMs = effectiveDurationMs * speed;
    let trimDurationMs = sourceTrimDurationMs;
    if (asset.durationMs) {
      const maxFromSource = asset.durationMs - clip.inMs;
      if (maxFromSource > 0) {
        trimDurationMs = Math.min(trimDurationMs, maxFromSource);
      }
    }

    const userCrop = clip.crop
      ? `,crop=${clip.crop.width}:${clip.crop.height}:${clip.crop.x}:${clip.crop.y}`
      : "";

    const i = ctx.inputIndex;
    ctx.inputArgs.push("-ignore_unknown", "-i", assetPath);

    const trimStart = clip.inMs / 1000;
    const duration = trimDurationMs / 1000;
    const transformed = hasClipTransform(clip);
    // Shift PTS to match timeline position so the overlay filter doesn't
    // consume frames during the disabled period before clip.startMs.
    const ptsShift = clip.startMs > 0 ? `+${clip.startMs / 1000}/TB` : "";

    // Speed filter: setpts=PTS/{speed} retimes the video
    const speedFilter = speed !== 1 ? `,setpts=PTS/${speed}` : "";

    const ccFilter = buildColorCorrectionFilter(clip.colorCorrection);

    let chain: string;
    if (transformed) {
      // Transform present: output at natural size, position via overlay
      chain =
        `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS${ptsShift}` +
        `${speedFilter}` +
        `${userCrop},format=yuva420p` +
        buildTransformFilter(clip, ctx.preset) +
        ccFilter;
    } else {
      // No transform: pad+crop to canvas size (backward compatible)
      chain =
        `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS${ptsShift}` +
        `${speedFilter}` +
        `${userCrop},` +
        `format=yuva420p,` +
        `pad=w='max(iw,${ctx.preset.width})':h='max(ih,${ctx.preset.height})':x=(ow-iw)/2:y=(oh-ih)/2:color=black@0,` +
        `crop=${ctx.preset.width}:${ctx.preset.height}:(iw-${ctx.preset.width})/2:(ih-${ctx.preset.height})/2` +
        ccFilter;
    }

    ctx.filterParts.push(`${chain}[v${i}]`);
    ctx.clipInputIndices.set(clip.id, i);
    ctx.clipHasTransform.set(clip.id, transformed);
    ctx.inputIndex++;
  },
};
