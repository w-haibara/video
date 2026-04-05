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

/**
 * Serve a file with HTTP Range request support.
 * Required for video seek in browsers — without Range support,
 * the seekable range is 0-0 and video.currentTime cannot be changed.
 */
async function serveFileWithRange(
  c: { req: { header: (name: string) => string | undefined } },
  filePath: string,
  contentType: string,
  extraHeaders?: Record<string, string>,
): Promise<Response> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return new Response(JSON.stringify({ error: "File not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const fileSize = file.size;
  const rangeHeader = c.req.header("range");

  const headers: Record<string, string> = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    ...extraHeaders,
  };

  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
      headers["Content-Length"] = String(chunkSize);

      return new Response(file.slice(start, end + 1), {
        status: 206,
        headers,
      });
    }
  }

  headers["Content-Length"] = String(fileSize);
  return new Response(await file.arrayBuffer(), { status: 200, headers });
}

const media = new Hono();

media.get("/projects/:projectId/:type/:filename", async (c) => {
  const { projectId, type, filename } = c.req.param();
  if (!["proxies", "thumbnails", "assets", "exports"].includes(type)) {
    return c.json({ error: "Invalid media type" }, 400);
  }
  const filePath = resolveWorkspacePath("projects", projectId, type, filename);

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  const extraHeaders: Record<string, string> = {};
  if (type === "exports") {
    extraHeaders["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  return serveFileWithRange(c, filePath, contentType, extraHeaders);
});

// Serve files from render-cache/{assetId}/{filename}
media.get("/projects/:projectId/render-cache/:assetId/:filename", async (c) => {
  const { projectId, assetId, filename } = c.req.param();
  const filePath = resolveWorkspacePath(
    "projects",
    projectId,
    "render-cache",
    assetId,
    filename,
  );

  const ext = path.extname(filename).toLowerCase();
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return serveFileWithRange(c, filePath, contentType);
});

export { media };
