import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export type FrameCompareResult = {
  totalFrames: number;
  matchedFrames: number;
  mismatchedFrames: number;
  missingFrames: number;
  perFrame: Array<{
    index: number;
    diffPixels: number;
    diffPercent: number;
    passed: boolean;
  }>;
  passed: boolean;
};

export type FrameCompareOptions = {
  referenceDir: string;
  actualDir: string;
  /** Max allowed pixel diff percentage per frame (default: 1.0 = 1%) */
  threshold?: number;
  /** Per-channel tolerance (0-255) before a pixel counts as "different" (default: 2) */
  channelTolerance?: number;
};

export async function listFrames(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  return entries
    .filter((f) => f.startsWith("frame_") && f.endsWith(".png"))
    .sort();
}

/**
 * Decode a PNG to raw RGBA bytes using sharp.
 */
async function decodeToRgba(filePath: string): Promise<Uint8Array> {
  const { data } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
}

/**
 * Compare two sets of sequential frame images pixel-by-pixel.
 */
export async function compareFrames(
  opts: FrameCompareOptions,
): Promise<FrameCompareResult> {
  const threshold = opts.threshold ?? 1.0;
  const channelTolerance = opts.channelTolerance ?? 2;

  const refFrames = await listFrames(opts.referenceDir);
  const actFrames = await listFrames(opts.actualDir);

  const maxLen = Math.max(refFrames.length, actFrames.length);
  const minLen = Math.min(refFrames.length, actFrames.length);
  const missingFrames = maxLen - minLen;

  const perFrame = await Promise.all(
    Array.from({ length: minLen }, async (_, i) => {
      const refPath = path.join(opts.referenceDir, refFrames[i]);
      const actPath = path.join(opts.actualDir, actFrames[i]);

      const [refData, actData] = await Promise.all([
        decodeToRgba(refPath),
        decodeToRgba(actPath),
      ]);

      const pixelCount = Math.max(refData.length, actData.length) / 4;
      let diffPixels = 0;

      if (refData.length !== actData.length) {
        diffPixels = pixelCount;
      } else {
        for (let p = 0; p < refData.length; p += 4) {
          const dr = Math.abs(refData[p] - actData[p]);
          const dg = Math.abs(refData[p + 1] - actData[p + 1]);
          const db = Math.abs(refData[p + 2] - actData[p + 2]);
          if (dr > channelTolerance || dg > channelTolerance || db > channelTolerance) {
            diffPixels++;
          }
        }
      }

      const diffPercent = pixelCount > 0 ? (diffPixels / pixelCount) * 100 : 0;
      const passed = diffPercent <= threshold;
      return { index: i, diffPixels, diffPercent, passed };
    }),
  );

  let matchedFrames = 0;
  let mismatchedFrames = 0;
  for (const f of perFrame) {
    if (f.passed) matchedFrames++;
    else mismatchedFrames++;
  }

  // Count missing frames as mismatched
  mismatchedFrames += missingFrames;

  return {
    totalFrames: maxLen,
    matchedFrames,
    mismatchedFrames,
    missingFrames,
    perFrame,
    passed: mismatchedFrames === 0,
  };
}
