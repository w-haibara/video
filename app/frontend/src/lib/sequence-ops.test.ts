import { describe, test, expect } from "bun:test";
import type { Asset, Clip, Sequence, Track } from "@video/shared";
import { inferTrackKind } from "@video/shared";
import { addClipFromAsset, removeClip, moveClip, trimClip, addTextClip, updateClip, findNonOverlappingPosition, clampClipsToDuration } from "./sequence-ops";

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
    expect(inferTrackKind(seq.tracks[0])).toBe("video");
    expect(seq.tracks[0].clips.length).toBe(1);
    const clip = seq.tracks[0].clips[0];
    expect(clip.clipKind).toBe("video");
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
    expect(inferTrackKind(seq.tracks[0])).toBe("audio");
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

  test("adds different asset kinds to the same last track", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    seq = addClipFromAsset(seq, audioAsset);
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].clips.length).toBe(2);
    expect(seq.tracks[0].clips[0].clipKind).toBe("video");
    expect(seq.tracks[0].clips[1].clipKind).toBe("audio");
  });

  test("adds to specified targetTrackId", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const firstTrackId = seq.tracks[0].id;
    // Create a second track
    const secondTrack: Track = { id: "track-2", clips: [] };
    seq = { ...seq, tracks: [...seq.tracks, secondTrack] };
    seq = addClipFromAsset(seq, audioAsset, undefined, firstTrackId);
    expect(seq.tracks[0].clips.length).toBe(2);
    expect(seq.tracks[1].clips.length).toBe(0);
  });

  test("sets clipKind to asset.kind", () => {
    const videoSeq = addClipFromAsset(emptySeq, videoAsset);
    expect(videoSeq.tracks[0].clips[0].clipKind).toBe("video");

    const imageSeq = addClipFromAsset(emptySeq, imageAsset);
    expect(imageSeq.tracks[0].clips[0].clipKind).toBe("image");

    const audioSeq = addClipFromAsset(emptySeq, audioAsset);
    expect(audioSeq.tracks[0].clips[0].clipKind).toBe("audio");
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
    const firstTrackId = seq.tracks[0].id;
    // Add audio to a separate explicit track
    const audioTrack: Track = { id: "audio-track", clips: [] };
    seq = { ...seq, tracks: [...seq.tracks, audioTrack] };
    seq = addClipFromAsset(seq, audioAsset, undefined, "audio-track");
    expect(seq.tracks.length).toBe(2);
    const audioClipId = seq.tracks.find((t: Track) => t.id === "audio-track")!.clips[0].id;
    seq = removeClip(seq, audioClipId);
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].id).toBe(firstTrackId);
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

  test("right trim clamps to maxSourceDurationMs", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // duration 5000, inMs 0
    const clipId = seq.tracks[0].clips[0].id;
    // First trim right to reduce to 3000
    seq = trimClip(seq, clipId, "right", -2000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(3000);
    // Now try to expand beyond source (5000) with maxSourceDurationMs constraint
    seq = trimClip(seq, clipId, "right", 5000, 5000);
    const clip = seq.tracks[0].clips[0];
    expect(clip.durationMs).toBe(5000); // clamped to maxSource - inMs
    expect(clip.outMs).toBe(5000);
  });

  test("right trim without maxSourceDurationMs allows any duration", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // duration 5000
    const clipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, clipId, "right", 10000); // no constraint
    expect(seq.tracks[0].clips[0].durationMs).toBe(15000);
  });

  test("right trim with inMs offset respects maxSourceDurationMs", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // duration 5000, inMs 0
    const clipId = seq.tracks[0].clips[0].id;
    // Left trim to move inMs to 2000
    seq = trimClip(seq, clipId, "left", 2000);
    expect(seq.tracks[0].clips[0].inMs).toBe(2000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(3000);
    // Try to expand right beyond source length
    seq = trimClip(seq, clipId, "right", 5000, 5000);
    const clip = seq.tracks[0].clips[0];
    // maxSource(5000) - inMs(2000) = 3000 max duration
    expect(clip.durationMs).toBe(3000);
    expect(clip.outMs).toBe(5000);
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
    expect(inferTrackKind(seq.tracks[0])).toBe("title");
    expect(seq.tracks[0].clips.length).toBe(1);
    const clip = seq.tracks[0].clips[0];
    expect(clip.startMs).toBe(1000);
    expect(clip.durationMs).toBe(3000);
    expect(clip.text?.value).toBe("Hello");
    expect(clip.text?.fontSize).toBe(48);
  });

  test("creates new track for each call without targetTrackId", () => {
    let seq = addTextClip(emptySeq, 0, 2000, { value: "First" });
    seq = addTextClip(seq, 3000, 1000, { value: "Second" });
    expect(seq.tracks.length).toBe(2);
    expect(seq.tracks[0].clips.length).toBe(1);
    expect(seq.tracks[1].clips.length).toBe(1);
  });

  test("adds to existing track when targetTrackId is specified", () => {
    let seq = addTextClip(emptySeq, 0, 2000, { value: "First" });
    const trackId = seq.tracks[0].id;
    seq = addTextClip(seq, 3000, 1000, { value: "Second" }, undefined, trackId);
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].clips.length).toBe(2);
  });

  test("sorts clips by startMs within same track", () => {
    let seq = addTextClip(emptySeq, 5000, 1000, { value: "B" });
    const trackId = seq.tracks[0].id;
    seq = addTextClip(seq, 1000, 1000, { value: "A" }, undefined, trackId);
    expect(seq.tracks[0].clips[0].text?.value).toBe("A");
    expect(seq.tracks[0].clips[1].text?.value).toBe("B");
  });

  test("does not mutate original", () => {
    const original: Sequence = { tracks: [] };
    addTextClip(original, 0, 1000, { value: "test" });
    expect(original.tracks.length).toBe(0);
  });
});

