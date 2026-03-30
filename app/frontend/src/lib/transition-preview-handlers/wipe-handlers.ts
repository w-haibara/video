import type { TransitionPreviewHandler } from "../transition-preview-registry";

export const wipeLeftPreviewHandler: TransitionPreviewHandler = {
  type: "wipe-left",
  label: "Wipe Left",
  computeIncomingStyle(progress) {
    // Reveal from left to right using clip-path
    return { clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)` };
  },
};

export const wipeUpPreviewHandler: TransitionPreviewHandler = {
  type: "wipe-up",
  label: "Wipe Up",
  computeIncomingStyle(progress) {
    // Reveal from bottom to top using clip-path
    return { clipPath: `inset(${(1 - progress) * 100}% 0 0 0)` };
  },
};
