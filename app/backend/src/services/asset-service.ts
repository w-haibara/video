import type { Asset, ImportAssetResponse } from "@video/shared";
import { generateId } from "@video/shared";
import type { PipelineContext } from "../pipeline/types";
import { runPipeline } from "../pipeline";
import { assetsDir, projectDir as getProjectDir, proxyDir, thumbnailDir } from "../utils/paths";
import { getProject, saveProject } from "./project-service";
import { enqueue } from "./job-queue";
import path from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { assetDetectorRegistry } from "../lib/asset-detector-registry";

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
    kind: assetDetectorRegistry.detect({
      filename: safeName,
      extension: path.extname(safeName).toLowerCase(),
      filePath: destPath,
    }) as Asset["kind"],
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

export async function deleteAsset(
  projectId: string,
  assetId: string,
): Promise<void> {
  const project = await getProject(projectId);
  const asset = project.assets.find((a) => a.id === assetId);
  if (!asset) {
    throw new Error(`Asset not found: ${assetId}`);
  }

  // Remove related files (ignore errors if files don't exist)
  const projDir = getProjectDir(projectId);
  const filesToDelete: string[] = [
    path.join(projDir, asset.originalPath),
  ];
  if (asset.thumbnailPath) {
    filesToDelete.push(path.join(projDir, asset.thumbnailPath));
  }
  if (asset.proxyPath) {
    filesToDelete.push(path.join(projDir, asset.proxyPath));
  }
  await Promise.all(filesToDelete.map((f) => rm(f, { force: true }).catch(() => {})));

  // Remove asset from project
  project.assets = project.assets.filter((a) => a.id !== assetId);
  await saveProject(project);
}
