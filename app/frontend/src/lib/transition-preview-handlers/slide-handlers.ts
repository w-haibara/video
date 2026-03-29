import type { TransitionPreviewHandler } from "../transition-preview-registry";

export const slideLeftPreviewHandler: TransitionPreviewHandler = {
  type: "slide-left",
  label: "Slide Left",
  computeIncomingStyle(progress) {
    return { transform: `translateX(${(1 - progress) * 100}%)` };
  },
};

export const slideRightPreviewHandler: TransitionPreviewHandler = {
  type: "slide-right",
  label: "Slide Right",
  computeIncomingStyle(progress) {
    return { transform: `translateX(${-(1 - progress) * 100}%)` };
  },
};

export const slideUpPreviewHandler: TransitionPreviewHandler = {
  type: "slide-up",
  label: "Slide Up",
  computeIncomingStyle(progress) {
    return { transform: `translateY(${(1 - progress) * 100}%)` };
  },
};

export const slideDownPreviewHandler: TransitionPreviewHandler = {
  type: "slide-down",
  label: "Slide Down",
  computeIncomingStyle(progress) {
    return { transform: `translateY(${-(1 - progress) * 100}%)` };
  },
};
