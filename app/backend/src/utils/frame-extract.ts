import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

export type FrameExtractOptions = {
  inputPath: string;
  outputDir: string;
  fps?: number;
  width?: number;
  height?: number;
};

/**
 * Extract frames from a video file as numbered PNGs.
 * Returns sorted list of absolute frame file paths.
 */
export async function extractFrames(
  opts: FrameExtractOptions,
): Promise<string[]> {
  await mkdir(opts.outputDir, { recursive: true });

  const vfParts: string[] = [];
  if (opts.fps != null) {
    vfParts.push(`fps=${opts.fps}`);
  }
  if (opts.width != null && opts.height != null) {
    vfParts.push(`scale=${opts.width}:${opts.height}`);
  }

  const args = ["-i", opts.inputPath];
  if (vfParts.length > 0) {
    args.push("-vf", vfParts.join(","));
  }
  args.push(path.join(opts.outputDir, "frame_%04d.png"));

  const proc = Bun.spawn(["ffmpeg", "-y", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const stderr = await new Response(proc.stderr).text();
    throw new Error(`Frame extraction failed (exit ${exitCode}): ${stderr}`);
  }

  const entries = await readdir(opts.outputDir);
  return entries
    .filter((f) => f.startsWith("frame_") && f.endsWith(".png"))
    .sort()
    .map((f) => path.join(opts.outputDir, f));
}
