import { describe, test, expect, beforeAll } from "bun:test";
import type { Asset, Sequence } from "@video/shared";
import { assetKindRegistry } from "./asset-kind-registry";
import { builtinPlugin } from "./builtin-plugin";
import {
  addClipFromAsset,
  addEmptyClip,
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

beforeAll(() => {
  builtinPlugin.registerAssetKinds!(assetKindRegistry);
});

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

  test("workflow: left trim adjusts startMs and inMs", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    const clipId = seq.tracks[0].clips[0].id;
    // Left trim by 1000ms — startMs shifts right, inMs increases
    seq = trimClip(seq, clipId, "left", 1000, 5000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: left and right trim combined", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    const clipId = seq.tracks[0].clips[0].id;
    // Left trim +500ms, then right trim -1500ms
    seq = trimClip(seq, clipId, "left", 500, 5000, 10000);
    seq = trimClip(seq, clipId, "right", -1500, 5000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: update blendMode", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    seq = updateClip(seq, clipId, { blendMode: "cover" });

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: overlap snap on same-track move", () => {
    let seq: Sequence = { tracks: [] };

    // video at 0-5000, image at 5000-8000
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Move image to 2000 — overlaps video, should snap
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = moveClip(seq, imageClipId, 2000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: remove track", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addTextClip(seq, 0, 2000, {
      value: "Overlay",
      fontSize: 20,
      color: "white",
    }, 10000);

    // Remove the text track
    const textTrackId = seq.tracks[1].id;
    seq = removeTrack(seq, textTrackId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: text with fontFamily and align", () => {
    let seq: Sequence = { tracks: [] };

    seq = addTextClip(seq, 0, 3000, {
      value: "Styled Title",
      fontFamily: "Noto Sans JP",
      fontSize: 32,
      align: "right",
      color: "#ff0000",
      backgroundColor: "#000000@0.8",
    }, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: add clip to specific target track", () => {
    let seq: Sequence = { tracks: [] };

    // Create two tracks
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addTextClip(seq, 0, 2000, { value: "T", fontSize: 16, color: "white" }, 10000);

    // Add image to the first (video) track explicitly
    const videoTrackId = seq.tracks[0].id;
    seq = addClipFromAsset(seq, imageAsset, 10000, videoTrackId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: audio clip with volume", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, audioAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    seq = updateClip(seq, clipId, { volume: 0.3 });

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: empty-asset video clip", () => {
    let seq: Sequence = { tracks: [] };

    // Manually add a clip with empty assetId (no asset assigned)
    seq = {
      tracks: [{
        id: "t1",
        clips: [{
          id: "empty1",
          clipKind: "video",
          assetId: "",
          startMs: 0,
          durationMs: 3000,
          inMs: 0,
          outMs: 3000,
        }],
      }],
    };

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: empty-asset clip alongside normal clips", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    // Add empty-asset clip to a second track
    const emptyClip = {
      id: "empty1",
      clipKind: "image",
      assetId: "",
      startMs: 1000,
      durationMs: 2000,
      inMs: 0,
      outMs: 2000,
    };
    seq = {
      ...seq,
      tracks: [
        ...seq.tracks,
        { id: "t-empty", clips: [emptyClip] },
      ],
    };

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: move empty-asset clip", () => {
    let seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [{
          id: "empty1",
          clipKind: "video",
          assetId: "",
          startMs: 0,
          durationMs: 2000,
          inMs: 0,
          outMs: 2000,
        }],
      }],
    };

    seq = moveClip(seq, "empty1", 3000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: trim empty-asset clip", () => {
    let seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [{
          id: "empty1",
          clipKind: "video",
          assetId: "",
          startMs: 0,
          durationMs: 3000,
          inMs: 0,
          outMs: 3000,
        }],
      }],
    };

    seq = trimClip(seq, "empty1", "right", -1000, undefined, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: remove empty-asset clip removes empty track", () => {
    let seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [{
          id: "empty1",
          clipKind: "video",
          assetId: "",
          startMs: 0,
          durationMs: 2000,
          inMs: 0,
          outMs: 2000,
        }],
      }],
    };

    seq = removeClip(seq, "empty1");

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: update empty-asset clip properties", () => {
    let seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [{
          id: "empty1",
          clipKind: "video",
          assetId: "",
          startMs: 0,
          durationMs: 3000,
          inMs: 0,
          outMs: 3000,
        }],
      }],
    };

    seq = updateClip(seq, "empty1", {
      transform: { x: 10, y: -5, scale: 1.2, rotation: 30 },
    });

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: clamp empty-asset clip to duration", () => {
    let seq: Sequence = {
      tracks: [{
        id: "t1",
        clips: [
          {
            id: "empty1",
            clipKind: "video",
            assetId: "",
            startMs: 0,
            durationMs: 5000,
            inMs: 0,
            outMs: 5000,
          },
        ],
      }],
    };

    seq = clampClipsToDuration(seq, 3000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addEmptyClip to existing track", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    // Add empty video clip at 6000ms on the same track
    const trackId = seq.tracks[0].id;
    seq = addEmptyClip(seq, "video", 6000, 3000, 10000, trackId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addEmptyClip creates new track when no target", () => {
    let seq: Sequence = { tracks: [] };

    seq = addEmptyClip(seq, "image", 1000, 3000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addEmptyClip with title sets text", () => {
    let seq: Sequence = { tracks: [] };

    seq = addEmptyClip(seq, "title", 0, 3000, 10000, undefined, {
      value: "Text",
      fontSize: 48,
      color: "white",
      backgroundColor: "black",
    });

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addEmptyClip clamped by maxDuration", () => {
    let seq: Sequence = { tracks: [] };

    // Start at 9000ms with 3000ms duration, should clamp to 1000ms
    seq = addEmptyClip(seq, "video", 9000, 3000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addEmptyClip rejected when overlapping", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    // Try to add empty clip overlapping with existing video clip (0-5000)
    const trackId = seq.tracks[0].id;
    const before = stabilize(seq);
    seq = addEmptyClip(seq, "image", 2000, 3000, 10000, trackId);

    // Should be unchanged because of overlap
    expect(stabilize(seq)).toEqual(before);
  });

  test("workflow: addEmptyClip rejected when beyond maxDuration", () => {
    let seq: Sequence = { tracks: [] };

    const before = stabilize(seq);
    seq = addEmptyClip(seq, "video", 10000, 3000, 10000);

    // startMs >= maxDurationMs, should be rejected (no tracks created)
    expect(seq.tracks.length).toBe(0);
  });

  test("workflow: addEmptyClip then move", () => {
    let seq: Sequence = { tracks: [] };

    seq = addEmptyClip(seq, "video", 0, 3000, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = moveClip(seq, clipId, 5000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addEmptyClip multiple kinds on same track", () => {
    let seq: Sequence = { tracks: [{ id: "t1", clips: [] }] };

    seq = addEmptyClip(seq, "video", 0, 2000, 10000, "t1");
    seq = addEmptyClip(seq, "image", 3000, 2000, 10000, "t1");
    seq = addEmptyClip(seq, "audio", 6000, 2000, 10000, "t1");

    expect(stabilize(seq)).toMatchSnapshot();
  });
});
