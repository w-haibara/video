import type { TransitionExportHandler } from "../transition-export-registry";

export const fadeExportHandler: TransitionExportHandler = {
  type: "fade",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    return `${inputLabel}fade=t=in:st=${ptsOffset}:d=${fadeDur}:alpha=1${outLabel}`;
  },
  buildFadeOut(inputLabel, outLabel, fadeOutStart, fadeDur) {
    return `${inputLabel}fade=t=out:st=${fadeOutStart}:d=${fadeDur}:alpha=1${outLabel}`;
  },
};

export const fadeBlackExportHandler: TransitionExportHandler = {
  type: "fade-black",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    return `${inputLabel}fade=t=in:st=${ptsOffset + fadeDur / 2}:d=${fadeDur / 2}:alpha=1${outLabel}`;
  },
  buildFadeOut(inputLabel, outLabel, fadeOutStart, fadeDur) {
    return `${inputLabel}fade=t=out:st=${fadeOutStart}:d=${fadeDur / 2}:alpha=1${outLabel}`;
  },
};

export const fadeWhiteExportHandler: TransitionExportHandler = {
  type: "fade-white",
  buildFadeIn(inputLabel, outLabel, ptsOffset, fadeDur) {
    const halfStart = ptsOffset + fadeDur / 2;
    const halfDur = fadeDur / 2;
    return `${inputLabel}fade=t=in:st=${halfStart}:d=${halfDur}:alpha=1,fade=t=in:st=${halfStart}:d=${halfDur}:color=white${outLabel}`;
  },
  buildFadeOut(inputLabel, outLabel, fadeOutStart, fadeDur) {
    const halfDur = fadeDur / 2;
    const midpoint = fadeOutStart + halfDur;
    return `${inputLabel}fade=t=out:st=${fadeOutStart}:d=${halfDur}:color=white,fade=t=out:st=${midpoint}:d=${halfDur}:alpha=1${outLabel}`;
  },
};
