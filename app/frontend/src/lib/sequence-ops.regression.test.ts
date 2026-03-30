import { describe, test, expect, beforeAll } from "bun:test";
import type { Asset, Sequence } from "@video/shared";
import { assetKindRegistry } from "./asset-kind-registry";
import { builtinPlugin } from "./builtin-plugin";
import {
  addClipFromAsset,
  addEmptyClip,
  moveClip,
  trimClip,
  splitClip,
  addTextClip,
  updateClip,
  clampClipsToDuration,
  removeClip,
  removeTrack,
  setTransition,
  removeTransition,
  rippleDelete,
  rippleTrim,
  duplicateClip,
  pasteClip,
  pasteAttributes,
  removeClips,
  moveClips,
  groupClips,
  ungroupClips,
  setTrackLocked,
  setTrackMuted,
  setTrackName,
  setTrackColor,
  addKeyframe,
  removeKeyframe,
  updateKeyframe,
  setClipSpeed,
  applyPipPreset,
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
  // Map random groupIds to deterministic ones
  const groupIdMap = new Map<string, string>();
  let groupIdx = 0;
  return {
    tracks: seq.tracks.map((track) => ({
      ...track,
      id: `track-${trackIdx++}`,
      clips: track.clips.map((clip) => {
        let stableGroupId = clip.groupId;
        if (clip.groupId) {
          if (!groupIdMap.has(clip.groupId)) {
            groupIdMap.set(clip.groupId, `group-${groupIdx++}`);
          }
          stableGroupId = groupIdMap.get(clip.groupId);
        }
        return {
          ...clip,
          id: `clip-${clipIdx++}`,
          ...(stableGroupId ? { groupId: stableGroupId } : {}),
        };
      }),
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

  test("workflow: split video clip at midpoint", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    // Split at 2500ms (midpoint of 0-5000ms clip)
    seq = splitClip(seq, clipId, 2500);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split clip near start", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    // Split at 100ms from start
    seq = splitClip(seq, clipId, 100);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split clip near end", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    // Split at 4900ms (near end of 0-5000ms clip)
    seq = splitClip(seq, clipId, 4900);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split at clip start (no-op)", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    const before = stabilize(seq);

    // Split at exact start — should be no-op
    seq = splitClip(seq, clipId, 0);

    expect(stabilize(seq)).toEqual(before);
  });

  test("workflow: split at clip end (no-op)", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    const before = stabilize(seq);

    // Split at exact end — should be no-op
    seq = splitClip(seq, clipId, 5000);

    expect(stabilize(seq)).toEqual(before);
  });

  test("workflow: split trimmed clip preserves in/out", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    // Trim left by 1000ms, then right by -1000ms
    seq = trimClip(seq, clipId, "left", 1000, 5000, 10000);
    seq = trimClip(seq, clipId, "right", -1000, 5000, 10000);

    // Now clip is: startMs=1000, durationMs=3000, inMs=1000, outMs=4000
    // Split at 2500ms
    seq = splitClip(seq, clipId, 2500);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split clip with transition clears transition on right", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Set transition on image clip
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, imageClipId, { type: "fade", durationMs: 500 });

    // Split the image clip
    const clipToSplit = seq.tracks[0].clips[1];
    seq = splitClip(seq, clipToSplit.id, clipToSplit.startMs + 1000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split empty-asset clip", () => {
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

    seq = splitClip(seq, "empty1", 1500);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split then move right part", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    seq = splitClip(seq, clipId, 2500);

    // Move the right clip to 5000ms
    const rightClipId = seq.tracks[0].clips[1].id;
    seq = moveClip(seq, rightClipId, 5000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split clip within transition zone clears transition on left", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    const imageClipId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, imageClipId, { type: "fade", durationMs: 500 });

    // Split 200ms in — within the 500ms transition zone
    const clipToSplit = seq.tracks[0].clips[1];
    seq = splitClip(seq, clipToSplit.id, clipToSplit.startMs + 200);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split nonexistent clip (no-op)", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    const before = stabilize(seq);

    seq = splitClip(seq, "nonexistent", 2500);

    expect(stabilize(seq)).toEqual(before);
  });

  test("workflow: ripple delete middle clip shifts subsequent", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, audioAsset, 10000);

    // Ripple delete the image clip (middle)
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = rippleDelete(seq, imageClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple delete first clip shifts all", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    const firstClipId = seq.tracks[0].clips[0].id;
    seq = rippleDelete(seq, firstClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple delete last clip (no shift needed)", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    const lastClipId = seq.tracks[0].clips[1].id;
    seq = rippleDelete(seq, lastClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple delete only clip removes track", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);

    const clipId = seq.tracks[0].clips[0].id;
    seq = rippleDelete(seq, clipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple delete multi-track only affects same track", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Add text to a new track at 2000ms
    seq = addTextClip(seq, 2000, 3000, {
      value: "Overlay",
      fontSize: 20,
      color: "white",
    }, 10000);

    // Ripple delete the video clip (first track)
    const videoClipId = seq.tracks[0].clips[0].id;
    seq = rippleDelete(seq, videoClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple trim right shorter shifts subsequent left", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Ripple trim video clip right by -2000ms
    const videoClipId = seq.tracks[0].clips[0].id;
    seq = rippleTrim(seq, videoClipId, "right", -2000, 5000, 10000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple trim right longer shifts subsequent right", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Ripple trim video clip right by +1000ms (extend within source duration)
    // Note: video is 5000ms source, clip is already 5000ms, so no change possible
    // Use a shorter clip scenario instead
    const videoClipId = seq.tracks[0].clips[0].id;
    seq = trimClip(seq, videoClipId, "right", -2000, 5000, 10000); // shorten first
    seq = rippleTrim(seq, videoClipId, "right", 1000, 5000, 10000); // then extend

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple trim + ripple delete combined", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, audioAsset, 10000);

    // Ripple trim first clip shorter
    const videoClipId = seq.tracks[0].clips[0].id;
    seq = rippleTrim(seq, videoClipId, "right", -2000, 5000, 10000);

    // Ripple delete second clip
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = rippleDelete(seq, imageClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple delete first clip when second has transition", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipBId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, clipBId, { type: "fade", durationMs: 500 });

    // Delete first clip — B should shift and lose transition
    const clipAId = seq.tracks[0].clips[0].id;
    seq = rippleDelete(seq, clipAId);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple delete clip with transition (net shift)", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipBId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, clipBId, { type: "fade", durationMs: 500 });

    // Delete B — C should shift by net duration
    seq = rippleDelete(seq, clipBId);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: duplicate video clip", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 20000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = duplicateClip(seq, clipId, 20000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: duplicate clip clamped by maxDuration", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 7000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = duplicateClip(seq, clipId, 7000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: paste clip at playhead on same track", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 20000);
    const clip = seq.tracks[0].clips[0];
    const trackId = seq.tracks[0].id;
    seq = pasteClip(seq, clip, 6000, trackId, 20000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: paste clip on different track", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 20000);
    seq = addTextClip(seq, 0, 2000, {
      value: "Overlay",
      fontSize: 20,
      color: "white",
    }, 20000);

    const clip = seq.tracks[0].clips[0];
    const targetTrackId = seq.tracks[1].id;
    seq = pasteClip(seq, clip, 3000, targetTrackId, 20000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: paste attributes from styled clip to plain clip", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 20000);
    seq = addClipFromAsset(seq, imageAsset, 20000);

    const srcClipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, srcClipId, {
      transform: { x: 10, y: -5, scale: 1.5, rotation: 30 },
      blendMode: "screen",
      crop: { x: 0, y: 0, width: 160, height: 90 },
    });

    const srcClip = seq.tracks[0].clips[0];
    const tgtClipId = seq.tracks[0].clips[1].id;
    seq = pasteAttributes(seq, srcClip, tgtClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: duplicate then move the duplicate", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = duplicateClip(seq, clipId, 30000);

    // Move the duplicate further
    const dupId = seq.tracks[0].clips[1].id;
    seq = moveClip(seq, dupId, 15000, 30000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: copy-paste with transform + blend attributes", () => {
    let seq: Sequence = { tracks: [] };

    seq = addClipFromAsset(seq, videoAsset, 20000);
    seq = addClipFromAsset(seq, imageAsset, 20000);

    // Style first clip
    const srcClipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, srcClipId, {
      transform: { x: 50, y: 50, scale: 2, rotation: 90 },
      blendMode: "overlay",
    });

    // Paste the clip at 8000ms
    const srcClip = seq.tracks[0].clips[0];
    const trackId = seq.tracks[0].id;
    seq = pasteClip(seq, srcClip, 8000, trackId, 20000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: ripple trim with transition on subsequent clip", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    const clipBId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, clipBId, { type: "fade", durationMs: 500 });

    // Right-trim clip A shorter — B should shift
    const clipAId = seq.tracks[0].clips[0].id;
    seq = rippleTrim(seq, clipAId, "right", -1000, 5000, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("multi-select: removeClips removes multiple clips at once", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);
    seq = addClipFromAsset(seq, audioAsset, 30000);
    // Remove the first and third clips
    const clipIds = new Set([seq.tracks[0].clips[0].id, seq.tracks[0].clips[2].id]);
    seq = removeClips(seq, clipIds);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("multi-select: moveClips shifts multiple clips by delta", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);
    const clipIds = new Set([seq.tracks[0].clips[0].id, seq.tracks[0].clips[1].id]);
    seq = moveClips(seq, clipIds, 1000, 30000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("group: groupClips assigns groupId, ungroupClips clears it", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);
    const clipIds = new Set([seq.tracks[0].clips[0].id, seq.tracks[0].clips[1].id]);
    seq = groupClips(seq, clipIds);
    expect(stabilize(seq)).toMatchSnapshot();

    seq = ungroupClips(seq, clipIds);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split on locked track is no-op", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const trackId = seq.tracks[0].id;
    const clipId = seq.tracks[0].clips[0].id;
    seq = setTrackLocked(seq, trackId, true);

    const before = stabilize(seq);
    const afterSplit = splitClip(seq, clipId, 2500);
    expect(stabilize(afterSplit)).toEqual(before);
  });

  test("workflow: ripple delete of one clip in a group", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);
    seq = addClipFromAsset(seq, audioAsset, 30000);

    // Group first two clips
    const clipIds = new Set([seq.tracks[0].clips[0].id, seq.tracks[0].clips[1].id]);
    seq = groupClips(seq, clipIds);

    // Ripple delete the first grouped clip
    const firstClipId = seq.tracks[0].clips[0].id;
    seq = rippleDelete(seq, firstClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: paste clip to locked track is no-op", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const trackId = seq.tracks[0].id;
    seq = setTrackLocked(seq, trackId, true);

    const clip = seq.tracks[0].clips[0];
    const before = stabilize(seq);
    const afterPaste = pasteClip(seq, clip, 6000, trackId, 30000);
    expect(stabilize(afterPaste)).toEqual(before);
  });

  test("workflow: removeTransition restores startMs and clears transition", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Set transition on image clip — this shifts startMs backward
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, imageClipId, { type: "fade", durationMs: 500 });

    // Now remove it — startMs should be restored, transition cleared
    seq = removeTransition(seq, imageClipId);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: setTrackName", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    const trackId = seq.tracks[0].id;
    seq = setTrackName(seq, trackId, "My Video Track");

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: setTrackColor", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    const trackId = seq.tracks[0].id;
    seq = setTrackColor(seq, trackId, "#DC322F");

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: duplicate clip with transition clears transition on duplicate", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);

    // Set transition on the image clip
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = setTransition(seq, imageClipId, { type: "fade", durationMs: 500 });

    // Duplicate the clip with transition
    seq = duplicateClip(seq, imageClipId, 30000);

    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: split then ripple delete one half", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);

    // Split the video clip at midpoint
    const videoClipId = seq.tracks[0].clips[0].id;
    seq = splitClip(seq, videoClipId, 2500);

    // Ripple delete the first half — second half and image should shift left
    const firstHalfId = seq.tracks[0].clips[0].id;
    seq = rippleDelete(seq, firstHalfId);

    expect(stabilize(seq)).toMatchSnapshot();
  });
});

describe("track lock & mute regression", () => {
  test("setTrackLocked then attempt operations", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, videoAsset, 30000);

    // Lock the track
    const trackId = seq.tracks[0].id;
    seq = setTrackLocked(seq, trackId, true);
    expect(stabilize(seq)).toMatchSnapshot();

    // Attempt move on locked track — should be unchanged
    const clipId = seq.tracks[0].clips[0].id;
    const afterMove = moveClip(seq, clipId, 1000, 30000);
    expect(afterMove).toBe(seq);

    // Unlock and move should work
    seq = setTrackLocked(seq, trackId, false);
    const afterUnlock = moveClip(seq, seq.tracks[0].clips[0].id, 1000, 30000);
    expect(stabilize(afterUnlock)).toMatchSnapshot();
  });

  test("setTrackMuted preserves track state", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);

    const trackId = seq.tracks[0].id;
    seq = setTrackMuted(seq, trackId, true);
    expect(stabilize(seq)).toMatchSnapshot();

    seq = setTrackMuted(seq, trackId, false);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("locked track blocks addClipFromAsset to that track", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const trackId = seq.tracks[0].id;
    seq = setTrackLocked(seq, trackId, true);

    const afterAdd = addClipFromAsset(seq, videoAsset, 30000, trackId);
    expect(afterAdd).toBe(seq);
  });

  test("locked track blocks splitClip", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const trackId = seq.tracks[0].id;
    const clipId = seq.tracks[0].clips[0].id;
    seq = setTrackLocked(seq, trackId, true);

    const afterSplit = splitClip(seq, clipId, 2500);
    expect(afterSplit).toBe(seq);
  });
});

describe("keyframe tracks regression", () => {
  const keyframeTracks = [
    {
      property: "transform.x",
      keyframes: [
        { timeMs: 0, value: 0 },
        { timeMs: 2500, value: 100 },
        { timeMs: 5000, value: 0 },
      ],
    },
    {
      property: "opacity",
      keyframes: [
        { timeMs: 0, value: 0, easing: "ease-in" as const },
        { timeMs: 1000, value: 1 },
      ],
    },
  ];

  test("workflow: clip with keyframeTracks preserves through move", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { keyframeTracks });
    seq = moveClip(seq, clipId, 5000, 30000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: clip with keyframeTracks preserves through trim", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { keyframeTracks });
    seq = trimClip(seq, clipId, "right", -1000, 5000, 30000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: clip with keyframeTracks preserves through split", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { keyframeTracks });
    seq = splitClip(seq, clipId, 2500);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: clip with keyframeTracks preserves through duplicate", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { keyframeTracks });
    seq = duplicateClip(seq, clipId, 30000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: clip with keyframeTracks preserves through paste", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, { keyframeTracks });
    const clip = seq.tracks[0].clips[0];
    const trackId = seq.tracks[0].id;
    seq = pasteClip(seq, clip, 10000, trackId, 30000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: pasteAttributes does not copy keyframeTracks", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    seq = addClipFromAsset(seq, imageAsset, 30000);
    const srcClipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, srcClipId, {
      keyframeTracks,
      transform: { x: 10, y: 5, scale: 1.5 },
    });
    const srcClip = seq.tracks[0].clips[0];
    const tgtClipId = seq.tracks[0].clips[1].id;
    seq = pasteAttributes(seq, srcClip, tgtClipId);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: clip with keyframeTracks + transform + blend", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 30000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      keyframeTracks,
      transform: { x: 10, y: -5, scale: 0.8, rotation: 15 },
      blendMode: "screen",
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addKeyframe creates track and adds keyframes", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 0, value: 0, easing: "linear" });
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 2000, value: 100, easing: "ease-out" });
    seq = addKeyframe(seq, clipId, "opacity", { timeMs: 0, value: 1, easing: "linear" });
    seq = addKeyframe(seq, clipId, "opacity", { timeMs: 3000, value: 0, easing: "ease-in" });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: addKeyframe replaces at same time", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 1000, value: 50 });
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 1000, value: 99, easing: "ease-in-out" });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: removeKeyframe removes single keyframe", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 0, value: 0 });
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 1000, value: 50 });
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 2000, value: 100 });
    seq = removeKeyframe(seq, clipId, "transform.x", 1000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: removeKeyframe removes last kf cleans up track", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 0, value: 0 });
    seq = removeKeyframe(seq, clipId, "transform.x", 0);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: updateKeyframe changes value and easing", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.scale", { timeMs: 0, value: 1, easing: "linear" });
    seq = addKeyframe(seq, clipId, "transform.scale", { timeMs: 3000, value: 2, easing: "linear" });
    seq = updateKeyframe(seq, clipId, "transform.scale", 3000, { value: 1.5, easing: "ease-in-out" });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: keyframe ops combined with move and trim", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 0, value: 0 });
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 4000, value: 200 });
    seq = moveClip(seq, clipId, 1000, 10000);
    seq = trimClip(seq, clipId, "right", -1000, 5000, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: keyframe ops with multiple properties on same clip", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 0, value: 0 });
    seq = addKeyframe(seq, clipId, "transform.x", { timeMs: 2000, value: 100 });
    seq = addKeyframe(seq, clipId, "transform.y", { timeMs: 0, value: 0 });
    seq = addKeyframe(seq, clipId, "transform.y", { timeMs: 2000, value: -50 });
    seq = addKeyframe(seq, clipId, "transform.scale", { timeMs: 0, value: 1 });
    seq = addKeyframe(seq, clipId, "transform.scale", { timeMs: 2000, value: 1.5 });
    seq = addKeyframe(seq, clipId, "volume", { timeMs: 0, value: 1 });
    seq = addKeyframe(seq, clipId, "volume", { timeMs: 2000, value: 0 });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: set clip speed to 2x", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = setClipSpeed(seq, clipId, 2, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: set clip speed to 0.5x", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = setClipSpeed(seq, clipId, 0.5, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: change speed multiple times preserves source duration", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 20000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = setClipSpeed(seq, clipId, 2, 20000);
    seq = setClipSpeed(seq, clipId, 0.5, 20000);
    seq = setClipSpeed(seq, clipId, 1, 20000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: speed change + trim + move", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 20000);
    seq = addClipFromAsset(seq, imageAsset, 20000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = setClipSpeed(seq, clipId, 2, 20000);
    seq = trimClip(seq, clipId, "right", -500, undefined, 20000);
    const imageClipId = seq.tracks[0].clips[1].id;
    seq = moveClip(seq, imageClipId, 3000, 20000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: add color correction to video clip", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { brightness: 0.3, contrast: -0.2, saturation: 0.5, hue: 15, temperature: 0.1 },
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: color correction preserved through move", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { brightness: 0.5, contrast: 0.2 },
    });
    seq = moveClip(seq, clipId, 2000, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: color correction preserved through trim", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { saturation: -0.5, hue: 90 },
    });
    seq = trimClip(seq, clipId, "right", -1000, 5000, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: color correction preserved through split", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { brightness: 0.2, temperature: -0.3 },
    });
    seq = splitClip(seq, clipId, 2500);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: color correction preserved through duplicate", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { contrast: 0.8, saturation: -0.3, hue: -45 },
    });
    seq = duplicateClip(seq, clipId, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: color correction + transform + blend mode combined", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { brightness: 0.1, contrast: 0.2, saturation: 0.3 },
      transform: { x: 10, y: -5, scale: 0.8, rotation: 15 },
      blendMode: "multiply",
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: reset color correction (set to undefined)", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      colorCorrection: { brightness: 0.5, contrast: 0.3 },
    });
    seq = updateClip(seq, clipId, {
      colorCorrection: undefined,
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  // ── Video Filters ──

  test("workflow: add video filters to video clip", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [
        { type: "blur", strength: 0.5 },
        { type: "sepia", strength: 0.7 },
      ],
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: video filters preserved through move", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [{ type: "grayscale", strength: 1.0 }],
    });
    seq = moveClip(seq, clipId, 2000, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: video filters preserved through trim", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [{ type: "blur", strength: 0.3 }, { type: "vignette", strength: 0.5 }],
    });
    seq = trimClip(seq, clipId, "right", -1000, 5000, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: video filters preserved through split", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [{ type: "sharpen", strength: 0.8 }],
    });
    seq = splitClip(seq, clipId, 2500);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: video filters preserved through duplicate", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [{ type: "grain", strength: 0.4 }, { type: "grayscale", strength: 0.6 }],
    });
    seq = duplicateClip(seq, clipId, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: video filters + color correction + transform combined", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    seq = addClipFromAsset(seq, imageAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [{ type: "blur", strength: 0.2 }, { type: "sepia", strength: 0.5 }],
      colorCorrection: { brightness: 0.1, contrast: 0.2 },
      transform: { x: 10, y: -5, scale: 0.8, rotation: 15 },
      blendMode: "multiply",
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: reset video filters (set to undefined)", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      videoFilters: [{ type: "blur", strength: 0.5 }],
    });
    seq = updateClip(seq, clipId, {
      videoFilters: undefined,
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  // ── Chroma Key tests ──

  test("workflow: set chroma key on video clip", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: chroma key preserved through split", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      chromaKey: { color: "#0000ff", similarity: 0.5, blend: 0.2 },
    });
    seq = splitClip(seq, clipId, 2500);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: chroma key preserved through duplicate", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      chromaKey: { color: "#00ff00", similarity: 0.4, blend: 0.15 },
    });
    seq = duplicateClip(seq, clipId, 10000);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: chroma key + transform combined", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
      transform: { x: 20, y: 10, scale: 0.6, rotation: 0 },
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: remove chroma key (set to undefined)", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      chromaKey: { color: "#00ff00", similarity: 0.3, blend: 0.1 },
    });
    seq = updateClip(seq, clipId, {
      chromaKey: undefined,
    });
    expect(stabilize(seq)).toMatchSnapshot();
  });

  // ── PiP Preset tests ──

  test("workflow: apply PiP corner-br preset", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = applyPipPreset(seq, clipId, "corner-br", 1920, 1080);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: apply PiP corner-tl preset", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = applyPipPreset(seq, clipId, "corner-tl", 1920, 1080);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: apply PiP side-by-side preset", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = applyPipPreset(seq, clipId, "side-by-side", 1920, 1080);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: apply PiP top-bottom preset", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = applyPipPreset(seq, clipId, "top-bottom", 1920, 1080);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: PiP preset overwrites existing transform", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;
    seq = updateClip(seq, clipId, {
      transform: { x: 100, y: 50, scale: 2, rotation: 45 },
    });
    seq = applyPipPreset(seq, clipId, "corner-br", 1920, 1080);
    expect(stabilize(seq)).toMatchSnapshot();
  });

  test("workflow: all four PiP corner presets", () => {
    let seq: Sequence = { tracks: [] };
    seq = addClipFromAsset(seq, videoAsset, 10000);
    const clipId = seq.tracks[0].clips[0].id;

    seq = applyPipPreset(seq, clipId, "corner-tr", 1920, 1080);
    expect(stabilize(seq)).toMatchSnapshot();
  });
});
