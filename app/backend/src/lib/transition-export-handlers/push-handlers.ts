import type { TransitionExportHandler } from "../transition-export-registry";

/**
 * Push-left: outgoing clip slides to the left while incoming slides from the right.
 * - Outgoing: buildOutgoingOverlayPosition slides from 0:0 to -W:0
 * - Incoming: buildOverlayPosition slides from right to center (like slide-left)
 */
export const pushLeftExportHandler: TransitionExportHandler = {
  type: "push-left",
  buildOverlayPosition(startSec, fadeDur, preset) {
    // Incoming slides from right to final position
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x='${preset.width}-${preset.width}*${prog}':y=0`;
  },
  buildOutgoingOverlayPosition(fadeOutStart, fadeDur, preset) {
    // Outgoing slides from 0 to -W (off screen left), clamped to 0 before transition starts
    const prog = `max(0,min(1,(t-${fadeOutStart})/${fadeDur}))`;
    return `x='-${preset.width}*${prog}':y=0`;
  },
};
