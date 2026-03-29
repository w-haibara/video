import { describe, test, expect } from "bun:test";
import type { Asset, Clip, Sequence, Track } from "@video/shared";
import { inferTrackKind } from "@video/shared";
import { addClipFromAsset, removeClip, moveClip, trimClip, addTextClip, updateClip, findNonOverlappingPosition, clampClipsToDuration, removeTrack, setTransition, removeTransition, splitClip, rippleDelete, rippleTrim } from "./sequence-ops";

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

describe("moveClip cross-track", () => {
  test("moves clip to a different track", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const sourceTrackId = seq.tracks[0].id;
    const clipId = seq.tracks[0].clips[0].id;
    // Add a second track
    const track2: Track = { id: "track-2", clips: [] };
    seq = { ...seq, tracks: [...seq.tracks, track2] };
    seq = moveClip(seq, clipId, 1000, undefined, "track-2");
    // Clip should be in track-2
    const t2 = seq.tracks.find((t: Track) => t.id === "track-2")!;
    expect(t2.clips.length).toBe(1);
    expect(t2.clips[0].id).toBe(clipId);
    expect(t2.clips[0].startMs).toBe(1000);
    // Source track should be preserved (empty but not deleted)
    const srcTrack = seq.tracks.find((t: Track) => t.id === sourceTrackId)!;
    expect(srcTrack).toBeDefined();
    expect(srcTrack.clips.length).toBe(0);
  });

  test("prevents overlap on target track", () => {
    // Track 1: clip at 0-5000; Track 2: existing clip at 0-3000
    let seq = addClipFromAsset(emptySeq, videoAsset); // track1 clip: 0-5000
    const clipId = seq.tracks[0].clips[0].id;
    const track2: Track = {
      id: "track-2",
      clips: [{ id: "existing", clipKind: "video", assetId: "v2", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 }],
    };
    seq = { ...seq, tracks: [...seq.tracks, track2] };
    // Move clip to track-2 at position 1000 (overlapping existing clip 0-3000)
    seq = moveClip(seq, clipId, 1000, undefined, "track-2");
    const t2 = seq.tracks.find((t: Track) => t.id === "track-2")!;
    const movedClip = t2.clips.find((c: Clip) => c.id === clipId)!;
    // Should snap to non-overlapping position (after existing clip at 3000)
    expect(movedClip.startMs).toBe(3000);
  });

  test("keeps source track if it still has clips", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    seq = addClipFromAsset(seq, { ...videoAsset, id: "v2", durationMs: 3000 });
    const sourceTrackId = seq.tracks[0].id;
    const clip1Id = seq.tracks[0].clips[0].id;
    const track2: Track = { id: "track-2", clips: [] };
    seq = { ...seq, tracks: [...seq.tracks, track2] };
    seq = moveClip(seq, clip1Id, 0, undefined, "track-2");
    // Source track should still exist (has clip2)
    expect(seq.tracks.find((t: Track) => t.id === sourceTrackId)).toBeDefined();
    expect(seq.tracks.find((t: Track) => t.id === sourceTrackId)!.clips.length).toBe(1);
  });

  test("no-op when targetTrackId does not exist", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const clipId = seq.tracks[0].clips[0].id;
    const before = JSON.stringify(seq);
    seq = moveClip(seq, clipId, 1000, undefined, "nonexistent");
    expect(JSON.stringify(seq)).toBe(before);
  });

  test("falls back to same-track move when targetTrackId equals source", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const trackId = seq.tracks[0].id;
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 2000, undefined, trackId);
    expect(seq.tracks[0].clips[0].startMs).toBe(2000);
  });

  test("respects maxDurationMs on cross-track move", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset); // duration 5000
    const clipId = seq.tracks[0].clips[0].id;
    const track2: Track = { id: "track-2", clips: [] };
    seq = { ...seq, tracks: [...seq.tracks, track2] };
    seq = moveClip(seq, clipId, 8000, 10000, "track-2");
    const t2 = seq.tracks.find((t: Track) => t.id === "track-2")!;
    expect(t2.clips[0].startMs).toBe(5000); // clamped: 10000 - 5000
  });

  test("can move clips to and from an empty source track", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const sourceTrackId = seq.tracks[0].id;
    const clipId = seq.tracks[0].clips[0].id;
    const track2: Track = { id: "track-2", clips: [] };
    seq = { ...seq, tracks: [...seq.tracks, track2] };
    // Move clip to track-2 — source track becomes empty but preserved
    seq = moveClip(seq, clipId, 0, undefined, "track-2");
    expect(seq.tracks.find((t: Track) => t.id === sourceTrackId)!.clips.length).toBe(0);
    // Move clip back to the empty source track
    seq = moveClip(seq, clipId, 500, undefined, sourceTrackId);
    const srcTrack = seq.tracks.find((t: Track) => t.id === sourceTrackId)!;
    expect(srcTrack.clips.length).toBe(1);
    expect(srcTrack.clips[0].startMs).toBe(500);
  });
});

