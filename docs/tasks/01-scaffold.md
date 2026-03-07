# 01: プロジェクトスキャフォールド

## 目的・ゴール

Bun workspaces によるモノレポ構成を作成し、backend / frontend / shared の3パッケージが正しく参照し合える状態にする。`bun run dev` で backend (port 3000) と frontend (port 5173) が同時に起動できることを確認する。

## 依存関係

なし（最初のタスク）

## 作成するファイル一覧

### ルート

| ファイル | 内容 |
|---------|------|
| `package.json` | workspaces 定義、dev/test スクリプト |
| `tsconfig.json` | project references で3パッケージを参照 |
| `.gitignore` | node_modules, dist, workspace/ |

### app/shared/

| ファイル | 内容 |
|---------|------|
| `package.json` | name: `@video/shared`, main/types エントリ |
| `tsconfig.json` | strict, 生 .ts エクスポート用 |

### app/backend/

| ファイル | 内容 |
|---------|------|
| `package.json` | name: `@video/backend`, dependencies: hono, @video/shared |
| `tsconfig.json` | Bun 用設定、shared への参照 |
| `src/index.ts` | 最小限の Hono サーバー（health check エンドポイントのみ） |

### app/frontend/

| ファイル | 内容 |
|---------|------|
| `package.json` | name: `@video/frontend`, dependencies: react, react-dom, vite 等 |
| `tsconfig.json` | Vite + React 用設定 |
| `vite.config.ts` | React plugin, proxy 設定 (`/api/*`, `/media/*` → localhost:3000) |
| `index.html` | Vite エントリ HTML |
| `src/main.tsx` | 最小限の React root |
| `src/App.tsx` | "Hello" を表示するだけの仮コンポーネント |

## 実装の詳細

### ルート package.json

```json
{
  "private": true,
  "workspaces": ["app/shared", "app/backend", "app/frontend"],
  "scripts": {
    "dev": "concurrently \"bun run --hot app/backend/src/index.ts\" \"cd app/frontend && bunx vite\"",
    "test": "bun test"
  },
  "devDependencies": {
    "concurrently": "^9",
    "typescript": "^5"
  }
}
```

### ルート tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "references": [
    { "path": "app/shared" },
    { "path": "app/backend" },
    { "path": "app/frontend" }
  ]
}
```

### app/shared/package.json

```json
{
  "name": "@video/shared",
  "version": "0.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

### app/backend/package.json

```json
{
  "name": "@video/backend",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "test": "bun test"
  },
  "dependencies": {
    "hono": "^4",
    "@video/shared": "workspace:*"
  }
}
```

### app/backend/src/index.ts（最小版）

```ts
import { Hono } from "hono";

const app = new Hono();
app.get("/api/health", (c) => c.json({ ok: true }));

export default { port: 3000, hostname: "127.0.0.1", fetch: app.fetch };
```

### app/frontend/package.json

```json
{
  "name": "@video/frontend",
  "version": "0.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "@video/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4",
    "vite": "^6",
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19"
  }
}
```

### vite.config.ts

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3000",
      "/media": "http://localhost:3000",
    },
  },
});
```

### .gitignore（追加エントリ）

```
node_modules/
dist/
workspace/
*.tsbuildinfo
```

## 完了条件

1. `bun install` が成功する
2. `bun run --hot app/backend/src/index.ts` で起動し、`curl http://localhost:3000/api/health` が `{"ok":true}` を返す
3. `cd app/frontend && bunx vite` で起動し、ブラウザで `http://localhost:5173` が表示される
4. frontend から `@video/shared` の型を import できる
5. backend から `@video/shared` の型を import できる（既存コードで確認済み）
6. `bun run dev`（ルート）で両方が同時起動する
