import { useRef } from "react";
import type { ActiveClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";
import { findAllActiveClips, computeMediaContainerStyle, mediaStyle, computeTransitionStyle } from "../../lib/preview-renderer-registry";
import { compositeStrategyRegistry } from "../../lib/composite-strategy-registry";
import type { VideoFilter } from "@video/shared";
import { ChromaKeyOverlay } from "./ChromaKeyOverlay";
import { GrainOverlay } from "./GrainOverlay";

/** Find a video filter by type and return its strength, or 0 if not present. */
function getFilterStrength(filters: VideoFilter[] | undefined, type: string): number {
  if (!filters) return 0;
  const f = filters.find((v) => v.type === type);
  return f && f.strength > 0 ? f.strength : 0;
}

/** Vignette overlay div. */
function VignetteOverlay({ strength }: { strength: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
        pointerEvents: "none",
      }}
    />
  );
}

function ImageClipComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const activeClips = content as ActiveClip[];

  return (
    <>
      {activeClips.map((activeClip) => {
        const assetW = activeClip.asset.width ?? ctx.canvasW;
        const assetH = activeClip.asset.height ?? ctx.canvasH;
        const clip = activeClip.clip;
        const blendMode = clip.blendMode ?? "cover";
        const strategy = compositeStrategyRegistry.get(blendMode);

        const thumb = activeClip.asset.thumbnailPath;
        const imageUrl = thumb
          ? `/media/projects/${ctx.project.id}/thumbnails/${thumb.split("/").pop()}`
          : "";

        const transStyle = computeTransitionStyle(clip, ctx.project, ctx.currentTimeMs);
        const containerStyle = {
          ...computeMediaContainerStyle(activeClip, ctx.canvasW, ctx.canvasH),
          zIndex: activeClip.trackIndex,
          ...(strategy?.containerStyle({ canvasW: ctx.canvasW, canvasH: ctx.canvasH }) ?? {}),
          ...transStyle,
          position: "absolute" as const,
        };

        const chromaKey = clip.chromaKey;
        const vignetteStrength = getFilterStrength(clip.videoFilters, "vignette");
        const grainStrength = getFilterStrength(clip.videoFilters, "grain");

        return (
          <div key={clip.id} style={containerStyle}>
            <ImageWithOverlays
              imageUrl={imageUrl}
              clip={clip}
              assetW={assetW}
              assetH={assetH}
              chromaKey={chromaKey}
              vignetteStrength={vignetteStrength}
              grainStrength={grainStrength}
            />
          </div>
        );
      })}
    </>
  );
}

function ImageWithOverlays({
  imageUrl,
  clip,
  assetW,
  assetH,
  chromaKey,
  vignetteStrength,
  grainStrength,
}: {
  imageUrl: string;
  clip: { crop?: import("@video/shared").ClipCrop; chromaKey?: import("@video/shared").ClipChromaKey };
  assetW: number;
  assetH: number;
  chromaKey: import("@video/shared").ClipChromaKey | undefined;
  vignetteStrength: number;
  grainStrength: number;
}) {
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <>
      <img
        ref={imgRef}
        src={imageUrl}
        alt=""
        style={mediaStyle(clip.crop, assetW, assetH)}
        crossOrigin="anonymous"
      />
      {chromaKey && (
        <ChromaKeyOverlay
          mediaElement={imgRef.current}
          chromaKey={chromaKey}
          width={assetW}
          height={assetH}
        />
      )}
      {vignetteStrength > 0 && <VignetteOverlay strength={vignetteStrength} />}
      {grainStrength > 0 && (
        <GrainOverlay width={assetW} height={assetH} strength={grainStrength} />
      )}
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
