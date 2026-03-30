import type { KeyframeTrack } from "../types/keyframe";

/**
 * Build an FFmpeg expression string from keyframe tracks for a given property.
 * Uses linear interpolation only (easing is complex to express in FFmpeg).
 *
 * The returned expression uses FFmpeg's `t` variable (seconds from stream start)
 * combined with `if(between(...), ...)` for time-segmented interpolation.
 *
 * @param tracks - keyframe tracks from the clip
 * @param property - dotted path to look up
 * @param defaultValue - fallback when no keyframes exist
 * @param durationMs - clip duration in milliseconds
 * @param clipStartSec - clip start time in seconds on the output timeline (default 0)
 * @returns FFmpeg expression string (without outer quotes), or a static number string
 */
export function buildKeyframeFilterExpression(
  tracks: KeyframeTrack[],
  property: string,
  defaultValue: number,
  durationMs: number,
  clipStartSec: number = 0,
): string {
  const track = tracks.find((t) => t.property === property);
  if (!track || track.keyframes.length === 0) return String(defaultValue);

  const kfs = track.keyframes;

  // Single keyframe: constant value
  if (kfs.length === 1) return String(kfs[0].value);

  // Build piecewise linear expression using nested if()
  // For each segment between consecutive keyframes, generate:
  //   if(between(t, t0, t1), v0 + (v1-v0)*(t-t0)/(t1-t0), <next>)
  //
  // Before first keyframe: first value (constant)
  // After last keyframe: last value (constant)

  // Use relative time: rt = t - clipStartSec
  // This converts FFmpeg's absolute timeline `t` to clip-relative time
  const tVar = clipStartSec === 0 ? "t" : `(t-${clipStartSec.toFixed(4)})`;

  const segments: string[] = [];
  for (let i = 0; i < kfs.length - 1; i++) {
    const left = kfs[i];
    const right = kfs[i + 1];
    const t0 = (left.timeMs / 1000).toFixed(4);
    const t1 = (right.timeMs / 1000).toFixed(4);
    const v0 = left.value;
    const v1 = right.value;

    if (v0 === v1) {
      // Constant segment
      segments.push(`if(between(${tVar},${t0},${t1}),${v0}`);
    } else {
      // Linear interpolation
      const slope = v1 - v0;
      const span = right.timeMs - left.timeMs;
      const slopePerSec = (slope / span) * 1000;
      segments.push(
        `if(between(${tVar},${t0},${t1}),${v0}+${slopePerSec.toFixed(4)}*(${tVar}-${t0})`,
      );
    }
  }

  // Build nested expression: wrap segments with the fallback being the last keyframe value
  const lastValue = kfs[kfs.length - 1].value;
  const firstValue = kfs[0].value;

  // The innermost fallback is the last keyframe value
  let expr = String(lastValue);
  for (let i = segments.length - 1; i >= 0; i--) {
    expr = `${segments[i]},${expr})`;
  }

  // Before first keyframe: return first value
  const t0 = (kfs[0].timeMs / 1000).toFixed(4);
  expr = `if(lt(${tVar},${t0}),${firstValue},${expr})`;

  return expr;
}
