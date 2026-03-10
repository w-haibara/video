import type { Asset, Clip, ClipText, Sequence, Track } from "@video/shared";
import { generateId, DEFAULT_IMAGE_DURATION_MS, inferTrackKind } from "@video/shared";
import { assetKindRegistry } from "./asset-kind-registry";

export function addClipFromAsset(
  sequence: Sequence,
  asset: Asset,
  maxDurationMs?: number,
  targetTrackId?: string,
): Sequence {
  const tracks = sequence.tracks.map((t: Track) => ({ ...t, clips: [...t.clips] }));
  const descriptor = assetKindRegistry.get(asset.kind);
  const trackKind = descriptor?.defaultTrackKind ?? "video";
  let track: Track | undefined;
  if (targetTrackId) {
    track = tracks.find((t: Track) => t.id === targetTrackId);
  }
  if (!track) {
    track = tracks.find((t: Track) => inferTrackKind(t) === trackKind);
  }
  if (!track) {
    track = { id: generateId(), clips: [] };
    tracks.push(track);
  }

  const lastEnd = track.clips.reduce(
    (max: number, c: Clip) => Math.max(max, c.startMs + c.durationMs),
    0,
  );

  // Reject if start position is already at or beyond the limit
  if (maxDurationMs != null && lastEnd >= maxDurationMs) {
    return sequence;
  }

  let durationMs = descriptor?.hasDuration
    ? (asset.durationMs ?? descriptor.defaultDurationMs ?? DEFAULT_IMAGE_DURATION_MS)
    : (descriptor?.defaultDurationMs ?? DEFAULT_IMAGE_DURATION_MS);

  // Clamp duration to fit within the limit
  if (maxDurationMs != null && lastEnd + durationMs > maxDurationMs) {
    durationMs = maxDurationMs - lastEnd;
  }

  const clipKind = asset.kind === "image" ? "image" : (trackKind === "audio" ? "audio" : "video");

  const clip: Clip = {
    id: generateId(),
    clipKind,
    assetId: asset.id,
    startMs: lastEnd,
    durationMs,
    inMs: 0,
    outMs: durationMs,
  };

  track.clips.push(clip);
  return { ...sequence, tracks };
}

export function removeClip(sequence: Sequence, clipId: string): Sequence {
  const tracks = sequence.tracks
    .map((track: Track) => ({
      ...track,
      clips: track.clips.filter((c: Clip) => c.id !== clipId),
    }))
    .filter((track: Track) => track.clips.length > 0);
  return { ...sequence, tracks };
}

export function findNonOverlappingPosition(
  clips: readonly Clip[],
  movingClipId: string,
  newStartMs: number,
  durationMs: number,
): number {
  const others = clips
    .filter((c) => c.id !== movingClipId)
    .sort((a, b) => a.startMs - b.startMs);

  if (others.length === 0) return newStartMs;

  let pos = newStartMs;
  const endMs = pos + durationMs;

  for (const other of others) {
    const otherEnd = other.startMs + other.durationMs;
    // Check overlap: [pos, pos+durationMs) intersects [other.startMs, otherEnd)
    if (pos < otherEnd && endMs > other.startMs) {
      // Snap to whichever side is closer
      const snapAfter = otherEnd;
      const snapBefore = other.startMs - durationMs;
      if (Math.abs(snapAfter - newStartMs) <= Math.abs(snapBefore - newStartMs)) {
        pos = snapAfter;
      } else {
        pos = snapBefore;
      }
    }
  }

  // Verify the snapped position doesn't overlap with any other clip
  for (const other of others) {
    const otherEnd = other.startMs + other.durationMs;
    if (pos < otherEnd && pos + durationMs > other.startMs) {
      // Still overlapping after snap — cancel the move
      const original = clips.find((c) => c.id === movingClipId);
      return original ? original.startMs : newStartMs;
    }
  }

  return pos;
}

