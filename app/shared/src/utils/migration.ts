import type { Project, Asset } from "../types/project";

/**
 * Migrate a project from the old format (Track.kind, no Clip.clipKind)
 * to the new format (no Track.kind, Clip.clipKind).
 *
 * - If clips already have clipKind, no changes are made.
 * - Track.kind "video" clips: clipKind determined by asset.kind ("video" or "image").
 * - Track.kind "audio" clips: clipKind = "audio".
 * - Track.kind "title" clips: clipKind = "title".
 */
export function migrateProject(raw: unknown): Project {
  const project = raw as Project & {
    sequence?: {
      tracks?: Array<{
        id: string;
        kind?: string;
        clips: Array<Record<string, unknown>>;
      }>;
    };
  };

  if (!project.sequence?.tracks) return project as Project;

  const assetMap = new Map<string, Asset>();
  if (project.assets) {
    for (const asset of project.assets) {
      assetMap.set(asset.id, asset);
    }
  }

  let needsMigration = false;

  for (const track of project.sequence.tracks) {
    const trackKind = (track as Record<string, unknown>).kind as string | undefined;

    for (const clip of track.clips) {
      if (clip.clipKind) continue;
      needsMigration = true;

      if (trackKind === "title") {
        clip.clipKind = "title";
      } else if (trackKind === "audio") {
        clip.clipKind = "audio";
      } else {
        // video track: determine from asset kind
        const asset = assetMap.get(clip.assetId as string);
        if (asset?.kind === "image") {
          clip.clipKind = "image";
        } else {
          clip.clipKind = "video";
        }
      }
    }

    // Remove legacy Track.kind field
    if ((track as Record<string, unknown>).kind !== undefined) {
      needsMigration = true;
      delete (track as Record<string, unknown>).kind;
    }
  }

  return project as Project;
}
