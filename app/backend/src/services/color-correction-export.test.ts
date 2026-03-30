import { describe, test, expect } from "bun:test";
import { buildColorCorrectionFilter, hasColorCorrection } from "./export-service";

describe("hasColorCorrection", () => {
  test("returns false for undefined", () => {
    expect(hasColorCorrection(undefined)).toBe(false);
  });

  test("returns false for empty object", () => {
    expect(hasColorCorrection({})).toBe(false);
  });

  test("returns false for all-zero values", () => {
    expect(hasColorCorrection({
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      temperature: 0,
    })).toBe(false);
  });

  test("returns true for non-zero brightness", () => {
    expect(hasColorCorrection({ brightness: 0.5 })).toBe(true);
  });

  test("returns true for non-zero temperature", () => {
    expect(hasColorCorrection({ temperature: -0.3 })).toBe(true);
  });
});

describe("buildColorCorrectionFilter", () => {
  test("returns empty string for undefined", () => {
    expect(buildColorCorrectionFilter(undefined)).toBe("");
  });

  test("returns empty string for all defaults", () => {
    expect(buildColorCorrectionFilter({})).toBe("");
  });

  test("brightness only", () => {
    expect(buildColorCorrectionFilter({ brightness: 0.3 })).toBe(",eq=brightness=0.3");
  });

  test("contrast only", () => {
    expect(buildColorCorrectionFilter({ contrast: 0.5 })).toBe(",eq=contrast=1.5");
  });

  test("saturation only", () => {
    expect(buildColorCorrectionFilter({ saturation: -0.5 })).toBe(",eq=saturation=0.5");
  });

  test("hue only", () => {
    expect(buildColorCorrectionFilter({ hue: 90 })).toBe(",hue=h=90");
  });

  test("negative hue", () => {
    expect(buildColorCorrectionFilter({ hue: -45 })).toBe(",hue=h=-45");
  });

  test("temperature only (warm)", () => {
    const result = buildColorCorrectionFilter({ temperature: 1 });
    expect(result).toBe(",colortemperature=temperature=12000");
  });

  test("temperature only (cool)", () => {
    const result = buildColorCorrectionFilter({ temperature: -1 });
    expect(result).toBe(",colortemperature=temperature=1000");
  });

  test("temperature neutral", () => {
    expect(buildColorCorrectionFilter({ temperature: 0 })).toBe("");
  });

  test("multiple eq properties combined", () => {
    const result = buildColorCorrectionFilter({
      brightness: 0.2,
      contrast: -0.3,
      saturation: 0.5,
    });
    expect(result).toBe(",eq=brightness=0.2:contrast=0.7:saturation=1.5");
  });

  test("eq + hue combined", () => {
    const result = buildColorCorrectionFilter({
      brightness: 0.1,
      hue: 45,
    });
    expect(result).toBe(",eq=brightness=0.1,hue=h=45");
  });

  test("all properties combined", () => {
    const result = buildColorCorrectionFilter({
      brightness: 0.2,
      contrast: 0.1,
      saturation: -0.3,
      hue: 30,
      temperature: 0.5,
    });
    expect(result).toBe(",eq=brightness=0.2:contrast=1.1:saturation=0.7,hue=h=30,colortemperature=temperature=9250");
  });

  test("extreme values", () => {
    const result = buildColorCorrectionFilter({
      brightness: -1,
      contrast: 1,
      saturation: -1,
      hue: 180,
      temperature: -1,
    });
    expect(result).toBe(",eq=brightness=-1:contrast=2:saturation=0,hue=h=180,colortemperature=temperature=1000");
  });
});
