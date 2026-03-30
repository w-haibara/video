import { describe, test, expect } from "bun:test";
import {
  evaluateAtTime,
  easeLinear,
  easeIn,
  easeOut,
  easeInOut,
  getEasing,
  hasKeyframes,
  getAnimatedValue,
} from "../keyframe/interpolate";
import type { KeyframeTrack } from "../types/keyframe";

// ── Easing function tests ──

describe("easeLinear", () => {
  test("t=0 → 0", () => expect(easeLinear(0)).toBe(0));
  test("t=0.25 → 0.25", () => expect(easeLinear(0.25)).toBe(0.25));
  test("t=0.5 → 0.5", () => expect(easeLinear(0.5)).toBe(0.5));
  test("t=0.75 → 0.75", () => expect(easeLinear(0.75)).toBe(0.75));
  test("t=1 → 1", () => expect(easeLinear(1)).toBe(1));
});

describe("easeIn", () => {
  test("t=0 → 0", () => expect(easeIn(0)).toBe(0));
  test("t=0.25 → 0.0625", () => expect(easeIn(0.25)).toBeCloseTo(0.0625, 6));
  test("t=0.5 → 0.25", () => expect(easeIn(0.5)).toBeCloseTo(0.25, 6));
  test("t=0.75 → 0.5625", () => expect(easeIn(0.75)).toBeCloseTo(0.5625, 6));
  test("t=1 → 1", () => expect(easeIn(1)).toBe(1));
});

describe("easeOut", () => {
  test("t=0 → 0", () => expect(easeOut(0)).toBe(0));
  test("t=0.25 → 0.4375", () => expect(easeOut(0.25)).toBeCloseTo(0.4375, 6));
  test("t=0.5 → 0.75", () => expect(easeOut(0.5)).toBeCloseTo(0.75, 6));
  test("t=0.75 → 0.9375", () => expect(easeOut(0.75)).toBeCloseTo(0.9375, 6));
  test("t=1 → 1", () => expect(easeOut(1)).toBe(1));
});

describe("easeInOut", () => {
  test("t=0 → 0", () => expect(easeInOut(0)).toBe(0));
  test("t=0.25 → approx 0.0625", () => expect(easeInOut(0.25)).toBeCloseTo(0.0625, 4));
  test("t=0.5 → 0.5", () => expect(easeInOut(0.5)).toBeCloseTo(0.5, 6));
  test("t=0.75 → approx 0.9375", () => expect(easeInOut(0.75)).toBeCloseTo(0.9375, 4));
  test("t=1 → 1", () => expect(easeInOut(1)).toBe(1));
});

describe("getEasing", () => {
  test("returns linear for 'linear'", () => expect(getEasing("linear")).toBe(easeLinear));
  test("returns easeIn for 'ease-in'", () => expect(getEasing("ease-in")).toBe(easeIn));
  test("returns easeOut for 'ease-out'", () => expect(getEasing("ease-out")).toBe(easeOut));
  test("returns easeInOut for 'ease-in-out'", () => expect(getEasing("ease-in-out")).toBe(easeInOut));
});

// ── evaluateAtTime tests ──

