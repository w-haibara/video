import type { VideoFilter } from "@video/shared";

/**
 * Build a CSS `filter` value from an array of video filters.
 * Returns undefined when no filters are applied.
 *
 * Supported in preview (CSS):
 *  - blur:      blur(strength * 10 px)
 *  - sepia:     sepia(strength)
 *  - grayscale: grayscale(strength)
 *
 * Export-only (no CSS representation):
 *  - sharpen, vignette, grain
 */
export function buildVideoFilterCss(filters: VideoFilter[] | undefined): string | undefined {
  if (!filters || filters.length === 0) return undefined;

  const parts: string[] = [];

  for (const f of filters) {
    if (f.strength <= 0) continue;
    switch (f.type) {
      case "blur":
        parts.push(`blur(${f.strength * 10}px)`);
        break;
      case "sepia":
        parts.push(`sepia(${f.strength})`);
        break;
      case "grayscale":
        parts.push(`grayscale(${f.strength})`);
        break;
      case "sharpen":
        // Approximate sharpening with a slight contrast boost
        parts.push(`contrast(${1 + f.strength * 0.2})`);
        break;
      // vignette, grain — require overlay elements, no CSS filter equivalent
      default:
        break;
    }
  }

  if (parts.length === 0) return undefined;
  return parts.join(" ");
}
