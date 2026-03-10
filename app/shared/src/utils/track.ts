import type { Track } from "../types/project";

/**
 * Derive the effective "track kind" from the clips inside a track.
 * Maps clipKind "image" → "video" (images share the video track).
 * Returns "video" as a fallback for empty tracks.
 */
export function inferTrackKind(track: Track): string {
  if (track.clips.length === 0) return "video";
  const ck = track.clips[0].clipKind;
  if (!ck) return "video";
  if (ck === "image") return "video";
  return ck;
}
