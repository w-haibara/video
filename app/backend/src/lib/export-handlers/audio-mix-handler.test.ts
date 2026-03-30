import { describe, test, expect } from "bun:test";
import { buildAtempoChain } from "./audio-mix-handler";

describe("buildAtempoChain", () => {
  test("speed = 1.0 returns empty string (identity)", () => {
    expect(buildAtempoChain(1)).toBe("");
  });

  test("speed = 0.5 returns single atempo=0.5", () => {
    expect(buildAtempoChain(0.5)).toBe(",atempo=0.5");
  });

  test("speed = 2.0 returns single atempo=2", () => {
    expect(buildAtempoChain(2.0)).toBe(",atempo=2");
  });

  test("speed = 0.25 chains two atempo=0.5 filters", () => {
    // 0.25 < 0.5 so first iteration: push atempo=0.5, remaining = 0.25/0.5 = 0.5
    // Now remaining == 0.5, loop exits, push atempo=0.5
    expect(buildAtempoChain(0.25)).toBe(",atempo=0.5,atempo=0.5");
  });

  test("speed = 4.0 returns single atempo=4 (within valid range)", () => {
    // 4.0 is within the 0.5-100.0 range, so a single atempo filter suffices
    expect(buildAtempoChain(4.0)).toBe(",atempo=4");
  });
});
