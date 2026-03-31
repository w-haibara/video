import { describe, test, expect } from "bun:test";
import { buildColorCorrectionFilter } from "./color-correction-css";

describe("buildColorCorrectionFilter", () => {
  test("returns undefined for undefined input", () => {
    expect(buildColorCorrectionFilter(undefined)).toBeUndefined();
  });

  test("returns undefined for empty object (all defaults)", () => {
    expect(buildColorCorrectionFilter({})).toBeUndefined();
  });

  test("returns undefined for all-zero values", () => {
    expect(buildColorCorrectionFilter({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      temperature: 0,
    })).toBeUndefined();
  });

  test("brightness only", () => {
    expect(buildColorCorrectionFilter({ brightness: 0.5 })).toBe("brightness(1.5)");
  });

  test("negative brightness", () => {
    expect(buildColorCorrectionFilter({ brightness: -0.5 })).toBe("brightness(0.5)");
  });

  test("contrast only", () => {
    expect(buildColorCorrectionFilter({ contrast: 0.3 })).toBe("contrast(1.3)");
  });

  test("saturation only", () => {
    expect(buildColorCorrectionFilter({ saturation: -0.5 })).toBe("saturate(0.5)");
  });

  test("hue only", () => {
    expect(buildColorCorrectionFilter({ hue: 90 })).toBe("hue-rotate(90deg)");
  });

  test("negative hue", () => {
    expect(buildColorCorrectionFilter({ hue: -45 })).toBe("hue-rotate(-45deg)");
  });

  test("warm temperature approximated with sepia + saturate", () => {
    expect(buildColorCorrectionFilter({ temperature: 0.5 })).toBe("sepia(0.150) saturate(1.150)");
  });

  test("cool temperature approximated with hue-rotate + saturate", () => {
    expect(buildColorCorrectionFilter({ temperature: -0.5 })).toBe("hue-rotate(15.0deg) saturate(0.900)");
  });

  test("multiple values combined", () => {
    expect(buildColorCorrectionFilter({
      brightness: 0.2,
      contrast: -0.1,
      saturation: 0.5,
      hue: 30,
    })).toBe("brightness(1.2) contrast(0.9) saturate(1.5) hue-rotate(30deg)");
  });

  test("partial values with some at zero", () => {
    expect(buildColorCorrectionFilter({
      brightness: 0,
      contrast: 0.5,
      saturation: 0,
      hue: 0,
    })).toBe("contrast(1.5)");
  });

  test("extreme values (min/max)", () => {
    expect(buildColorCorrectionFilter({
      brightness: -1,
      contrast: 1,
      saturation: -1,
      hue: 180,
    })).toBe("brightness(0) contrast(2) saturate(0) hue-rotate(180deg)");
  });
});