describe("findNonOverlappingPosition cross-track", () => {
  test("snaps after last clip when target has no gaps", () => {
    // Target track has clips: 0-3000, 3000-5000 — no gaps
    const targetClips: Clip[] = [
      { id: "t1", clipKind: "video", assetId: "a1", startMs: 0, durationMs: 3000, inMs: 0, outMs: 3000 },
      { id: "t2", clipKind: "video", assetId: "a2", startMs: 3000, durationMs: 2000, inMs: 0, outMs: 2000 },
    ];
    // Moving clip (not in targetClips) with duration 4000, requested at position 1000
    const pos = findNonOverlappingPosition(targetClips, "cross-clip", 1000, 4000);
    // Should place after last clip: 5000
    expect(pos).toBe(5000);
  });

  test("places clip in gap between target track clips", () => {
    // Target track: clip at 0-2000, gap 2000-5000, clip at 5000-8000
    const targetClips: Clip[] = [
      { id: "t1", clipKind: "video", assetId: "a1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
      { id: "t2", clipKind: "video", assetId: "a2", startMs: 5000, durationMs: 3000, inMs: 0, outMs: 3000 },
    ];
    // Moving clip with duration 2000, requested at position 1000 (overlapping t1)
    const pos = findNonOverlappingPosition(targetClips, "cross-clip", 1000, 2000);
    // Should snap after t1: 2000 (fits in the 2000-5000 gap)
    expect(pos).toBe(2000);
  });

  test("returns non-overlapping position when movingClipId is not in clips", () => {
    // Target track: clip at 0-5000
    const targetClips: Clip[] = [
      { id: "t1", clipKind: "video", assetId: "a1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 },
    ];
    // movingClipId doesn't exist in targetClips
    const pos = findNonOverlappingPosition(targetClips, "nonexistent", 2000, 3000);
    // Should snap after t1: 5000
    expect(pos).toBe(5000);
  });
});

describe("removeTrack", () => {
  test("removes track and its clips", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const trackId = seq.tracks[0].id;
    seq = removeTrack(seq, trackId);
    expect(seq.tracks.length).toBe(0);
  });

  test("returns empty sequence when removing the only track", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const trackId = seq.tracks[0].id;
    seq = removeTrack(seq, trackId);
    expect(seq.tracks).toEqual([]);
  });

  test("preserves other tracks", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const track2: Track = { id: "track-2", clips: [{ id: "c2", clipKind: "audio", assetId: "a1", startMs: 0, durationMs: 5000, inMs: 0, outMs: 5000 }] };
    seq = { ...seq, tracks: [...seq.tracks, track2] };
    seq = removeTrack(seq, "track-2");
    expect(seq.tracks.length).toBe(1);
    expect(seq.tracks[0].clips[0].clipKind).toBe("video");
  });

  test("no-op for non-existent trackId", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    seq = removeTrack(seq, "nonexistent");
    expect(seq.tracks.length).toBe(1);
  });

  test("does not mutate original sequence", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset);
    const trackId = seq.tracks[0].id;
    const original = seq;
    removeTrack(seq, trackId);
    expect(original.tracks.length).toBe(1);
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

