import type { Asset, Clip, ClipText, ClipTransition, Keyframe, KeyframeTrack, Sequence, Track } from "@video/shared";
import { generateId, DEFAULT_IMAGE_DURATION_MS } from "@video/shared";

/**
 * Find all clip IDs that belong to the same group as any of the given clip IDs.
 * Returns the expanded set including the original IDs.
 */
export function expandGroupSelection(
  sequence: Sequence,
  clipIds: ReadonlySet<string>,
): Set<string> {
  const result = new Set(clipIds);
  // Collect groupIds from selected clips
  const groupIds = new Set<string>();
  for (const track of sequence.tracks) {
    for (const clip of track.clips) {
      if (clipIds.has(clip.id) && clip.groupId) {
        groupIds.add(clip.groupId);
      }
    }
  }
  // Add all clips that share any of those groupIds
  if (groupIds.size > 0) {
    for (const track of sequence.tracks) {
      for (const clip of track.clips) {
        if (clip.groupId && groupIds.has(clip.groupId)) {
          result.add(clip.id);
        }
      }
    }
  }
  return result;
}

/**
 * Remove multiple clips from the sequence.
 * Empty tracks are removed.
 */
export function removeClips(sequence: Sequence, clipIds: ReadonlySet<string>): Sequence {
  if (areAnyClipsOnLockedTrack(sequence, clipIds)) return sequence;
  const tracks = sequence.tracks
    .map((track: Track) => ({
      ...track,
      clips: track.clips.filter((c: Clip) => !clipIds.has(c.id)),
    }))
    .filter((track: Track) => track.clips.length > 0);
  return { ...sequence, tracks };
}

/**
 * Move multiple clips by a delta (in ms).
 * All clips shift by the same amount. Clamped to 0 on the left.
 */
export function moveClips(
  sequence: Sequence,
  clipIds: ReadonlySet<string>,
  deltaMs: number,
  maxDurationMs?: number,
): Sequence {
  if (areAnyClipsOnLockedTrack(sequence, clipIds)) return sequence;
  // Find minimum startMs among selected clips to prevent going below 0
  let minStart = Infinity;
  let maxEnd = 0;
  for (const track of sequence.tracks) {
    for (const clip of track.clips) {
      if (clipIds.has(clip.id)) {
        minStart = Math.min(minStart, clip.startMs);
        maxEnd = Math.max(maxEnd, clip.startMs + clip.durationMs);
      }
    }
  }
  if (minStart === Infinity) return sequence;

  // Clamp delta so no clip goes below 0 or beyond max duration
  let clampedDelta = deltaMs;
  if (minStart + clampedDelta < 0) {
    clampedDelta = -minStart;
  }
  if (maxDurationMs != null && maxEnd + clampedDelta > maxDurationMs) {
    clampedDelta = maxDurationMs - maxEnd;
  }
  if (clampedDelta === 0) return sequence;

  const roundedDelta = Math.round(clampedDelta);

  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips
      .map((c: Clip) =>
        clipIds.has(c.id) ? { ...c, startMs: c.startMs + roundedDelta } : c,
      )
      .sort((a: Clip, b: Clip) => a.startMs - b.startMs),
  }));
  return { ...sequence, tracks };
}

/**
 * Assign a shared groupId to all specified clips.
 */
export function groupClips(sequence: Sequence, clipIds: ReadonlySet<string>): Sequence {
  if (clipIds.size < 2) return sequence;
  const groupId = generateId();
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) =>
      clipIds.has(c.id) ? { ...c, groupId } : c,
    ),
  }));
  return { ...sequence, tracks };
}

/**
 * Remove groupId from all specified clips.
 */
export function ungroupClips(sequence: Sequence, clipIds: ReadonlySet<string>): Sequence {
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) =>
      clipIds.has(c.id) ? { ...c, groupId: undefined } : c,
    ),
  }));
  return { ...sequence, tracks };
}
import { assetKindRegistry } from "./asset-kind-registry";

