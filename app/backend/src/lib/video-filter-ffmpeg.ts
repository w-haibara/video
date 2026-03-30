import type { VideoFilter } from "@video/shared";

/**
 * Build FFmpeg filter segment for video filters.
 * Returns comma-prefixed filter chain or empty string.
 *
 * Supported filters:
 *  - blur:      boxblur=radius:radius (radius = strength * 10)
 *  - sharpen:   unsharp=5:5:strength*1.5:5:5:0
 *  - vignette:  vignette=angle=PI/(4-strength*3)
 *  - grain:     noise=alls=N:allf=t (N = strength * 30)
 *  - sepia:     colorchannelmixer scaled by strength
 *  - grayscale: colorchannelmixer scaled by strength
 */
export function buildVideoFilterFfmpeg(filters: VideoFilter[] | undefined): string {
  if (!filters || filters.length === 0) return "";

  const parts: string[] = [];

  for (const f of filters) {
    if (f.strength <= 0) continue;
    switch (f.type) {
      case "blur": {
        const radius = Math.max(1, Math.round(f.strength * 10));
        parts.push(`boxblur=${radius}:${radius}`);
        break;
      }
      case "sharpen": {
        const amount = (f.strength * 1.5).toFixed(2);
        parts.push(`unsharp=5:5:${amount}:5:5:0`);
        break;
      }
      case "vignette": {
        // angle ranges from PI/4 (subtle) to PI/1 (strong)
        const divisor = Math.max(1, 4 - f.strength * 3);
        parts.push(`vignette=angle=PI/${divisor.toFixed(2)}`);
        break;
      }
      case "grain": {
        const amount = Math.max(1, Math.round(f.strength * 30));
        parts.push(`noise=alls=${amount}:allf=t`);
        break;
      }
      case "sepia": {
        // Sepia matrix blended with identity by strength
        const s = f.strength;
        const r = 1 - s;
        // Sepia target: R=[.393,.769,.189] G=[.349,.686,.168] B=[.272,.534,.131]
        const rr = (r * 1 + s * 0.393).toFixed(3);
        const rg = (r * 0 + s * 0.769).toFixed(3);
        const rb = (r * 0 + s * 0.189).toFixed(3);
        const gr = (r * 0 + s * 0.349).toFixed(3);
        const gg = (r * 1 + s * 0.686).toFixed(3);
        const gb = (r * 0 + s * 0.168).toFixed(3);
        const br = (r * 0 + s * 0.272).toFixed(3);
        const bg = (r * 0 + s * 0.534).toFixed(3);
        const bb = (r * 1 + s * 0.131).toFixed(3);
        parts.push(`colorchannelmixer=${rr}:${rg}:${rb}:0:${gr}:${gg}:${gb}:0:${br}:${bg}:${bb}:0`);
        break;
      }
      case "grayscale": {
        // Grayscale weights: R=0.3, G=0.59, B=0.11, blended with identity by strength
        const s = f.strength;
        const r = 1 - s;
        const rr = (r * 1 + s * 0.3).toFixed(3);
        const rg = (r * 0 + s * 0.59).toFixed(3);
        const rb = (r * 0 + s * 0.11).toFixed(3);
        const gr = (r * 0 + s * 0.3).toFixed(3);
        const gg = (r * 1 + s * 0.59).toFixed(3);
        const gb = (r * 0 + s * 0.11).toFixed(3);
        const br = (r * 0 + s * 0.3).toFixed(3);
        const bg = (r * 0 + s * 0.59).toFixed(3);
        const bb = (r * 1 + s * 0.11).toFixed(3);
        parts.push(`colorchannelmixer=${rr}:${rg}:${rb}:0:${gr}:${gg}:${gb}:0:${br}:${bg}:${bb}:0`);
        break;
      }
      default:
        break;
    }
  }

  if (parts.length === 0) return "";
  return "," + parts.join(",");
}
