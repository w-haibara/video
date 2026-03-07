import { app } from "./app";
import { ffmpegTool } from "./pipeline/tools/ffmpeg";
import { mkdir } from "node:fs/promises";
import { WORKSPACE_ROOT } from "./utils/paths";

try {
  await ffmpegTool.checkInstalled();
} catch (e) {
  console.warn("WARNING: ffmpeg/ffprobe not found. Media processing will not work.");
}
await mkdir(WORKSPACE_ROOT, { recursive: true });

console.log("workspace:", WORKSPACE_ROOT);
console.log("server: http://127.0.0.1:3000");

export default { port: 3000, hostname: "127.0.0.1", fetch: app.fetch };
