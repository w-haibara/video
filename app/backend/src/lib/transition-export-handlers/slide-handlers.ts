import type { TransitionExportHandler } from "../transition-export-registry";

export const slideLeftExportHandler: TransitionExportHandler = {
  type: "slide-left",
  buildOverlayPosition(startSec, fadeDur, preset) {
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x='${preset.width}-${preset.width}*${prog}':y=0`;
  },
};

export const slideRightExportHandler: TransitionExportHandler = {
  type: "slide-right",
  buildOverlayPosition(startSec, fadeDur, preset) {
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x='-${preset.width}+${preset.width}*${prog}':y=0`;
  },
};

export const slideUpExportHandler: TransitionExportHandler = {
  type: "slide-up",
  buildOverlayPosition(startSec, fadeDur, preset) {
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x=0:y='${preset.height}-${preset.height}*${prog}'`;
  },
};

export const slideDownExportHandler: TransitionExportHandler = {
  type: "slide-down",
  buildOverlayPosition(startSec, fadeDur, preset) {
    const prog = `min(1,(t-${startSec})/${fadeDur})`;
    return `x=0:y='-${preset.height}+${preset.height}*${prog}'`;
  },
};
