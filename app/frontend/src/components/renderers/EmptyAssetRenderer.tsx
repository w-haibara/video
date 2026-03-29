import type { PreviewRenderContext, PreviewLayerRenderer, ActiveEmptyClip } from "../../lib/preview-renderer-registry";
import { findAllActiveEmptyClips } from "../../lib/preview-renderer-registry";
import { theme } from "../../theme";

function EmptyAssetComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const clips = content as ActiveEmptyClip[];

  return (
    <>
      {clips.map((entry) => (
        <div
          key={entry.clip.id}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: entry.trackIndex,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: theme.bgHover,
            border: `2px dashed ${theme.textMuted}`,
            boxSizing: "border-box",
          }}
        >
          <span
            style={{
              color: theme.textMuted,
              fontSize: `${14 * ctx.canvasScale}px`,
              userSelect: "none",
            }}
          >
            No Asset
          </span>
        </div>
      ))}
    </>
  );
}

function findActiveEmptyContent(ctx: PreviewRenderContext): ActiveEmptyClip[] | null {
  const clips = findAllActiveEmptyClips(ctx.project, ctx.currentTimeMs);
  return clips.length > 0 ? clips : null;
}

export const emptyAssetRenderer: PreviewLayerRenderer = {
  id: "empty-asset",
  zOrder: 1,
  findActiveContent: findActiveEmptyContent,
  Component: EmptyAssetComponent,
};