export function addClipFromAsset(
  sequence: Sequence,
  asset: Asset,
  maxDurationMs?: number,
  targetTrackId?: string,
): Sequence {
  // Reject if target track is locked
  if (targetTrackId) {
    const target = sequence.tracks.find((t: Track) => t.id === targetTrackId);
    if (target?.locked) return sequence;
  }
  const tracks = sequence.tracks.map((t: Track) => ({ ...t, clips: [...t.clips] }));
  const descriptor = assetKindRegistry.get(asset.kind);
  let track: Track | undefined;
  if (targetTrackId) {
    track = tracks.find((t: Track) => t.id === targetTrackId);
  }
  if (!track && tracks.length > 0) {
    track = tracks[tracks.length - 1];
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

  const clipKind = asset.kind;

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
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
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
  maxStartMs?: number,
): number {
  const others = clips
    .filter((c) => c.id !== movingClipId)
    .sort((a, b) => a.startMs - b.startMs);

  if (others.length === 0) return newStartMs;

  let pos = newStartMs;

  for (const other of others) {
    const otherEnd = other.startMs + other.durationMs;
    // Check overlap: [pos, pos+durationMs) intersects [other.startMs, otherEnd)
    if (pos < otherEnd && pos + durationMs > other.startMs) {
      const snapAfter = otherEnd;
      const snapBefore = other.startMs - durationMs;
      const afterValid = maxStartMs == null || snapAfter <= maxStartMs;
      const beforeValid = snapBefore >= 0;

      if (afterValid && beforeValid) {
        pos = Math.abs(snapBefore - newStartMs) < Math.abs(snapAfter - newStartMs) ? snapBefore : snapAfter;
      } else if (afterValid) {
        pos = snapAfter;
      } else if (beforeValid) {
        pos = snapBefore;
      } else {
        // Neither side fits within bounds — will be caught by verification below
        pos = snapAfter;
      }
    }
  }

  // Verify the snapped position doesn't overlap with any other clip
  for (const other of others) {
    const otherEnd = other.startMs + other.durationMs;
    if (pos < otherEnd && pos + durationMs > other.startMs) {
      // Still overlapping after snap — find a gap that fits within bounds
      for (let i = 0; i < others.length; i++) {
        const gapStart = i === 0 ? 0 : others[i - 1].startMs + others[i - 1].durationMs;
        const gapEnd = others[i].startMs;
        if (gapEnd - gapStart >= durationMs && (maxStartMs == null || gapStart <= maxStartMs)) {
          return gapStart;
        }
      }
      // Check gap after the last clip
      const last = others[others.length - 1];
      const afterLast = last.startMs + last.durationMs;
      if (maxStartMs == null || afterLast <= maxStartMs) {
        return afterLast;
      }
      // No valid position found — return original (caller should check for overlap)
      return newStartMs;
    }
  }

  return pos;
}

export function moveClip(
  sequence: Sequence,
  clipId: string,
  newStartMs: number,
  maxDurationMs?: number,
  targetTrackId?: string,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  // Also reject if target track is locked
  if (targetTrackId) {
    const target = sequence.tracks.find((t: Track) => t.id === targetTrackId);
    if (target?.locked) return sequence;
  }
  let startMs = Math.max(0, Math.round(newStartMs));

  // Find the clip and its source track
  let sourceTrack: Track | undefined;
  let movingClip: Clip | undefined;
  for (const track of sequence.tracks) {
    const clip = track.clips.find((c: Clip) => c.id === clipId);
    if (clip) {
      sourceTrack = track;
      movingClip = clip;
      break;
    }
  }
  if (!sourceTrack || !movingClip) return sequence;

  if (maxDurationMs != null) {
    const maxStart = Math.max(0, maxDurationMs - movingClip.durationMs);
    startMs = Math.min(startMs, maxStart);
  }

  // Cross-track move
  if (targetTrackId && targetTrackId !== sourceTrack.id) {
    const targetTrack = sequence.tracks.find((t: Track) => t.id === targetTrackId);
    if (!targetTrack) return sequence;

    // Apply overlap prevention on the target track (with max boundary constraint)
    const maxStartMs = maxDurationMs != null ? Math.max(0, maxDurationMs - movingClip.durationMs) : undefined;
    startMs = findNonOverlappingPosition(targetTrack.clips, clipId, startMs, movingClip.durationMs, maxStartMs);
    startMs = Math.max(0, startMs);
    if (maxStartMs != null) {
      startMs = Math.min(startMs, maxStartMs);
    }

    // Reject move if overlap persists (no valid position within bounds)
    const hasOverlap = targetTrack.clips.some((c: Clip) => {
      const otherEnd = c.startMs + c.durationMs;
      return startMs < otherEnd && startMs + movingClip.durationMs > c.startMs;
    });
    if (hasOverlap) return sequence;

    const movedClip = { ...movingClip, startMs };
    const tracks = sequence.tracks
      .map((track: Track) => {
        if (track.id === sourceTrack!.id) {
          return { ...track, clips: track.clips.filter((c: Clip) => c.id !== clipId) };
        }
        if (track.id === targetTrackId) {
          return {
            ...track,
            clips: [...track.clips, movedClip].sort((a: Clip, b: Clip) => a.startMs - b.startMs),
          };
        }
        return { ...track, clips: [...track.clips] };
      })
    return { ...sequence, tracks };
  }

  // Same-track move
  const sameTrackMaxStartMs = maxDurationMs != null ? Math.max(0, maxDurationMs - movingClip.durationMs) : undefined;
  startMs = findNonOverlappingPosition(sourceTrack.clips, clipId, startMs, movingClip.durationMs, sameTrackMaxStartMs);
  startMs = Math.max(0, startMs);
  if (maxDurationMs != null) {
    startMs = Math.min(startMs, Math.max(0, maxDurationMs - movingClip.durationMs));
  }

  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips
      .map((c: Clip) => (c.id === clipId ? { ...c, startMs } : c))
      .sort((a: Clip, b: Clip) => a.startMs - b.startMs),
  }));
  return { ...sequence, tracks };
}

