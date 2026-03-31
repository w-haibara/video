import type { ClipColorCorrection } from "@video/shared";

/**
 * Build a CSS `filter` value from color correction properties.
 * Returns undefined when no correction is applied (all values at defaults).
 *
 * Mapping:
 *  - brightness: value -1..1 maps to CSS brightness(0..2)
 *  - contrast:   value -1..1 maps to CSS contrast(0..2)
 *  - saturation:  value -1..1 maps to CSS saturate(0..2)
 *  - hue:        value -180..180 maps to CSS hue-rotate(deg)
 *  - temperature: skipped in CSS preview (export-only)
 */
export function buildColorCorrectionFilter(cc: ClipColorCorrection | undefined): string | undefined {
  if (!cc) return undefined;

  const parts: string[] = [];

  const brightness = cc.brightness ?? 0;
  if (brightness !== 0) {
    parts.push(`brightness(${1 + brightness})`);
  }

  const contrast = cc.contrast ?? 0;
  if (contrast !== 0) {
    parts.push(`contrast(${1 + contrast})`);
  }

  const saturation = cc.saturation ?? 0;
  if (saturation !== 0) {
    parts.push(`saturate(${1 + saturation})`);
  }

  const hue = cc.hue ?? 0;
  if (hue !== 0) {
    parts.push(`hue-rotate(${hue}deg)`);
  }

  // Approximate temperature with CSS filters:
  // Warm (positive): sepia + saturate to shift warm
  // Cool (negative): hue-rotate blue + desaturate slightly
  const temperature = cc.temperature ?? 0;
  if (temperature > 0) {
    // Warm: add sepia tint proportional to temperature, boost saturation
    parts.push(`sepia(${(temperature * 0.3).toFixed(3)})`);
    parts.push(`saturate(${(1 + temperature * 0.3).toFixed(3)})`);
  } else if (temperature < 0) {
    // Cool: hue-rotate toward blue, slightly desaturate
    const amount = Math.abs(temperature);
    parts.push(`hue-rotate(${(amount * 30).toFixed(1)}deg)`);
    parts.push(`saturate(${(1 - amount * 0.2).toFixed(3)})`);
  }

  if (parts.length === 0) return undefined;
  return parts.join(" ");
}
