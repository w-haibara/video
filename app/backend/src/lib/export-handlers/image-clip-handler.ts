import type { ExportClipHandler, ExportBuildContext } from "../export-handler-registry";
import type { Clip, Asset } from "@video/shared";
import path from "node:path";
import { buildTransformFilter, hasClipTransform } from "../../services/export-service";

export const imageClipHandler: ExportClipHandler = {
  assetKind: "image",
  buildInput(clip: Clip, asset: Asset, ctx: ExportBuildContext): void {
    const assetPath = path.join(ctx.assetsBase, path.basename(asset.originalPath));

    const effectiveDurationMs = Math.min(clip.durationMs, clip.outMs - clip.inMs);

    const i = ctx.inputIndex;
    ctx.inputArgs.push("-loop", "1", "-t", String(effectiveDurationMs / 1000), "-i", assetPath);

    const userCrop = clip.crop ? `crop=${clip.crop.width}:${clip.crop.height}:${clip.crop.x}:${clip.crop.y},` : "";
    const transformed = hasClipTransform(clip);

    let chain: string;
    if (transformed) {
      chain =
        `[${i}:v]${userCrop}format=yuva420p,setsar=1` +
        buildTransformFilter(clip, ctx.preset);
    } else {
      chain =
        `[${i}:v]${userCrop}` +
        `format=yuva420p,` +
        `pad=w='max(iw,${ctx.preset.width})':h='max(ih,${ctx.preset.height})':x=(ow-iw)/2:y=(oh-ih)/2:color=black@0,` +
        `crop=${ctx.preset.width}:${ctx.preset.height}:(iw-${ctx.preset.width})/2:(ih-${ctx.preset.height})/2,setsar=1`;
    }

    ctx.filterParts.push(`${chain}[v${i}]`);
    ctx.clipInputIndices.set(clip.id, i);
    ctx.clipHasTransform.set(clip.id, transformed);
    ctx.inputIndex++;
  },
};
