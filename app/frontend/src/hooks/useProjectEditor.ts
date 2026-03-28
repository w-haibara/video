import { useCallback } from "react";
import type { Project, Asset, Clip, ClipText, ClipTransition, Sequence } from "@video/shared";
import * as SeqOps from "../lib/sequence-ops";

export function useProjectEditor(
  project: Project,
  sequence: Sequence,
  pushState: (seq: Sequence) => void,
) {
  const maxDurationMs = project.settings.durationMs;

  const addClipFromAsset = useCallback(
    (asset: Asset, targetTrackId?: string) => {
      pushState(SeqOps.addClipFromAsset(sequence, asset, maxDurationMs, targetTrackId));
    },
    [sequence, pushState, maxDurationMs],
  );

  const removeClip = useCallback(
    (clipId: string) => {
      pushState(SeqOps.removeClip(sequence, clipId));
    },
    [sequence, pushState],
  );

  const moveClip = useCallback(
    (clipId: string, newStartMs: number, targetTrackId?: string) => {
      pushState(SeqOps.moveClip(sequence, clipId, newStartMs, maxDurationMs, targetTrackId));
    },
    [sequence, pushState, maxDurationMs],
  );

  const trimClip = useCallback(
    (clipId: string, side: "left" | "right", deltaMs: number) => {
      // Find the clip's asset to get source duration constraint
      let maxSourceDurationMs: number | undefined;
      for (const track of sequence.tracks) {
        const clip = track.clips.find((c: Clip) => c.id === clipId);
        if (clip) {
          const asset = project.assets.find((a: Asset) => a.id === clip.assetId);
          // Only constrain video/audio clips with known duration (not images)
          if (asset && asset.kind !== "image" && asset.durationMs) {
            maxSourceDurationMs = asset.durationMs;
          }
          break;
        }
      }
      pushState(SeqOps.trimClip(sequence, clipId, side, deltaMs, maxSourceDurationMs, maxDurationMs));
    },
    [sequence, project.assets, pushState, maxDurationMs],
  );

  const addTextClip = useCallback(
    (startMs: number, durationMs: number, text: ClipText, targetTrackId?: string) => {
      pushState(SeqOps.addTextClip(sequence, startMs, durationMs, text, maxDurationMs, targetTrackId));
    },
    [sequence, pushState, maxDurationMs],
  );

  const updateClip = useCallback(
    (clipId: string, updates: Partial<Clip>) => {
      pushState(SeqOps.updateClip(sequence, clipId, updates));
    },
    [sequence, pushState],
  );

  const setTransition = useCallback(
    (clipId: string, transition: ClipTransition | undefined) => {
      if (transition) {
        pushState(SeqOps.setTransition(sequence, clipId, transition));
      } else {
        pushState(SeqOps.removeTransition(sequence, clipId));
      }
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
    setTransition,
  };
}