export function removeTrack(sequence: Sequence, trackId: string): Sequence {
  const tracks = sequence.tracks.filter((t: Track) => t.id !== trackId);
  return { ...sequence, tracks };
}

/**
 * Set the locked state of a track.
 */
export function setTrackLocked(sequence: Sequence, trackId: string, locked: boolean): Sequence {
  const tracks = sequence.tracks.map((t: Track) =>
    t.id === trackId ? { ...t, locked } : t,
  );
  return { ...sequence, tracks };
}

/**
 * Set the muted state of a track.
 */
export function setTrackMuted(sequence: Sequence, trackId: string, muted: boolean): Sequence {
  const tracks = sequence.tracks.map((t: Track) =>
    t.id === trackId ? { ...t, muted } : t,
  );
  return { ...sequence, tracks };
}

/**
 * Set the name of a track.
 */
export function setTrackName(sequence: Sequence, trackId: string, name: string): Sequence {
  const tracks = sequence.tracks.map((t: Track) =>
    t.id === trackId ? { ...t, name: name || undefined } : t,
  );
  return { ...sequence, tracks };
}

/**
 * Set the color of a track.
 */
export function setTrackColor(sequence: Sequence, trackId: string, color: string | undefined): Sequence {
  const tracks = sequence.tracks.map((t: Track) =>
    t.id === trackId ? { ...t, color } : t,
  );
  return { ...sequence, tracks };
}

/**
 * Check if a clip belongs to a locked track.
 */
export function isClipOnLockedTrack(sequence: Sequence, clipId: string): boolean {
  for (const track of sequence.tracks) {
    if (track.clips.some((c: Clip) => c.id === clipId)) {
      return track.locked === true;
    }
  }
  return false;
}

