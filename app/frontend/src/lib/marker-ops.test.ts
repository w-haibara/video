import { describe, test, expect } from "vitest";
import {
  addMarker,
  removeMarker,
  updateMarker,
  nextMarkerTime,
  prevMarkerTime,
} from "./marker-ops";
import type { Marker } from "@video/shared";

function makeMarker(timeMs: number, label?: string): Marker {
  return { id: `m-${timeMs}`, timeMs, label };
}

describe("addMarker", () => {
  test("adds a marker to an empty array", () => {
    const result = addMarker([], 1000);
    expect(result).toHaveLength(1);
    expect(result[0].timeMs).toBe(1000);
    expect(result[0].id).toBeDefined();
  });

  test("adds a marker with label and color", () => {
    const result = addMarker([], 2000, "intro", "#ff0000");
    expect(result[0].label).toBe("intro");
    expect(result[0].color).toBe("#ff0000");
  });

  test("maintains sorted order", () => {
    const markers = [makeMarker(1000), makeMarker(3000)];
    const result = addMarker(markers, 2000);
    expect(result.map((m) => m.timeMs)).toEqual([1000, 2000, 3000]);
  });

  test("appends to end when adding at later time", () => {
    const markers = [makeMarker(1000), makeMarker(2000)];
    const result = addMarker(markers, 5000);
    expect(result.map((m) => m.timeMs)).toEqual([1000, 2000, 5000]);
  });

  test("inserts at start when adding at earlier time", () => {
    const markers = [makeMarker(2000), makeMarker(3000)];
    const result = addMarker(markers, 500);
    expect(result.map((m) => m.timeMs)).toEqual([500, 2000, 3000]);
  });
});

describe("removeMarker", () => {
  test("removes a marker by id", () => {
    const markers = [makeMarker(1000), makeMarker(2000), makeMarker(3000)];
    const result = removeMarker(markers, "m-2000");
    expect(result).toHaveLength(2);
    expect(result.map((m) => m.timeMs)).toEqual([1000, 3000]);
  });

  test("returns same array if marker not found", () => {
    const markers = [makeMarker(1000)];
    const result = removeMarker(markers, "nonexistent");
    expect(result).toHaveLength(1);
  });

  test("handles empty array", () => {
    const result = removeMarker([], "m-1");
    expect(result).toEqual([]);
  });
});

describe("updateMarker", () => {
  test("updates label", () => {
    const markers = [makeMarker(1000, "old")];
    const result = updateMarker(markers, "m-1000", { label: "new" });
    expect(result[0].label).toBe("new");
  });

  test("updates color", () => {
    const markers = [makeMarker(1000)];
    const result = updateMarker(markers, "m-1000", { color: "#00ff00" });
    expect(result[0].color).toBe("#00ff00");
  });

  test("updates timeMs and re-sorts", () => {
    const markers = [makeMarker(1000), makeMarker(2000), makeMarker(3000)];
    const result = updateMarker(markers, "m-1000", { timeMs: 2500 });
    expect(result.map((m) => m.timeMs)).toEqual([2000, 2500, 3000]);
  });

  test("does not modify other markers", () => {
    const markers = [makeMarker(1000, "a"), makeMarker(2000, "b")];
    const result = updateMarker(markers, "m-1000", { label: "updated" });
    expect(result[1].label).toBe("b");
  });
});

describe("nextMarkerTime", () => {
  const markers = [makeMarker(1000), makeMarker(2000), makeMarker(3000)];

  test("returns next marker after current time", () => {
    expect(nextMarkerTime(markers, 500)).toBe(1000);
  });

  test("skips marker at current time", () => {
    expect(nextMarkerTime(markers, 1000)).toBe(2000);
  });

  test("returns undefined when at or past last marker", () => {
    expect(nextMarkerTime(markers, 3000)).toBeUndefined();
  });

  test("returns undefined for empty markers", () => {
    expect(nextMarkerTime([], 0)).toBeUndefined();
  });

  test("returns first marker when before all", () => {
    expect(nextMarkerTime(markers, 0)).toBe(1000);
  });

  test("navigates through middle markers", () => {
    expect(nextMarkerTime(markers, 1500)).toBe(2000);
  });
});

describe("prevMarkerTime", () => {
  const markers = [makeMarker(1000), makeMarker(2000), makeMarker(3000)];

  test("returns previous marker before current time", () => {
    expect(prevMarkerTime(markers, 2500)).toBe(2000);
  });

  test("skips marker at current time", () => {
    expect(prevMarkerTime(markers, 2000)).toBe(1000);
  });

  test("returns undefined when before first marker", () => {
    expect(prevMarkerTime(markers, 500)).toBeUndefined();
  });

  test("returns undefined for empty markers", () => {
    expect(prevMarkerTime([], 5000)).toBeUndefined();
  });

  test("returns last marker when after all", () => {
    expect(prevMarkerTime(markers, 5000)).toBe(3000);
  });

  test("navigates through middle markers", () => {
    expect(prevMarkerTime(markers, 1500)).toBe(1000);
  });
});
