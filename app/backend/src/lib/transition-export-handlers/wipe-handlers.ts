import type { TransitionExportHandler } from "../transition-export-registry";

/**
 * Wipe-left: incoming clip is revealed from left to right.
 * Uses geq filter to create a time-varying alpha mask that sweeps rightward.
 */
export const wipeLeftExportHandler: TransitionExportHandler = {
  type: "wipe-left",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    // geq alpha: pixels left of the wipe edge are visible (alpha=255),
    // pixels right of the edge are transparent (alpha=0).
    // Wipe edge: X < W * progress
    const prog = `min(1,max(0,(T-${ptsOffset})/${fadeDur}))`;
    return `${inputLabel}format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lt(X,W*${prog}),255,0)'${outLabel}`;
  },
};

/**
 * Wipe-up: incoming clip is revealed from bottom to top.
 * Uses geq filter to create a time-varying alpha mask that sweeps upward.
 */
export const wipeUpExportHandler: TransitionExportHandler = {
  type: "wipe-up",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    // geq alpha: pixels below the wipe edge are visible (alpha=255),
    // pixels above the edge are transparent (alpha=0).
    // Wipe edge sweeps from bottom (Y=H) to top (Y=0).
    // Visible when Y > H * (1 - progress), i.e. Y >= H - H*progress
    const prog = `min(1,max(0,(T-${ptsOffset})/${fadeDur}))`;
    return `${inputLabel}format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(gte(Y,H*(1-${prog})),255,0)'${outLabel}`;
  },
};
