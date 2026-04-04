import type { Project, Asset } from "@video/shared";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { buildExportArgs } from "./export-service";

/**
 * Export a project to a video file.
 * Standalone function that depends only on the Project object + asset files.
 * No job queue, no HTTP context — awaits FFmpeg completion directly.
 */
export async function exportProject(
  project: Project,
  assetsDir: string,
  outputPath: string,
  resolveAssetVideoPath?: (asset: Asset) => string,
): Promise<void> {
  await mkdir(path.dirname(outputPath), { recursive: true });

  const args = buildExportArgs(project, assetsDir, outputPath, resolveAssetVideoPath);

  const proc = Bun.spawn(["ffmpeg", ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    const rawStderr = await new Response(proc.stderr).text();
    const stderr = rawStderr
      .split("\n")
      .filter((line) => !line.includes("Skipping NAL unit"))
      .join("\n");
    throw new Error(`Export failed (exit ${exitCode}): ${stderr}`);
  }
}
