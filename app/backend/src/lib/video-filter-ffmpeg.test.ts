import { describe, test, expect } from "bun:test";
import { buildVideoFilterFfmpeg } from "./video-filter-ffmpeg";

describe("buildVideoFilterFfmpeg", () => {
  test("returns empty string for undefined input", () => {
    expect(buildVideoFilterFfmpeg(undefined)).toBe("");
  });

  test("returns empty string for empty array", () => {
    expect(buildVideoFilterFfmpeg([])).toBe("");
  });

  test("blur filter", () => {
    const result = buildVideoFilterFfmpeg([{ type: "blur", strength: 0.5 }]);
    expect(result).toBe(",boxblur=5:5");
  });

  test("blur at full strength", () => {
    const result = buildVideoFilterFfmpeg([{ type: "blur", strength: 1.0 }]);
    expect(result).toBe(",boxblur=10:10");
  });

  test("blur at low strength clamps to 1", () => {
    const result = buildVideoFilterFfmpeg([{ type: "blur", strength: 0.05 }]);
    expect(result).toBe(",boxblur=1:1");
  });

  test("sharpen filter", () => {
    const result = buildVideoFilterFfmpeg([{ type: "sharpen", strength: 0.5 }]);
    expect(result).toBe(",unsharp=5:5:0.75:5:5:0");
  });

  test("sharpen at full strength", () => {
    const result = buildVideoFilterFfmpeg([{ type: "sharpen", strength: 1.0 }]);
    expect(result).toBe(",unsharp=5:5:1.50:5:5:0");
  });

  test("vignette filter", () => {
    const result = buildVideoFilterFfmpeg([{ type: "vignette", strength: 0.5 }]);
    expect(result).toMatch(/^,vignette=angle=PI\/2\.50$/);
  });

  test("vignette at full strength", () => {
    const result = buildVideoFilterFfmpeg([{ type: "vignette", strength: 1.0 }]);
    expect(result).toBe(",vignette=angle=PI/1.00");
  });

  test("grain filter", () => {
    const result = buildVideoFilterFfmpeg([{ type: "grain", strength: 0.5 }]);
    expect(result).toBe(",noise=alls=15:allf=t");
  });

  test("grain at full strength", () => {
    const result = buildVideoFilterFfmpeg([{ type: "grain", strength: 1.0 }]);
    expect(result).toBe(",noise=alls=30:allf=t");
  });

  test("sepia filter", () => {
    const result = buildVideoFilterFfmpeg([{ type: "sepia", strength: 1.0 }]);
    expect(result).toMatch(/^,colorchannelmixer=/);
    // At full strength, R channel should be .393:.769:.189
    expect(result).toContain("0.393:0.769:0.189:0");
  });

  test("sepia at half strength blends with identity", () => {
    const result = buildVideoFilterFfmpeg([{ type: "sepia", strength: 0.5 }]);
    expect(result).toMatch(/^,colorchannelmixer=/);
  });

  test("grayscale filter at full strength", () => {
    const result = buildVideoFilterFfmpeg([{ type: "grayscale", strength: 1.0 }]);
    expect(result).toMatch(/^,colorchannelmixer=/);
    // At full grayscale, all rows should have same weights: .3:.59:.11
    expect(result).toContain("0.300:0.590:0.110:0");
  });

  test("grayscale at half strength", () => {
    const result = buildVideoFilterFfmpeg([{ type: "grayscale", strength: 0.5 }]);
    expect(result).toMatch(/^,colorchannelmixer=/);
  });

  test("multiple filters combined", () => {
    const result = buildVideoFilterFfmpeg([
      { type: "blur", strength: 0.3 },
      { type: "sepia", strength: 0.5 },
    ]);
    expect(result).toMatch(/^,boxblur=3:3,colorchannelmixer=/);
  });

  test("zero-strength filters are skipped", () => {
    const result = buildVideoFilterFfmpeg([
      { type: "blur", strength: 0 },
      { type: "sepia", strength: 0.5 },
    ]);
    expect(result).toMatch(/^,colorchannelmixer=/);
  });

  test("all zero-strength returns empty string", () => {
    expect(buildVideoFilterFfmpeg([
      { type: "blur", strength: 0 },
      { type: "grayscale", strength: 0 },
    ])).toBe("");
  });

  test("unknown filter type is skipped", () => {
    expect(buildVideoFilterFfmpeg([{ type: "unknown", strength: 0.5 }])).toBe("");
  });

  test("filter order matches input array order (sepia before grayscale)", () => {
    const result = buildVideoFilterFfmpeg([
      { type: "sepia", strength: 0.8 },
      { type: "grayscale", strength: 0.6 },
    ]);
    // Both produce colorchannelmixer; sepia should come first
    const sepiaIdx = result.indexOf("colorchannelmixer=");
    const grayscaleIdx = result.indexOf("colorchannelmixer=", sepiaIdx + 1);
    expect(sepiaIdx).toBeGreaterThan(-1);
    expect(grayscaleIdx).toBeGreaterThan(sepiaIdx);

    // Reverse order: grayscale before sepia
    const reversed = buildVideoFilterFfmpeg([
      { type: "grayscale", strength: 1.0 },
      { type: "sepia", strength: 1.0 },
    ]);
    // At full strength, grayscale has R=0.300 and sepia has R=0.393
    const parts = reversed.split(",colorchannelmixer=");
    // parts[0] is empty (leading comma), parts[1] is first filter, parts[2] is second
    expect(parts.length).toBe(3);
    expect(parts[1]).toContain("0.300"); // grayscale R weight
    expect(parts[2]).toContain("0.393"); // sepia R weight
  });

  test("all six filters combined", () => {
    const result = buildVideoFilterFfmpeg([
      { type: "blur", strength: 0.2 },
      { type: "sharpen", strength: 0.3 },
      { type: "vignette", strength: 0.4 },
      { type: "grain", strength: 0.5 },
      { type: "sepia", strength: 0.6 },
      { type: "grayscale", strength: 0.1 },
    ]);
    expect(result).toMatch(/^,boxblur=/);
    expect(result).toContain("unsharp=");
    expect(result).toContain("vignette=");
    expect(result).toContain("noise=");
    // Should have two colorchannelmixer (sepia + grayscale)
    const ccmCount = (result.match(/colorchannelmixer=/g) || []).length;
    expect(ccmCount).toBe(2);
  });
});