/**
 * Check if any of the given clip IDs are on a locked track.
 */
export function areAnyClipsOnLockedTrack(sequence: Sequence, clipIds: ReadonlySet<string>): boolean {
  for (const track of sequence.tracks) {
    if (track.locked && track.clips.some((c: Clip) => clipIds.has(c.id))) {
      return true;
    }
  }
  return false;
}

export function addTextClip(
  sequence: Sequence,
  startMs: number,
  durationMs: number,
  text: ClipText,
  maxDurationMs?: number,
  targetTrackId?: string,
): Sequence {
  // Reject if target track is locked
  if (targetTrackId) {
    const target = sequence.tracks.find((t: Track) => t.id === targetTrackId);
    if (target?.locked) return sequence;
  }
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

export function addEmptyClip(
  sequence: Sequence,
  clipKind: string,
  startMs: number,
  durationMs: number,
  maxDurationMs?: number,
  targetTrackId?: string,
  text?: ClipText,
): Sequence {
  // Reject if target track is locked
  if (targetTrackId) {
    const target = sequence.tracks.find((t: Track) => t.id === targetTrackId);
    if (target?.locked) return sequence;
  }
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
    track = { id: generateId(), clips: [] };
    tracks.push(track);
  }

  // Check for overlap with existing clips on this track
  const hasOverlap = track.clips.some((c: Clip) => {
    const cEnd = c.startMs + c.durationMs;
    return startMs < cEnd && startMs + clampedDuration > c.startMs;
  });
  if (hasOverlap) {
    return sequence;
  }

  const clip: Clip = {
    id: generateId(),
    clipKind,
    assetId: "",
    startMs,
    durationMs: clampedDuration,
    inMs: 0,
    outMs: clampedDuration,
    ...(text ? { text } : {}),
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
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) =>
      c.id === clipId ? { ...c, ...updates } : c,
    ),
  }));
  return { ...sequence, tracks };
}

/**
 * Set a transition on a clip. Moves the clip's startMs backward to create
 * an overlap with the previous clip on the same track.
 * Returns the original sequence unchanged if there is no previous clip.
 */
export function setTransition(
  sequence: Sequence,
  clipId: string,
  transition: ClipTransition,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  // Find the clip and its track
  let targetTrack: Track | undefined;
  let clipIdx = -1;
  for (const track of sequence.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx >= 0) {
      targetTrack = track;
      clipIdx = idx;
      break;
    }
  }
  if (!targetTrack || clipIdx <= 0) return sequence; // No previous clip → no transition

  const clip = targetTrack.clips[clipIdx];
  const prevClip = targetTrack.clips[clipIdx - 1];
  const prevEnd = prevClip.startMs + prevClip.durationMs;

  // The overlap amount is the transition duration, but capped so the clip
  // doesn't move before the previous clip's start
  const maxOverlap = Math.min(
    transition.durationMs,
    prevClip.durationMs / 2,
    clip.durationMs / 2,
  );
  const overlapMs = Math.max(0, maxOverlap);

  // Already has a transition? Undo the old overlap first
  const oldOverlap = clip.transition ? clip.transition.durationMs : 0;
  const currentGapStart = clip.startMs + oldOverlap; // where clip would be without old transition
  const newStartMs = currentGapStart - overlapMs;

  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) =>
      c.id === clipId
        ? { ...c, startMs: Math.max(prevClip.startMs, newStartMs), transition: { ...transition, durationMs: overlapMs } }
        : c,
    ),
  }));
  return { ...sequence, tracks };
}

/**
 * Remove a transition from a clip. Moves the clip forward to close the overlap.
 */
