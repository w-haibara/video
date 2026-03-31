import type { TransitionExportHandler } from "../transition-export-registry";

/**
 * Push-left: outgoing clip slides to the left while incoming slides from the right.
 * - Outgoing: buildFadeOut applies a horizontal slide to the left (negative x direction)
 *   via setpts + overlay repositioning. Since we can't reposition an already-overlaid clip,
 *   we fade the outgoing clip's alpha to 0 during the push, creating the visual effect
 *   of it being pushed away as the incoming clip covers it.
 * - Incoming: buildOverlayPosition slides from right to center (like slide-left)
 */
export const pushLeftExportHandler: TransitionExportHandler = {
  type: "push-left",
  buildFadeOut(inputLabel, outLabel, fadeOutStart, fadeDur) {
    // Fade out the outgoing clip's alpha during the push transition
    return `${inputLabel}fade=t=out:st=${fadeOutStart}:d=${fadeDur}:alpha=1${outLabel}`;
  },
  buildOverlayPosition(startSec, fadeDur, preset) {
    // Incoming slides from right to final position
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x='${preset.width}-${preset.width}*${prog}':y=0`;
  },
};
