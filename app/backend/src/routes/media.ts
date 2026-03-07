import { Hono } from "hono";
import { resolveWorkspacePath } from "../utils/paths";

const media = new Hono();

media.get("/projects/:projectId/:type/:filename", async (c) => {
  const { projectId, type, filename } = c.req.param();
  if (!["proxy", "thumbnails", "assets"].includes(type)) {
    return c.json({ error: "Invalid media type" }, 400);
  }
  const filePath = resolveWorkspacePath("projects", projectId, type, filename);
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return c.json({ error: "File not found" }, 404);
  }
  return new Response(file);
});

export { media };