describe("addClipFromAsset with maxDurationMs", () => {
  test("clamps clip duration to fit within maxDurationMs", () => {
    const seq = addClipFromAsset(emptySeq, videoAsset, 3000);
    const clip = seq.tracks[0].clips[0];
    expect(clip.durationMs).toBe(3000); // clamped from 5000 to 3000
    expect(clip.outMs).toBe(3000);
  });

  test("rejects clip when startMs >= maxDurationMs", () => {
    // Fill up to 5000ms
    let seq = addClipFromAsset(emptySeq, videoAsset); // 0-5000
    // Try to add another clip with max 5000 — startMs would be 5000, rejected
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2" }, 5000);
    expect(seq.tracks[0].clips.length).toBe(1); // unchanged
  });

  test("allows clip when it fits within maxDurationMs", () => {
    const seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(5000); // no clamping needed
  });

  test("no constraint when maxDurationMs is undefined", () => {
    const seq = addClipFromAsset(emptySeq, videoAsset);
    expect(seq.tracks[0].clips[0].durationMs).toBe(5000);
  });
});

describe("moveClip with maxDurationMs", () => {
  test("allows move when clip fits within maxDurationMs", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // duration 5000
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 2000, 10000);
    expect(seq.tracks[0].clips[0].startMs).toBe(2000);
  });

  test("clamps startMs when clip would exceed maxDurationMs", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // duration 5000
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 8000, 10000); // 8000 + 5000 = 13000 > 10000
    expect(seq.tracks[0].clips[0].startMs).toBe(5000); // clamped to 10000 - 5000
  });

  test("clamps startMs to 0 when clip is longer than maxDurationMs", () => {
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, durationMs: 15000 });
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 5000, 10000);
    expect(seq.tracks[0].clips[0].startMs).toBe(0); // max(0, 10000-15000) = 0
  });
});

describe("trimClip with maxTimelineDurationMs", () => {
  test("right trim clamps to timeline duration", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // startMs=0, duration=5000
    const clipId = seq.tracks[0].clips[0].id;
    // First shorten to 3000
    seq = trimClip(seq, clipId, "right", -2000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(3000);
    // Try to expand right by 10000 with timeline limit of 8000
    seq = trimClip(seq, clipId, "right", 10000, undefined, 8000);
    const clip = seq.tracks[0].clips[0];
    expect(clip.durationMs).toBe(8000); // clamped to 8000 - 0 (startMs)
  });

  test("right trim respects both source and timeline limits", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // startMs=0, duration=5000
    const clipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, clipId, "right", -2000);
    // Source limit 5000, timeline limit 4000 — timeline wins (4000 < 5000)
    seq = trimClip(seq, clipId, "right", 10000, 5000, 4000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(4000);
  });
});

