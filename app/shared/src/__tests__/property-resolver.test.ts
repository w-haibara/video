import { describe, test, expect } from "bun:test";
import { getStaticValue } from "../keyframe/property-resolver";
import type { Clip } from "../types/project";

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: "c1",
    clipKind: "video",
    assetId: "v1",
    startMs: 0,
    durationMs: 5000,
    inMs: 0,
    outMs: 5000,
    ...overrides,
  };
}

// ── getStaticValue tests ──

describe("getStaticValue", () => {
  test("transform.x defaults to 0", () => {
    expect(getStaticValue(makeClip(), "transform.x")).toBe(0);
  });

  test("transform.x reads from clip.transform", () => {
    expect(getStaticValue(makeClip({ transform: { x: 50 } }), "transform.x")).toBe(50);
  });

  test("transform.y defaults to 0", () => {
    expect(getStaticValue(makeClip(), "transform.y")).toBe(0);
  });

  test("transform.y reads from clip.transform", () => {
    expect(getStaticValue(makeClip({ transform: { y: -30 } }), "transform.y")).toBe(-30);
  });

  test("transform.scale defaults to 1", () => {
    expect(getStaticValue(makeClip(), "transform.scale")).toBe(1);
  });

  test("transform.scale reads from clip.transform", () => {
    expect(getStaticValue(makeClip({ transform: { scale: 2.5 } }), "transform.scale")).toBe(2.5);
  });

  test("transform.rotation defaults to 0", () => {
    expect(getStaticValue(makeClip(), "transform.rotation")).toBe(0);
  });

  test("transform.rotation reads from clip.transform", () => {
    expect(getStaticValue(makeClip({ transform: { rotation: 90 } }), "transform.rotation")).toBe(90);
  });

  test("opacity defaults to 1.0", () => {
    expect(getStaticValue(makeClip(), "opacity")).toBe(1.0);
  });

  test("volume defaults to 1.0", () => {
    expect(getStaticValue(makeClip(), "volume")).toBe(1.0);
  });

  test("volume reads from clip.volume", () => {
    expect(getStaticValue(makeClip({ volume: 0.3 }), "volume")).toBe(0.3);
  });

  test("unsupported property returns undefined", () => {
    expect(getStaticValue(makeClip(), "color.brightness")).toBeUndefined();
  });
});

