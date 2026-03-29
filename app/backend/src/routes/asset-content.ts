import { Hono } from "hono";
import {
  readAssetContent,
  writeAssetContent,
  reprocessAsset,
} from "../services/asset-service";

const assetContent = new Hono();

// GET /api/projects/:id/assets/:assetId/content
assetContent.get("/:id/assets/:assetId/content", async (c) => {
  const projectId = c.req.param("id");
  const assetId = c.req.param("assetId");
  try {
    const content = await readAssetContent(projectId, assetId);
    return c.json({ content });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 404);
  }
});

function errorStatus(err: unknown): 404 | 500 {
  return (err instanceof Error && err.message.startsWith("Asset not found:")) ? 404 : 500;
}

// PUT /api/projects/:id/assets/:assetId/content
assetContent.put("/:id/assets/:assetId/content", async (c) => {
  const projectId = c.req.param("id");
  const assetId = c.req.param("assetId");
  const { content } = await c.req.json<{ content: string }>();
  if (content == null) {
    return c.json({ error: "content is required" }, 400);
  }
  try {
    await writeAssetContent(projectId, assetId, content);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: (err as Error).message }, errorStatus(err));
  }
});

// POST /api/projects/:id/assets/:assetId/reprocess
assetContent.post("/:id/assets/:assetId/reprocess", async (c) => {
  const projectId = c.req.param("id");
  const assetId = c.req.param("assetId");
  try {
    const result = await reprocessAsset(projectId, assetId);
    return c.json(result, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, errorStatus(err));
  }
});

export { assetContent };
