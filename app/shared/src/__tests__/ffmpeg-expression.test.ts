import { describe, test, expect } from "bun:test";
import { buildKeyframeFilterExpression } from "../keyframe/ffmpeg-expression";
import type { KeyframeTrack } from "../types/keyframe";

describe("buildKeyframeFilterExpression", () => {
  test("no matching track returns default", () => {
    const tracks: KeyframeTrack[] = [];
    expect(buildKeyframeFilterExpression(tracks, "transform.x", 0, 1000)).toBe("0");
  });

  test("empty keyframes returns default", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.x", keyframes: [] },
    ];
    expect(buildKeyframeFilterExpression(tracks, "transform.x", 42, 1000)).toBe("42");
  });

  test("single keyframe returns constant", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.x", keyframes: [{ timeMs: 500, value: 75 }] },
    ];
    expect(buildKeyframeFilterExpression(tracks, "transform.x", 0, 1000)).toBe("75");
  });

  test("two keyframes generates linear expression", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    const expr = buildKeyframeFilterExpression(tracks, "transform.x", 0, 1000);
    // Should contain if/between for the segment
    expect(expr).toContain("between(t,");
    expect(expr).toContain("100");
  });

  test("constant segment (same values) generates constant expression", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "opacity",
        keyframes: [
          { timeMs: 0, value: 0.5 },
          { timeMs: 1000, value: 0.5 },
        ],
      },
    ];
    const expr = buildKeyframeFilterExpression(tracks, "opacity", 1, 1000);
    expect(expr).toContain("0.5");
  });

  test("three keyframes generates nested expression", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 500, value: 100 },
          { timeMs: 1000, value: 50 },
        ],
      },
    ];
    const expr = buildKeyframeFilterExpression(tracks, "transform.x", 0, 1000);
    // Should have two between() segments
    const betweenCount = (expr.match(/between/g) || []).length;
    expect(betweenCount).toBe(2);
  });

  test("expression for non-matching property returns default", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.y",
        keyframes: [{ timeMs: 0, value: 10 }, { timeMs: 1000, value: 20 }],
      },
    ];
    expect(buildKeyframeFilterExpression(tracks, "transform.x", 5, 1000)).toBe("5");
  });

  test("non-zero clipStartSec offsets time in expression", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    const expr = buildKeyframeFilterExpression(tracks, "transform.x", 0, 1000, 2.0);
    // Should use (t-2.0000) instead of t
    expect(expr).toContain("(t-2.0000)");
    expect(expr).not.toContain("between(t,");
  });

  test("clipStartSec=0 does not add time offset wrapper", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    const expr = buildKeyframeFilterExpression(tracks, "transform.x", 0, 1000, 0);
    // Should use plain t in between(), not (t-offset)
    expect(expr).toContain("between(t,");
    // lt() should also use plain t
    expect(expr).toContain("lt(t,");
  });
});
