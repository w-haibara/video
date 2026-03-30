import { describe, test, expect } from "bun:test";
import { buildVideoFilterCss } from "./video-filter-css";

describe("buildVideoFilterCss", () => {
  test("returns undefined for undefined input", () => {
    expect(buildVideoFilterCss(undefined)).toBeUndefined();
  });

  test("returns undefined for empty array", () => {
    expect(buildVideoFilterCss([])).toBeUndefined();
  });

  test("blur filter", () => {
    expect(buildVideoFilterCss([{ type: "blur", strength: 0.5 }])).toBe("blur(5px)");
  });

  test("blur at max strength", () => {
    expect(buildVideoFilterCss([{ type: "blur", strength: 1.0 }])).toBe("blur(10px)");
  });

  test("sepia filter", () => {
    expect(buildVideoFilterCss([{ type: "sepia", strength: 0.7 }])).toBe("sepia(0.7)");
  });

  test("grayscale filter", () => {
    expect(buildVideoFilterCss([{ type: "grayscale", strength: 1.0 }])).toBe("grayscale(1)");
  });

  test("sharpen is export-only (no CSS)", () => {
    expect(buildVideoFilterCss([{ type: "sharpen", strength: 0.5 }])).toBeUndefined();
  });

  test("vignette is export-only (no CSS)", () => {
    expect(buildVideoFilterCss([{ type: "vignette", strength: 0.5 }])).toBeUndefined();
  });

  test("grain is export-only (no CSS)", () => {
    expect(buildVideoFilterCss([{ type: "grain", strength: 0.5 }])).toBeUndefined();
  });

  test("multiple filters combined", () => {
    expect(buildVideoFilterCss([
      { type: "blur", strength: 0.3 },
      { type: "sepia", strength: 0.5 },
      { type: "grayscale", strength: 0.2 },
    ])).toBe("blur(3px) sepia(0.5) grayscale(0.2)");
  });

  test("zero-strength filters are skipped", () => {
    expect(buildVideoFilterCss([
      { type: "blur", strength: 0 },
      { type: "sepia", strength: 0.5 },
    ])).toBe("sepia(0.5)");
  });

  test("all zero-strength returns undefined", () => {
    expect(buildVideoFilterCss([
      { type: "blur", strength: 0 },
      { type: "grayscale", strength: 0 },
    ])).toBeUndefined();
  });

  test("mixed preview and export-only filters", () => {
    expect(buildVideoFilterCss([
      { type: "blur", strength: 0.5 },
      { type: "sharpen", strength: 0.8 },
      { type: "grayscale", strength: 0.3 },
      { type: "grain", strength: 0.5 },
    ])).toBe("blur(5px) grayscale(0.3)");
  });

  test("unknown filter type is skipped", () => {
    expect(buildVideoFilterCss([{ type: "unknown-filter", strength: 0.5 }])).toBeUndefined();
  });
});
