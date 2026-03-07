# 07: Frontend ホーム画面

## 目的・ゴール

Vite + React のフロントエンドをセットアップし、React Router でルーティング、TanStack Query でサーバー状態管理を行う。ホーム画面でプロジェクト一覧の表示と新規作成ができるようにする。

## 依存関係

- 01-scaffold（frontend パッケージ構成、vite.config.ts）
- 02-shared-types（Project 型、API 型）
- 03-backend-server（API が動作していること）

## 作成するファイル一覧

| ファイル | 内容 |
|---------|------|
| `app/frontend/src/main.tsx` | React root, QueryClientProvider, BrowserRouter |
| `app/frontend/src/App.tsx` | React Router ルート定義 |
| `app/frontend/src/api/client.ts` | fetch ラッパー |
| `app/frontend/src/api/projects.ts` | useProjects(), useProject(id), useCreateProject() |
| `app/frontend/src/pages/HomePage.tsx` | プロジェクト一覧 + 新規作成ボタン |
| `app/frontend/src/components/ProjectCard.tsx` | プロジェクト一覧の1項目 |
| `app/frontend/src/components/CreateProjectDialog.tsx` | プロジェクト名入力 + 作成 |

## 実装の詳細

### main.tsx

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
```

### App.tsx

```tsx
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
// EditorPage は 08-frontend-editor で追加
// import { EditorPage } from "./pages/EditorPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* <Route path="/projects/:id" element={<EditorPage />} /> */}
    </Routes>
  );
}
```

### api/client.ts

```ts
const BASE = "";  // Vite proxy が /api を転送するので相対パスでOK

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
```

### api/projects.ts

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  ListProjectsResponse,
  GetProjectResponse,
  CreateProjectRequest,
  CreateProjectResponse,
} from "@video/shared";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => apiFetch<ListProjectsResponse>("/api/projects"),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => apiFetch<GetProjectResponse>(`/api/projects/${id}`),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      apiFetch<CreateProjectResponse>("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
```

### pages/HomePage.tsx

```tsx
import { useState } from "react";
import { useProjects } from "../api/projects";
import { ProjectCard } from "../components/ProjectCard";
import { CreateProjectDialog } from "../components/CreateProjectDialog";

export function HomePage() {
  const { data, isLoading, error } = useProjects();
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <header>
        <h1>Projects</h1>
        <button onClick={() => setShowCreate(true)}>New Project</button>
      </header>
      <div>
        {data?.projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
        {data?.projects.length === 0 && <p>No projects yet.</p>}
      </div>
      {showCreate && (
        <CreateProjectDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
```

### components/ProjectCard.tsx

```tsx
import { Link } from "react-router-dom";
import type { Project } from "@video/shared";

type Props = { project: Project };

export function ProjectCard({ project }: Props) {
  return (
    <Link to={`/projects/${project.id}`}>
      <div>
        <h3>{project.name}</h3>
        <p>{project.assets.length} assets</p>
        <time>{new Date(project.updatedAt).toLocaleDateString()}</time>
      </div>
    </Link>
  );
}
```

### components/CreateProjectDialog.tsx

```tsx
import { useState } from "react";
import { useCreateProject } from "../api/projects";

type Props = { onClose: () => void };

export function CreateProjectDialog({ onClose }: Props) {
  const [name, setName] = useState("");
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProject.mutate(
      { name: name.trim() },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>New Project</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          autoFocus
        />
        <button type="submit" disabled={createProject.isPending}>
          {createProject.isPending ? "Creating..." : "Create"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
```

### 追加する依存パッケージ (frontend)

```
react-router-dom@^7
@tanstack/react-query@^5
```

## 完了条件

1. `http://localhost:5173/` でホーム画面が表示される
2. プロジェクト一覧が API から取得されて表示される
3. 「New Project」ボタンでダイアログが開き、プロジェクトを作成できる
4. 作成後、一覧に新しいプロジェクトが表示される
5. プロジェクトカードをクリックすると `/projects/:id` に遷移する（ページは 08 で実装）
6. TypeScript のコンパイルエラーがない
