#!/usr/bin/env bun
/**
 * Generate a standalone HTML parity report with embedded images.
 * Usage: bun tools/canvas-export-test/generate-report.ts
 *
 * Reads FFmpeg reference frames and Canvas actual frames, compares them,
 * and produces a single self-contained HTML file with all images inlined
 * as base64 data URIs.
 */
import { readdir, readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { compareFrames, listFrames } from "../../app/backend/src/utils/frame-compare";

const EXPORT_REFS_DIR = path.resolve(
  import.meta.dir,
  "../../app/backend/src/__fixtures__/export/references",
);
const ACTUAL_DIR = path.resolve(import.meta.dir, ".actual");
const OUTPUT_PATH = path.resolve(import.meta.dir, "parity-report.html");

/** Same fixture list as the test file. */
const FIXTURES: Array<{
  fixture: string;
  exportRef?: string;
  skip?: string;
}> = [
  { fixture: "single-video" },
  { fixture: "two-clips" },
  { fixture: "image-clip" },
  { fixture: "text-overlay" },
  { fixture: "title-font-align" },
  { fixture: "crop-transform" },
  { fixture: "multi-track" },
  { fixture: "overlay-transform" },
  { fixture: "transition-fade" },
  { fixture: "transition-fade-black" },
  { fixture: "transition-fade-white" },
  { fixture: "transition-slide-left" },
  { fixture: "transition-slide-right" },
  { fixture: "transition-slide-up" },
  { fixture: "transition-slide-down" },
  { fixture: "transition-wipe-left" },
  { fixture: "transition-wipe-up" },
  { fixture: "transition-zoom-in" },
  { fixture: "transition-push-left" },
  { fixture: "opacity", exportRef: "blend-opacity" },
  { fixture: "multiply", exportRef: "blend-multiply" },
  { fixture: "screen", exportRef: "blend-screen" },
  { fixture: "overlay-blend", exportRef: "blend-overlay" },
  { fixture: "add", exportRef: "blend-add" },
  { fixture: "difference", exportRef: "blend-difference" },
  { fixture: "transition-with-transform" },
  { fixture: "transition-multi-track" },
  { fixture: "blend-mode-transition" },
  { fixture: "crop-blend" },
  { fixture: "keyframe-transform-x" },
  { fixture: "speed-2x" },
  { fixture: "speed-half" },
  { fixture: "speed-multi-clip" },
  { fixture: "speed-transition" },
  { fixture: "color-correction" },
  { fixture: "color-correction-hue" },
  { fixture: "color-correction-transform" },
  { fixture: "color-correction-video-filter" },
  { fixture: "keyframe-color-correction" },
  { fixture: "video-filter-blur-sepia" },
  { fixture: "video-filter-grayscale" },
  { fixture: "video-filter-transform" },
  { fixture: "video-filter-transition" },
  { fixture: "chroma-key" },
  { fixture: "chroma-key-transform" },
  { fixture: "chroma-key-blend" },
  { fixture: "pip-corner-br" },
  { fixture: "pip-side-by-side" },
  { fixture: "p5js-transform" },
  { fixture: "p5js-multi-track" },
  { fixture: "p5js-transition" },
  { fixture: "feature-showcase" },
];

async function toDataUri(filePath: string): Promise<string> {
  const buf = await readFile(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

async function safeListFrames(dir: string): Promise<string[]> {
  try {
    return await listFrames(dir);
  } catch {
    return [];
  }
}

type FixtureResult = {
  fixture: string;
  exportRef: string;
  skip?: string;
  ffmpegFrames: string[]; // data URIs
  canvasFrames: string[]; // data URIs
  perFrame: Array<{ index: number; diffPercent: number; passed: boolean }>;
  missingFrames: number;
  status: "pass" | "fail" | "skip" | "missing";
  failReason?: string;
};

async function analyzeFixture(f: (typeof FIXTURES)[number]): Promise<FixtureResult> {
  const exportRef = f.exportRef ?? f.fixture;
  const refDir = path.join(EXPORT_REFS_DIR, exportRef);
  const actDir = path.join(ACTUAL_DIR, f.fixture);

  if (f.skip) {
    return {
      fixture: f.fixture,
      exportRef,
      skip: f.skip,
      ffmpegFrames: [],
      canvasFrames: [],
      perFrame: [],
      missingFrames: 0,
      status: "skip",
    };
  }

  const refFrameNames = await safeListFrames(refDir);
  const actFrameNames = await safeListFrames(actDir);

  if (refFrameNames.length === 0) {
    return {
      fixture: f.fixture,
      exportRef,
      ffmpegFrames: [],
      canvasFrames: [],
      perFrame: [],
      missingFrames: 0,
      status: "missing",
      failReason: "No FFmpeg reference frames",
    };
  }
  if (actFrameNames.length === 0) {
    return {
      fixture: f.fixture,
      exportRef,
      ffmpegFrames: [],
      canvasFrames: [],
      perFrame: [],
      missingFrames: 0,
      status: "missing",
      failReason: "No Canvas frames (run parity test first)",
    };
  }

  // Compare
  const result = await compareFrames({
    referenceDir: refDir,
    actualDir: actDir,
    threshold: 15.0,
    channelTolerance: 40,
  });

  // Only count pixel mismatches (ignore trailing missing frames)
  const pixelMismatches = result.perFrame.filter((pf) => !pf.passed);
  const passed = pixelMismatches.length === 0;

  // Embed images as data URIs
  const ffmpegFrames = await Promise.all(
    refFrameNames.map((name) => toDataUri(path.join(refDir, name))),
  );
  const canvasFrames = await Promise.all(
    actFrameNames.map((name) => toDataUri(path.join(actDir, name))),
  );

  return {
    fixture: f.fixture,
    exportRef,
    ffmpegFrames,
    canvasFrames,
    perFrame: result.perFrame,
    missingFrames: result.missingFrames,
    status: passed ? "pass" : "fail",
    failReason: passed
      ? undefined
      : `${pixelMismatches.length} frame(s) exceed threshold`,
  };
}

function renderHtml(results: FixtureResult[]): string {
  const pass = results.filter((r) => r.status === "pass");
  const fail = results.filter((r) => r.status === "fail");
  const skip = results.filter((r) => r.status === "skip");
  const missing = results.filter((r) => r.status === "missing");

  const badge = (status: string) => {
    const colors: Record<string, string> = {
      pass: "#22c55e",
      fail: "#ef4444",
      skip: "#a3a3a3",
      missing: "#f59e0b",
    };
    return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;color:#fff;font-size:12px;font-weight:600;background:${colors[status] ?? "#888"}">${status.toUpperCase()}</span>`;
  };

  const summaryRow = (r: FixtureResult) => {
    const link =
      r.status === "fail" || r.status === "pass"
        ? `<a href="#fixture-${r.fixture}">${r.fixture}</a>`
        : r.fixture;
    return `<tr>
      <td>${link}</td>
      <td>${r.exportRef}</td>
      <td>${r.ffmpegFrames.length}</td>
      <td>${r.canvasFrames.length}</td>
      <td>${r.missingFrames}</td>
      <td>${badge(r.status)}</td>
      <td>${r.failReason ?? r.skip ?? ""}</td>
    </tr>`;
  };

  const detailSection = (r: FixtureResult) => {
    if (r.status === "skip" || r.status === "missing") return "";

    const maxFrames = Math.max(r.ffmpegFrames.length, r.canvasFrames.length);
    let framesHtml = "";
    for (let i = 0; i < maxFrames; i++) {
      const pf = r.perFrame[i];
      const diffText = pf
        ? `${pf.diffPercent.toFixed(2)}%`
        : "N/A";
      const framePassed = pf ? pf.passed : false;
      const borderColor =
        !pf ? "#f59e0b" : framePassed ? "#22c55e" : "#ef4444";

      const ffImg = r.ffmpegFrames[i]
        ? `<img src="${r.ffmpegFrames[i]}" style="width:160px;height:90px;display:block;border:2px solid #dc2626">`
        : `<div style="width:160px;height:90px;background:#e5e5e5;display:flex;align-items:center;justify-content:center;color:#888;font-size:11px">N/A</div>`;
      const cvImg = r.canvasFrames[i]
        ? `<img src="${r.canvasFrames[i]}" style="width:160px;height:90px;display:block;border:2px solid #2563eb">`
        : `<div style="width:160px;height:90px;background:#e5e5e5;display:flex;align-items:center;justify-content:center;color:#888;font-size:11px">N/A</div>`;

      framesHtml += `
        <div style="display:inline-block;margin:4px;padding:6px;border:2px solid ${borderColor};border-radius:6px;vertical-align:top;text-align:center;background:#fff">
          <div style="font-weight:600;font-size:12px;margin-bottom:4px">Frame ${i + 1} <span style="color:${borderColor};font-size:11px">(${diffText})</span></div>
          <div style="display:flex;gap:8px">
            <div>
              <div style="font-size:10px;color:#dc2626;font-weight:600;margin-bottom:2px">FFmpeg</div>
              ${ffImg}
            </div>
            <div>
              <div style="font-size:10px;color:#2563eb;font-weight:600;margin-bottom:2px">Canvas</div>
              ${cvImg}
            </div>
          </div>
        </div>`;
    }

    return `
      <div id="fixture-${r.fixture}" style="margin:24px 0;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#fafafa">
        <h3 style="margin:0 0 4px 0">${r.fixture} ${badge(r.status)}</h3>
        <div style="font-size:13px;color:#666;margin-bottom:12px">
          Export ref: <code>${r.exportRef}</code> &middot;
          FFmpeg: ${r.ffmpegFrames.length} frames &middot;
          Canvas: ${r.canvasFrames.length} frames &middot;
          Missing: ${r.missingFrames}
          ${r.failReason ? ` &middot; <span style="color:#ef4444">${r.failReason}</span>` : ""}
        </div>
        <div style="overflow-x:auto;white-space:nowrap">
          ${framesHtml}
        </div>
      </div>`;
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Canvas Export Parity Report</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 1400px; margin: 0 auto; padding: 20px; background: #f9fafb; color: #111; }
  h1 { margin: 0 0 8px 0; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  th { background: #f3f4f6; font-weight: 600; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code { background: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-size: 12px; }
  .summary-cards { display: flex; gap: 12px; margin: 16px 0; }
  .card { padding: 12px 20px; border-radius: 8px; color: #fff; font-weight: 600; font-size: 18px; }
  .card small { display: block; font-size: 12px; font-weight: 400; opacity: 0.8; }
</style>
</head>
<body>
<h1>Canvas Export Parity Report</h1>
<p style="color:#666;margin:0 0 16px 0">
  Generated: ${new Date().toISOString()}<br>
  Threshold: 15% pixel diff, 40 channel tolerance. Trailing missing frames are tolerated.
</p>

<div class="summary-cards">
  <div class="card" style="background:#22c55e">${pass.length}<small>Pass</small></div>
  <div class="card" style="background:#ef4444">${fail.length}<small>Fail</small></div>
  <div class="card" style="background:#a3a3a3">${skip.length}<small>Skip</small></div>
  <div class="card" style="background:#f59e0b">${missing.length}<small>Missing</small></div>
</div>

<h2>Summary</h2>
<table>
  <thead>
    <tr><th>Fixture</th><th>Export Ref</th><th>FFmpeg</th><th>Canvas</th><th>Missing</th><th>Status</th><th>Notes</th></tr>
  </thead>
  <tbody>
    ${results.map(summaryRow).join("\n")}
  </tbody>
</table>

<h2>Failed Fixtures — Frame-by-Frame Comparison</h2>
${fail.map(detailSection).join("\n")}

<h2>Passed Fixtures — Frame-by-Frame Comparison</h2>
<details>
  <summary style="cursor:pointer;font-weight:600;margin-bottom:8px">Show ${pass.length} passing fixtures</summary>
  ${pass.map(detailSection).join("\n")}
</details>

</body>
</html>`;
}

// Main
console.log("Analyzing fixtures...");
const results = await Promise.all(FIXTURES.map(analyzeFixture));
const html = renderHtml(results);
await Bun.write(OUTPUT_PATH, html);

const fail = results.filter((r) => r.status === "fail").length;
const pass = results.filter((r) => r.status === "pass").length;
console.log(`Report: ${pass} pass, ${fail} fail → ${OUTPUT_PATH}`);
