import { readdir } from "node:fs/promises";
import path from "node:path";
import type { Clip, Sequence } from "../../app/shared/src/types/project";
import { theme } from "../../app/frontend/src/theme";
import {
  makeSingleVideoProject,
  makeTwoClipProject,
  makeImageClipProject,
  makeTextOverlayProject,
  makeCropTransformProject,
  makeMultiTrackProject,
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
const ASSETS_DIR = path.join(
  ROOT,
  "app/backend/src/__fixtures__/export/assets",
);

// ── Constants (derived from theme) ──

const CLIP_COLORS: Record<string, string> = {
  video: theme.clipVideo,
  audio: theme.clipAudio,
  image: theme.clipImage,
  title: theme.clipText,
};

const FALLBACK_COLOR = "#999";

const CLIP_LABELS: Record<string, string> = {
  video: "V",
  audio: "A",
  image: "I",
  title: "T",
};

// ── Types ──

type Snapshot = { name: string; sequence: Sequence };

type ExportTestCase = {
  name: string;
  description: string;
  sequence: Sequence;
  assets: Array<{ id: string; kind: string; originalPath: string; durationMs?: number }>;
  settings: { durationMs: number; canvasWidth: number; canvasHeight: number };
  frameCount: number;
};

// ── Export test case definitions ──

const EXPORT_TESTS: Array<{
  name: string;
  description: string;
  factory: () => ReturnType<typeof makeSingleVideoProject>;
}> = [
  { name: "single-video", description: "1秒の動画クリップ1つ", factory: makeSingleVideoProject },
  { name: "two-clips", description: "2つの連続動画クリップ (0-1s, 1-2s)", factory: makeTwoClipProject },
  { name: "image-clip", description: "画像クリップ1枚を1秒間表示", factory: makeImageClipProject },
  { name: "text-overlay", description: "動画上にテキストオーバーレイ", factory: makeTextOverlayProject },
  { name: "crop-transform", description: "クロップ・トランスフォーム付き動画", factory: makeCropTransformProject },
  { name: "multi-track", description: "2トラック合成 (動画+画像)", factory: makeMultiTrackProject },
];

// ── Snap parser ──

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

// ── Reference frame scanner ──

async function countFrames(testName: string): Promise<number> {
  const dir = path.join(REFS_DIR, testName);
  try {
    const entries = await readdir(dir);
    return entries.filter((f) => f.startsWith("frame_") && f.endsWith(".png")).length;
  } catch {
    return 0;
  }
}

async function buildExportTestCases(): Promise<ExportTestCase[]> {
  const frameCounts = await Promise.all(
    EXPORT_TESTS.map((def) => countFrames(def.name)),
  );
  return EXPORT_TESTS.map((def, i) => {
    const project = def.factory();
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
      frameCount: frameCounts[i],
    };
  });
}

// ── Clip property helpers ──

const esc = Bun.escapeHTML;

function clipColor(kind: string): string {
  return CLIP_COLORS[kind] ?? FALLBACK_COLOR;
}

function clipLabel(clip: Clip): string {
  if (clip.clipKind === "title" && clip.text) {
    return `T: &quot;${esc(clip.text.value)}&quot;`;
  }
  const label = CLIP_LABELS[clip.clipKind] ?? clip.clipKind;
  return clip.assetId ? `${label}: ${esc(clip.assetId)}` : label;
}

/** Collect optional clip properties as key-value descriptions. */
function collectClipProps(clip: Clip, verbose: boolean): string[] {
  const props: string[] = [];
  if (clip.volume != null) {
    props.push(verbose ? `volume: ${clip.volume}` : `vol=${clip.volume}`);
  }
  if (clip.transform) {
    const t = clip.transform;
    props.push(verbose
      ? `transform: x=${t.x} y=${t.y} scale=${t.scale} rotation=${t.rotation}`
      : `transform(${t.x},${t.y},${t.scale},${t.rotation}°)`);
  }
  if (clip.crop) {
    const c = clip.crop;
    props.push(verbose
      ? `crop: x=${c.x} y=${c.y} w=${c.width} h=${c.height}`
      : `crop(${c.x},${c.y},${c.width}x${c.height})`);
  }
  if (clip.text) {
    if (verbose) {
      props.push(`text: "${clip.text.value}" (${clip.text.fontSize}px, ${clip.text.color})`);
      if (clip.text.backgroundColor) props.push(`  bg: ${clip.text.backgroundColor}`);
    } else {
      props.push(`"${esc(clip.text.value)}"`);
    }
  }
  if (clip.blendMode) {
    props.push(verbose ? `blend: ${clip.blendMode}` : `blend=${clip.blendMode}`);
  }
  return props;
}

