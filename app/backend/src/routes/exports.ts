import { Hono } from "hono";
import * as exportService from "../services/export-service";

const exports = new Hono();

// POST /api/projects/:id/export - Start export
exports.post("/:id/export", async (c) => {
  const projectId = c.req.param("id");
  const { filename } = await c.req.json<{ filename?: string }>();
  const outputFilename = filename ?? `export-${Date.now()}.mp4`;

  const result = await exportService.startExport(projectId, outputFilename);
  return c.json(result, 201);
});

// GET /api/projects/:id/exports - List exports
exports.get("/:id/exports", async (c) => {
  const projectId = c.req.param("id");
  const files = await exportService.listExports(projectId);
  return c.json({ exports: files });
});

export { exports };
