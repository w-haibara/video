import { app } from "./app";
import { ffmpegTool } from "./pipeline/tools/ffmpeg";
import { mkdir } from "node:fs/promises";
import { getWorkspaceRoot } from "./utils/paths";

try {
  await ffmpegTool.checkInstalled();
} catch (e) {
  console.warn("WARNING: ffmpeg/ffprobe not found. Media processing will not work.");
}
const workspaceRoot = getWorkspaceRoot();
await mkdir(workspaceRoot, { recursive: true });

console.log("workspace:", workspaceRoot);
console.log("server: http://127.0.0.1:3000");

export default { port: 3000, hostname: "127.0.0.1", fetch: app.fetch };
