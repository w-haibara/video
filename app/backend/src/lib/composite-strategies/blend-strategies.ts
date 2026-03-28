import type { ExportCompositeStrategy, CompositeContext } from "../composite-strategy-registry";

function blendStrategy(id: string, ffmpegMode: string): ExportCompositeStrategy {
  return {
    id,
    buildOverlayFilter(
      bottomLabel: string,
      topLabel: string,
      enable: string,
      position?: string,
      _ctx?: CompositeContext,
    ): string {
      const pos = position ?? "0:0";
      if (pos === "0:0") {
        // Same-sized inputs: blend directly
        return `${bottomLabel}${topLabel}blend=all_mode=${ffmpegMode}:enable='${enable}'`;
      }
      // Positioned clip: fall back to overlay (blend requires same-sized inputs)
      return `${bottomLabel}${topLabel}overlay=${pos}:enable='${enable}'`;
    },
  };
}

export const multiplyExportStrategy = blendStrategy("multiply", "multiply");
export const screenExportStrategy = blendStrategy("screen", "screen");
export const overlayExportStrategy = blendStrategy("overlay", "overlay");
export const addExportStrategy = blendStrategy("add", "addition");
export const differenceExportStrategy = blendStrategy("difference", "difference");
