import type { TransitionExportHandler } from "../transition-export-registry";

/**
 * Zoom-in: incoming clip appears from center with alpha fade-in.
 *
 * True scaling in FFmpeg requires canvas dimensions that aren't available
 * in the buildFadeIn signature, so the export uses an alpha fade-in as an
 * approximation. The preview handler provides the full scale animation.
 */
export const zoomInExportHandler: TransitionExportHandler = {
  type: "zoom-in",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    return `${inputLabel}fade=t=in:st=${ptsOffset}:d=${fadeDur}:alpha=1${outLabel}`;
  },
};