describe("setTransition", () => {
  function twoClipSeq(): Sequence {
    return {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
          { id: "c2", clipKind: "video", assetId: "v1", startMs: 2000, durationMs: 2000, inMs: 0, outMs: 2000 },
        ],
      }],
    };
  }

  test("sets transition and moves clip backward to create overlap", () => {
    const seq = setTransition(twoClipSeq(), "c2", { type: "fade", durationMs: 500 });
    const clip = seq.tracks[0].clips.find(c => c.id === "c2")!;
    expect(clip.transition).toEqual({ type: "fade", durationMs: 500 });
    expect(clip.startMs).toBe(1500); // 2000 - 500 = 1500
  });

  test("caps overlap at half of shorter clip duration", () => {
    const seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 400, inMs: 0, outMs: 400 },
          { id: "c2", clipKind: "video", assetId: "v1", startMs: 400, durationMs: 2000, inMs: 0, outMs: 2000 },
        ],
      }],
    };
    const result = setTransition(seq, "c2", { type: "fade", durationMs: 500 });
    const clip = result.tracks[0].clips.find(c => c.id === "c2")!;
    // 500ms requested but capped at 400/2 = 200ms (half of shorter clip)
    expect(clip.transition!.durationMs).toBe(200);
    expect(clip.startMs).toBe(200); // 400 - 200 = 200
  });

  test("no-op when clip is first on track (no previous clip)", () => {
    const seq = setTransition(twoClipSeq(), "c1", { type: "fade", durationMs: 500 });
    const clip = seq.tracks[0].clips.find(c => c.id === "c1")!;
    expect(clip.transition).toBeUndefined();
    expect(clip.startMs).toBe(0);
  });

  test("no-op for non-existent clip", () => {
    const seq = twoClipSeq();
    const result = setTransition(seq, "nonexistent", { type: "fade", durationMs: 500 });
    expect(result).toBe(seq); // same reference = no change
  });

  test("project file structure with transition", () => {
    const seq = setTransition(twoClipSeq(), "c2", { type: "fade", durationMs: 500 });
    // Verify complete clip structure
    const c2 = seq.tracks[0].clips.find(c => c.id === "c2")!;
    expect(c2).toEqual({
      id: "c2",
      clipKind: "video",
      assetId: "v1",
      startMs: 1500,
      durationMs: 2000,
      inMs: 0,
      outMs: 2000,
      transition: { type: "fade", durationMs: 500 },
    });
    // c1 should be unchanged
    const c1 = seq.tracks[0].clips.find(c => c.id === "c1")!;
    expect(c1.startMs).toBe(0);
    expect(c1.durationMs).toBe(2000);
    expect(c1.transition).toBeUndefined();
  });
});

describe("removeTransition", () => {
  test("removes transition and moves clip forward", () => {
    let seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
          { id: "c2", clipKind: "video", assetId: "v1", startMs: 1500, durationMs: 2000, inMs: 0, outMs: 2000,
            transition: { type: "fade", durationMs: 500 } },
        ],
      }],
    };
    seq = removeTransition(seq, "c2");
    const clip = seq.tracks[0].clips.find(c => c.id === "c2")!;
    expect(clip.transition).toBeUndefined();
    expect(clip.startMs).toBe(2000); // 1500 + 500 = 2000
  });

  test("no-op when clip has no transition", () => {
    const seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
        ],
      }],
    };
    const result = removeTransition(seq, "c1");
    expect(result).toBe(seq);
  });
});

