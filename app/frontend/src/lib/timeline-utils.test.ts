import { describe, test, expect } from "bun:test";
import { msToPx, pxToMs, clampZoomIndex, getZoomLevels } from "./timeline-utils";

describe("timeline-utils", () => {
  test("msToPx converts ms to px at default zoom (index 3 = 0.1)", () => {
    expect(msToPx(1000, 3)).toBe(100); // 1 sec = 100px at 0.1 px/ms
    expect(msToPx(5000, 3)).toBe(500);
    expect(msToPx(0, 3)).toBe(0);
  });

  test("pxToMs converts px to ms at default zoom", () => {
    expect(pxToMs(100, 3)).toBe(1000);
    expect(pxToMs(500, 3)).toBe(5000);
    expect(pxToMs(0, 3)).toBe(0);
  });

  test("msToPx and pxToMs are inverses", () => {
    for (let z = 0; z < getZoomLevels().length; z++) {
      const ms = 12345;
      expect(pxToMs(msToPx(ms, z), z)).toBeCloseTo(ms, 5);
    }
  });

  test("zoom levels increase", () => {
    const levels = getZoomLevels();
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]).toBeGreaterThan(levels[i - 1]);
    }
  });

  test("higher zoom index means more pixels per ms", () => {
    expect(msToPx(1000, 4)).toBeGreaterThan(msToPx(1000, 3));
  });

  test("clampZoomIndex clamps to valid range", () => {
    expect(clampZoomIndex(-1)).toBe(0);
    expect(clampZoomIndex(0)).toBe(0);
    expect(clampZoomIndex(3)).toBe(3);
    expect(clampZoomIndex(100)).toBe(getZoomLevels().length - 1);
  });
});
