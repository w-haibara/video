import type { CSSProperties } from "react";
import type { PreviewCompositeStrategy } from "../composite-strategy-registry";

function blendStrategy(id: string, label: string, mixBlendMode: CSSProperties["mixBlendMode"]): PreviewCompositeStrategy {
  return {
    id,
    label,
    containerStyle() {
      return { mixBlendMode };
    },
  };
}

export const multiplyPreviewStrategy = blendStrategy("multiply", "Multiply (乗算)", "multiply");
export const screenPreviewStrategy = blendStrategy("screen", "Screen (スクリーン)", "screen");
export const overlayPreviewStrategy = blendStrategy("overlay", "Overlay (オーバーレイ)", "overlay");
export const addPreviewStrategy = blendStrategy("add", "Add (加算)", "lighter");
export const differencePreviewStrategy = blendStrategy("difference", "Difference (差の絶対値)", "difference");