describe("splitClip", () => {
  test("splits a clip at midpoint with correct timing", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    const clip = seq.tracks[0].clips[0];
    // Clip: startMs=0, durationMs=5000, inMs=0, outMs=5000
    seq = splitClip(seq, clipId, 2000);
    expect(seq.tracks[0].clips).toHaveLength(2);

    const left = seq.tracks[0].clips[0];
    const right = seq.tracks[0].clips[1];
    expect(left.id).toBe(clipId); // left keeps original id
    expect(left.startMs).toBe(0);
    expect(left.durationMs).toBe(2000);
    expect(left.inMs).toBe(0);
    expect(left.outMs).toBe(2000);

    expect(right.id).not.toBe(clipId); // right gets new id
    expect(right.startMs).toBe(2000);
    expect(right.durationMs).toBe(3000);
    expect(right.inMs).toBe(2000);
    expect(right.outMs).toBe(5000);
  });

  test("splits a trimmed clip correctly", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    // Trim: inMs=1000, outMs=4000, durationMs=3000
    seq = trimClip(seq, clipId, "left", 1000);
    const trimmed = seq.tracks[0].clips[0];
    expect(trimmed.inMs).toBe(1000);

    seq = splitClip(seq, trimmed.id, trimmed.startMs + 1500);
    const left = seq.tracks[0].clips[0];
    const right = seq.tracks[0].clips[1];

    expect(left.durationMs).toBe(1500);
    expect(left.inMs).toBe(1000);
    expect(left.outMs).toBe(2500);

    expect(right.durationMs).toBe(2500);
    expect(right.inMs).toBe(2500);
    expect(right.outMs).toBe(5000);
  });

  test("no-op when split at clip start", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    const original = seq;
    seq = splitClip(seq, clipId, 0);
    expect(seq).toBe(original);
  });

  test("no-op when split at clip end", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    const clip = seq.tracks[0].clips[0];
    const original = seq;
    seq = splitClip(seq, clipId, clip.startMs + clip.durationMs);
    expect(seq).toBe(original);
  });

  test("no-op for nonexistent clip", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    const original = seq;
    seq = splitClip(seq, "nonexistent", 2000);
    expect(seq).toBe(original);
  });

  test("clears transition on left clip when split within transition zone", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, imageClipId, { type: "fade", durationMs: 500 });
    const clip = seq.tracks[0].clips[1];

    // Split 200ms in — within the 500ms transition zone
    seq = splitClip(seq, clip.id, clip.startMs + 200);
    const left = seq.tracks[0].clips[1]; // was the image clip
    expect(left.transition).toBeUndefined(); // transition cleared
    expect(left.durationMs).toBe(200);
  });

  test("keeps transition on left clip when split outside transition zone", () => {
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, imageClipId, { type: "fade", durationMs: 500 });
    const clip = seq.tracks[0].clips[1];

    // Split 1000ms in — outside the 500ms transition zone
    seq = splitClip(seq, clip.id, clip.startMs + 1000);
    const left = seq.tracks[0].clips[1];
    expect(left.transition).toBeDefined();
    expect(left.transition?.durationMs).toBe(500);
    expect(left.durationMs).toBe(1000);
  });
});

