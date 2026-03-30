import type { TransitionPreviewHandler } from "../transition-preview-registry";

export const pushLeftPreviewHandler: TransitionPreviewHandler = {
  type: "push-left",
  label: "Push Left",
  computeIncomingStyle(progress) {
    // Incoming slides from right (same as slide-left)
    return { transform: `translateX(${(1 - progress) * 100}%)` };
  },
  computeOutgoingStyle(progress) {
    // Outgoing is pushed to the left
    return { transform: `translateX(${-progress * 100}%)` };
  },
};
