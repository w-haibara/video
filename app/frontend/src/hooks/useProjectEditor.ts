import { useCallback } from "react";
import type { Project, Asset, Clip, ClipText, Sequence } from "@video/shared";
import * as SeqOps from "../lib/sequence-ops";

export function useProjectEditor(
  project: Project,
  sequence: Sequence,
  pushState: (seq: Sequence) => void,
) {
  const addClipFromAsset = useCallback(
    (asset: Asset) => {
      pushState(SeqOps.addClipFromAsset(sequence, asset));
    },
    [sequence, pushState],
  );

  const removeClip = useCallback(
    (clipId: string) => {
      pushState(SeqOps.removeClip(sequence, clipId));
    },
    [sequence, pushState],
  );

  const moveClip = useCallback(
    (clipId: string, newStartMs: number) => {
      pushState(SeqOps.moveClip(sequence, clipId, newStartMs));
    },
    [sequence, pushState],
  );

  const trimClip = useCallback(
    (clipId: string, side: "left" | "right", deltaMs: number) => {
      // Find the clip's asset to get source duration constraint
      let maxSourceDurationMs: number | undefined;
      for (const track of sequence.tracks) {
        const clip = track.clips.find((c) => c.id === clipId);
        if (clip) {
          const asset = project.assets.find((a) => a.id === clip.assetId);
          // Only constrain video/audio clips with known duration (not images)
          if (asset && asset.kind !== "image" && asset.durationMs) {
            maxSourceDurationMs = asset.durationMs;
          }
          break;
        }
      }
      pushState(SeqOps.trimClip(sequence, clipId, side, deltaMs, maxSourceDurationMs));
    },
    [sequence, project.assets, pushState],
  );

  const addTextClip = useCallback(
    (startMs: number, durationMs: number, text: ClipText) => {
      pushState(SeqOps.addTextClip(sequence, startMs, durationMs, text));
    },
    [sequence, pushState],
  );

  const updateClip = useCallback(
    (clipId: string, updates: Partial<Clip>) => {
      pushState(SeqOps.updateClip(sequence, clipId, updates));
    },
    [sequence, pushState],
  );

  return {
    addClipFromAsset,
    removeClip,
    moveClip,
    trimClip,
    addTextClip,
    updateClip,
  };
}
