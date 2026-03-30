import type { ExportClipHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip, Asset } from "@video/shared";
import { buildTransformFilter, hasClipTransform } from "../../services/export-service";

export const videoClipHandler: ExportClipHandler = {
  assetKind: "video",
  buildInput(clip: Clip, asset: Asset, ctx: ExportBuildContext): void {
    const assetPath = ctx.resolveAssetVideoPath(asset);

    let effectiveDurationMs = Math.min(clip.durationMs, clip.outMs - clip.inMs);
    if (asset.durationMs) {
      const maxFromSource = asset.durationMs - clip.inMs;
      if (maxFromSource > 0) {
        effectiveDurationMs = Math.min(effectiveDurationMs, maxFromSource);
      }
    }

    const userCrop = clip.crop
      ? `,crop=${clip.crop.width}:${clip.crop.height}:${clip.crop.x}:${clip.crop.y}`
      : "";

    const i = ctx.inputIndex;
    ctx.inputArgs.push("-ignore_unknown", "-i", assetPath);

    const trimStart = clip.inMs / 1000;
    const duration = effectiveDurationMs / 1000;
    const transformed = hasClipTransform(clip);
    // Shift PTS to match timeline position so the overlay filter doesn't
    // consume frames during the disabled period before clip.startMs.
    const ptsShift = clip.startMs > 0 ? `+${clip.startMs / 1000}/TB` : "";

    let chain: string;
    if (transformed) {
      // Transform present: output at natural size, position via overlay
      chain =
        `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS${ptsShift}` +
        `${userCrop},format=yuva420p` +
        buildTransformFilter(clip, ctx.preset);
    } else {
      // No transform: pad+crop to canvas size (backward compatible)
      chain =
        `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS${ptsShift}` +
        `${userCrop},` +
        `format=yuva420p,` +
        `pad=w='max(iw,${ctx.preset.width})':h='max(ih,${ctx.preset.height})':x=(ow-iw)/2:y=(oh-ih)/2:color=black@0,` +
        `crop=${ctx.preset.width}:${ctx.preset.height}:(iw-${ctx.preset.width})/2:(ih-${ctx.preset.height})/2`;
    }

    ctx.filterParts.push(`${chain}[v${i}]`);
    ctx.clipInputIndices.set(clip.id, i);
    ctx.clipHasTransform.set(clip.id, transformed);
    ctx.inputIndex++;
  },
};
