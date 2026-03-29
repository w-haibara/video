import type { TransitionPreviewHandler } from "../transition-preview-registry";

export const fadePreviewHandler: TransitionPreviewHandler = {
  type: "fade",
  label: "Fade",
  computeIncomingStyle(progress) {
    return { opacity: progress };
  },
  computeOutgoingStyle(progress) {
    return { opacity: 1 - progress };
  },
};

export const fadeBlackPreviewHandler: TransitionPreviewHandler = {
  type: "fade-black",
  label: "Fade (Black)",
  computeIncomingStyle(progress) {
    return { opacity: progress < 0.5 ? 0 : (progress - 0.5) * 2 };
  },
  computeOutgoingStyle(progress) {
    return { opacity: progress < 0.5 ? 1 - progress * 2 : 0 };
  },
};

export const fadeWhitePreviewHandler: TransitionPreviewHandler = {
  type: "fade-white",
  label: "Fade (White)",
  computeIncomingStyle(progress) {
    const style: Record<string, unknown> = {
      opacity: progress < 0.5 ? 0 : (progress - 0.5) * 2,
    };
    if (progress < 0.5) {
      style.filter = "brightness(5)";
    }
    return style;
  },
  computeOutgoingStyle(progress) {
    const style: Record<string, unknown> = {
      opacity: progress < 0.5 ? 1 - progress * 2 : 0,
    };
    if (progress < 0.5) {
      style.filter = "brightness(5)";
    }
    return style;
  },
};