/** Property keys that get badge indicators on timeline clips. */
const BADGE_KEYS: Array<{ key: keyof Clip; label: string }> = [
  { key: "transform", label: "T" },
  { key: "crop", label: "C" },
  { key: "volume", label: "V" },
  { key: "text", label: "Tx" },
];

function clipBadges(clip: Clip): string {
  return BADGE_KEYS
    .filter((b) => clip[b.key] != null)
    .map((b) => `<span class="badge">${b.label}</span>`)
    .join("");
}

function clipTooltip(clip: Clip): string {
  const lines = [
    `${clip.clipKind} (${clip.id})`,
    `asset: ${clip.assetId || "(none)"}`,
    `start: ${clip.startMs}ms  duration: ${clip.durationMs}ms`,
    `in: ${clip.inMs}ms  out: ${clip.outMs}ms`,
    ...collectClipProps(clip, true),
  ];
  return esc(lines.join("\n"));
}

// ── HTML renderers ──

function renderTimelineHtml(seq: Sequence, timelineWidth = 800): string {
  let maxMs = 0;
  for (const track of seq.tracks) {
    for (const clip of track.clips) {
      maxMs = Math.max(maxMs, clip.startMs + clip.durationMs);
    }
  }
  if (maxMs === 0) maxMs = 1000;

  const scale = timelineWidth / maxMs;
  const TRACK_H = 40;
  const RULER_H = 24;

  const tickInterval = maxMs <= 3000 ? 500 : maxMs <= 10000 ? 1000 : 2000;
  let rulerHtml = "";
  for (let t = 0; t <= maxMs; t += tickInterval) {
    const x = t * scale;
    rulerHtml += `<div class="tick" style="left:${x}px"><span>${t / 1000}s</span></div>`;
  }

  let tracksHtml = "";
  for (const track of seq.tracks) {
    let clipsHtml = "";
    for (const clip of track.clips) {
      const left = clip.startMs * scale;
      const width = Math.max(clip.durationMs * scale, 2);
      const color = clipColor(clip.clipKind);
      const label = clipLabel(clip);
      const tooltip = clipTooltip(clip);
      const badges = clipBadges(clip);

      clipsHtml += `<div class="clip" style="left:${left}px;width:${width}px;background:${color}" title="${tooltip}">
        <span class="clip-label">${label}</span>${badges}
      </div>`;
    }

    tracksHtml += `<div class="track-row">
      <div class="track-label">${esc(track.id)}</div>
      <div class="track-clips" style="width:${timelineWidth}px;height:${TRACK_H}px">${clipsHtml}</div>
    </div>`;
  }

  return `<div class="timeline">
    <div class="ruler" style="width:${timelineWidth}px;height:${RULER_H}px">${rulerHtml}</div>
    ${tracksHtml}
  </div>`;
}

function renderClipTable(seq: Sequence): string {
  let html = '<table class="clip-details"><thead><tr><th>Track</th><th>Clip</th><th>Kind</th><th>Asset</th><th>Start</th><th>Duration</th><th>In/Out</th><th>Props</th></tr></thead><tbody>';
  for (const track of seq.tracks) {
    for (const clip of track.clips) {
      const props = collectClipProps(clip, false);
      html += `<tr>
        <td>${esc(track.id)}</td>
        <td>${esc(clip.id)}</td>
        <td><span class="kind-dot" style="background:${clipColor(clip.clipKind)}"></span>${esc(clip.clipKind)}</td>
        <td>${esc(clip.assetId || "-")}</td>
        <td>${clip.startMs}ms</td>
        <td>${clip.durationMs}ms</td>
        <td>${clip.inMs}\u2013${clip.outMs}ms</td>
        <td>${props.length > 0 ? esc(props.join(", ")) : "-"}</td>
      </tr>`;
    }
  }
  html += "</tbody></table>";
  return html;
}

// ── Section renderers ──

function renderSnapshotSection(snap: Snapshot): string {
  return `<div class="card">
    <h2>${esc(snap.name)}</h2>
    ${renderTimelineHtml(snap.sequence)}
    ${renderClipTable(snap.sequence)}
  </div>`;
}

function frameSrc(testName: string, n: number): string {
  return `/frames/${testName}/frame_${String(n).padStart(4, "0")}.png`;
}