export function removeTransition(
  sequence: Sequence,
  clipId: string,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  let targetTrack: Track | undefined;
  for (const track of sequence.tracks) {
    if (track.clips.some((c) => c.id === clipId)) {
      targetTrack = track;
      break;
    }
  }
  if (!targetTrack) return sequence;

  const clip = targetTrack.clips.find((c) => c.id === clipId);
  if (!clip?.transition) return sequence;

  const overlapMs = clip.transition.durationMs;

  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) =>
      c.id === clipId
        ? { ...c, startMs: c.startMs + overlapMs, transition: undefined }
        : c,
    ),
  }));
  return { ...sequence, tracks };
}

export function splitClip(
  sequence: Sequence,
  clipId: string,
  splitTimeMs: number,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  // Find the clip and its track
  let targetTrack: Track | undefined;
  let clipIdx = -1;
  for (const track of sequence.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clipId);
    if (idx >= 0) {
      targetTrack = track;
      clipIdx = idx;
      break;
    }
  }
  if (!targetTrack || clipIdx < 0) return sequence;

  const clip = targetTrack.clips[clipIdx];
  const clipEnd = clip.startMs + clip.durationMs;

  // splitTimeMs must be strictly inside the clip (not at edges)
  if (splitTimeMs <= clip.startMs || splitTimeMs >= clipEnd) return sequence;

  const leftDuration = splitTimeMs - clip.startMs;
  const rightDuration = clipEnd - splitTimeMs;

  const leftClip: Clip = {
    ...clip,
    // Keep original id for the left part
    durationMs: leftDuration,
    outMs: clip.inMs + leftDuration,
    // Clear transition if left clip is too short to honour it
    ...(clip.transition && leftDuration < clip.transition.durationMs
      ? { transition: undefined }
      : {}),
  };

  const rightClip: Clip = {
    ...clip,
    id: generateId(),
    startMs: splitTimeMs,
    durationMs: rightDuration,
    inMs: clip.inMs + leftDuration,
    // outMs stays the same as original
    // Clear transition on the right clip — it's a new boundary
    transition: undefined,
  };

  const tracks = sequence.tracks.map((track: Track) => {
    if (track.id !== targetTrack!.id) return { ...track, clips: [...track.clips] };
    const newClips = [...track.clips];
    newClips.splice(clipIdx, 1, leftClip, rightClip);
    return { ...track, clips: newClips };
  });

  return { ...sequence, tracks };
}

/**
 * Ripple delete: remove a clip and shift all subsequent clips on the same track
 * to fill the gap. If the track becomes empty, remove it.
 */
export function rippleDelete(sequence: Sequence, clipId: string): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  // Find the clip and its track
  let targetTrack: Track | undefined;
  let targetClip: Clip | undefined;
  for (const track of sequence.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      targetTrack = track;
      targetClip = clip;
      break;
    }
  }
  if (!targetTrack || !targetClip) return sequence;

  const clipEnd = targetClip.startMs + targetClip.durationMs;
  // Net unique timeline space = duration minus any incoming transition overlap
  const shiftAmount = targetClip.durationMs - (targetClip.transition?.durationMs ?? 0);

  const tracks = sequence.tracks
    .map((track: Track) => {
      if (track.id !== targetTrack!.id) return { ...track, clips: [...track.clips] };
      const newClips = track.clips
        .filter((c: Clip) => c.id !== clipId)
        .map((c: Clip) => {
          // Shift clips that logically follow the deleted clip.
          // Account for transitions: a clip with a transition has startMs pulled
          // back into the previous clip's range, so use the non-overlap start.
          const logicalStart = c.startMs + (c.transition?.durationMs ?? 0);
          if (logicalStart >= clipEnd) {
            const shifted = { ...c, startMs: Math.max(0, c.startMs - shiftAmount) };
            // Clear transition if it now has no predecessor to overlap with
            if (shifted.startMs === 0 && c.transition) {
              return { ...shifted, transition: undefined };
            }
            return shifted;
          }
          return c;
        });
      return { ...track, clips: newClips };
    })
    .filter((track: Track) => track.clips.length > 0);

  return { ...sequence, tracks };
}

