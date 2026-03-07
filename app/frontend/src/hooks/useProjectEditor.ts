import { useCallback } from "react";
import type { Project, Asset, Clip, Track } from "@video/shared";
import { generateId, DEFAULT_IMAGE_DURATION_MS } from "@video/shared";
import { useUpdateProject } from "../api/projects";

export function useProjectEditor(project: Project) {
  const updateProject = useUpdateProject(project.id);

  const addClipFromAsset = useCallback(
    (asset: Asset) => {
      const tracks = [...project.sequence.tracks];

      // Find or create the appropriate track
      const trackKind = asset.kind === "audio" ? "audio" : "video";
      let track = tracks.find((t) => t.kind === trackKind);
      if (!track) {
        track = { id: generateId(), kind: trackKind, clips: [] };
        tracks.push(track);
      } else {
        track = { ...track, clips: [...track.clips] };
        const idx = tracks.findIndex((t) => t.id === track!.id);
        tracks[idx] = track;
      }

      // Calculate startMs: place after the last clip in this track
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

      updateProject.mutate({
        sequence: { ...project.sequence, tracks },
      });
    },
    [project, updateProject],
  );

  const removeClip = useCallback(
    (clipId: string) => {
      const tracks = project.sequence.tracks
        .map((track) => ({
          ...track,
          clips: track.clips.filter((c) => c.id !== clipId),
        }))
        .filter((track) => track.clips.length > 0);

      updateProject.mutate({
        sequence: { ...project.sequence, tracks },
      });
    },
    [project, updateProject],
  );

  return { addClipFromAsset, removeClip, isSaving: updateProject.isPending };
}
