import type { Clip } from "../types/project";

/**
 * Get static value from a clip using dotted path.
 * Returns undefined for unsupported properties.
 */
export function getStaticValue(clip: Clip, property: string): number | undefined {
  switch (property) {
    case "transform.x":
      return clip.transform?.x ?? 0;
    case "transform.y":
      return clip.transform?.y ?? 0;
    case "transform.scale":
      return clip.transform?.scale ?? 1;
    case "transform.rotation":
      return clip.transform?.rotation ?? 0;
    case "opacity":
      return 1.0;
    case "volume":
      return clip.volume ?? 1.0;
    default:
      return undefined;
  }
}