function renderAssetPreview(a: ExportTestCase["assets"][number]): string {
  const fileName = path.basename(a.originalPath);
  const src = `/assets/${esc(fileName)}`;
  if (a.kind === "video") {
    return `<video src="${src}" controls muted class="asset-preview-video"></video>`;
  }
  if (a.kind === "image") {
    return `<img src="${src}" alt="${esc(a.id)}" class="asset-preview-img">`;
  }
  if (a.kind === "audio") {
    return `<audio src="${src}" controls class="asset-preview-audio"></audio>`;
  }
  return `<span class="asset-preview-unknown">${esc(fileName)}</span>`;
}

function renderExportSection(tc: ExportTestCase): string {
  const assetRows = tc.assets.map((a) =>
    `<span class="asset-tag"><span class="kind-dot" style="background:${clipColor(a.kind)}"></span>${esc(a.id)} (${esc(a.kind)}${a.durationMs != null ? `, ${a.durationMs}ms` : ""})</span>`
  ).join(" ");

  const assetPreviews = tc.assets.map((a) => {
    const fileName = path.basename(a.originalPath);
    return `<div class="asset-preview-item">
      <div class="asset-preview-label"><span class="kind-dot" style="background:${clipColor(a.kind)}"></span>${esc(a.id)} <span class="asset-preview-file">${esc(fileName)}</span></div>
      ${renderAssetPreview(a)}
    </div>`;
  }).join("");

  let filmstripHtml = "";
  if (tc.frameCount > 0) {
    const thumbs = Array.from({ length: tc.frameCount }, (_, i) =>
      `<img src="${frameSrc(tc.name, i + 1)}" class="thumb" data-index="${i + 1}" alt="frame ${i + 1}">`
    ).join("");

    filmstripHtml = `<div class="filmstrip-player" data-test-name="${esc(tc.name)}" data-frame-count="${tc.frameCount}">
      <div class="player-display">
        <img class="player-img" src="${frameSrc(tc.name, 1)}" alt="preview">
        <div class="player-controls">
          <button class="btn-step-back" title="Step back">\u23EE</button>
          <button class="btn-play" title="Play">\u25B6</button>
          <button class="btn-pause" title="Pause">\u23F8</button>
          <button class="btn-step-fwd" title="Step forward">\u23ED</button>
          <span class="frame-counter">1 / ${tc.frameCount}</span>
        </div>
      </div>
      <div class="filmstrip-thumbs">${thumbs}</div>
    </div>`;
  } else {
    filmstripHtml = '<p class="no-frames">\u53C2\u7167\u30D5\u30EC\u30FC\u30E0\u306A\u3057</p>';
  }

  return `<div class="card export-card">
    <div class="export-header">
      <h2>${esc(tc.name)}</h2>
      <span class="export-desc">${esc(tc.description)}</span>
    </div>
    <div class="export-meta">
      <span class="meta-item">Canvas: ${tc.settings.canvasWidth}x${tc.settings.canvasHeight}</span>
      <span class="meta-item">Duration: ${tc.settings.durationMs}ms</span>
      <span class="meta-item">Frames: ${tc.frameCount}</span>
    </div>
    <div class="export-assets">Assets: ${assetRows}</div>
    ${renderTimelineHtml(tc.sequence)}
    ${renderClipTable(tc.sequence)}
    <div class="export-bottom">
      <div class="asset-previews">${assetPreviews}</div>
      <div class="export-preview">
        ${filmstripHtml}
      </div>
    </div>
  </div>`;
}

// ── Page ──

