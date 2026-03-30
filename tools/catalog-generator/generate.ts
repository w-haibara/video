/**
 * Feature Catalog Generator
 *
 * Reads export regression test definitions and editor operation snapshots,
 * then generates a single Markdown file (docs/feature-catalog.md) containing
 * all content from the regression viewer as a static feature catalog.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Clip, Sequence } from "../../app/shared/src/types/project";
import { buildP5jsHtml } from "../../app/backend/src/pipeline/steps/p5js-prepare";
import {
  makeSingleVideoProject,
  makeTwoClipProject,
  makeImageClipProject,
  makeTextOverlayProject,
  makeCropTransformProject,
  makeMultiTrackProject,
  makeOverlayTransformProject,
  makeFadeTransitionProject,
  makeFadeBlackTransitionProject,
  makeFadeWhiteTransitionProject,
  makeSlideLeftTransitionProject,
  makeSlideRightTransitionProject,
  makeSlideUpTransitionProject,
  makeSlideDownTransitionProject,
  makeOpacityProject,
  makeMultiplyProject,
  makeScreenProject,
  makeOverlayBlendProject,
  makeAddProject,
  makeDifferenceProject,
  makeP5jsProject,
  makeEmptyAssetMixedProject,
  makeSplitClipProject,
  makeMutedTrackProject,
  makeTransitionWithTransformProject,
  makeTransitionMultiTrackProject,
  makeBlendModeTransitionProject,
  makeCropBlendProject,
  makeTitleFontAlignProject,
} from "../../app/backend/src/__fixtures__/export/make-fixture-project";

const ROOT = path.resolve(import.meta.dir, "../..");
const SNAP_PATH = path.join(
  ROOT,
  "app/frontend/src/lib/__snapshots__/sequence-ops.regression.test.ts.snap",
);
const REFS_DIR = path.join(
  ROOT,
  "app/backend/src/__fixtures__/export/references",
);
const FIXTURES_DIR = path.join(ROOT, "app/backend/src/__fixtures__/export");
const OUTPUT_PATH = path.join(ROOT, "docs/feature-catalog.md");

// ── Types ──

type Snapshot = { name: string; sequence: Sequence };

type AssetInfo = {
  id: string;
  kind: string;
  originalPath: string;
  durationMs?: number;
};

type ExportTestCase = {
  name: string;
  description: string;
  sequence: Sequence;
  assets: AssetInfo[];
  settings: { durationMs: number; canvasWidth: number; canvasHeight: number };
  frameCount: number;
  frameFiles: string[];
};

// ── Export test definitions (mirrors regression-viewer) ──

const EXPORT_TESTS: Array<{
  name: string;
  description: string;
  factory: () => ReturnType<typeof makeSingleVideoProject>;
}> = [
  { name: "single-video", description: "Single 1s video clip", factory: makeSingleVideoProject },
  { name: "two-clips", description: "Two sequential video clips (0-1s, 1-2s)", factory: makeTwoClipProject },
  { name: "image-clip", description: "Single image clip displayed for 1s", factory: makeImageClipProject },
  { name: "text-overlay", description: "Text overlay on video", factory: makeTextOverlayProject },
  { name: "crop-transform", description: "Video with crop and transform", factory: makeCropTransformProject },
  { name: "multi-track", description: "Two-track composite (video + image)", factory: makeMultiTrackProject },
  { name: "overlay-transform", description: "Scaled top clip with transparent bottom clip exposure", factory: makeOverlayTransformProject },
  { name: "transition-fade", description: "Fade cross-dissolve (300ms)", factory: makeFadeTransitionProject },
  { name: "transition-fade-black", description: "Fade through black (300ms)", factory: makeFadeBlackTransitionProject },
  { name: "transition-fade-white", description: "Fade through white (300ms)", factory: makeFadeWhiteTransitionProject },
  { name: "transition-slide-left", description: "Slide left (300ms)", factory: makeSlideLeftTransitionProject },
  { name: "transition-slide-right", description: "Slide right (300ms)", factory: makeSlideRightTransitionProject },
  { name: "transition-slide-up", description: "Slide up (300ms)", factory: makeSlideUpTransitionProject },
  { name: "transition-slide-down", description: "Slide down (300ms)", factory: makeSlideDownTransitionProject },
  { name: "blend-opacity", description: "Opacity blend (50% alpha overlay)", factory: makeOpacityProject },
  { name: "blend-multiply", description: "Multiply blend (darkens)", factory: makeMultiplyProject },
  { name: "blend-screen", description: "Screen blend (lightens)", factory: makeScreenProject },
  { name: "blend-overlay", description: "Overlay blend (contrast)", factory: makeOverlayBlendProject },
  { name: "blend-add", description: "Add blend (additive light)", factory: makeAddProject },
  { name: "blend-difference", description: "Difference blend (absolute diff)", factory: makeDifferenceProject },
  { name: "empty-asset-mixed", description: "Video + empty-asset clip (empty skipped)", factory: makeEmptyAssetMixedProject },
  { name: "split-clip", description: "Video clip split into two halves at 500ms", factory: makeSplitClipProject },
  { name: "muted-track", description: "Video + muted image track (muted excluded)", factory: makeMutedTrackProject },
  { name: "transition-with-transform", description: "Fade transition + transform on clip 2", factory: makeTransitionWithTransformProject },
  { name: "transition-multi-track", description: "Fade transition on track 1 + image overlay on track 2", factory: makeTransitionMultiTrackProject },
  { name: "blend-mode-transition", description: "Fade transition + multiply blend on clip 2", factory: makeBlendModeTransitionProject },
  { name: "crop-blend", description: "Crop + screen blend on top clip", factory: makeCropBlendProject },
  { name: "title-font-align", description: "Title overlay with fontFamily and align", factory: makeTitleFontAlignProject },
  { name: "p5js-rendered", description: "p5.js sketch rendered from source via Chromium pipeline", factory: makeP5jsProject },
];

// ── Snapshot parser (same as regression-viewer) ──

function parseSnapshots(text: string): Snapshot[] {
  const re = /exports\[`([^`]+)`\]\s*=\s*`\n([\s\S]*?)\n`;/g;
  const results: Snapshot[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const name = m[1];
    const body = m[2];
    try {
      const sequence = new Function(`return (${body})`)() as Sequence;
      results.push({ name, sequence });
    } catch {
      console.warn(`Failed to parse snapshot: ${name}`);
    }
  }
  return results;
}

// ── Frame scanner ──

async function listFrameFiles(testName: string): Promise<string[]> {
  try {
    const entries = await readdir(path.join(REFS_DIR, testName));
    return entries
      .filter((f) => f.startsWith("frame_") && f.endsWith(".png"))
      .sort();
  } catch {
    return [];
  }
}

async function buildExportTestCase(
  def: (typeof EXPORT_TESTS)[number],
): Promise<ExportTestCase> {
  const project = def.factory();
  const frameFiles = await listFrameFiles(def.name);
  return {
    name: def.name,
    description: def.description,
    sequence: project.sequence,
    assets: project.assets.map((a) => ({
      id: a.id,
      kind: a.kind,
      originalPath: a.originalPath,
      durationMs: a.durationMs,
    })),
    settings: project.settings,
    frameCount: frameFiles.length,
    frameFiles,
  };
}

// ── Clip property helpers ──

function collectClipProps(clip: Clip): string[] {
  const props: string[] = [];
  if (clip.volume != null) {
    props.push(`volume=${clip.volume}`);
  }
  if (clip.transform) {
    const t = clip.transform;
    props.push(`transform(${t.x},${t.y},${t.scale},${t.rotation}deg)`);
  }
  if (clip.crop) {
    const c = clip.crop;
    props.push(`crop(${c.x},${c.y},${c.width}x${c.height})`);
  }
  if (clip.text) {
    props.push(`text="${clip.text.value}" ${clip.text.fontSize}px ${clip.text.color}`);
    if (clip.text.backgroundColor) props.push(`bg=${clip.text.backgroundColor}`);
  }
  if (clip.blendMode) {
    props.push(`blend=${clip.blendMode}`);
  }
  if (clip.transition) {
    props.push(`transition=${clip.transition.type} ${clip.transition.durationMs}ms`);
  }
  return props;
}

// ── Markdown generators ──

function mdClipTable(seq: Sequence): string {
  const lines: string[] = [];
  lines.push("| Track | Clip | Kind | Asset | Start | Duration | In/Out | Properties |");
  lines.push("|-------|------|------|-------|-------|----------|--------|------------|");
  for (const track of seq.tracks) {
    for (const clip of track.clips) {
      const props = collectClipProps(clip);
      lines.push(
        `| ${track.id} | ${clip.id} | ${clip.clipKind} | ${clip.assetId || "-"} | ${clip.startMs}ms | ${clip.durationMs}ms | ${clip.inMs}-${clip.outMs}ms | ${props.length > 0 ? props.join(", ") : "-"} |`,
      );
    }
  }
  return lines.join("\n");
}

function mdTimeline(seq: Sequence): string {
  let maxMs = 0;
  for (const track of seq.tracks) {
    for (const clip of track.clips) {
      maxMs = Math.max(maxMs, clip.startMs + clip.durationMs);
    }
  }
  if (maxMs === 0) maxMs = 1000;

  const WIDTH = 60; // character width of timeline
  const scale = WIDTH / maxMs;

  const lines: string[] = [];
  lines.push("```");

  // Ruler
  const tickInterval = maxMs <= 3000 ? 500 : maxMs <= 10000 ? 1000 : 2000;
  let ruler = " ".repeat(10); // track label width
  for (let t = 0; t <= maxMs; t += tickInterval) {
    const pos = Math.round(t * scale);
    const label = `${t / 1000}s`;
    const padding = pos - (ruler.length - 10);
    if (padding > 0) ruler += " ".repeat(padding);
    ruler += label;
  }
  lines.push(ruler);

  for (const track of seq.tracks) {
    const row = new Array(WIDTH).fill(" ");
    for (const clip of track.clips) {
      const start = Math.round(clip.startMs * scale);
      const end = Math.min(Math.round((clip.startMs + clip.durationMs) * scale), WIDTH);
      const kindChar = clip.clipKind === "video" ? "V"
        : clip.clipKind === "image" ? "I"
        : clip.clipKind === "title" ? "T"
        : clip.clipKind === "audio" ? "A"
        : clip.clipKind === "p5js" ? "P"
        : "?";
      for (let i = start; i < end; i++) {
        row[i] = i === start ? "[" : i === end - 1 ? "]" : kindChar;
      }
    }
    const label = track.id.padEnd(10);
    lines.push(`${label}${row.join("")}`);
  }
  lines.push("```");
  return lines.join("\n");
}

function mdFilmstrip(tc: ExportTestCase): string {
  if (tc.frameCount === 0) return "_No reference frames_\n";
  const refsRelPath = `../app/backend/src/__fixtures__/export/references/${tc.name}`;
  const imgs = tc.frameFiles.map(
    (f, i) => `<img src="${refsRelPath}/${f}" width="80" title="frame ${i + 1}">`,
  );
  return imgs.join(" ") + "\n";
}

async function generateExportSection(tests: ExportTestCase[]): Promise<string> {
  const lines: string[] = [];
  lines.push("## Export Regression Tests\n");

  for (const tc of tests) {
    lines.push(`### ${tc.name}\n`);
    lines.push(`${tc.description}\n`);

    lines.push("**Project Settings**\n");
    lines.push(
      `- Canvas: ${tc.settings.canvasWidth}x${tc.settings.canvasHeight}`,
    );
    lines.push(`- Duration: ${tc.settings.durationMs}ms`);
    lines.push(`- Frames: ${tc.frameCount}\n`);

    lines.push("**Assets**\n");
    if (tc.assets.length === 0) {
      lines.push("_None_\n");
    } else {
      for (const a of tc.assets) {
        const dur = a.durationMs != null ? `, ${a.durationMs}ms` : "";
        lines.push(`- \`${a.id}\` (${a.kind}${dur}) — ${a.originalPath}`);
      }
      lines.push("");
      // Embed asset previews
      const assetEmbeds: string[] = [];
      for (const a of tc.assets) {
        const relPath = `../app/backend/src/__fixtures__/export/${a.originalPath}`;
        if (a.kind === "image") {
          assetEmbeds.push(`<img src="${relPath}" width="160" title="${a.id} (${a.kind})">`);
        } else if (a.kind === "video" || a.kind === "p5js") {
          assetEmbeds.push(`<video src="${relPath}" width="160" controls muted title="${a.id} (${a.kind})"></video>`);
        } else if (a.kind === "audio") {
          assetEmbeds.push(`<audio src="${relPath}" controls title="${a.id} (${a.kind})"></audio>`);
        }
      }
      if (assetEmbeds.length > 0) {
        lines.push(assetEmbeds.join(" ") + "\n");
      }
    }

    // Embed p5.js sketch source code and generated HTML
    for (const a of tc.assets) {
      if (a.kind === "p5js" && a.originalPath.endsWith(".p5.js")) {
        const sketchPath = path.join(FIXTURES_DIR, a.originalPath);
        try {
          const sketchCode = await readFile(sketchPath, "utf-8");
          lines.push(`**p5.js Sketch** (\`${a.originalPath}\`)\n`);
          lines.push("```javascript");
          lines.push(sketchCode.trim());
          lines.push("```\n");

          // Show the generated HTML template
          const html = buildP5jsHtml(sketchCode, tc.settings.canvasWidth, tc.settings.canvasHeight);
          lines.push("<details>\n<summary><strong>Generated HTML (passed to Chromium for rendering)</strong></summary>\n");
          lines.push("```html");
          lines.push(html.trim());
          lines.push("```\n");
          lines.push("</details>\n");
        } catch {
          // sketch file doesn't exist — skip
        }
      }
    }

    lines.push("**Clip Details**\n");
    lines.push(mdClipTable(tc.sequence));
    lines.push("");

    lines.push("**Timeline**\n");
    lines.push(mdTimeline(tc.sequence));
    lines.push("");

    lines.push("**Filmstrip**\n");
    lines.push(mdFilmstrip(tc));
    lines.push("---\n");
  }

  return lines.join("\n");
}

function generateSnapshotSection(snapshots: Snapshot[]): string {
  const lines: string[] = [];
  lines.push("## Editor Operation Snapshots\n");

  for (const snap of snapshots) {
    lines.push(`### ${snap.name}\n`);

    lines.push("**Clip Details**\n");
    lines.push(mdClipTable(snap.sequence));
    lines.push("");

    lines.push("**Timeline**\n");
    lines.push(mdTimeline(snap.sequence));
    lines.push("");

    lines.push("---\n");
  }

  return lines.join("\n");
}

function generateToc(
  exportTests: ExportTestCase[],
  snapshots: Snapshot[],
): string {
  const lines: string[] = [];
  lines.push("## Table of Contents\n");

  lines.push(`### Export Regression Tests (${exportTests.length})\n`);
  for (const tc of exportTests) {
    const anchor = tc.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    lines.push(`- [${tc.name}](#${anchor}) — ${tc.description}`);
  }
  lines.push("");

  lines.push(`### Editor Operation Snapshots (${snapshots.length})\n`);
  for (const snap of snapshots) {
    const anchor = snap.name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-");
    lines.push(`- [${snap.name}](#${anchor})`);
  }
  lines.push("");

  return lines.join("\n");
}

// ── Main ──

async function main() {
  console.log("Loading export test cases...");
  const exportTests = await Promise.all(
    EXPORT_TESTS.map((def) => buildExportTestCase(def)),
  );
  console.log(`  ${exportTests.length} export tests loaded`);

  console.log("Loading snapshots...");
  const snapText = await Bun.file(SNAP_PATH).text();
  const snapshots = parseSnapshots(snapText);
  console.log(`  ${snapshots.length} snapshots loaded`);

  const parts: string[] = [];
  parts.push("# Feature Catalog — Video Editor\n");
  parts.push(generateToc(exportTests, snapshots));
  parts.push(await generateExportSection(exportTests));
  parts.push(generateSnapshotSection(snapshots));

  const md = parts.join("\n");
  await Bun.write(OUTPUT_PATH, md);
  console.log(`\nGenerated: ${OUTPUT_PATH}`);
  console.log(`  ${exportTests.length} export tests, ${snapshots.length} snapshots`);
  console.log(`  ${md.length} bytes, ${md.split("\n").length} lines`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
