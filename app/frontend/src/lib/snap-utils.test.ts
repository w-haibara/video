import { describe, it, expect } from "vitest";
import { findSnapPoint, snapClipPosition } from "./snap-utils";

describe("findSnapPoint", () => {
  it("snaps to nearest target within threshold", () => {
    const result = findSnapPoint(1005, [0, 1000, 2000], 50);
    expect(result).toEqual({ snappedMs: 1000, snapped: true, snapLineMs: 1000 });
  });

  it("does not snap when outside threshold", () => {
    const result = findSnapPoint(1100, [0, 1000, 2000], 50);
    expect(result).toEqual({ snappedMs: 1100, snapped: false, snapLineMs: undefined });
  });

  it("snaps to exact match", () => {
    const result = findSnapPoint(1000, [0, 1000, 2000], 50);
    expect(result).toEqual({ snappedMs: 1000, snapped: true, snapLineMs: 1000 });
  });

  it("snaps to closer target when multiple are in range", () => {
    const result = findSnapPoint(1020, [1000, 1030], 50);
    expect(result).toEqual({ snappedMs: 1030, snapped: true, snapLineMs: 1030 });
  });

  it("returns original value when no targets", () => {
    const result = findSnapPoint(500, [], 50);
    expect(result).toEqual({ snappedMs: 500, snapped: false, snapLineMs: undefined });
  });

  it("snaps to threshold boundary", () => {
    const result = findSnapPoint(1050, [1000], 50);
    expect(result).toEqual({ snappedMs: 1000, snapped: true, snapLineMs: 1000 });
  });

  it("does not snap at threshold + 1", () => {
    const result = findSnapPoint(1051, [1000], 50);
    expect(result).toEqual({ snappedMs: 1051, snapped: false, snapLineMs: undefined });
  });

  it("snaps to time 0", () => {
    const result = findSnapPoint(8, [0, 5000], 10);
    expect(result).toEqual({ snappedMs: 0, snapped: true, snapLineMs: 0 });
  });

  it("snaps to playhead position", () => {
    const result = findSnapPoint(3495, [0, 1000, 2000, 3500], 10);
    expect(result).toEqual({ snappedMs: 3500, snapped: true, snapLineMs: 3500 });
  });
});

describe("snapClipPosition", () => {
  it("snaps clip start to target", () => {
    const result = snapClipPosition(1005, 2000, [0, 1000, 5000], 50);
    expect(result).toEqual({ snappedMs: 1000, snapped: true, snapLineMs: 1000 });
  });

  it("snaps clip end to target", () => {
    // clip: start=2990, duration=2000, end=4990 -> snaps end to 5000
    const result = snapClipPosition(2990, 2000, [0, 1000, 5000], 50);
    expect(result).toEqual({ snappedMs: 3000, snapped: true, snapLineMs: 5000 });
  });

  it("prefers closer snap when both edges snap", () => {
    // start=1002, end=3002; targets 1000 (dist=2) and 3000 (dist=2) -> picks start (tie goes to start)
    const result = snapClipPosition(1002, 2000, [1000, 3000], 50);
    expect(result).toEqual({ snappedMs: 1000, snapped: true, snapLineMs: 1000 });
  });

  it("prefers end snap when end is closer", () => {
    // start=1010, end=3010; targets 1000 (dist=10) and 3005 (dist=5) -> picks end
    const result = snapClipPosition(1010, 2000, [1000, 3005], 50);
    expect(result).toEqual({ snappedMs: 1005, snapped: true, snapLineMs: 3005 });
  });

  it("does not snap when no targets in range", () => {
    const result = snapClipPosition(1500, 2000, [0, 1000, 5000], 50);
    expect(result).toEqual({ snappedMs: 1500, snapped: false, snapLineMs: undefined });
  });

  it("snaps start to time 0", () => {
    const result = snapClipPosition(5, 1000, [0, 2000, 3000], 10);
    expect(result).toEqual({ snappedMs: 0, snapped: true, snapLineMs: 0 });
  });

  it("handles zero-duration clip", () => {
    const result = snapClipPosition(995, 0, [1000], 10);
    expect(result).toEqual({ snappedMs: 1000, snapped: true, snapLineMs: 1000 });
  });
});
