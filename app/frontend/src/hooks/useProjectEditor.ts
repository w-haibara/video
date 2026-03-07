import { useCallback } from "react";
import type { Project, Asset, Sequence } from "@video/shared";
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
      pushState(SeqOps.trimClip(sequence, clipId, side, deltaMs));
    },
    [sequence, pushState],
  );

  return { addClipFromAsset, removeClip, moveClip, trimClip };
}
