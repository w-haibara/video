import type { TransitionPreviewHandler } from "../transition-preview-registry";

export const zoomInPreviewHandler: TransitionPreviewHandler = {
  type: "zoom-in",
  label: "Zoom In",
  computeIncomingStyle(progress) {
    // Scale from small to full size, with opacity fade
    const scale = Math.max(0.01, progress);
    return {
      transform: `scale(${scale})`,
      opacity: progress,
    };
  },
};
