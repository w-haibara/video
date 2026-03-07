import { Hono } from "hono";
import { importAsset, deleteAsset } from "../services/asset-service";

const assets = new Hono();

assets.post("/import", async (c) => {
  const projectId = c.req.query("projectId");
  const filename = c.req.query("filename");
  if (!projectId || !filename) {
    return c.json({ error: "projectId and filename are required" }, 400);
  }

  const body = c.req.raw.body;
  if (!body) {
    return c.json({ error: "Request body is required" }, 400);
  }

  const result = await importAsset(projectId, filename, body);
  return c.json(result, 201);
});

assets.delete("/:assetId", async (c) => {
  const projectId = c.req.query("projectId");
  const assetId = c.req.param("assetId");
  if (!projectId) {
    return c.json({ error: "projectId is required" }, 400);
  }

  try {
    await deleteAsset(projectId, assetId);
    return c.json({ ok: true });
  } catch (err) {
    return c.json({ error: (err as Error).message }, 404);
  }
});

export { assets };
