import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findAllActiveClips, computeMediaContainerStyle, mediaStyle, computeTransitionStyle } from "../../lib/preview-renderer-registry";
import { compositeStrategyRegistry } from "../../lib/composite-strategy-registry";

function ImageClipComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const activeClips = content as ActiveClip[];

  return (
    <>
      {activeClips.map((activeClip) => {
        const assetW = activeClip.asset.width ?? ctx.canvasW;
        const assetH = activeClip.asset.height ?? ctx.canvasH;
        const blendMode = activeClip.clip.blendMode ?? "cover";
        const strategy = compositeStrategyRegistry.get(blendMode);

        const thumb = activeClip.asset.thumbnailPath;
        const imageUrl = thumb
          ? `/media/projects/${ctx.project.id}/thumbnails/${thumb.split("/").pop()}`
          : "";

        const transStyle = computeTransitionStyle(activeClip.clip, ctx.project, ctx.currentTimeMs);
        const containerStyle = {
          ...computeMediaContainerStyle(activeClip, ctx.canvasW, ctx.canvasH),
          zIndex: activeClip.trackIndex,
          ...(strategy?.containerStyle({ canvasW: ctx.canvasW, canvasH: ctx.canvasH }) ?? {}),
          ...transStyle,
          position: "absolute" as const,
        };

        return (
          <div key={activeClip.clip.id} style={containerStyle}>
            <img src={imageUrl} alt="" style={mediaStyle(activeClip.clip.crop, assetW, assetH)} />
          </div>
        );
      })}
    </>
  );
}

function findActiveImageClips(ctx: PreviewRenderContext): ActiveClip[] | null {
  const clips = findAllActiveClips(ctx.project, ctx.currentTimeMs, "image", "image");
  return clips.length > 0 ? clips : null;
}

export const imageClipRenderer: PreviewLayerRenderer = {
  id: "image-clip",
  zOrder: 0,
  findActiveContent: findActiveImageClips,
  Component: ImageClipComponent,
};
