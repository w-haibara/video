import type { Asset, ImportAssetResponse } from "@video/shared";
import { generateId } from "@video/shared";
import type { PipelineContext } from "../pipeline/types";
import { runPipeline } from "../pipeline";
import { assetsDir, projectDir as getProjectDir } from "../utils/paths";
import { getProject, saveProject } from "./project-service";
import { enqueue } from "./job-queue";
import path from "node:path";
import { mkdir } from "node:fs/promises";

function detectKind(filename: string): Asset["kind"] {
  const ext = path.extname(filename).toLowerCase();
  if ([".mp4", ".mov", ".avi", ".mkv", ".webm"].includes(ext)) return "video";
  if ([".mp3", ".wav", ".aac", ".m4a", ".ogg"].includes(ext)) return "audio";
  return "image";
}

export function createImportTask(
  projectId: string,
  projectDir: string,
  asset: Asset,
) {
  return async (job: { progress: number }) => {
    const ctx: PipelineContext = {
      asset,
      projectDir,
      projectId,
      shared: new Map(),
      reportProgress: () => {},
    };

    await runPipeline(asset.kind, ctx, (overall) => {
      job.progress = overall;
    });

    return ctx.asset;
  };
}

export async function importAsset(
  projectId: string,
  filename: string,
  body: ReadableStream<Uint8Array>,
): Promise<ImportAssetResponse> {
  const dir = assetsDir(projectId);
  await mkdir(dir, { recursive: true });
  const safeName = path.basename(filename);
  const destPath = path.join(dir, safeName);
  const chunks: Uint8Array[] = [];
  const reader = body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  await Bun.write(destPath, new Blob(chunks));

  const asset: Asset = {
    id: generateId(),
    kind: detectKind(filename),
    originalPath: `assets/${safeName}`,
  };

  const project = await getProject(projectId);
  project.assets.push(asset);
  await saveProject(project);

  const projDir = getProjectDir(projectId);
  const task = createImportTask(projectId, projDir, asset);
  const job = enqueue(projectId, asset.id, async (j) => {
    const updatedAsset = await task(j);
    const proj = await getProject(projectId);
    const idx = proj.assets.findIndex((a) => a.id === asset.id);
    if (idx !== -1) {
      proj.assets[idx] = updatedAsset;
      await saveProject(proj);
    }
  });

  return { asset, jobId: job.id };
}