/**
 * Ripple trim: trim a clip then shift all subsequent clips on the same track
 * by the change in clip duration.
 */
export function rippleTrim(
  sequence: Sequence,
  clipId: string,
  side: "left" | "right",
  deltaMs: number,
  maxSourceDurationMs?: number,
  maxTimelineDurationMs?: number,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  // Find the clip before trimming
  let oldClip: Clip | undefined;
  let trackId: string | undefined;
  for (const track of sequence.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      oldClip = clip;
      trackId = track.id;
      break;
    }
  }
  if (!oldClip || !trackId) return sequence;

  const oldEnd = oldClip.startMs + oldClip.durationMs;

  // Apply the regular trim
  const trimmed = trimClip(sequence, clipId, side, deltaMs, maxSourceDurationMs, maxTimelineDurationMs);

  // Find the clip after trimming
  let newClip: Clip | undefined;
  for (const track of trimmed.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      newClip = clip;
      break;
    }
  }
  if (!newClip) return trimmed;

  const newEnd = newClip.startMs + newClip.durationMs;
  const shift = newEnd - oldEnd; // positive = clip grew, negative = clip shrunk

  if (shift === 0) return trimmed;

  // Shift subsequent clips on the same track
  const tracks = trimmed.tracks.map((track: Track) => {
    if (track.id !== trackId) return { ...track, clips: [...track.clips] };
    return {
      ...track,
      clips: track.clips.map((c: Clip) => {
        if (c.id === clipId) return c;
        // Shift clips that logically follow the trimmed clip (account for transitions)
        const logicalStart = c.startMs + (c.transition?.durationMs ?? 0);
        if (logicalStart >= oldEnd) {
          return { ...c, startMs: Math.max(0, c.startMs + shift) };
        }
        return c;
      }),
    };
  });

  return { ...sequence, tracks };
}

/**
 * Duplicate a clip immediately after the original on the same track.
 * The new clip gets a fresh ID and no transition.
 */
export function duplicateClip(
  sequence: Sequence,
  clipId: string,
  maxDurationMs: number,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  let targetTrack: Track | undefined;
  let originalClip: Clip | undefined;
  for (const track of sequence.tracks) {
    const clip = track.clips.find((c) => c.id === clipId);
    if (clip) {
      targetTrack = track;
      originalClip = clip;
      break;
    }
  }
  if (!targetTrack || !originalClip) return sequence;

  const newStartMs = originalClip.startMs + originalClip.durationMs;

  // Reject if start is beyond the limit
  if (newStartMs >= maxDurationMs) return sequence;

  // Clamp duration to fit within the limit
  let durationMs = originalClip.durationMs;
  if (newStartMs + durationMs > maxDurationMs) {
    durationMs = maxDurationMs - newStartMs;
  }

  // Check for overlap with existing clips on this track
  const hasOverlap = targetTrack.clips.some((c: Clip) => {
    if (c.id === clipId) return false;
    const cEnd = c.startMs + c.durationMs;
    return newStartMs < cEnd && newStartMs + durationMs > c.startMs;
  });
  if (hasOverlap) return sequence;

  const newClip: Clip = {
    ...originalClip,
    id: generateId(),
    startMs: newStartMs,
    durationMs,
    outMs: originalClip.inMs + durationMs,
    transition: undefined, // duplicated clip has no transition
  };

  const tracks = sequence.tracks.map((track: Track) => {
    if (track.id !== targetTrack!.id) return { ...track, clips: [...track.clips] };
    const newClips = [...track.clips, newClip].sort((a: Clip, b: Clip) => a.startMs - b.startMs);
    return { ...track, clips: newClips };
  });

  return { ...sequence, tracks };
}

/**
 * Paste a clip at a given time on a target track.
 * The clip gets a fresh ID and no transition.
 */
