import { useState, useCallback, useMemo } from "react";

const ZOOM_LEVELS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1.0];
const DEFAULT_ZOOM_INDEX = 3; // 0.1 px/ms = 100px/sec

export function useTimelineZoom() {
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  const pxPerMs = ZOOM_LEVELS[zoomIndex];

  const zoomIn = useCallback(() => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  }, []);

  const msToPx = useCallback((ms: number) => ms * pxPerMs, [pxPerMs]);
  const pxToMs = useCallback((px: number) => px / pxPerMs, [pxPerMs]);

  return useMemo(
    () => ({ pxPerMs, zoomIn, zoomOut, msToPx, pxToMs }),
    [pxPerMs, zoomIn, zoomOut, msToPx, pxToMs],
  );
}
