import { describe, test, expect } from "bun:test";
import type { Asset, Clip } from "@video/shared";
import { getCompatibleAssets, computeAssetChangeUpdates } from "./InspectorPanel";

const videoAsset1: Asset = {
  id: "v1",
  kind: "video",
  originalPath: "assets/video1.mp4",
  durationMs: 5000,
};

const videoAsset2: Asset = {
  id: "v2",
  kind: "video",
  originalPath: "assets/video2.mp4",
  durationMs: 10000,
};

const imageAsset: Asset = {
  id: "i1",
  kind: "image",
  originalPath: "assets/photo.jpg",
};

const audioAsset: Asset = {
  id: "a1",
  kind: "audio",
  originalPath: "assets/bgm.mp3",
  durationMs: 60000,
};

const allAssets = [videoAsset1, videoAsset2, imageAsset, audioAsset];

const makeClip = (overrides: Partial<Clip> = {}): Clip => ({
  id: "clip1",
  clipKind: "video",
  assetId: "v1",
  startMs: 0,
  durationMs: 5000,
  inMs: 0,
  outMs: 5000,
  ...overrides,
});

describe("getCompatibleAssets", () => {
  test("returns only video assets for video clip kind", () => {
    const result = getCompatibleAssets(allAssets, "video");
    expect(result).toEqual([videoAsset1, videoAsset2]);
  });

  test("returns only image assets for image clip kind", () => {
    const result = getCompatibleAssets(allAssets, "image");
    expect(result).toEqual([imageAsset]);
  });

  test("returns only audio assets for audio clip kind", () => {
    const result = getCompatibleAssets(allAssets, "audio");
    expect(result).toEqual([audioAsset]);
  });

  test("returns empty array for title clip kind", () => {
    const result = getCompatibleAssets(allAssets, "title");
    expect(result).toEqual([]);
  });

  test("returns empty array for unknown clip kind", () => {
    const result = getCompatibleAssets(allAssets, "unknown");
    expect(result).toEqual([]);
  });

  test("returns empty array when no assets exist", () => {
    const result = getCompatibleAssets([], "video");
    expect(result).toEqual([]);
  });
});

describe("computeAssetChangeUpdates", () => {
  test("switching to a new video asset updates assetId and timing", () => {
    const clip = makeClip({ assetId: "v1", durationMs: 5000, inMs: 1000, outMs: 4000 });
    const updates = computeAssetChangeUpdates(videoAsset2, clip);
    expect(updates).toEqual({
      assetId: "v2",
      durationMs: 10000,
      inMs: 0,
      outMs: 10000,
    });
  });

  test("switching to an image asset uses default duration", () => {
    const clip = makeClip({ clipKind: "image", assetId: "i1" });
    const updates = computeAssetChangeUpdates(imageAsset, clip);
    // image has no durationMs, so should use defaultDurationMs (3000)
    expect(updates).toEqual({
      assetId: "i1",
      durationMs: 3000,
      inMs: 0,
      outMs: 3000,
    });
  });

  test("switching to an audio asset uses its durationMs", () => {
    const clip = makeClip({ clipKind: "audio", assetId: "a1" });
    const updates = computeAssetChangeUpdates(audioAsset, clip);
    expect(updates).toEqual({
      assetId: "a1",
      durationMs: 60000,
      inMs: 0,
      outMs: 60000,
    });
  });

  test("switching to undefined (no asset) clears assetId only", () => {
    const clip = makeClip();
    const updates = computeAssetChangeUpdates(undefined, clip);
    expect(updates).toEqual({ assetId: "" });
  });

  test("switching from empty asset to a video asset", () => {
    const clip = makeClip({ assetId: "", durationMs: 3000, inMs: 0, outMs: 3000 });
    const updates = computeAssetChangeUpdates(videoAsset1, clip);
    expect(updates).toEqual({
      assetId: "v1",
      durationMs: 5000,
      inMs: 0,
      outMs: 5000,
    });
  });

  test("clamps duration to maxDurationMs when clip would exceed project boundary", () => {
    const clip = makeClip({ startMs: 8000, durationMs: 2000 });
    // videoAsset2.durationMs = 10000, startMs=8000 + 10000 = 18000 > maxDurationMs=10000
    const updates = computeAssetChangeUpdates(videoAsset2, clip, 10000);
    expect(updates).toEqual({
      assetId: "v2",
      durationMs: 2000,  // 10000 - 8000
      inMs: 0,
      outMs: 2000,
    });
  });

  test("no clamping when clip fits within maxDurationMs", () => {
    const clip = makeClip({ startMs: 0, durationMs: 5000 });
    const updates = computeAssetChangeUpdates(videoAsset2, clip, 20000);
    expect(updates).toEqual({
      assetId: "v2",
      durationMs: 10000,
      inMs: 0,
      outMs: 10000,
    });
  });

  test("clears transition and restores startMs when switching asset on clip with transition", () => {
    const clip = makeClip({
      startMs: 700,  // shifted by transition overlap
      durationMs: 5000,
      transition: { type: "fade", durationMs: 300 },
    });
    const updates = computeAssetChangeUpdates(videoAsset2, clip);
    expect(updates).toEqual({
      assetId: "v2",
      durationMs: 10000,
      inMs: 0,
      outMs: 10000,
      transition: undefined,
      startMs: 1000,  // 700 + 300 (restored)
    });
  });

  test("clears transition and clamps when switching asset exceeds maxDurationMs", () => {
    const clip = makeClip({
      startMs: 4700,  // shifted by 300ms transition overlap
      durationMs: 5000,
      transition: { type: "fade", durationMs: 300 },
    });
    // After transition clear: startMs = 5000. videoAsset2.durationMs=10000, 5000+10000=15000 > 10000
    const updates = computeAssetChangeUpdates(videoAsset2, clip, 10000);
    expect(updates).toEqual({
      assetId: "v2",
      durationMs: 5000,  // 10000 - 5000
      inMs: 0,
      outMs: 5000,
      transition: undefined,
      startMs: 5000,
    });
  });

  test("clearing asset on clip with transition also clears transition", () => {
    const clip = makeClip({
      startMs: 700,
      transition: { type: "fade", durationMs: 300 },
    });
    const updates = computeAssetChangeUpdates(undefined, clip);
    expect(updates).toEqual({
      assetId: "",
      transition: undefined,
      startMs: 1000,
    });
  });
});
