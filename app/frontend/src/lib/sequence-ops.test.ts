import { describe, test, expect } from "bun:test";
import type { Asset, Sequence } from "@video/shared";
import { addClipFromAsset, removeClip, moveClip, trimClip, addTextClip, updateClip } from "./sequence-ops";

const emptySeq: Sequence = { tracks: [] };

const videoAsset: Asset = {
  id: "v1",
  kind: "video",
  originalPath: "assets/video.mp4",
  durationMs: 5000,
};

const imageAsset: Asset = {
  id: "i1",
  kind: "image",
  originalPath: "assets/photo.jpg",
};

const audioAsset: Asset = {
  id: "a1",
  kind: "audio",
  originalPath: "assets/bgm.mp3",
  durationMs: 60000,
};

describe("addClipFromAsset", () => {
  test("creates video track and clip for video asset", () => {
    const seq = addClipFromAsset(emptySeq, videoAsset);
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].kind).toBe("video");
    expect(seq.tracks[0].clips.length).toBe(1);
    const clip = seq.tracks[0].clips[0];
    expect(clip.assetId).toBe("v1");
    expect(clip.startMs).toBe(0);
    expect(clip.durationMs).toBe(5000);
    expect(clip.inMs).toBe(0);
    expect(clip.outMs).toBe(5000);
  });

  test("uses DEFAULT_IMAGE_DURATION_MS for image assets", () => {
    const seq = addClipFromAsset(emptySeq, imageAsset);
    const clip = seq.tracks[0].clips[0];
    expect(clip.durationMs).toBe(3000);
  });

  test("creates audio track for audio asset", () => {
    const seq = addClipFromAsset(emptySeq, audioAsset);
    expect(seq.tracks[0].kind).toBe("audio");
  });

  test("appends clip after existing clips in same track", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 3000 });
    const clips = seq.tracks[0].clips;
    expect(clips.length).toBe(2);
    expect(clips[1].startMs).toBe(5000); // after first clip
    expect(clips[1].durationMs).toBe(3000);
  });

  test("does not mutate original sequence", () => {
    const original = { ...emptySeq, tracks: [] };
    addClipFromAsset(original, videoAsset);
    expect(original.tracks.length).toBe(0);
  });
});

describe("removeClip", () => {
  test("removes clip by id", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = removeClip(seq, clipId);
    expect(seq.tracks.length).toBe(0); // track removed too (empty)
  });

  test("removes empty tracks", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    seq = addClipFromAsset(seq, audioAsset);
    const audioClipId = seq.tracks.find((t) => t.kind === "audio")!.clips[0].id;
    seq = removeClip(seq, audioClipId);
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].kind).toBe("video");
  });

  test("no-op for non-existent clip", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const before = seq.tracks[0].clips.length;
    seq = removeClip(seq, "nonexistent");
    expect(seq.tracks[0].clips.length).toBe(before);
  });
});

describe("moveClip", () => {
  test("moves clip to new position", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 2000);
    expect(seq.tracks[0].clips[0].startMs).toBe(2000);
  });

  test("clamps to zero for negative values", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, -500);
    expect(seq.tracks[0].clips[0].startMs).toBe(0);
  });

  test("rounds to nearest ms", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 1500.7);
    expect(seq.tracks[0].clips[0].startMs).toBe(1501);
  });

  test("re-sorts clips after move", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // clip1 at 0
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 2000 }); // clip2 at 5000
    const firstClipId = seq.tracks[0].clips[0].id;
    // Move first clip after second
    seq = moveClip(seq, firstClipId, 8000);
    expect(seq.tracks[0].clips[0].startMs).toBe(5000); // v2 now first
    expect(seq.tracks[0].clips[1].startMs).toBe(8000); // v1 moved to 8000
    expect(seq.tracks[0].clips[1].id).toBe(firstClipId);
  });
});

