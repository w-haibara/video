import type { ActiveTextClip, PreviewRenderContext, PreviewLayerRenderer } from "../../lib/preview-renderer-registry";

function findActiveTextClips(ctx: PreviewRenderContext): ActiveTextClip[] | null {
  const result: ActiveTextClip[] = [];
  for (const track of ctx.project.sequence.tracks) {
    for (const clip of track.clips) {
      if (clip.clipKind !== "title") continue;
      if (ctx.currentTimeMs >= clip.startMs && ctx.currentTimeMs < clip.startMs + clip.durationMs && clip.text) {
        result.push({ clip, text: clip.text });
      }
    }
  }
  return result.length > 0 ? result : null;
}

function TextOverlayComponent({ content, ctx }: { content: unknown; ctx: PreviewRenderContext }) {
  const textClips = content as ActiveTextClip[];

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-end",
      pointerEvents: "none",
      padding: `${40 * ctx.canvasScale}px`,
    }}>
      {textClips.map(({ clip, text }) => (
        <div
          key={clip.id}
          style={{
            fontSize: `${(text.fontSize ?? 48) * ctx.canvasScale}px`,
            color: text.color ?? "#ffffff",
            backgroundColor: text.backgroundColor ?? "rgba(0,0,0,0.5)",
            textAlign: (text.align as React.CSSProperties["textAlign"]) ?? "center",
            fontFamily: text.fontFamily ?? "sans-serif",
            padding: `${8 * ctx.canvasScale}px`,
            borderRadius: `${4 * ctx.canvasScale}px`,
            marginBottom: "0px",
            maxWidth: "90%",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {text.value}
        </div>
      ))}
    </div>
  );
}

export const textOverlayRenderer: PreviewLayerRenderer = {
  id: "text-overlay",
  zOrder: 10,
  findActiveContent: findActiveTextClips,
  Component: TextOverlayComponent,
};
