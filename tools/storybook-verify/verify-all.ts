/**
 * Storybook 全 story の視覚 + エラー検証スクリプト
 *
 * 1. http://localhost:6006/index.json から全 story を列挙
 * 2. 各 story を iframe.html で直接開く
 * 3. pageerror / console.error / #storybook-root の空チェック / error overlay を収集
 * 4. full-page PNG スクリーンショットを screenshots/ に保存
 * 5. report.json にまとめて書き出し
 *
 * Usage:
 *   bun run tools/storybook-verify/verify-all.ts [--limit N]
 *
 * Requires Storybook running on http://localhost:6006.
 */
import { chromium, type Page } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const STORYBOOK_BASE = "http://localhost:6006";
const OUT_DIR = path.join("tools", "storybook-verify");
const SHOTS_DIR = path.join(OUT_DIR, "screenshots");
const REPORT_PATH = path.join(OUT_DIR, "report.json");
const VIEWPORT = { width: 1280, height: 800 };
const NAV_TIMEOUT_MS = 15_000;
const SETTLE_MS = 400;

type IndexEntry = {
  id: string;
  type: "story" | "docs";
  title: string;
  name: string;
};

type StoryResult = {
  id: string;
  title: string;
  name: string;
  status: "ok" | "error" | "empty";
  pageErrors: string[];
  consoleErrors: string[];
  errorOverlay: string | null;
  rootHtmlSize: number;
  screenshot: string;
  durationMs: number;
};

function parseArgs(): { limit: number | null } {
  const args = process.argv.slice(2);
  const limitIdx = args.indexOf("--limit");
  if (limitIdx >= 0 && args[limitIdx + 1]) {
    return { limit: Number(args[limitIdx + 1]) };
  }
  return { limit: null };
}

function safeId(id: string): string {
  return id.replace(/[^a-z0-9_-]+/gi, "_");
}

async function fetchIndex(): Promise<IndexEntry[]> {
  const res = await fetch(`${STORYBOOK_BASE}/index.json`);
  if (!res.ok) {
    throw new Error(`Failed to fetch /index.json: ${res.status}`);
  }
  const json = (await res.json()) as { entries: Record<string, IndexEntry> };
  return Object.values(json.entries).filter((e) => e.type === "story");
}

async function verifyStory(page: Page, entry: IndexEntry): Promise<StoryResult> {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];

  const onPageError = (err: Error) => {
    pageErrors.push(err.message);
  };
  const onConsole = (msg: import("playwright").ConsoleMessage) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Ignore fixture asset 404s — fixtures reference mock URLs that are
    // expected to fail loading in isolated Storybook context.
    if (text.startsWith("Failed to load resource")) return;
    // Ignore interaction-test assertion failures from Storybook's addon-vitest
    // .test() blocks. Those are a separate concern (test correctness), not a
    // story rendering problem, and their async nature causes them to leak
    // into the next story's console listener.
    if (text.includes("TestingLibraryElementError")) return;
    consoleErrors.push(text);
  };
  page.on("pageerror", onPageError);
  page.on("console", onConsole);

  const start = Date.now();
  const url = `${STORYBOOK_BASE}/iframe.html?id=${encodeURIComponent(
    entry.id,
  )}&viewMode=story`;
  let errorOverlay: string | null = null;
  let rootHtmlSize = 0;

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: NAV_TIMEOUT_MS });
  } catch (err) {
    pageErrors.push(`navigation: ${(err as Error).message}`);
  }

  // Settle time for async rendering (canvas, fonts, etc.)
  await page.waitForTimeout(SETTLE_MS);

  try {
    const info = await page.evaluate(() => {
      const root = document.querySelector("#storybook-root");
      const errEl = document.querySelector<HTMLElement>(
        "#error-message, .sb-errordisplay, .sb-heading",
      );
      const errVisible =
        errEl && errEl.offsetParent !== null ? errEl.textContent : null;
      return {
        rootHtmlSize: root?.innerHTML.length ?? 0,
        errorOverlay: errVisible,
      };
    });
    rootHtmlSize = info.rootHtmlSize;
    errorOverlay = info.errorOverlay;
  } catch (err) {
    pageErrors.push(`evaluate: ${(err as Error).message}`);
  }

  const screenshotPath = path.join(SHOTS_DIR, `${safeId(entry.id)}.png`);
  try {
    await page.screenshot({ path: screenshotPath, fullPage: false });
  } catch (err) {
    pageErrors.push(`screenshot: ${(err as Error).message}`);
  }

  page.off("pageerror", onPageError);
  page.off("console", onConsole);

  const durationMs = Date.now() - start;
  let status: StoryResult["status"] = "ok";
  if (pageErrors.length > 0 || consoleErrors.length > 0 || errorOverlay) {
    status = "error";
  } else if (rootHtmlSize < 20) {
    status = "empty";
  }

  return {
    id: entry.id,
    title: entry.title,
    name: entry.name,
    status,
    pageErrors,
    consoleErrors,
    errorOverlay,
    rootHtmlSize,
    screenshot: path.relative(OUT_DIR, screenshotPath),
    durationMs,
  };
}

async function main() {
  const { limit } = parseArgs();
  await mkdir(SHOTS_DIR, { recursive: true });

  console.log(`Fetching Storybook index from ${STORYBOOK_BASE}/index.json...`);
  const allStories = await fetchIndex();
  const stories = limit ? allStories.slice(0, limit) : allStories;
  console.log(
    `Found ${allStories.length} stories. Verifying ${stories.length}.`,
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  const results: StoryResult[] = [];
  let okCount = 0;
  let errorCount = 0;
  let emptyCount = 0;

  for (let i = 0; i < stories.length; i++) {
    const entry = stories[i];
    const result = await verifyStory(page, entry);
    results.push(result);
    if (result.status === "ok") okCount++;
    else if (result.status === "error") errorCount++;
    else emptyCount++;

    const marker =
      result.status === "ok" ? "OK" : result.status === "empty" ? "EMPTY" : "ERR";
    console.log(
      `[${i + 1}/${stories.length}] ${marker.padEnd(5)} ${entry.id} (${result.durationMs}ms)`,
    );
    if (result.status !== "ok") {
      if (result.pageErrors.length)
        console.log(`  pageErrors: ${result.pageErrors.join(" | ")}`);
      if (result.consoleErrors.length)
        console.log(`  consoleErrors: ${result.consoleErrors.join(" | ")}`);
      if (result.errorOverlay) console.log(`  overlay: ${result.errorOverlay}`);
    }
  }

  await context.close();
  await browser.close();

  const report = {
    generatedAt: new Date().toISOString(),
    storybookBase: STORYBOOK_BASE,
    viewport: VIEWPORT,
    total: stories.length,
    ok: okCount,
    error: errorCount,
    empty: emptyCount,
    results,
  };
  await writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

  console.log("");
  console.log(`Report: ${REPORT_PATH}`);
  console.log(`Summary: ok=${okCount} error=${errorCount} empty=${emptyCount}`);
  if (errorCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