describe("rippleDelete", () => {
  function threeClipSeq(): Sequence {
    return {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
          { id: "c2", clipKind: "video", assetId: "v1", startMs: 2000, durationMs: 3000, inMs: 0, outMs: 3000 },
          { id: "c3", clipKind: "video", assetId: "v1", startMs: 5000, durationMs: 1000, inMs: 0, outMs: 1000 },
        ],
      }],
    };
  }

  test("removes clip and shifts subsequent clips left", () => {
    const seq = rippleDelete(threeClipSeq(), "c2");
    expect(seq.tracks[0].clips).toHaveLength(2);
    expect(seq.tracks[0].clips[0].id).toBe("c1");
    expect(seq.tracks[0].clips[0].startMs).toBe(0); // unchanged
    expect(seq.tracks[0].clips[1].id).toBe("c3");
    expect(seq.tracks[0].clips[1].startMs).toBe(2000); // 5000 - 3000 = 2000
  });

  test("removes first clip and shifts all subsequent clips left", () => {
    const seq = rippleDelete(threeClipSeq(), "c1");
    expect(seq.tracks[0].clips).toHaveLength(2);
    expect(seq.tracks[0].clips[0].id).toBe("c2");
    expect(seq.tracks[0].clips[0].startMs).toBe(0); // 2000 - 2000 = 0
    expect(seq.tracks[0].clips[1].id).toBe("c3");
    expect(seq.tracks[0].clips[1].startMs).toBe(3000); // 5000 - 2000 = 3000
  });

  test("removes last clip without shifting others", () => {
    const seq = rippleDelete(threeClipSeq(), "c3");
    expect(seq.tracks[0].clips).toHaveLength(2);
    expect(seq.tracks[0].clips[0].startMs).toBe(0);
    expect(seq.tracks[0].clips[1].startMs).toBe(2000);
  });

  test("removes track when last clip is deleted", () => {
    const seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
        ],
      }],
    };
    const result = rippleDelete(seq, "c1");
    expect(result.tracks).toHaveLength(0);
  });

  test("only affects same track", () => {
    const seq: Sequence = {
      tracks: [
        {
          id: "t1",
          clips: [
            { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
            { id: "c2", clipKind: "video", assetId: "v1", startMs: 2000, durationMs: 3000, inMs: 0, outMs: 3000 },
          ],
        },
        {
          id: "t2",
          clips: [
            { id: "c3", clipKind: "video", assetId: "v1", startMs: 2000, durationMs: 3000, inMs: 0, outMs: 3000 },
          ],
        },
      ],
    };
    const result = rippleDelete(seq, "c1");
    // Track 1: c2 shifted left
    expect(result.tracks[0].clips[0].id).toBe("c2");
    expect(result.tracks[0].clips[0].startMs).toBe(0); // shifted from 2000 to 0
    // Track 2: unchanged
    expect(result.tracks[1].clips[0].id).toBe("c3");
    expect(result.tracks[1].clips[0].startMs).toBe(2000);
  });

  test("no-op for nonexistent clip", () => {
    const seq = threeClipSeq();
    const result = rippleDelete(seq, "nonexistent");
    expect(result).toBe(seq);
  });

  test("handles clips with gaps correctly", () => {
    const seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 1000, inMs: 0, outMs: 1000 },
          { id: "c2", clipKind: "video", assetId: "v1", startMs: 3000, durationMs: 1000, inMs: 0, outMs: 1000 },
          { id: "c3", clipKind: "video", assetId: "v1", startMs: 6000, durationMs: 1000, inMs: 0, outMs: 1000 },
        ],
      }],
    };
    // Delete c1 (0-1000), only c2 and c3 should shift left by 1000
    const result = rippleDelete(seq, "c1");
    expect(result.tracks[0].clips[0].id).toBe("c2");
    expect(result.tracks[0].clips[0].startMs).toBe(2000); // 3000 - 1000
    expect(result.tracks[0].clips[1].id).toBe("c3");
    expect(result.tracks[0].clips[1].startMs).toBe(5000); // 6000 - 1000
  });
});

