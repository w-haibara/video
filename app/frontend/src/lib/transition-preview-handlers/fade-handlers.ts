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
    // FFmpeg: fade in alpha (second half) + fade from white (second half)
    return {
      opacity: progress < 0.5 ? 0 : (progress - 0.5) * 2,
      __whiteBlend: progress < 0.5 ? 0 : 1 - (progress - 0.5) * 2,
    };
  },
  computeOutgoingStyle(progress) {
    // FFmpeg: fade to white (first half, alpha stays 1) + fade out alpha (second half)
    return {
      opacity: progress < 0.5 ? 1 : (1 - progress) * 2,
      __whiteBlend: progress < 0.5 ? progress * 2 : 1,
    };
  },
};
