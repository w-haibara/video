import { app } from "./app";
import { mkdir } from "node:fs/promises";
import { getWorkspaceRoot } from "./utils/paths";

const workspaceRoot = getWorkspaceRoot();
await mkdir(workspaceRoot, { recursive: true });

console.log("workspace:", workspaceRoot);
console.log("server: http://127.0.0.1:3000");

export default { port: 3000, hostname: "127.0.0.1", fetch: app.fetch };