describe("rippleTrim", () => {
  function threeClipSeq(): Sequence {
    return {
      tracks: [{
        id: "t1",
        clips: [
          { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
          { id: "c2", clipKind: "video", assetId: "v1", startMs: 2000, durationMs: 3000, inMs: 0, outMs: 3000 },
          { id: "c3", clipKind: "video", assetId: "v1", startMs: 5000, durationMs: 1000, inMs: 0, outMs: 1000 },
        ],
      }],
    };
  }

  test("right trim shorter shifts subsequent clips left", () => {
    // Shorten c2 by 1000ms, c3 should shift left by 1000ms
    const seq = rippleTrim(threeClipSeq(), "c2", "right", -1000);
    expect(seq.tracks[0].clips[1].durationMs).toBe(2000); // 3000 - 1000
    expect(seq.tracks[0].clips[2].startMs).toBe(4000); // 5000 - 1000
  });

  test("right trim longer shifts subsequent clips right", () => {
    // Extend c2 by 500ms, c3 should shift right by 500ms
    const seq = rippleTrim(threeClipSeq(), "c2", "right", 500);
    expect(seq.tracks[0].clips[1].durationMs).toBe(3500);
    expect(seq.tracks[0].clips[2].startMs).toBe(5500); // 5000 + 500
  });

  test("left trim does not affect subsequent clips (end unchanged)", () => {
    // Left trim c2 by 500ms — start moves right, end stays same
    const seq = rippleTrim(threeClipSeq(), "c2", "left", 500);
    expect(seq.tracks[0].clips[1].startMs).toBe(2500);
    expect(seq.tracks[0].clips[1].durationMs).toBe(2500);
    // c3 stays same since c2's end didn't change
    expect(seq.tracks[0].clips[2].startMs).toBe(5000);
  });

  test("does not affect other tracks", () => {
    const seq: Sequence = {
      tracks: [
        {
          id: "t1",
          clips: [
            { id: "c1", clipKind: "video", assetId: "v1", startMs: 0, durationMs: 2000, inMs: 0, outMs: 2000 },
            { id: "c2", clipKind: "video", assetId: "v1", startMs: 2000, durationMs: 3000, inMs: 0, outMs: 3000 },
          ],
        },
        {
          id: "t2",
          clips: [
            { id: "c3", clipKind: "video", assetId: "v1", startMs: 5000, durationMs: 1000, inMs: 0, outMs: 1000 },
          ],
        },
      ],
    };
    const result = rippleTrim(seq, "c1", "right", -500);
    // c2 should shift left
    expect(result.tracks[0].clips[1].startMs).toBe(1500); // 2000 - 500
    // c3 on other track should not move
    expect(result.tracks[1].clips[0].startMs).toBe(5000);
  });

  test("no-op for nonexistent clip", () => {
    const seq = threeClipSeq();
    const result = rippleTrim(seq, "nonexistent", "right", -500);
    expect(result).toBe(seq);
  });

  test("no shift when trim has no duration change", () => {
    // Try to extend beyond source max — clamped to 0 change
    const seq = rippleTrim(threeClipSeq(), "c2", "right", 0);
    expect(seq.tracks[0].clips[2].startMs).toBe(5000); // unchanged
  });
});

describe("rippleDelete with transitions", () => {
  test("ripple delete shifts clips with transitions correctly", () => {
    // A → B (with 500ms transition) → C
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipBId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, clipBId, { type: "fade", durationMs: 500 });

    // Delete clip A — B and C should be shifted
    const clipAId = seq.tracks[0].clips[0].id;
    const result = rippleDelete(seq, clipAId);

    // B should be shifted and its transition cleared (no predecessor)
    const clips = result.tracks[0].clips;
    expect(clips).toHaveLength(2);
    expect(clips[0].startMs).toBe(0);
    expect(clips[0].transition).toBeUndefined();
  });

  test("ripple delete of clip with transition uses net duration for shift", () => {
    // A → B (with 500ms transition) → C
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipBId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, clipBId, { type: "fade", durationMs: 500 });

    const clipCBefore = seq.tracks[0].clips[2];

    // Delete clip B — C should shift by B's net duration (not full duration)
    const result = rippleDelete(seq, clipBId);
    const clips = result.tracks[0].clips;
    expect(clips).toHaveLength(2);
    // C should be shifted left by B's net duration (durationMs - transition overlap)
    const shiftedC = clips[1];
    expect(shiftedC.startMs).toBeLessThan(clipCBefore.startMs);
  });
});

describe("rippleTrim with transitions", () => {
  test("ripple trim shifts clips with transitions on right-side shorten", () => {
    // A → B (with 500ms transition)
    let seq = addClipFromAsset(emptySeq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    const clipBId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, clipBId, { type: "fade", durationMs: 500 });

    const clipAId = seq.tracks[0].clips[0].id;
    const clipBBefore = seq.tracks[0].clips[1];

    // Right-trim clip A by -1000ms (shorter) — B should shift left
    const result = rippleTrim(seq, clipAId, "right", -1000);
    const clipBAfter = result.tracks[0].clips[1];
    expect(clipBAfter.startMs).toBe(clipBBefore.startMs - 1000);
  });
});
