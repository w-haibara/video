import type { TransitionExportHandler } from "../transition-export-registry";

/**
 * Zoom-in: incoming clip scales from small (center) to full size with alpha fade-in.
 *
 * Uses FFmpeg `scale` with a time-varying expression to animate scale from 0.3 to 1.0,
 * combined with alpha fade-in. The overlay is centered via buildOverlayPosition.
 */
export const zoomInExportHandler: TransitionExportHandler = {
  type: "zoom-in",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    // Scale from 0.3 to 1.0 over the transition, combined with alpha fade-in.
    // FFmpeg scale filter needs eval=frame to evaluate expressions per-frame.
    const scaleExpr = `0.3+0.7*clip((t-${ptsOffset})/${fadeDur},0,1)`;
    return (
      `${inputLabel}scale=w='iw*(${scaleExpr})':h='ih*(${scaleExpr})':eval=frame,format=yuva420p,` +
      `fade=t=in:st=${ptsOffset}:d=${fadeDur}:alpha=1${outLabel}`
    );
  },
  buildOverlayPosition(startSec, fadeDur, _preset) {
    // Center the scaled clip during the transition; after transition it's full-size at 0,0
    return `x='(W-w)/2':y='(H-h)/2'`;
  },
};
