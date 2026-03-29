/**
 * Snap utility for timeline clip positioning.
 * Finds the nearest snap point for a dragged clip edge.
 */

export type SnapResult = {
  /** The position to use (snapped or original) */
  snappedMs: number;
  /** Whether snapping occurred */
  snapped: boolean;
  /** The snap target position (for drawing a snap line) */
  snapLineMs: number | undefined;
};

/**
 * Given a dragged edge position, find the nearest snap point within threshold.
 *
 * @param dragEdgeMs - The edge being checked (startMs or endMs of dragged clip)
 * @param snapTargetsMs - All snap-worthy points (other clip edges, playhead, time 0)
 * @param thresholdMs - Snap threshold in milliseconds
 * @returns SnapResult with snapped position and snap line info
 */
export function findSnapPoint(
  dragEdgeMs: number,
  snapTargetsMs: number[],
  thresholdMs: number,
): SnapResult {
  let bestDistance = Infinity;
  let bestTarget: number | undefined;

  for (const target of snapTargetsMs) {
    const distance = Math.abs(dragEdgeMs - target);
    if (distance < bestDistance && distance <= thresholdMs) {
      bestDistance = distance;
      bestTarget = target;
    }
  }

  if (bestTarget !== undefined) {
    return {
      snappedMs: bestTarget,
      snapped: true,
      snapLineMs: bestTarget,
    };
  }

  return {
    snappedMs: dragEdgeMs,
    snapped: false,
    snapLineMs: undefined,
  };
}

/**
 * Check both edges of a clip (start and end) and snap to the nearest target.
 *
 * @param proposedStartMs - The proposed start position of the clip
 * @param clipDurationMs - Duration of the clip
 * @param snapTargetsMs - All snap-worthy points
 * @param thresholdMs - Snap threshold in milliseconds
 * @returns SnapResult with the adjusted startMs
 */
export function snapClipPosition(
  proposedStartMs: number,
  clipDurationMs: number,
  snapTargetsMs: number[],
  thresholdMs: number,
): SnapResult {
  const proposedEndMs = proposedStartMs + clipDurationMs;

  const startSnap = findSnapPoint(proposedStartMs, snapTargetsMs, thresholdMs);
  const endSnap = findSnapPoint(proposedEndMs, snapTargetsMs, thresholdMs);

  // If both edges snap, pick the closer one
  if (startSnap.snapped && endSnap.snapped) {
    const startDist = Math.abs(proposedStartMs - startSnap.snappedMs);
    const endDist = Math.abs(proposedEndMs - endSnap.snappedMs);
    if (startDist <= endDist) {
      return startSnap;
    }
    return {
      snappedMs: endSnap.snappedMs - clipDurationMs,
      snapped: true,
      snapLineMs: endSnap.snapLineMs,
    };
  }

  if (startSnap.snapped) {
    return startSnap;
  }

  if (endSnap.snapped) {
    return {
      snappedMs: endSnap.snappedMs - clipDurationMs,
      snapped: true,
      snapLineMs: endSnap.snapLineMs,
    };
  }

  return {
    snappedMs: proposedStartMs,
    snapped: false,
    snapLineMs: undefined,
  };
}
