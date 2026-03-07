import { describe, test, expect, beforeEach } from "bun:test";
import { enqueue, getJob, retry, _reset } from "./job-queue";

beforeEach(() => _reset());

describe("job-queue", () => {
  test("enqueue creates a job with correct fields", () => {
    const job = enqueue("p1", "a1", async () => {});
    expect(job.projectId).toBe("p1");
    expect(job.assetId).toBe("a1");
    expect(job.id).toBeDefined();
    expect(job.createdAt).toBeDefined();
  });

  test("job transitions to completed after successful task", async () => {
    const job = enqueue("p1", "a1", async () => {});
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("completed");
    expect(getJob(job.id)?.progress).toBe(1);
  });

  test("job transitions to failed on task error", async () => {
    const job = enqueue("p1", "a1", async () => {
      throw new Error("boom");
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("failed");
    expect(getJob(job.id)?.error).toBe("boom");
  });

  test("retry re-queues a failed job", async () => {
    let attempts = 0;
    const job = enqueue("p1", "a1", async () => {
      attempts++;
      if (attempts === 1) throw new Error("fail");
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("failed");

    retry(job.id);
    await new Promise((r) => setTimeout(r, 50));
    expect(getJob(job.id)?.status).toBe("completed");
    expect(attempts).toBe(2);
  });

  test("retry throws on non-failed job", async () => {
    const job = enqueue("p1", "a1", async () => {});
    await new Promise((r) => setTimeout(r, 50));
    expect(() => retry(job.id)).toThrow("Job is not failed");
  });

  test("sequential execution", async () => {
    const order: string[] = [];
    enqueue("p1", "a1", async () => {
      order.push("start-1");
      await Bun.sleep(20);
      order.push("end-1");
    });
    enqueue("p1", "a2", async () => {
      order.push("start-2");
      await Bun.sleep(20);
      order.push("end-2");
    });
    await new Promise((r) => setTimeout(r, 200));
    expect(order).toEqual(["start-1", "end-1", "start-2", "end-2"]);
  });

  test("getJob returns undefined for unknown id", () => {
    expect(getJob("xxx")).toBeUndefined();
  });
});
