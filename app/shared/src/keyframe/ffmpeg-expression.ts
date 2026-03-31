import type { KeyframeTrack, EasingType } from "../types/keyframe";

/**
 * Build an FFmpeg sub-expression for easing-interpolated progress.
 * `p` is a linear 0..1 progress expression string.
 *
 * - linear:      p  (identity)
 * - ease-in:     p^2
 * - ease-out:    1-(1-p)^2
 * - ease-in-out: if(lt(p,0.5), 2*p^2, 1-pow(-2*p+2,2)/2)
 */
function buildEasedProgress(p: string, easing: EasingType | undefined): string {
  switch (easing) {
    case "ease-in":
      return `pow(${p},2)`;
    case "ease-out":
      return `(1-pow(1-(${p}),2))`;
    case "ease-in-out":
      return `if(lt(${p},0.5),2*pow(${p},2),1-pow(-2*(${p})+2,2)/2)`;
    case "linear":
    default:
      return p;
  }
}

/**
 * Build an FFmpeg expression string from keyframe tracks for a given property.
 * Supports easing: linear, ease-in, ease-out, ease-in-out via quadratic
 * approximations expressible in FFmpeg's expression language.
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

  // Build piecewise expression using nested if()
  // For each segment between consecutive keyframes, generate:
  //   if(between(t, t0, t1), v0 + (v1-v0)*eased_progress, <next>)
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
      // Interpolation with easing
      const easing = left.easing;
      const linearProgress = `(${tVar}-${t0})/(${t1}-${t0})`;
      const easedProgress = buildEasedProgress(linearProgress, easing);
      const delta = v1 - v0;
      segments.push(
        `if(between(${tVar},${t0},${t1}),${v0}+${delta}*${easedProgress}`,
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