export function pasteClip(
  sequence: Sequence,
  clip: Clip,
  pasteTimeMs: number,
  targetTrackId: string,
  maxDurationMs: number,
): Sequence {
  // Reject if target track is locked
  const targetCheck = sequence.tracks.find((t: Track) => t.id === targetTrackId);
  if (targetCheck?.locked) return sequence;
  const startMs = Math.max(0, Math.round(pasteTimeMs));

  // Reject if start is beyond the limit
  if (startMs >= maxDurationMs) return sequence;

  // Clamp duration to fit within the limit
  let durationMs = clip.durationMs;
  if (startMs + durationMs > maxDurationMs) {
    durationMs = maxDurationMs - startMs;
  }

  let targetTrack = sequence.tracks.find((t: Track) => t.id === targetTrackId);
  const tracks = sequence.tracks.map((t: Track) => ({ ...t, clips: [...t.clips] }));

  if (!targetTrack) {
    // If target track doesn't exist, create one
    targetTrack = { id: generateId(), clips: [] };
    tracks.push(targetTrack);
  } else {
    // Use the copy from tracks array
    targetTrack = tracks.find((t: Track) => t.id === targetTrackId)!;
  }

  // Check for overlap with existing clips on target track
  const hasOverlap = targetTrack.clips.some((c: Clip) => {
    const cEnd = c.startMs + c.durationMs;
    return startMs < cEnd && startMs + durationMs > c.startMs;
  });
  if (hasOverlap) return sequence;

  const newClip: Clip = {
    ...clip,
    id: generateId(),
    startMs,
    durationMs,
    outMs: clip.inMs + durationMs,
    transition: undefined, // pasted clip has no transition
  };

  targetTrack.clips.push(newClip);
  targetTrack.clips.sort((a: Clip, b: Clip) => a.startMs - b.startMs);

  return { ...sequence, tracks };
}

/**
 * Paste only visual attributes (transform, blendMode, crop, transition) from
 * a source clip onto a target clip.
 */
export function pasteAttributes(
  sequence: Sequence,
  sourceClip: Clip,
  targetClipId: string,
): Sequence {
  const updates: Partial<Clip> = {};
  if (sourceClip.transform) updates.transform = { ...sourceClip.transform };
  if (sourceClip.blendMode) updates.blendMode = sourceClip.blendMode;
  if (sourceClip.crop) updates.crop = { ...sourceClip.crop };
  // Note: transition is NOT pasted because it depends on clip position/context

  return updateClip(sequence, targetClipId, updates);
}

export function trimClip(
  sequence: Sequence,
  clipId: string,
  side: "left" | "right",
  deltaMs: number,
  maxSourceDurationMs?: number,
  maxTimelineDurationMs?: number,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
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

// ── Keyframe operations ──

/**
 * Add a keyframe to a clip's property track.
 * If no track exists for the property, one is created.
 * If a keyframe already exists at the same timeMs, it is replaced.
 * Keyframes are kept sorted by timeMs.
 */
export function addKeyframe(
  sequence: Sequence,
  clipId: string,
  property: string,
  keyframe: Keyframe,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) => {
      if (c.id !== clipId) return c;
      const existing = c.keyframeTracks ?? [];
      const trackIdx = existing.findIndex((t) => t.property === property);
      let newTracks: KeyframeTrack[];
      if (trackIdx >= 0) {
        // Replace existing keyframe at same time, or add new one
        const kfTrack = existing[trackIdx];
        const kfs = kfTrack.keyframes.filter((k) => k.timeMs !== keyframe.timeMs);
        kfs.push(keyframe);
        kfs.sort((a, b) => a.timeMs - b.timeMs);
        newTracks = [...existing];
        newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
      } else {
        newTracks = [...existing, { property, keyframes: [keyframe] }];
      }
      return { ...c, keyframeTracks: newTracks };
    }),
  }));
  return { ...sequence, tracks };
}

/**
 * Remove a keyframe from a clip's property track at the given time.
 * If the track becomes empty, it is removed.
 */
