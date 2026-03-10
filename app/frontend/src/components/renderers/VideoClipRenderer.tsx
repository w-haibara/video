import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findActiveClipInTracks, computeMediaContainerStyle, mediaStyle } from "../../lib/preview-renderer-registry";

function findActiveVideoClip(ctx: PreviewRenderContext): ActiveClip | null {
  return findActiveClipInTracks(ctx.project, ctx.currentTimeMs, "video", "video");
}

function VideoClipComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const activeClip = content as ActiveClip;
  const assetW = activeClip.asset.width ?? ctx.canvasW;
  const assetH = activeClip.asset.height ?? ctx.canvasH;
  const crop = activeClip.clip.crop;

  return (
    <div style={computeMediaContainerStyle(activeClip, ctx.canvasW, ctx.canvasH)}>
      <video
        ref={ctx.videoRef}
        style={mediaStyle(crop, assetW, assetH)}
        muted
      />
    </div>
  );
}

export const videoClipRenderer: PreviewLayerRenderer = {
  id: "video-clip",
  zOrder: 0,
  findActiveContent: findActiveVideoClip,
  Component: VideoClipComponent,
};