describe("addTextClip with maxDurationMs", () => {
  test("clamps text clip duration to maxDurationMs", () => {
    const seq = addTextClip(emptySeq, 8000, 5000, { value: "Hello" }, 10000);
    const clip = seq.tracks[0].clips[0];
    expect(clip.durationMs).toBe(2000); // 10000 - 8000
    expect(clip.outMs).toBe(2000);
  });

  test("rejects text clip when startMs >= maxDurationMs", () => {
    const seq = addTextClip(emptySeq, 10000, 3000, { value: "Hello" }, 10000);
    expect(seq.tracks.length).toBe(0); // rejected, unchanged
  });

  test("allows text clip within maxDurationMs without clamping", () => {
    const seq = addTextClip(emptySeq, 2000, 3000, { value: "Hello" }, 10000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(3000);
  });
});

describe("moveClip overlap prevention", () => {
  test("snaps to end of previous clip when dragged on top of it", () => {
    // Create two clips: clip1 at 0-5000, clip2 at 5000-10000
    let seq = addClipFromAsset(emptySeq, videoAsset); // clip1: 0-5000
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 5000 }); // clip2: 5000-10000
    const clip2Id = seq.tracks[0].clips[1].id;
    // Try to move clip2 to 2000 (overlapping clip1)
    seq = moveClip(seq, clip2Id, 2000);
    // Should snap to clip1's end (5000)
    const movedClip = seq.tracks[0].clips.find((c: Clip) => c.id === clip2Id)!;
    expect(movedClip.startMs).toBe(5000);
  });

  test("allows free movement when no overlap", () => {
    // Create two clips with gap: clip1 at 0-5000, clip2 at 15000-20000
    let seq = addClipFromAsset(emptySeq, videoAsset); // clip1: 0-5000
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 5000 }); // clip2: 5000-10000
    const clip2Id = seq.tracks[0].clips[1].id;
    // Move clip2 to 12000 (plenty of space)
    seq = moveClip(seq, clip2Id, 12000);
    const movedClip = seq.tracks[0].clips.find((c: Clip) => c.id === clip2Id)!;
    expect(movedClip.startMs).toBe(12000);
  });

  test("handles three clips - move to gap between them", () => {
    // clip1: 0-2000, clip2: 2000-4000, clip3: 10000-12000
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 2000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 2000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v3", durationMs: 2000 });
    const clip3Id = seq.tracks[0].clips[2].id;
    // Move clip3 to gap at 6000
    seq = moveClip(seq, clip3Id, 6000);
    const movedClip = seq.tracks[0].clips.find((c: Clip) => c.id === clip3Id)!;
    expect(movedClip.startMs).toBe(6000);
  });

  test("snaps before next clip when approaching from left", () => {
    // clip1: 0-2000, clip2: 5000-7000
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 2000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 2000 });
    // clip2 is at 2000-4000, move it to 5000 then test snapping
    const clip1Id = seq.tracks[0].clips[0].id;
    const clip2Id = seq.tracks[0].clips[1].id;
    // Move clip2 far away first
    seq = moveClip(seq, clip2Id, 8000);
    // Now move clip1 to overlap with clip2 from the left
    seq = moveClip(seq, clip1Id, 7500);
    const movedClip = seq.tracks[0].clips.find((c: Clip) => c.id === clip1Id)!;
    // Should snap before clip2 (8000 - 2000 = 6000)
    expect(movedClip.startMs).toBe(6000);
  });

  test("cancels move when no valid position exists between clips", () => {
    // Create tight arrangement: clip1: 0-5000, clip2: 5000-10000, clip3: 10000-15000
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 5000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 5000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v3", durationMs: 5000 });
    const clip3Id = seq.tracks[0].clips[2].id;
    // Try to move clip3 to 2000 (no room between clip1 and clip2)
    seq = moveClip(seq, clip3Id, 2000);
    const movedClip = seq.tracks[0].clips.find((c: Clip) => c.id === clip3Id)!;
    // Should stay at original position (10000) since snap would still overlap
    expect(movedClip.startMs).toBe(10000);
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

describe("clampClipsToDuration", () => {
  test("removes clips that start at or beyond maxDurationMs", () => {
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 3000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 3000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v3", durationMs: 3000 });
    // clips: 0-3000, 3000-6000, 6000-9000
    seq = clampClipsToDuration(seq, 6000);
    expect(seq.tracks[0].clips.length).toBe(2);
    expect(seq.tracks[0].clips[0].durationMs).toBe(3000);
    expect(seq.tracks[0].clips[1].durationMs).toBe(3000);
  });

  test("clamps clip that spans the boundary", () => {
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 5000 });
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 5000 });
    // clips: 0-5000, 5000-10000
    seq = clampClipsToDuration(seq, 8000);
    expect(seq.tracks[0].clips.length).toBe(2);
    expect(seq.tracks[0].clips[0].durationMs).toBe(5000); // unchanged
    expect(seq.tracks[0].clips[1].durationMs).toBe(3000); // clamped: 8000 - 5000
    expect(seq.tracks[0].clips[1].outMs).toBe(3000); // inMs(0) + 3000
  });

  test("clamps title track clips", () => {
    let seq = addTextClip(emptySeq, 2000, 5000, { value: "Hello" });
    seq = clampClipsToDuration(seq, 4000);
    expect(seq.tracks[0].clips.length).toBe(1);
    expect(seq.tracks[0].clips[0].durationMs).toBe(2000); // 4000 - 2000
  });

  test("removes title clips beyond maxDurationMs", () => {
    let seq = addTextClip(emptySeq, 5000, 3000, { value: "Hello" });
    seq = clampClipsToDuration(seq, 4000);
    expect(seq.tracks[0].clips.length).toBe(0);
  });

  test("clamps audio track clips", () => {
    let seq = addClipFromAsset(emptySeq, audioAsset);
    // audio clip: 0-60000
    seq = clampClipsToDuration(seq, 10000);
    expect(seq.tracks[0].clips[0].durationMs).toBe(10000);
    expect(seq.tracks[0].clips[0].outMs).toBe(10000);
  });

  test("preserves tracks even when all clips removed", () => {
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 3000 });
    seq = clampClipsToDuration(seq, 0);
    // Track still exists but with no clips
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].clips.length).toBe(0);
  });

  test("does not mutate original sequence", () => {
    let seq = addClipFromAsset(emptySeq, { ...videoAsset, id: "v1", durationMs: 5000 });
    const original = seq;
    clampClipsToDuration(seq, 3000);
    expect(original.tracks[0].clips[0].durationMs).toBe(5000);
  });
});
