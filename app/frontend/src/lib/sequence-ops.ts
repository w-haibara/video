import type { Asset, Clip, ClipText, Sequence } from "@video/shared";
import { generateId, DEFAULT_IMAGE_DURATION_MS } from "@video/shared";

export function addClipFromAsset(
  sequence: Sequence,
  asset: Asset,
  maxDurationMs?: number,
): Sequence {
  const tracks = sequence.tracks.map((t) => ({ ...t, clips: [...t.clips] }));
  const trackKind = asset.kind === "audio" ? "audio" : "video";
  let track = tracks.find((t) => t.kind === trackKind);
  if (!track) {
    track = { id: generateId(), kind: trackKind, clips: [] };
    tracks.push(track);
  }

  const lastEnd = track.clips.reduce(
    (max, c) => Math.max(max, c.startMs + c.durationMs),
    0,
  );

  // Reject if start position is already at or beyond the limit
  if (maxDurationMs != null && lastEnd >= maxDurationMs) {
    return sequence;
  }

  const isImage = asset.kind === "image";
  let durationMs = isImage
    ? DEFAULT_IMAGE_DURATION_MS
    : (asset.durationMs ?? DEFAULT_IMAGE_DURATION_MS);

  // Clamp duration to fit within the limit
  if (maxDurationMs != null && lastEnd + durationMs > maxDurationMs) {
    durationMs = maxDurationMs - lastEnd;
  }

  const clip: Clip = {
    id: generateId(),
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
    .map((track) => ({
      ...track,
      clips: track.clips.filter((c) => c.id !== clipId),
    }))
    .filter((track) => track.clips.length > 0);
  return { ...sequence, tracks };
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
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) {
        const maxStart = Math.max(0, maxDurationMs - clip.durationMs);
        startMs = Math.min(startMs, maxStart);
        break;
      }
    }
  }
  const tracks = sequence.tracks.map((track) => ({
    ...track,
    clips: track.clips
      .map((c) => (c.id === clipId ? { ...c, startMs } : c))
      .sort((a, b) => a.startMs - b.startMs),
  }));
  return { ...sequence, tracks };
}

export function addTextClip(
  sequence: Sequence,
  startMs: number,
  durationMs: number,
  text: ClipText,
  maxDurationMs?: number,
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

  const tracks = sequence.tracks.map((t) => ({ ...t, clips: [...t.clips] }));
  let track = tracks.find((t) => t.kind === "title");
  if (!track) {
    track = { id: generateId(), kind: "title", clips: [] };
    tracks.push(track);
  }

  const clip: Clip = {
    id: generateId(),
    assetId: "",
    startMs,
    durationMs: clampedDuration,
    inMs: 0,
    outMs: clampedDuration,
    text,
  };

  track.clips.push(clip);
  track.clips.sort((a, b) => a.startMs - b.startMs);
  return { ...sequence, tracks };
}

export function updateClip(
  sequence: Sequence,
  clipId: string,
  updates: Partial<Clip>,
): Sequence {
  const tracks = sequence.tracks.map((track) => ({
    ...track,
    clips: track.clips.map((c) =>
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
  const tracks = sequence.tracks.map((track) => ({
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