export function moveClip(
  sequence: Sequence,
  clipId: string,
  newStartMs: number,
  maxDurationMs?: number,
): Sequence {
  let startMs = Math.max(0, Math.round(newStartMs));
  if (maxDurationMs != null) {
    // Find the clip to get its duration for clamping
    for (const track of sequence.tracks) {
      const clip = track.clips.find((c: Clip) => c.id === clipId);
      if (clip) {
        const maxStart = Math.max(0, maxDurationMs - clip.durationMs);
        startMs = Math.min(startMs, maxStart);
        break;
      }
    }
  }

  // Apply overlap prevention within the same track
  for (const track of sequence.tracks) {
    const clip = track.clips.find((c: Clip) => c.id === clipId);
    if (clip) {
      startMs = findNonOverlappingPosition(track.clips, clipId, startMs, clip.durationMs);
      startMs = Math.max(0, startMs);
      if (maxDurationMs != null) {
        startMs = Math.min(startMs, Math.max(0, maxDurationMs - clip.durationMs));
      }
      break;
    }
  }

  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips
      .map((c: Clip) => (c.id === clipId ? { ...c, startMs } : c))
      .sort((a: Clip, b: Clip) => a.startMs - b.startMs),
  }));
  return { ...sequence, tracks };
}

export function addTextClip(
  sequence: Sequence,
  startMs: number,
  durationMs: number,
  text: ClipText,
  maxDurationMs?: number,
  targetTrackId?: string,
): Sequence {
  // Reject if start is beyond the limit
  if (maxDurationMs != null && startMs >= maxDurationMs) {
    return sequence;
  }

  // Clamp duration
  let clampedDuration = durationMs;
  if (maxDurationMs != null && startMs + clampedDuration > maxDurationMs) {
    clampedDuration = maxDurationMs - startMs;
  }

  const tracks = sequence.tracks.map((t: Track) => ({ ...t, clips: [...t.clips] }));
  let track: Track | undefined;
  if (targetTrackId) {
    track = tracks.find((t: Track) => t.id === targetTrackId);
  }
  if (!track) {
    track = tracks.find((t: Track) => inferTrackKind(t) === "title");
  }
  if (!track) {
    track = { id: generateId(), clips: [] };
    tracks.push(track);
  }

  const clip: Clip = {
    id: generateId(),
    clipKind: "title",
    assetId: "",
    startMs,
    durationMs: clampedDuration,
    inMs: 0,
    outMs: clampedDuration,
    text,
  };

  track.clips.push(clip);
  track.clips.sort((a: Clip, b: Clip) => a.startMs - b.startMs);
  return { ...sequence, tracks };
}

export function clampClipsToDuration(
  sequence: Sequence,
  maxDurationMs: number,
): Sequence {
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips
      .filter((c: Clip) => c.startMs < maxDurationMs)
      .map((c: Clip) => {
        if (c.startMs + c.durationMs > maxDurationMs) {
          const clampedDuration = maxDurationMs - c.startMs;
          return {
            ...c,
            durationMs: clampedDuration,
            outMs: c.inMs + clampedDuration,
          };
        }
        return c;
      }),
  }));
  return { ...sequence, tracks };
}

export function updateClip(
  sequence: Sequence,
  clipId: string,
  updates: Partial<Clip>,
): Sequence {
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) =>
      c.id === clipId ? { ...c, ...updates } : c,
    ),
  }));
  return { ...sequence, tracks };
}

export function trimClip(
  sequence: Sequence,
  clipId: string,
  side: "left" | "right",
  deltaMs: number,
  maxSourceDurationMs?: number,
  maxTimelineDurationMs?: number,
): Sequence {
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) => {
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
        let newDuration = Math.max(100, c.durationMs + deltaMs);
        if (maxSourceDurationMs != null) {
          newDuration = Math.min(newDuration, maxSourceDurationMs - c.inMs);
        }
        if (maxTimelineDurationMs != null) {
          newDuration = Math.min(newDuration, maxTimelineDurationMs - c.startMs);
        }
        return {
          ...c,
          durationMs: newDuration,
          outMs: c.inMs + newDuration,
        };
      }
    }),
  }));
  return { ...sequence, tracks };
}
