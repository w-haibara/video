import type { Marker } from "@video/shared";
import { generateId } from "@video/shared";

/** Add a marker at the given time. Returns new markers array. */
export function addMarker(
  markers: Marker[],
  timeMs: number,
  label?: string,
  color?: string,
): Marker[] {
  const marker: Marker = { id: generateId(), timeMs, label, color };
  return [...markers, marker].sort((a, b) => a.timeMs - b.timeMs);
}

/** Remove a marker by ID. Returns new markers array. */
export function removeMarker(markers: Marker[], markerId: string): Marker[] {
  return markers.filter((m) => m.id !== markerId);
}

/** Update a marker's label and/or color. Returns new markers array. */
export function updateMarker(
  markers: Marker[],
  markerId: string,
  updates: { label?: string; color?: string; timeMs?: number },
): Marker[] {
  const updated = markers.map((m) =>
    m.id === markerId ? { ...m, ...updates } : m,
  );
  // Re-sort if timeMs changed
  if (updates.timeMs !== undefined) {
    updated.sort((a, b) => a.timeMs - b.timeMs);
  }
  return updated;
}

/**
 * Find the next marker after the given time.
 * Returns the marker's timeMs, or undefined if none.
 */
export function nextMarkerTime(
  markers: Marker[],
  currentTimeMs: number,
): number | undefined {
  // Markers are sorted by timeMs
  for (const m of markers) {
    if (m.timeMs > currentTimeMs + 0.5) return m.timeMs;
  }
  return undefined;
}

/**
 * Find the previous marker before the given time.
 * Returns the marker's timeMs, or undefined if none.
 */
export function prevMarkerTime(
  markers: Marker[],
  currentTimeMs: number,
): number | undefined {
  // Iterate in reverse
  for (let i = markers.length - 1; i >= 0; i--) {
    if (markers[i].timeMs < currentTimeMs - 0.5) return markers[i].timeMs;
  }
  return undefined;
}