describe("trimClip", () => {
  test("trims left side", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // 0-5000
    const clipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, clipId, "left", 1000);
    const clip = seq.tracks[0].clips[0];
    expect(clip.startMs).toBe(1000);
    expect(clip.durationMs).toBe(4000);
    expect(clip.inMs).toBe(1000);
  });

  test("trims right side", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // 0-5000
    const clipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, clipId, "right", -2000);
    const clip = seq.tracks[0].clips[0];
    expect(clip.durationMs).toBe(3000);
    expect(clip.outMs).toBe(3000);
  });

  test("enforces minimum duration of 100ms", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, clipId, "right", -10000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(100);
  });

  test("left trim cannot go below inMs=0", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, clipId, "left", -1000); // try to expand before 0
    const clip = seq.tracks[0].clips[0];
    expect(clip.inMs).toBe(0); // clamped
  });
});

describe("addTextClip", () => {
  test("creates title track and text clip", () => {
    const seq = addTextClip(emptySeq, 1000, 3000, {
      value: "Hello",
      fontSize: 48,
      color: "#ffffff",
    });
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].kind).toBe("title");
    expect(seq.tracks[0].clips.length).toBe(1);
    const clip = seq.tracks[0].clips[0];
    expect(clip.startMs).toBe(1000);
    expect(clip.durationMs).toBe(3000);
    expect(clip.text?.value).toBe("Hello");
    expect(clip.text?.fontSize).toBe(48);
  });

  test("adds to existing title track", () => {
    let seq = addTextClip(emptySeq, 0, 2000, { value: "First" });
    seq = addTextClip(seq, 3000, 1000, { value: "Second" });
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].clips.length).toBe(2);
  });

  test("sorts clips by startMs", () => {
    let seq = addTextClip(emptySeq, 5000, 1000, { value: "B" });
    seq = addTextClip(seq, 1000, 1000, { value: "A" });
    expect(seq.tracks[0].clips[0].text?.value).toBe("A");
    expect(seq.tracks[0].clips[1].text?.value).toBe("B");
  });

  test("does not mutate original", () => {
    const original: Sequence = { tracks: [] };
    addTextClip(original, 0, 1000, { value: "test" });
    expect(original.tracks.length).toBe(0);
  });
});

describe("updateClip", () => {
  test("updates clip text", () => {
    let seq = addTextClip(emptySeq, 0, 2000, { value: "old" });
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      text: { value: "new", fontSize: 36, color: "#ff0000" },
    });
    expect(seq.tracks[0].clips[0].text?.value).toBe("new");
    expect(seq.tracks[0].clips[0].text?.fontSize).toBe(36);
  });

  test("adds rotation transform to clip", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      transform: { rotation: 90 },
    });
    expect(seq.tracks[0].clips[0].transform?.rotation).toBe(90);
  });

  test("updates rotation to different value", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { transform: { rotation: 90 } });
    seq = updateClip(seq, clipId, { transform: { rotation: 270 } });
    expect(seq.tracks[0].clips[0].transform?.rotation).toBe(270);
  });

  test("adds crop to clip", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      crop: { x: 100, y: 50, width: 800, height: 600 },
    });
    const crop = seq.tracks[0].clips[0].crop;
    expect(crop?.x).toBe(100);
    expect(crop?.y).toBe(50);
    expect(crop?.width).toBe(800);
    expect(crop?.height).toBe(600);
  });

  test("clears crop by setting undefined", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      crop: { x: 10, y: 10, width: 100, height: 100 },
    });
    seq = updateClip(seq, clipId, { crop: undefined });
    expect(seq.tracks[0].clips[0].crop).toBeUndefined();
  });

  test("updates volume on audio clip", () => {
    let seq = addClipFromAsset(emptySeq, audioAsset);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { volume: 0.5 });
    expect(seq.tracks[0].clips[0].volume).toBe(0.5);
  });

  test("does not affect other clips", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 3000 });
    const firstId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, firstId, { transform: { rotation: 180 } });
    expect(seq.tracks[0].clips[0].transform?.rotation).toBe(180);
    expect(seq.tracks[0].clips[1].transform).toBeUndefined();
  });
});