describe("evaluateAtTime", () => {
  test("empty tracks returns default", () => {
    expect(evaluateAtTime([], "transform.x", 500, 42)).toBe(42);
  });

  test("no matching property returns default", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.y", keyframes: [{ timeMs: 0, value: 10 }] },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 500, 42)).toBe(42);
  });

  test("empty keyframes array returns default", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.x", keyframes: [] },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 500, 42)).toBe(42);
  });

  test("single keyframe: always returns that value", () => {
    const tracks: KeyframeTrack[] = [
      { property: "opacity", keyframes: [{ timeMs: 500, value: 0.5 }] },
    ];
    expect(evaluateAtTime(tracks, "opacity", 0, 1)).toBe(0.5);
    expect(evaluateAtTime(tracks, "opacity", 500, 1)).toBe(0.5);
    expect(evaluateAtTime(tracks, "opacity", 1000, 1)).toBe(0.5);
  });

  test("two keyframes: linear interpolation at midpoint", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 500, 0)).toBe(50);
  });

  test("two keyframes: value at start", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 0, 0)).toBe(0);
  });

  test("two keyframes: value at end", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 1000, 0)).toBe(100);
  });

  test("before first keyframe returns first value", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 500, value: 50 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 0, 0)).toBe(50);
    expect(evaluateAtTime(tracks, "transform.x", 250, 0)).toBe(50);
  });

  test("after last keyframe returns last value", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 500, value: 50 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 1000, 0)).toBe(50);
    expect(evaluateAtTime(tracks, "transform.x", 750, 0)).toBe(50);
  });

  test("three keyframes: interpolation across segments", () => {
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
    // First segment: 0-500ms, 0→100
    expect(evaluateAtTime(tracks, "transform.x", 250, 0)).toBe(50);
    // At boundary
    expect(evaluateAtTime(tracks, "transform.x", 500, 0)).toBe(100);
    // Second segment: 500-1000ms, 100→50
    expect(evaluateAtTime(tracks, "transform.x", 750, 0)).toBe(75);
  });

  test("ease-in easing between two keyframes", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "opacity",
        keyframes: [
          { timeMs: 0, value: 0, easing: "ease-in" },
          { timeMs: 1000, value: 1 },
        ],
      },
    ];
    // At midpoint, ease-in (t^2): t=0.5 → eased=0.25
    expect(evaluateAtTime(tracks, "opacity", 500, 0)).toBeCloseTo(0.25, 6);
  });

  test("ease-out easing between two keyframes", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "opacity",
        keyframes: [
          { timeMs: 0, value: 0, easing: "ease-out" },
          { timeMs: 1000, value: 1 },
        ],
      },
    ];
    // At midpoint, ease-out: t=0.5 → 1-(1-0.5)^2 = 0.75
    expect(evaluateAtTime(tracks, "opacity", 500, 0)).toBeCloseTo(0.75, 6);
  });

  test("ease-in-out easing between two keyframes", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "opacity",
        keyframes: [
          { timeMs: 0, value: 0, easing: "ease-in-out" },
          { timeMs: 1000, value: 1 },
        ],
      },
    ];
    // At midpoint (t=0.5) should be 0.5
    expect(evaluateAtTime(tracks, "opacity", 500, 0)).toBeCloseTo(0.5, 4);
    // At quarter (t=0.25) should be ~0.0625
    expect(evaluateAtTime(tracks, "opacity", 250, 0)).toBeCloseTo(0.0625, 4);
  });

  test("mixed easing across segments", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0, easing: "ease-in" },
          { timeMs: 1000, value: 100, easing: "ease-out" },
          { timeMs: 2000, value: 200 },
        ],
      },
    ];
    // First segment: ease-in at midpoint
    expect(evaluateAtTime(tracks, "transform.x", 500, 0)).toBeCloseTo(25, 4);
    // Second segment: ease-out at midpoint
    expect(evaluateAtTime(tracks, "transform.x", 1500, 0)).toBeCloseTo(175, 4);
  });

  test("zero-length segment returns left value", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 500, value: 10 },
          { timeMs: 500, value: 20 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 500, 0)).toBe(10);
  });

  test("negative values interpolated correctly", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.y",
        keyframes: [
          { timeMs: 0, value: -100 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.y", 500, 0)).toBe(0);
    expect(evaluateAtTime(tracks, "transform.y", 250, 0)).toBe(-50);
  });

  test("multiple tracks: only reads matching property", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [{ timeMs: 0, value: 10 }, { timeMs: 1000, value: 20 }],
      },
      {
        property: "transform.y",
        keyframes: [{ timeMs: 0, value: -50 }, { timeMs: 1000, value: 50 }],
      },
    ];
    expect(evaluateAtTime(tracks, "transform.x", 500, 0)).toBe(15);
    expect(evaluateAtTime(tracks, "transform.y", 500, 0)).toBe(0);
  });
});

// ── hasKeyframes tests ──

describe("hasKeyframes", () => {
  test("undefined tracks returns false", () => {
    expect(hasKeyframes(undefined, "transform.x")).toBe(false);
  });

  test("empty array returns false", () => {
    expect(hasKeyframes([], "transform.x")).toBe(false);
  });

  test("no matching property returns false", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.y", keyframes: [{ timeMs: 0, value: 10 }] },
    ];
    expect(hasKeyframes(tracks, "transform.x")).toBe(false);
  });

  test("matching property with empty keyframes returns false", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.x", keyframes: [] },
    ];
    expect(hasKeyframes(tracks, "transform.x")).toBe(false);
  });

  test("matching property with keyframes returns true", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.x", keyframes: [{ timeMs: 0, value: 10 }] },
    ];
    expect(hasKeyframes(tracks, "transform.x")).toBe(true);
  });
});

// ── getAnimatedValue tests ──

describe("getAnimatedValue", () => {
  test("undefined tracks returns static value", () => {
    expect(getAnimatedValue(undefined, "transform.x", 500, 42)).toBe(42);
  });

  test("no keyframes for property returns static value", () => {
    const tracks: KeyframeTrack[] = [
      { property: "transform.y", keyframes: [{ timeMs: 0, value: 10 }] },
    ];
    expect(getAnimatedValue(tracks, "transform.x", 500, 42)).toBe(42);
  });

  test("with keyframes returns animated value", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "transform.x",
        keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 100 },
        ],
      },
    ];
    expect(getAnimatedValue(tracks, "transform.x", 500, 42)).toBe(50);
  });

  test("static value is ignored when keyframes exist", () => {
    const tracks: KeyframeTrack[] = [
      {
        property: "opacity",
        keyframes: [{ timeMs: 0, value: 0.5 }],
      },
    ];
    // Even though static is 1.0, keyframe says 0.5
    expect(getAnimatedValue(tracks, "opacity", 0, 1.0)).toBe(0.5);
  });
});
