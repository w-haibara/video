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

  // temperature is export-only; not representable with CSS filters

  if (parts.length === 0) return undefined;
  return parts.join(" ");
}
