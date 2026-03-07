# 03: Backend Hono サーバー + Project CRUD

## 目的・ゴール

Hono ベースの backend サーバーを構築し、Project の CRUD API と workspace のパス管理を実装する。FFmpeg の存在チェックも起動時に行う。

## 依存関係

- 01-scaffold（backend パッケージ構成）
- 02-shared-types（Project 型、API 型、generateId）

## 作成するファイル一覧

| ファイル | 内容 |
|---------|------|
| `app/backend/src/app.ts` | Hono app 定義、ミドルウェア、ルートマウント |
| `app/backend/src/index.ts` | エントリポイント: FFmpeg チェック、workspace 初期化、サーバー起動 |
| `app/backend/src/routes/projects.ts` | Project CRUD の Hono Router |
| `app/backend/src/services/project-service.ts` | project.json の read/write、一覧取得 |
| `app/backend/src/utils/paths.ts` | workspace パス解決、path traversal 防止 |

## 実装の詳細

### utils/paths.ts

```ts
import path from "node:path";

const WORKSPACE_ROOT = path.resolve("workspace");

/**
 * workspace 内の安全なパスを返す。
 * path traversal を防止する。
 */
export function resolveWorkspacePath(...segments: string[]): string {
  const resolved = path.resolve(WORKSPACE_ROOT, ...segments);
  if (!resolved.startsWith(WORKSPACE_ROOT + path.sep) && resolved !== WORKSPACE_ROOT) {
    throw new Error(`Path traversal detected: ${segments.join("/")}`);
  }
  return resolved;
}

/** プロジェクトディレクトリのパス */
export function projectDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId);
}

/** project.json のパス */
export function projectJsonPath(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "project.json");
}

/** assets ディレクトリのパス */
export function assetsDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "assets");
}

/** proxy ディレクトリのパス */
export function proxyDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "proxy");
}

/** thumbnail ディレクトリのパス */
export function thumbnailDir(projectId: string): string {
  return resolveWorkspacePath("projects", projectId, "thumbnails");
}

export { WORKSPACE_ROOT };
```

### services/project-service.ts

```ts
import type { Project } from "@video/shared";
import { generateId } from "@video/shared";
import { projectDir, projectJsonPath, assetsDir, proxyDir, thumbnailDir, WORKSPACE_ROOT } from "../utils/paths";
import { mkdir, readdir, readFile, writeFile, rm } from "node:fs/promises";

export async function createProject(name: string): Promise<Project> {
  const id = generateId();
  const now = new Date().toISOString();
  const project: Project = {
    id,
    name,
    createdAt: now,
    updatedAt: now,
    assets: [],
    sequence: { tracks: [] },
  };
  // ディレクトリ作成
  await mkdir(projectDir(id), { recursive: true });
  await mkdir(assetsDir(id), { recursive: true });
  await mkdir(proxyDir(id), { recursive: true });
  await mkdir(thumbnailDir(id), { recursive: true });
  // project.json 書き出し
  await writeFile(projectJsonPath(id), JSON.stringify(project, null, 2));
  return project;
}

export async function getProject(id: string): Promise<Project> {
  const data = await readFile(projectJsonPath(id), "utf-8");
  return JSON.parse(data) as Project;
}

export async function listProjects(): Promise<Project[]> {
  const projectsRoot = /* resolveWorkspacePath("projects") */;
  // readdir → 各 project.json を読む
}

export async function updateProject(id: string, updates: Partial<Pick<Project, "name" | "sequence">>): Promise<Project> {
  const project = await getProject(id);
  if (updates.name) project.name = updates.name;
  if (updates.sequence) project.sequence = updates.sequence;
  project.updatedAt = new Date().toISOString();
  await writeFile(projectJsonPath(id), JSON.stringify(project, null, 2));
  return project;
}

export async function deleteProject(id: string): Promise<void> {
  await rm(projectDir(id), { recursive: true, force: true });
}

/** project.json の asset 配列を更新 */
export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = new Date().toISOString();
  await writeFile(projectJsonPath(project.id), JSON.stringify(project, null, 2));
}
```

### routes/projects.ts

```ts
import { Hono } from "hono";
import * as projectService from "../services/project-service";

const projects = new Hono();

// POST /api/projects — プロジェクト作成
projects.post("/", async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  const project = await projectService.createProject(name);
  return c.json(project, 201);
});

// GET /api/projects — プロジェクト一覧
projects.get("/", async (c) => {
  const list = await projectService.listProjects();
  return c.json({ projects: list });
});

// GET /api/projects/:id — プロジェクト取得
projects.get("/:id", async (c) => {
  const project = await projectService.getProject(c.req.param("id"));
  return c.json(project);
});

// PUT /api/projects/:id — プロジェクト更新
projects.put("/:id", async (c) => {
  const updates = await c.req.json();
  const project = await projectService.updateProject(c.req.param("id"), updates);
  return c.json(project);
});

// DELETE /api/projects/:id — プロジェクト削除
projects.delete("/:id", async (c) => {
  await projectService.deleteProject(c.req.param("id"));
  return c.body(null, 204);
});

export { projects };
```

### app.ts

```ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { projects } from "./routes/projects";

const app = new Hono();

// Middleware
app.use("*", cors({ origin: "http://localhost:5173" }));

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message }, 500);
});

// Routes
app.route("/api/projects", projects);

// Health check
app.get("/api/health", (c) => c.json({ ok: true }));

export { app };
```

### index.ts

```ts
import { app } from "./app";
import { ffmpegTool } from "./pipeline/tools/ffmpeg";
import { mkdir } from "node:fs/promises";
import { WORKSPACE_ROOT } from "./utils/paths";

// Startup checks
await ffmpegTool.checkInstalled();
await mkdir(WORKSPACE_ROOT, { recursive: true });

console.log("workspace:", WORKSPACE_ROOT);
console.log("server: http://127.0.0.1:3000");

export default { port: 3000, hostname: "127.0.0.1", fetch: app.fetch };
```

## 完了条件

1. サーバーが起動し、FFmpeg 存在チェックが通る
2. `curl -X POST http://localhost:3000/api/projects -H 'Content-Type: application/json' -d '{"name":"test"}'` でプロジェクトが作成される
3. `workspace/projects/<id>/` ディレクトリと `project.json` が作成される
4. GET /api/projects でプロジェクト一覧が返る
5. GET /api/projects/:id で単一プロジェクトが返る
6. PUT /api/projects/:id で更新できる
7. DELETE /api/projects/:id で削除できる
8. path traversal を含むリクエストがエラーになる
