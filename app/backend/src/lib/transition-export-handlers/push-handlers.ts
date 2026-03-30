import type { TransitionExportHandler } from "../transition-export-registry";

/**
 * Push-left: outgoing clip is pushed to the left while incoming slides from the right.
 * - Outgoing: buildFadeOut applies a fade-out on alpha so it disappears during push
 * - Incoming: buildOverlayPosition slides from right to center (like slide-left)
 */
export const pushLeftExportHandler: TransitionExportHandler = {
  type: "push-left",
  buildFadeOut(inputLabel, outLabel, fadeOutStart, fadeDur) {
    // Fade out the outgoing clip's alpha during the transition
    return `${inputLabel}fade=t=out:st=${fadeOutStart}:d=${fadeDur}:alpha=1${outLabel}`;
  },
  buildOverlayPosition(startSec, fadeDur, preset) {
    // Incoming slides from right to final position (same as slide-left)
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x='${preset.width}-${preset.width}*${prog}':y=0`;
  },
};