function renderPage(
  snapshots: Snapshot[],
  exportTests: ExportTestCase[],
): string {
  const snapshotSections = snapshots.map(renderSnapshotSection).join("\n");
  const exportSections = exportTests.map(renderExportSection).join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Regression Test Viewer</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #FDF6E3; color: #5C6A72;
    padding: 24px; line-height: 1.5;
  }
  h1 { font-size: 22px; margin-bottom: 8px; }
  h2 { font-size: 16px; margin-bottom: 8px; font-weight: 600; }

  .page-desc { font-size: 13px; color: #939F91; margin-bottom: 24px; }

  .section-heading {
    font-size: 18px; font-weight: 700; margin: 32px 0 16px;
    padding-bottom: 8px; border-bottom: 2px solid #D4CCAB;
  }

  .card {
    background: #fff; border: 1px solid #D4CCAB; border-radius: 8px;
    padding: 16px; margin-bottom: 20px;
  }

  /* ── Timeline ── */
  .timeline { overflow-x: auto; margin-bottom: 12px; }
  .ruler {
    position: relative; border-bottom: 1px solid #D4CCAB;
    margin-left: 80px; margin-bottom: 4px;
  }
  .tick {
    position: absolute; top: 0; bottom: 0; border-left: 1px solid #E5DFC9;
  }
  .tick span {
    position: absolute; top: 2px; left: 4px; font-size: 10px; color: #939F91; white-space: nowrap;
  }
  .track-row { display: flex; align-items: stretch; margin-bottom: 2px; }
  .track-label {
    width: 80px; flex-shrink: 0; font-size: 11px; color: #939F91;
    display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;
  }
  .track-clips { position: relative; background: #F4F0D9; border-radius: 4px; }
  .clip {
    position: absolute; top: 4px; bottom: 4px; border-radius: 3px;
    display: flex; align-items: center; gap: 4px; padding: 0 6px;
    color: #fff; font-size: 11px; overflow: hidden; white-space: nowrap;
    cursor: default; transition: filter 0.1s;
  }
  .clip:hover { filter: brightness(1.15); }
  .clip-label { overflow: hidden; text-overflow: ellipsis; }
  .badge {
    background: rgba(255,255,255,0.3); border-radius: 2px;
    padding: 0 3px; font-size: 9px; flex-shrink: 0;
  }

  /* ── Details table ── */
  .clip-details {
    width: 100%; border-collapse: collapse; font-size: 12px;
  }
  .clip-details th {
    text-align: left; padding: 4px 8px; background: #F4F0D9;
    border-bottom: 1px solid #D4CCAB; font-weight: 600; font-size: 11px;
  }
  .clip-details td {
    padding: 4px 8px; border-bottom: 1px solid #EFE9D5;
  }
  .kind-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    margin-right: 4px; vertical-align: middle;
  }

  /* ── Export section ── */
  .export-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
  .export-desc { font-size: 13px; color: #939F91; }
  .export-meta {
    display: flex; gap: 16px; margin-bottom: 8px;
    font-size: 12px; color: #939F91;
  }
  .meta-item {
    background: #F4F0D9; padding: 2px 8px; border-radius: 3px;
  }
  .export-assets {
    font-size: 12px; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  }
  .asset-tag {
    background: #F4F0D9; padding: 2px 8px; border-radius: 3px;
    display: inline-flex; align-items: center; gap: 4px;
  }
  /* ── Export bottom (assets + frames side by side) ── */
  .export-bottom {
    display: flex; gap: 16px; margin-top: 12px;
    align-items: flex-start; flex-wrap: wrap;
  }
  .asset-previews {
    display: flex; gap: 8px; flex-direction: column;
  }
  .asset-preview-item {
    background: #F4F0D9; border-radius: 4px; padding: 8px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .asset-preview-label {
    font-size: 11px; font-weight: 600;
    display: flex; align-items: center; gap: 4px;
  }
  .asset-preview-file { color: #939F91; font-weight: 400; }
  .asset-preview-video {
    width: 160px; height: 90px; background: #000; border-radius: 3px;
    image-rendering: pixelated;
  }
  .asset-preview-img {
    width: 160px; height: 90px; object-fit: contain; background: #000;
    border-radius: 3px; image-rendering: pixelated;
  }
  .asset-preview-audio { width: 200px; height: 32px; }
  .asset-preview-unknown { font-size: 12px; color: #939F91; }

  .export-preview { min-width: 0; flex: 1; }
  .no-frames { color: #939F91; font-size: 13px; font-style: italic; }

  /* ── Filmstrip ── */
  .player-display { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px; }
  .player-img {
    width: 320px; height: 180px; object-fit: contain; background: #000;
    border: 1px solid #D4CCAB; border-radius: 4px; image-rendering: pixelated;
  }
  .player-controls {
    display: flex; flex-direction: column; gap: 6px; align-items: flex-start;
  }
  .player-controls button {
    background: #3A94C5; color: #fff; border: none; border-radius: 4px;
    padding: 6px 14px; cursor: pointer; font-size: 14px; min-width: 48px;
  }
  .player-controls button:hover { background: #2E7BA3; }
  .frame-counter { font-size: 13px; font-variant-numeric: tabular-nums; margin-top: 4px; }
  .filmstrip-thumbs {
    display: flex; gap: 2px; overflow-x: auto; padding: 4px 0;
  }
  .thumb {
    width: 64px; height: 36px; object-fit: contain; cursor: pointer;
    border: 2px solid transparent; border-radius: 2px; image-rendering: pixelated;
    flex-shrink: 0; background: #000;
  }
  .thumb:hover { border-color: #3A94C5; }
  .thumb.active { border-color: #F85552; }
</style>
</head>
<body>
<h1>Regression Test Viewer</h1>
<p class="page-desc">\u30A8\u30C7\u30A3\u30BF\u64CD\u4F5C\u306E\u30B9\u30CA\u30C3\u30D7\u30B7\u30E7\u30C3\u30C8\u30C6\u30B9\u30C8\u3068\u3001\u30A8\u30AF\u30B9\u30DD\u30FC\u30C8\u30EA\u30B0\u30EC\u30C3\u30B7\u30E7\u30F3\u30C6\u30B9\u30C8\u306E\u30D7\u30ED\u30B8\u30A7\u30AF\u30C8\u30FB\u53C2\u7167\u30D5\u30EC\u30FC\u30E0\u3092\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002</p>

<div class="section-heading">Export Regression Tests</div>
${exportSections}

<div class="section-heading">Editor Operation Snapshots</div>
${snapshotSections}

<script>
document.querySelectorAll('.filmstrip-player').forEach(player => {
  const testName = player.dataset.testName;
  const frameCount = parseInt(player.dataset.frameCount);
  let current = 1;
  let intervalId = null;

  const img = player.querySelector('.player-img');
  const counter = player.querySelector('.frame-counter');
  const thumbs = player.querySelectorAll('.thumb');

  function frameSrc(n) {
    return '/frames/' + testName + '/frame_' + String(n).padStart(4, '0') + '.png';
  }

  function show(n) {
    current = n;
    img.src = frameSrc(n);
    counter.textContent = n + ' / ' + frameCount;
    thumbs.forEach((t, i) => t.classList.toggle('active', i + 1 === n));
  }

  player.querySelector('.btn-play').onclick = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      show(current >= frameCount ? 1 : current + 1);
    }, 100);
  };

  player.querySelector('.btn-pause').onclick = () => {
    clearInterval(intervalId);
    intervalId = null;
  };

  player.querySelector('.btn-step-back').onclick = () => {
    clearInterval(intervalId); intervalId = null;
    show(current <= 1 ? frameCount : current - 1);
  };

  player.querySelector('.btn-step-fwd').onclick = () => {
    clearInterval(intervalId); intervalId = null;
    show(current >= frameCount ? 1 : current + 1);
  };

  thumbs.forEach((thumb, i) => {
    thumb.onclick = () => {
      clearInterval(intervalId); intervalId = null;
      show(i + 1);
    };
  });

  show(1);
});
</script>
</body>
</html>`;
}

// ── Server ──

const PORT = parseInt(process.env.PORT || "3001", 10);

const snapText = await Bun.file(SNAP_PATH).text();
const snapshots = parseSnapshots(snapText);
const exportTests = await buildExportTestCases();

console.log(`Parsed ${snapshots.length} snapshots, ${exportTests.length} export test cases`);

const html = renderPage(snapshots, exportTests);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(html, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }

    if (url.pathname === "/api/snapshots") {
      return Response.json(
        snapshots.map((s) => ({ name: s.name, sequence: s.sequence })),
      );
    }

    if (url.pathname === "/api/exports") {
      return Response.json(
        exportTests.map((t) => ({
          name: t.name,
          description: t.description,
          sequence: t.sequence,
          assets: t.assets,
          settings: t.settings,
          frameCount: t.frameCount,
        })),
      );
    }

    if (url.pathname.startsWith("/assets/")) {
      const fileName = url.pathname.slice("/assets/".length);
      const resolved = path.resolve(ASSETS_DIR, fileName);
      if (!resolved.startsWith(ASSETS_DIR + path.sep)) {
        return new Response("Forbidden", { status: 403 });
      }
      const file = Bun.file(resolved);
      if (!(await file.exists())) {
        return new Response("Not Found", { status: 404 });
      }
      return new Response(file, {
        headers: { "content-type": file.type || "application/octet-stream" },
      });
    }

    if (url.pathname.startsWith("/frames/")) {
      const rest = url.pathname.slice("/frames/".length);
      const slashIdx = rest.indexOf("/");
      if (slashIdx === -1) return new Response("Not Found", { status: 404 });
      const testName = rest.slice(0, slashIdx);
      const fileName = rest.slice(slashIdx + 1);
      const resolved = path.resolve(REFS_DIR, testName, fileName);
      if (!resolved.startsWith(REFS_DIR + path.sep)) {
        return new Response("Forbidden", { status: 403 });
      }
      try {
        return new Response(Bun.file(resolved), {
          headers: { "content-type": "image/png" },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Regression viewer: http://localhost:${PORT}`);
