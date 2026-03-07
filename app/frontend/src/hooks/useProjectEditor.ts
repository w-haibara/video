import { useCallback } from "react";
import type { Project, Asset, Clip, Sequence } from "@video/shared";
import { generateId, DEFAULT_IMAGE_DURATION_MS } from "@video/shared";

type MutateSequence = (
  updater: (tracks: Sequence["tracks"]) => Sequence["tracks"],
) => void;

export function useProjectEditor(
  project: Project,
  sequence: Sequence,
  pushState: (seq: Sequence) => void,
) {
  const mutateSequence: MutateSequence = useCallback(
    (updater) => {
      const tracks = updater(sequence.tracks);
      pushState({ ...sequence, tracks });
    },
    [sequence, pushState],
  );

  const addClipFromAsset = useCallback(
    (asset: Asset) => {
      mutateSequence((tracks) => {
        const newTracks = tracks.map((t) => ({ ...t, clips: [...t.clips] }));
        const trackKind = asset.kind === "audio" ? "audio" : "video";
        let track = newTracks.find((t) => t.kind === trackKind);
        if (!track) {
          track = { id: generateId(), kind: trackKind, clips: [] };
          newTracks.push(track);
        }

        const lastEnd = track.clips.reduce(
          (max, c) => Math.max(max, c.startMs + c.durationMs),
          0,
        );

        const isImage = asset.kind === "image";
        const durationMs = isImage
          ? DEFAULT_IMAGE_DURATION_MS
          : (asset.durationMs ?? DEFAULT_IMAGE_DURATION_MS);

        const clip: Clip = {
          id: generateId(),
          assetId: asset.id,
          startMs: lastEnd,
          durationMs,
          inMs: 0,
          outMs: durationMs,
        };

        track.clips.push(clip);
        return newTracks;
      });
    },
    [mutateSequence],
  );

  const removeClip = useCallback(
    (clipId: string) => {
      mutateSequence((tracks) =>
        tracks
          .map((track) => ({
            ...track,
            clips: track.clips.filter((c) => c.id !== clipId),
          }))
          .filter((track) => track.clips.length > 0),
      );
    },
    [mutateSequence],
  );

  const moveClip = useCallback(
    (clipId: string, newStartMs: number) => {
      const startMs = Math.max(0, Math.round(newStartMs));
      mutateSequence((tracks) =>
        tracks.map((track) => ({
          ...track,
          clips: track.clips
            .map((c) => (c.id === clipId ? { ...c, startMs } : c))
            .sort((a, b) => a.startMs - b.startMs),
        })),
      );
    },
    [mutateSequence],
  );

  const trimClip = useCallback(
    (clipId: string, side: "left" | "right", deltaMs: number) => {
      mutateSequence((tracks) =>
        tracks.map((track) => ({
          ...track,
          clips: track.clips.map((c) => {
            if (c.id !== clipId) return c;
            if (side === "left") {
              const delta = Math.min(deltaMs, c.durationMs - 100);
              const clampedDelta = Math.max(delta, -c.inMs);
              return {
                ...c,
                startMs: Math.max(0, c.startMs + clampedDelta),
                durationMs: c.durationMs - clampedDelta,
                inMs: c.inMs + clampedDelta,
              };
            } else {
              const newDuration = Math.max(100, c.durationMs + deltaMs);
              return {
                ...c,
                durationMs: newDuration,
                outMs: c.inMs + newDuration,
              };
            }
          }),
        })),
      );
    },
    [mutateSequence],
  );

  return { addClipFromAsset, removeClip, moveClip, trimClip };
}