export function removeKeyframe(
  sequence: Sequence,
  clipId: string,
  property: string,
  timeMs: number,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) => {
      if (c.id !== clipId) return c;
      const existing = c.keyframeTracks;
      if (!existing) return c;
      const trackIdx = existing.findIndex((t) => t.property === property);
      if (trackIdx < 0) return c;
      const kfTrack = existing[trackIdx];
      const kfs = kfTrack.keyframes.filter((k) => k.timeMs !== timeMs);
      if (kfs.length === 0) {
        // Remove the entire track
        const newTracks = existing.filter((_, i) => i !== trackIdx);
        return { ...c, keyframeTracks: newTracks.length > 0 ? newTracks : undefined };
      }
      const newTracks = [...existing];
      newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
      return { ...c, keyframeTracks: newTracks };
    }),
  }));
  return { ...sequence, tracks };
}

/**
 * Update an existing keyframe at the given time for a clip's property track.
 * Only the specified fields in `updates` are changed.
 */
export function updateKeyframe(
  sequence: Sequence,
  clipId: string,
  property: string,
  timeMs: number,
  updates: Partial<Keyframe>,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;
  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) => {
      if (c.id !== clipId) return c;
      const existing = c.keyframeTracks;
      if (!existing) return c;
      const trackIdx = existing.findIndex((t) => t.property === property);
      if (trackIdx < 0) return c;
      const kfTrack = existing[trackIdx];
      let kfs = kfTrack.keyframes.map((k) =>
        k.timeMs === timeMs ? { ...k, ...updates } : k,
      );
      // If timeMs changed, re-sort
      if (updates.timeMs !== undefined) {
        kfs = kfs.sort((a, b) => a.timeMs - b.timeMs);
      }
      const newTracks = [...existing];
      newTracks[trackIdx] = { ...kfTrack, keyframes: kfs };
      return { ...c, keyframeTracks: newTracks };
    }),
  }));
  return { ...sequence, tracks };
}

// ── Speed control ──

/** Minimum allowed speed multiplier. */
export const MIN_SPEED = 0.25;
/** Maximum allowed speed multiplier. */
export const MAX_SPEED = 4.0;

/**
 * Set the playback speed of a clip.
 * Adjusts `durationMs` and `outMs` based on the new speed relative to the
 * original source duration (outMs − inMs at speed=1).
 *
 * The "source duration" is the portion of the original media that the clip
 * uses: `outMs - inMs` when speed is 1.0. When speed changes, we compute
 * the new timeline duration as `sourceDuration / speed`, then update
 * `durationMs` and `outMs` accordingly.
 */
export function setClipSpeed(
  sequence: Sequence,
  clipId: string,
  speed: number,
  maxDurationMs?: number,
): Sequence {
  if (isClipOnLockedTrack(sequence, clipId)) return sequence;

  // Clamp speed to valid range
  const clampedSpeed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));

  const tracks = sequence.tracks.map((track: Track) => ({
    ...track,
    clips: track.clips.map((c: Clip) => {
      if (c.id !== clipId) return c;

      // The source duration is the range of media content being used.
      // When speed was previously set, we need the original source range.
      const currentSpeed = c.speed ?? 1;
      // Original source duration at speed=1:
      // current durationMs = sourceDuration / currentSpeed
      // so sourceDuration = current durationMs * currentSpeed
      const sourceDurationMs = c.durationMs * currentSpeed;

      // New timeline duration at the new speed
      let newDurationMs = Math.round(sourceDurationMs / clampedSpeed);

      // Clamp to maxDurationMs if needed
      if (maxDurationMs != null && c.startMs + newDurationMs > maxDurationMs) {
        newDurationMs = maxDurationMs - c.startMs;
      }

      // Ensure minimum duration
      newDurationMs = Math.max(100, newDurationMs);

      return {
        ...c,
        speed: clampedSpeed,
        durationMs: newDurationMs,
        outMs: c.inMs + newDurationMs,
      };
    }),
  }));
  return { ...sequence, tracks };
}
