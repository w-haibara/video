import { describe, test, expect } from "bun:test";
import type { Clip, Keyframe, Sequence, Track } from "@video/shared";
import { addKeyframe, removeKeyframe, updateKeyframe } from "./sequence-ops";

function makeClip(overrides: Partial<Clip> = {}): Clip {
  return {
    id: "c1",
    clipKind: "video",
    assetId: "a1",
    startMs: 0,
    durationMs: 5000,
    inMs: 0,
    outMs: 5000,
    ...overrides,
  };
}

function makeSeq(clips: Clip[], trackOverrides: Partial<Track> = {}): Sequence {
  return { tracks: [{ id: "t1", clips, ...trackOverrides }] };
}

function getClip(seq: Sequence, clipId = "c1"): Clip {
  for (const t of seq.tracks) {
    const c = t.clips.find((c) => c.id === clipId);
    if (c) return c;
  }
  throw new Error(`Clip ${clipId} not found`);
}

describe("addKeyframe", () => {
  test("creates a new track for the property when none exists", () => {
    const seq = makeSeq([makeClip()]);
    const kf: Keyframe = { timeMs: 1000, value: 50, easing: "linear" };
    const result = addKeyframe(seq, "c1", "transform.x", kf);
    const clip = getClip(result);
    expect(clip.keyframeTracks).toBeDefined();
    expect(clip.keyframeTracks!.length).toBe(1);
    expect(clip.keyframeTracks![0].property).toBe("transform.x");
    expect(clip.keyframeTracks![0].keyframes).toEqual([kf]);
  });

  test("adds to existing track and keeps sorted", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip]);
    let result = addKeyframe(seq, "c1", "transform.x", { timeMs: 2000, value: 100 });
    result = addKeyframe(result, "c1", "transform.x", { timeMs: 500, value: 25 });
    const kfs = getClip(result).keyframeTracks![0].keyframes;
    expect(kfs.length).toBe(3);
    expect(kfs[0].timeMs).toBe(0);
    expect(kfs[1].timeMs).toBe(500);
    expect(kfs[2].timeMs).toBe(2000);
  });

  test("replaces keyframe at same timeMs", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 1000, value: 50 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = addKeyframe(seq, "c1", "transform.x", { timeMs: 1000, value: 99, easing: "ease-in" });
    const kfs = getClip(result).keyframeTracks![0].keyframes;
    expect(kfs.length).toBe(1);
    expect(kfs[0].value).toBe(99);
    expect(kfs[0].easing).toBe("ease-in");
  });

  test("adds a new property track alongside existing ones", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = addKeyframe(seq, "c1", "opacity", { timeMs: 0, value: 1 });
    expect(getClip(result).keyframeTracks!.length).toBe(2);
  });

  test("does not modify clip on locked track", () => {
    const seq = makeSeq([makeClip()], { locked: true });
    const result = addKeyframe(seq, "c1", "transform.x", { timeMs: 0, value: 0 });
    expect(result).toBe(seq);
  });

  test("does not affect other clips", () => {
    const c1 = makeClip({ id: "c1" });
    const c2 = makeClip({ id: "c2", startMs: 5000 });
    const seq = makeSeq([c1, c2]);
    const result = addKeyframe(seq, "c1", "transform.x", { timeMs: 0, value: 10 });
    expect(getClip(result, "c2").keyframeTracks).toBeUndefined();
    expect(getClip(result, "c1").keyframeTracks!.length).toBe(1);
  });
});

