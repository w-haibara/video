const ZOOM_LEVELS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];

export function getZoomLevels() {
  return ZOOM_LEVELS;
}

export function msToPx(ms: number, zoomIndex: number): number {
  return ms * ZOOM_LEVELS[zoomIndex];
}

export function pxToMs(px: number, zoomIndex: number): number {
  return px / ZOOM_LEVELS[zoomIndex];
}

export function clampZoomIndex(index: number): number {
  return Math.max(0, Math.min(index, ZOOM_LEVELS.length - 1));
}
