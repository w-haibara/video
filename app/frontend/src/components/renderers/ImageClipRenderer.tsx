import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findActiveClipInTracks, computeMediaContainerStyle, mediaStyle } from "../../lib/preview-renderer-registry";

function findActiveImageClip(ctx: PreviewRenderContext): ActiveClip | null {
  return findActiveClipInTracks(ctx.project, ctx.currentTimeMs, "video", "image");
}

function ImageClipComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const activeClip = content as ActiveClip;
  const assetW = activeClip.asset.width ?? ctx.canvasW;
  const assetH = activeClip.asset.height ?? ctx.canvasH;
  const crop = activeClip.clip.crop;

  const thumb = activeClip.asset.thumbnailPath;
  const imageUrl = thumb
    ? `/media/projects/${ctx.project.id}/thumbnails/${thumb.split("/").pop()}`
    : "";

  return (
    <div style={computeMediaContainerStyle(activeClip, ctx.canvasW, ctx.canvasH)}>
      <img src={imageUrl} alt="" style={mediaStyle(crop, assetW, assetH)} />
    </div>
  );
}

export const imageClipRenderer: PreviewLayerRenderer = {
  id: "image-clip",
  zOrder: 0,
  findActiveContent: findActiveImageClip,
  Component: ImageClipComponent,
};
