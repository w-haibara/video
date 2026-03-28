import { describe, test, expect } from "bun:test";
import type { Asset, Sequence } from "@video/shared";
import {
  addClipFromAsset,
  moveClip,
  trimClip,
  addTextClip,
  updateClip,
  clampClipsToDuration,
  removeClip,
  removeTrack,
} from "./sequence-ops";

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

/**
 * Strip random IDs from a sequence so snapshots are stable.
 * Replaces all id fields with sequential deterministic values.
 */
function stabilize(seq: Sequence): Sequence {
  let trackIdx = 0;
  let clipIdx = 0;
  return {
    tracks: seq.tracks.map((track) => ({
      ...track,
      id: `track-${trackIdx++}`,
      clips: track.clips.map((clip) => ({
        ...clip,
        id: `clip-${clipIdx++}`,
      })),
    })),
  };
}

describe("editor operation regression", () => {
  test("workflow: add video → add image → move clip → trim", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Move the second clip (image) to 6000ms
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = moveClip(seq, imageClipId, 6000, 10000);

    // Trim first clip right side by -1000ms
    const videoClipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, videoClipId, "right", -1000, 5000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: multi-track with text overlay", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    // Add text to a new track
    seq = addTextClip(seq, 1000, 2000, {
      value: "Title",
      fontSize: 24,
      color: "white",
      backgroundColor: "black@0.5",
    }, 10000);

    // Add another text clip
    seq = addTextClip(seq, 4000, 1000, {
      value: "Subtitle",
      fontSize: 16,
      color: "yellow",
    }, 10000, seq.tracks[1]?.id);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: cross-track move", () => {
    let seq: Sequence = { tracks: [] };

    // Add two clips to same track
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Add a new empty track by adding a text clip
    seq = addTextClip(seq, 0, 1000, {
      value: "Overlay",
      fontSize: 20,
      color: "white",
    }, 10000);

    // Move image clip to the text track
    const imageClipId = seq.tracks[0].clips[1].id;
    const targetTrackId = seq.tracks[1].id;
    seq = moveClip(seq, imageClipId, 2000, 10000, targetTrackId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: duration change clamps existing clips", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Reduce max duration — clips beyond 3000ms should be clamped/removed
    seq = clampClipsToDuration(seq, 3000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: update clip properties", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    // Apply transform
    seq = updateClip(seq, clipId, {
      transform: { x: 20, y: -10, scale: 1.5, rotation: 45 },
    });

    // Apply crop
    seq = updateClip(seq, clipId, {
      crop: { x: 10, y: 10, width: 140, height: 70 },
    });

    // Set volume
    seq = updateClip(seq, clipId, { volume: 0.5 });

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: add and remove clips", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, audioAsset, 10000);

    // Remove the image clip (middle)
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = removeClip(seq, imageClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });
});
