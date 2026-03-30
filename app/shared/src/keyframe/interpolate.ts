import type { EasingType, KeyframeTrack } from "../types/keyframe";

// ── Easing functions ──

/** Linear interpolation: t */
export function easeLinear(t: number): number {
  return t;
}

/** Ease-in (quadratic): t^2 */
export function easeIn(t: number): number {
  return t * t;
}

/** Ease-out (quadratic): 1 - (1-t)^2 */
export function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** Ease-in-out (cubic): smooth S-curve */
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Get easing function by type. */
export function getEasing(type: EasingType): (t: number) => number {
  switch (type) {
    case "linear":
      return easeLinear;
    case "ease-in":
      return easeIn;
    case "ease-out":
      return easeOut;
    case "ease-in-out":
      return easeInOut;
    default:
      return easeLinear;
  }
}

// ── Core interpolation ──

/**
 * Evaluate a keyframe track for a given property at a given time.
 *
 * - If timeMs is before first keyframe, returns first keyframe value
 * - If timeMs is after last keyframe, returns last keyframe value
 * - If between two keyframes, interpolates based on easing of the left keyframe
 * - If no matching track/property or empty keyframes, returns defaultValue
 */
export function evaluateAtTime(
  tracks: KeyframeTrack[],
  property: string,
  timeMs: number,
  defaultValue: number,
): number {
  const track = tracks.find((t) => t.property === property);
  if (!track || track.keyframes.length === 0) return defaultValue;

  const kfs = track.keyframes;

  // Before first keyframe
  if (timeMs <= kfs[0].timeMs) return kfs[0].value;

  // After last keyframe
  if (timeMs >= kfs[kfs.length - 1].timeMs) return kfs[kfs.length - 1].value;

  // Find the two surrounding keyframes
  for (let i = 0; i < kfs.length - 1; i++) {
    const left = kfs[i];
    const right = kfs[i + 1];
    if (timeMs >= left.timeMs && timeMs <= right.timeMs) {
      const span = right.timeMs - left.timeMs;
      if (span === 0) return left.value;
      const rawT = (timeMs - left.timeMs) / span;
      const easingFn = getEasing(left.easing ?? "linear");
      const easedT = easingFn(rawT);
      return left.value + (right.value - left.value) * easedT;
    }
  }

  return defaultValue;
}

// ── Helpers ──

/** Check if a clip has any keyframes for a property. */
export function hasKeyframes(
  tracks: KeyframeTrack[] | undefined,
  property: string,
): boolean {
  if (!tracks) return false;
  const track = tracks.find((t) => t.property === property);
  return !!track && track.keyframes.length > 0;
}

/**
 * Get value at time, falling back to static value.
 * If no keyframe tracks exist for the property, returns staticValue unchanged.
 */
export function getAnimatedValue(
  tracks: KeyframeTrack[] | undefined,
  property: string,
  timeMs: number,
  staticValue: number,
): number {
  if (!tracks) return staticValue;
  if (!hasKeyframes(tracks, property)) return staticValue;
  return evaluateAtTime(tracks, property, timeMs, staticValue);
}