describe("removeKeyframe", () => {
  test("removes a keyframe by time", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 50 },
          { timeMs: 2000, value: 100 },
        ]},
      ],
    });
    const seq = makeSeq([clip]);
    const result = removeKeyframe(seq, "c1", "transform.x", 1000);
    const kfs = getClip(result).keyframeTracks![0].keyframes;
    expect(kfs.length).toBe(2);
    expect(kfs[0].timeMs).toBe(0);
    expect(kfs[1].timeMs).toBe(2000);
  });

  test("removes entire track when last keyframe is removed", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
        { property: "opacity", keyframes: [{ timeMs: 0, value: 1 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = removeKeyframe(seq, "c1", "transform.x", 0);
    const tracks = getClip(result).keyframeTracks!;
    expect(tracks.length).toBe(1);
    expect(tracks[0].property).toBe("opacity");
  });

  test("sets keyframeTracks to undefined when all tracks removed", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = removeKeyframe(seq, "c1", "transform.x", 0);
    expect(getClip(result).keyframeTracks).toBeUndefined();
  });

  test("no-op if no keyframe tracks exist", () => {
    const seq = makeSeq([makeClip()]);
    const result = removeKeyframe(seq, "c1", "transform.x", 0);
    expect(getClip(result).keyframeTracks).toBeUndefined();
  });

  test("no-op if property track not found", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = removeKeyframe(seq, "c1", "opacity", 0);
    expect(getClip(result).keyframeTracks!.length).toBe(1);
  });

  test("no-op if timeMs not found in track", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = removeKeyframe(seq, "c1", "transform.x", 999);
    expect(getClip(result).keyframeTracks![0].keyframes.length).toBe(1);
  });

  test("does not modify clip on locked track", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip], { locked: true });
    const result = removeKeyframe(seq, "c1", "transform.x", 0);
    expect(result).toBe(seq);
  });
});

describe("updateKeyframe", () => {
  test("updates value of an existing keyframe", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [
          { timeMs: 0, value: 0, easing: "linear" },
          { timeMs: 2000, value: 100, easing: "linear" },
        ]},
      ],
    });
    const seq = makeSeq([clip]);
    const result = updateKeyframe(seq, "c1", "transform.x", 2000, { value: 200 });
    const kfs = getClip(result).keyframeTracks![0].keyframes;
    expect(kfs[1].value).toBe(200);
    expect(kfs[1].easing).toBe("linear"); // easing unchanged
  });

  test("updates easing of an existing keyframe", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0, easing: "linear" }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = updateKeyframe(seq, "c1", "transform.x", 0, { easing: "ease-in-out" });
    expect(getClip(result).keyframeTracks![0].keyframes[0].easing).toBe("ease-in-out");
  });

  test("re-sorts when timeMs is updated", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [
          { timeMs: 0, value: 0 },
          { timeMs: 1000, value: 50 },
          { timeMs: 2000, value: 100 },
        ]},
      ],
    });
    const seq = makeSeq([clip]);
    const result = updateKeyframe(seq, "c1", "transform.x", 2000, { timeMs: 500 });
    const kfs = getClip(result).keyframeTracks![0].keyframes;
    expect(kfs[0].timeMs).toBe(0);
    expect(kfs[1].timeMs).toBe(500);
    expect(kfs[1].value).toBe(100); // value was on the 2000ms kf
    expect(kfs[2].timeMs).toBe(1000);
  });

  test("no-op if no tracks exist", () => {
    const seq = makeSeq([makeClip()]);
    const result = updateKeyframe(seq, "c1", "transform.x", 0, { value: 99 });
    expect(getClip(result).keyframeTracks).toBeUndefined();
  });

  test("no-op if property track not found", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = updateKeyframe(seq, "c1", "opacity", 0, { value: 0.5 });
    // transform.x track unchanged
    expect(getClip(result).keyframeTracks![0].keyframes[0].value).toBe(0);
  });

  test("does not modify clip on locked track", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "transform.x", keyframes: [{ timeMs: 0, value: 0 }] },
      ],
    });
    const seq = makeSeq([clip], { locked: true });
    const result = updateKeyframe(seq, "c1", "transform.x", 0, { value: 99 });
    expect(result).toBe(seq);
  });

  test("updates both value and easing simultaneously", () => {
    const clip = makeClip({
      keyframeTracks: [
        { property: "opacity", keyframes: [{ timeMs: 500, value: 1, easing: "linear" }] },
      ],
    });
    const seq = makeSeq([clip]);
    const result = updateKeyframe(seq, "c1", "opacity", 500, { value: 0.5, easing: "ease-out" });
    const kf = getClip(result).keyframeTracks![0].keyframes[0];
    expect(kf.value).toBe(0.5);
    expect(kf.easing).toBe("ease-out");
  });
});
