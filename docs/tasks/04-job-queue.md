# 04: Job キュー

## 目的・ゴール

インメモリの Job キューを実装する。FFmpeg はCPUヘビーなため同時実行は1ジョブに限定し、逐次実行する。Job のライフサイクル管理（pending → processing → completed/failed）と retry をサポートする。

## 依存関係

- 02-shared-types（Job 型、JobStatus 型、generateId）

## 作成するファイル一覧

| ファイル | 内容 |
|---------|------|
| `app/backend/src/services/job-queue.ts` | Job キュー実装 |
| `app/backend/src/services/job-queue.test.ts` | Job キューのユニットテスト |

## 実装の詳細

### services/job-queue.ts

```ts
import type { Job, JobStatus } from "@video/shared";
import { generateId } from "@video/shared";

type JobTask = (job: Job) => Promise<void>;

const jobs = new Map<string, Job>();
const tasks = new Map<string, JobTask>();
const queue: string[] = [];  // pending な jobId のキュー
let running = false;

/**
 * 新しい Job を作成してキューに追加。
 * task は実際の処理関数（asset-service が組み立てる）。
 */
export function enqueue(
  projectId: string,
  assetId: string,
  task: JobTask,
): Job {
  const now = new Date().toISOString();
  const job: Job = {
    id: generateId(),
    projectId,
    assetId,
    status: "pending",
    progress: 0,
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(job.id, job);
  tasks.set(job.id, task);
  queue.push(job.id);
  drain(); // 非同期でキュー処理開始（awaitしない）
  return job;
}

/** Job を取得 */
export function getJob(id: string): Job | undefined {
  return jobs.get(id);
}

/** プロジェクトの全 Job を取得 */
export function getJobsByProject(projectId: string): Job[] {
  return [...jobs.values()].filter((j) => j.projectId === projectId);
}

/** failed → pending に戻して再キュー */
export function retry(id: string): Job {
  const job = jobs.get(id);
  if (!job) throw new Error(`Job not found: ${id}`);
  if (job.status !== "failed") throw new Error(`Job is not failed: ${id}`);
  job.status = "pending";
  job.progress = 0;
  job.error = undefined;
  job.updatedAt = new Date().toISOString();
  queue.push(id);
  drain();
  return job;
}

/** キューを逐次処理 */
async function drain(): Promise<void> {
  if (running) return;
  running = true;
  try {
    while (queue.length > 0) {
      const jobId = queue.shift()!;
      const job = jobs.get(jobId);
      const task = tasks.get(jobId);
      if (!job || !task) continue;

      job.status = "processing";
      job.updatedAt = new Date().toISOString();

      try {
        await task(job);
        job.status = "completed";
        job.progress = 1;
      } catch (err) {
        job.status = "failed";
        job.error = err instanceof Error ? err.message : String(err);
      }
      job.updatedAt = new Date().toISOString();
    }
  } finally {
    running = false;
  }
}

/** テスト用: 全 Job をクリア */
export function _reset(): void {
  jobs.clear();
  tasks.clear();
  queue.length = 0;
  running = false;
}
```

### 公開 API まとめ

| 関数 | 引数 | 戻り値 | 説明 |
|------|------|--------|------|
| `enqueue` | `(projectId, assetId, task)` | `Job` | Job 作成 + キューイング |
| `getJob` | `(id)` | `Job \| undefined` | 単一 Job 取得 |
| `getJobsByProject` | `(projectId)` | `Job[]` | プロジェクト内全 Job |
| `retry` | `(id)` | `Job` | failed → pending に戻す |
| `_reset` | なし | `void` | テスト用リセット |

### services/job-queue.test.ts

テストケース:

1. **基本ライフサイクル**: enqueue → drain → completed
   - enqueue 直後は pending
   - drain 完了後は completed, progress=1
2. **失敗ケース**: task が throw → status=failed, error にメッセージ
3. **retry**: failed → retry() → pending → 再実行 → completed
4. **逐次実行**: 2つの Job を enqueue → 同時に1つだけ processing
   - task 内で「自分が processing かつ他が processing でない」ことを検証
5. **不正な retry**: completed な Job に retry() → エラー
6. **存在しない Job**: getJob("xxx") → undefined

```ts
import { describe, test, expect, beforeEach } from "bun:test";
import { enqueue, getJob, retry, _reset } from "./job-queue";

beforeEach(() => _reset());

describe("job-queue", () => {
  test("enqueue creates a pending job", () => {
    const job = enqueue("p1", "a1", async () => {});
    expect(job.status).toBe("pending");
    expect(job.projectId).toBe("p1");
    expect(job.assetId).toBe("a1");
  });

  test("job transitions to completed after successful task", async () => {
    const job = enqueue("p1", "a1", async () => {});
    // Wait for drain to complete
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("completed");
    expect(getJob(job.id)?.progress).toBe(1);
  });

  test("job transitions to failed on task error", async () => {
    const job = enqueue("p1", "a1", async () => { throw new Error("boom"); });
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("failed");
    expect(getJob(job.id)?.error).toBe("boom");
  });

  test("retry re-queues a failed job", async () => {
    const job = enqueue("p1", "a1", async () => { throw new Error("fail"); });
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("failed");

    let callCount = 0;
    // Note: retry reuses the original task, so we test with a new approach
    retry(job.id);
    expect(getJob(job.id)?.status).toBe("pending");
  });

  test("sequential execution", async () => {
    const order: string[] = [];
    enqueue("p1", "a1", async () => { order.push("start-1"); await Bun.sleep(20); order.push("end-1"); });
    enqueue("p1", "a2", async () => { order.push("start-2"); await Bun.sleep(20); order.push("end-2"); });
    await new Promise((r) => setTimeout(r, 200));
    expect(order).toEqual(["start-1", "end-1", "start-2", "end-2"]);
  });
});
```

## 完了条件

1. `bun test app/backend/src/services/job-queue.test.ts` が全テストパス
2. enqueue → completed のライフサイクルが正しく動作
3. 失敗時に status=failed, error にメッセージが入る
4. retry で再実行される
5. 複数 Job が逐次（直列）で実行される
