import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createProject, getProject } from "./project-service";
import { importAsset } from "./asset-service";
import { assetsDir } from "../utils/paths";

let tmpDir: string;

beforeEach(async () => {
  tmpDir = await mkdtemp(path.join(tmpdir(), "video-asset-test-"));
  process.env.WORKSPACE_DIR = tmpDir;
});

afterEach(async () => {
  delete process.env.WORKSPACE_DIR;
  await rm(tmpDir, { recursive: true, force: true });
});

function makeBody(data: string): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(data));
      controller.close();
    },
  });
}

describe("asset-service", () => {
  test("importAsset saves file and returns asset with jobId", async () => {
    const project = await createProject("Asset Test");
    const result = await importAsset(project.id, "photo.jpg", makeBody("fake-image-data"));

    expect(result.asset.id).toBeDefined();
    expect(result.asset.kind).toBe("image");
    expect(result.asset.originalPath).toBe("assets/photo.jpg");
    expect(result.jobId).toBeDefined();

    const filePath = path.join(assetsDir(project.id), "photo.jpg");
    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("fake-image-data");

    const updated = await getProject(project.id);
    expect(updated.assets.length).toBe(1);
    expect(updated.assets[0].kind).toBe("image");
  });

  test("importAsset detects video kind for .mp4", async () => {
    const project = await createProject("Video Test");
    const result = await importAsset(project.id, "clip.mp4", makeBody("fake"));
    expect(result.asset.kind).toBe("video");
  });

  test("importAsset detects audio kind for .mp3", async () => {
    const project = await createProject("Audio Test");
    const result = await importAsset(project.id, "song.mp3", makeBody("fake"));
    expect(result.asset.kind).toBe("audio");
  });

  test("importAsset detects image kind for .heic", async () => {
    const project = await createProject("HEIC Test");
    const result = await importAsset(project.id, "photo.heic", makeBody("fake"));
    expect(result.asset.kind).toBe("image");
  });
});
