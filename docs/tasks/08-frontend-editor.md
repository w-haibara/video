# 08: Frontend エディタ画面 + アセットパネル

## 目的・ゴール

エディタ画面のレイアウトを構築し、アセットパネルでファイルインポートとサムネイル表示を実現する。Job の進捗をポーリングでリアルタイム表示し、Phase 1 のゴール「素材をインポートしてサムネイル表示できる状態」を達成する。

## 依存関係

- 07-frontend-home（React Router, TanStack Query, API client セットアップ）
- 05-asset-import（backend API が動作していること）

## 作成・変更するファイル一覧

| ファイル | 操作 | 内容 |
|---------|------|------|
| `app/frontend/src/pages/EditorPage.tsx` | 新規 | エディタシェル（3カラムレイアウト） |
| `app/frontend/src/components/EditorLayout.tsx` | 新規 | CSS Grid コンテナ |
| `app/frontend/src/components/AssetPanel.tsx` | 新規 | アセット一覧 + インポートボタン |
| `app/frontend/src/components/AssetThumbnail.tsx` | 新規 | サムネイル画像 + Job 状態オーバーレイ |
| `app/frontend/src/components/JobProgress.tsx` | 新規 | プログレスバー / ステータス表示 |
| `app/frontend/src/api/assets.ts` | 新規 | useImportAsset() |
| `app/frontend/src/api/jobs.ts` | 新規 | useJob(id) |
| `app/frontend/src/App.tsx` | 変更 | EditorPage ルート追加 |

## 実装の詳細

### api/assets.ts

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ImportAssetResponse } from "@video/shared";

export function useImportAsset(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<ImportAssetResponse> => {
      const res = await fetch(
        `/api/assets/import?projectId=${projectId}&filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/octet-stream" },
          body: file.stream(),
        },
      );
      if (!res.ok) throw new Error(`Import failed: ${res.status}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
```

### api/jobs.ts

```ts
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { GetJobResponse } from "@video/shared";
import { JOB_POLL_INTERVAL_MS } from "@video/shared";

export function useJob(jobId: string | null) {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: () => apiFetch<GetJobResponse>(`/api/jobs/${jobId}`),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // completed/failed で自動停止
      if (status === "completed" || status === "failed") return false;
      return JOB_POLL_INTERVAL_MS;
    },
  });
}
```

### pages/EditorPage.tsx

```tsx
import { useParams } from "react-router-dom";
import { useProject } from "../api/projects";
import { EditorLayout } from "../components/EditorLayout";
import { AssetPanel } from "../components/AssetPanel";

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id!);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <EditorLayout
      left={<AssetPanel project={project} />}
      center={<div style={{ color: "#888" }}>Preview (Phase 2)</div>}
      bottom={<div style={{ color: "#888" }}>Timeline (Phase 2)</div>}
    />
  );
}
```

### components/EditorLayout.tsx

```tsx
import type { ReactNode } from "react";

type Props = {
  left: ReactNode;
  center: ReactNode;
  bottom: ReactNode;
};

export function EditorLayout({ left, center, bottom }: Props) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "280px 1fr",
      gridTemplateRows: "1fr 200px",
      height: "100vh",
      gap: "1px",
      background: "#222",
    }}>
      <div style={{ gridRow: "1 / 3", overflow: "auto", background: "#1a1a1a", padding: "8px" }}>
        {left}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#111" }}>
        {center}
      </div>
      <div style={{ background: "#1a1a1a", padding: "8px", overflow: "auto" }}>
        {bottom}
      </div>
    </div>
  );
}
```

### components/AssetPanel.tsx

```tsx
import { useRef, useState } from "react";
import type { Project } from "@video/shared";
import { useImportAsset } from "../api/assets";
import { AssetThumbnail } from "./AssetThumbnail";

type Props = { project: Project };

export function AssetPanel({ project }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importAsset = useImportAsset(project.id);
  const [activeJobIds, setActiveJobIds] = useState<Map<string, string>>(new Map());

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of files) {
      const result = await importAsset.mutateAsync(file);
      setActiveJobIds((prev) => new Map(prev).set(result.asset.id, result.jobId));
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, color: "#fff" }}>Assets</h3>
        <button onClick={() => fileInputRef.current?.click()}>+ Import</button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*,image/*,audio/*,.heic"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "4px" }}>
        {project.assets.map((asset) => (
          <AssetThumbnail
            key={asset.id}
            asset={asset}
            projectId={project.id}
            jobId={activeJobIds.get(asset.id) ?? null}
          />
        ))}
      </div>
    </div>
  );
}
```

### components/AssetThumbnail.tsx

```tsx
import type { Asset } from "@video/shared";
import { useJob } from "../api/jobs";
import { JobProgress } from "./JobProgress";

type Props = {
  asset: Asset;
  projectId: string;
  jobId: string | null;
};

export function AssetThumbnail({ asset, projectId, jobId }: Props) {
  const { data: job } = useJob(jobId);

  const thumbnailUrl = asset.thumbnailPath
    ? `/media/projects/${projectId}/thumbnails/${asset.thumbnailPath.split("/").pop()}`
    : undefined;

  const isProcessing = job && job.status !== "completed" && job.status !== "failed";

  return (
    <div style={{ position: "relative", aspectRatio: "16/9", background: "#333", borderRadius: "4px", overflow: "hidden" }}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={asset.originalPath}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#666", fontSize: "12px" }}>
          {asset.kind}
        </div>
      )}
      {isProcessing && job && (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.7)", padding: "4px" }}>
          <JobProgress job={job} />
        </div>
      )}
      {job?.status === "failed" && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(200,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px" }}>
          Failed
        </div>
      )}
    </div>
  );
}
```

### components/JobProgress.tsx

```tsx
import type { Job } from "@video/shared";

type Props = { job: Job };

export function JobProgress({ job }: Props) {
  const percent = Math.round(job.progress * 100);
  return (
    <div>
      <div style={{
        height: "3px",
        background: "#444",
        borderRadius: "2px",
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          width: `${percent}%`,
          background: job.status === "failed" ? "#e44" : "#4af",
          transition: "width 0.3s ease",
        }} />
      </div>
      <div style={{ fontSize: "10px", color: "#aaa", marginTop: "2px" }}>
        {job.status === "processing" ? `${percent}%` : job.status}
      </div>
    </div>
  );
}
```

### App.tsx（変更）

```tsx
import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { EditorPage } from "./pages/EditorPage";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/projects/:id" element={<EditorPage />} />
    </Routes>
  );
}
```

## 完了条件 (Phase 1 ゴール)

1. `/projects/:id` でエディタ画面が表示される（左: アセットパネル、中央: Preview 占位、下: Timeline 占位）
2. 「+ Import」ボタンでファイル選択ダイアログが開く
3. ファイルを選択すると backend にアップロードされる
4. アップロード後、Job のポーリングが開始される
5. 処理中はプログレスバーが表示される
6. 処理完了後、サムネイル画像が表示される
7. 処理失敗時、エラー表示がされる
8. 複数ファイルを同時にインポートできる（キューイングされる）
9. ブラウザでフルフロー確認: プロジェクト作成 → エディタに遷移 → ファイルインポート → 進捗表示 → サムネイル表示
