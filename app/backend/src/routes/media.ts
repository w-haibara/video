import path from "node:path";
import { Hono } from "hono";
import { resolveWorkspacePath } from "../utils/paths";

const MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
};

const media = new Hono();

media.get("/projects/:projectId/:type/:filename", async (c) => {
  const { projectId, type, filename } = c.req.param();
  if (!["proxies", "thumbnails", "assets", "exports"].includes(type)) {
    return c.json({ error: "Invalid media type" }, 400);
  }
  const filePath = resolveWorkspacePath("projects", projectId, type, filename);
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return c.json({ error: "File not found" }, 404);
  }

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const headers: Record<string, string> = {
    "Content-Type": contentType,
  };
  if (type === "exports") {
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return new Response(file, { headers });
});

export { media };
