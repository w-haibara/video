import type { ExportCompositeStrategy, CompositeContext } from "../composite-strategy-registry";

export const opacityExportStrategy: ExportCompositeStrategy = {
  id: "opacity",
  buildOverlayFilter(
    bottomLabel: string,
    topLabel: string,
    enable: string,
    position?: string,
    ctx?: CompositeContext,
  ): string {
    const pos = position ?? "0:0";
    const idx = ctx?.overlayIdx ?? 0;
    const tmp = `[_opa${idx}]`;
    return (
      `${topLabel}colorchannelmixer=aa=0.5${tmp};` +
      `${bottomLabel}${tmp}overlay=${pos}:enable='${enable}'`
    );
  },
};
