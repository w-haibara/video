import type { ExportClipHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip, Asset } from "@video/shared";
import path from "node:path";
import { buildTransformFilter } from "../../services/export-service";

export const videoClipHandler: ExportClipHandler = {
  assetKind: "video",
  buildInput(clip: Clip, asset: Asset, ctx: ExportBuildContext): void {
    const assetPath = path.join(ctx.assetsBase, path.basename(asset.originalPath));

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
    let chain =
      `[${i}:v]trim=start=${trimStart}:duration=${duration},setpts=PTS-STARTPTS` +
      `${userCrop},` +
      `pad=w='max(iw,${ctx.preset.width})':h='max(ih,${ctx.preset.height})':x=(ow-iw)/2:y=(oh-ih)/2:color=black,` +
      `crop=${ctx.preset.width}:${ctx.preset.height}:(iw-${ctx.preset.width})/2:(ih-${ctx.preset.height})/2`;
    chain += buildTransformFilter(clip, ctx.preset);
    ctx.filterParts.push(`${chain}[v${i}]`);
    ctx.clipInputIndices.set(clip.id, i);
    ctx.inputIndex++;
  },
};
