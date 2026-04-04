import { stat } from "node:fs/promises";
import path from "node:path";
import type { Clip, Sequence } from "../../app/shared/src/types/project";
import { theme } from "../../app/frontend/src/theme";
import { listFrames } from "../../app/backend/src/utils/frame-compare";
import { resolveUnder } from "../../app/backend/src/utils/paths";
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
  makeWipeLeftTransitionProject,
  makeWipeUpTransitionProject,
  makeZoomInTransitionProject,
  makePushLeftTransitionProject,
  makeOpacityProject,
  makeMultiplyProject,
  makeScreenProject,
  makeOverlayBlendProject,
  makeAddProject,
  makeDifferenceProject,
  makeP5jsProject,
  makeP5jsTransformProject,
  makeP5jsMultiTrackProject,
  makeP5jsTransitionProject,
  makeP5jsFlowfieldProject,
  makeP5jsFlowfieldMultiTrackProject,
  makeEmptyAssetMixedProject,
  makeSplitClipProject,
  makeMutedTrackProject,
  makeTransitionWithTransformProject,
  makeTransitionMultiTrackProject,
  makeBlendModeTransitionProject,
  makeCropBlendProject,
  makeTitleFontAlignProject,
  makeKeyframeTransformXProject,
  makeSpeed2xProject,
  makeSpeedHalfProject,
  makeSpeedMultiClipProject,
  makeColorCorrectionProject,
  makeColorCorrectionHueProject,
  makeColorCorrectionTransformProject,
  makeVideoFilterBlurSepiaProject,
  makeVideoFilterGrayscaleProject,
  makeVideoFilterTransformProject,
  makeChromaKeyProject,
  makeChromaKeyTransformProject,
  makePipCornerBrProject,
  makePipSideBySideProject,
  makeSpeedTransitionProject,
  makeColorCorrectionVideoFilterProject,
  makeKeyframeColorCorrectionProject,
  makeVideoFilterTransitionProject,
  makeChromaKeyBlendProject,
  makeFeatureShowcaseProject,
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
const CANVAS_ACTUAL_DIR = path.join(
  ROOT,
  "tools/canvas-export-test/.actual",
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
  { name: "transition-wipe-left", description: "Wipe left (300ms)", factory: makeWipeLeftTransitionProject },
  { name: "transition-wipe-up", description: "Wipe up (300ms)", factory: makeWipeUpTransitionProject },
  { name: "transition-zoom-in", description: "Zoom in (300ms)", factory: makeZoomInTransitionProject },
  { name: "transition-push-left", description: "Push left (300ms)", factory: makePushLeftTransitionProject },
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
  { name: "keyframe-transform-x", description: "Keyframe animated transform.x (horizontal movement)", factory: makeKeyframeTransformXProject },
  { name: "speed-2x", description: "Video clip at 2x speed (500ms)", factory: makeSpeed2xProject },
  { name: "speed-half", description: "Video clip at 0.5x speed (2000ms)", factory: makeSpeedHalfProject },
  { name: "speed-multi-clip", description: "Two clips: first at 2x speed, second normal", factory: makeSpeedMultiClipProject },
  { name: "color-correction", description: "Color correction (brightness + contrast + saturation)", factory: makeColorCorrectionProject },
  { name: "color-correction-hue", description: "Color correction (hue rotation 90deg)", factory: makeColorCorrectionHueProject },
  { name: "color-correction-transform", description: "Color correction + transform (cross-feature)", factory: makeColorCorrectionTransformProject },
  { name: "video-filter-blur-sepia", description: "Video filter (blur + sepia)", factory: makeVideoFilterBlurSepiaProject },
  { name: "video-filter-grayscale", description: "Video filter (grayscale)", factory: makeVideoFilterGrayscaleProject },
  { name: "video-filter-transform", description: "Video filter + transform (cross-feature)", factory: makeVideoFilterTransformProject },
  { name: "p5js-rendered", description: "p5.js sketch rendered from source via Chromium pipeline", factory: makeP5jsProject },
  { name: "chroma-key", description: "Chroma key (green screen removal)", factory: makeChromaKeyProject },
  { name: "chroma-key-transform", description: "Chroma key + transform (cross-feature)", factory: makeChromaKeyTransformProject },
  { name: "pip-corner-br", description: "PiP preset: corner bottom-right (0.3x)", factory: makePipCornerBrProject },
  { name: "pip-side-by-side", description: "PiP preset: side-by-side (0.5x)", factory: makePipSideBySideProject },
  { name: "speed-transition", description: "Speed 2x + fade transition (cross-feature)", factory: makeSpeedTransitionProject },
  { name: "color-correction-video-filter", description: "Color correction + sepia video filter stacked", factory: makeColorCorrectionVideoFilterProject },
  { name: "keyframe-color-correction", description: "Keyframe transform.x + color correction (cross-feature)", factory: makeKeyframeColorCorrectionProject },
  { name: "video-filter-transition", description: "Video filter (grayscale) + fade transition (cross-feature)", factory: makeVideoFilterTransitionProject },
  { name: "chroma-key-blend", description: "Chroma key + screen blend mode (cross-feature)", factory: makeChromaKeyBlendProject },
  { name: "p5js-transform", description: "p5.js clip with transform (scale + rotation)", factory: makeP5jsTransformProject },
  { name: "p5js-multi-track", description: "p5.js + video multi-track overlay (opacity blend)", factory: makeP5jsMultiTrackProject },
  { name: "p5js-transition", description: "p5.js with fade transition from video", factory: makeP5jsTransitionProject },
  { name: "p5js-flowfield", description: "Complex p5.js: Perlin-noise flow field with particle trails", factory: makeP5jsFlowfieldProject },
  { name: "p5js-flowfield-multi-track", description: "p5.js flow field + video multi-track (screen blend)", factory: makeP5jsFlowfieldMultiTrackProject },
  { name: "feature-showcase", description: "ALL features: p5js, video, image, audio, transitions, keyframes, speed, color, filters, chroma key, PiP, titles", factory: makeFeatureShowcaseProject },
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
  try {
    return (await listFrames(path.join(REFS_DIR, testName))).length;
  } catch {
    return 0;
  }
}

function buildExportTestCase(def: (typeof EXPORT_TESTS)[number], frameCount: number): ExportTestCase {
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
    frameCount,
  };
}

async function buildAllExportTestCases(): Promise<ExportTestCase[]> {
  const frameCounts = await Promise.all(
    EXPORT_TESTS.map((def) => countFrames(def.name)),
  );
  return EXPORT_TESTS.map((def, i) => buildExportTestCase(def, frameCounts[i]));
}

// ── Parity test mapping (fixture name -> export ref name) ──

const PARITY_FIXTURE_MAP: Array<{
  fixture: string;
  exportRef: string;
  skip?: string;
}> = [
  { fixture: "single-video", exportRef: "single-video" },
  { fixture: "two-clips", exportRef: "two-clips" },
  { fixture: "image-clip", exportRef: "image-clip" },
  { fixture: "text-overlay", exportRef: "text-overlay" },
  { fixture: "title-font-align", exportRef: "title-font-align" },
  { fixture: "crop-transform", exportRef: "crop-transform" },
  { fixture: "multi-track", exportRef: "multi-track" },
  { fixture: "overlay-transform", exportRef: "overlay-transform" },
  { fixture: "transition-fade", exportRef: "transition-fade" },
  { fixture: "transition-fade-black", exportRef: "transition-fade-black" },
  { fixture: "transition-fade-white", exportRef: "transition-fade-white" },
  { fixture: "transition-slide-left", exportRef: "transition-slide-left" },
  { fixture: "transition-slide-right", exportRef: "transition-slide-right" },
  { fixture: "transition-slide-up", exportRef: "transition-slide-up" },
  { fixture: "transition-slide-down", exportRef: "transition-slide-down" },
  { fixture: "transition-wipe-left", exportRef: "transition-wipe-left" },
  { fixture: "transition-wipe-up", exportRef: "transition-wipe-up" },
  { fixture: "transition-zoom-in", exportRef: "transition-zoom-in" },
  { fixture: "transition-push-left", exportRef: "transition-push-left" },
  { fixture: "opacity", exportRef: "blend-opacity" },
  { fixture: "multiply", exportRef: "blend-multiply" },
  { fixture: "screen", exportRef: "blend-screen" },
  { fixture: "overlay-blend", exportRef: "blend-overlay" },
  { fixture: "add", exportRef: "blend-add" },
  { fixture: "difference", exportRef: "blend-difference" },
  { fixture: "transition-with-transform", exportRef: "transition-with-transform" },
  { fixture: "transition-multi-track", exportRef: "transition-multi-track" },
  { fixture: "blend-mode-transition", exportRef: "blend-mode-transition" },
  { fixture: "crop-blend", exportRef: "crop-blend" },
  { fixture: "keyframe-transform-x", exportRef: "keyframe-transform-x" },
  { fixture: "speed-2x", exportRef: "speed-2x" },
  { fixture: "speed-half", exportRef: "speed-half" },
  { fixture: "speed-multi-clip", exportRef: "speed-multi-clip" },
  { fixture: "speed-transition", exportRef: "speed-transition" },
  { fixture: "color-correction", exportRef: "color-correction" },
  { fixture: "color-correction-hue", exportRef: "color-correction-hue" },
  { fixture: "color-correction-transform", exportRef: "color-correction-transform" },
  { fixture: "color-correction-video-filter", exportRef: "color-correction-video-filter" },
  { fixture: "keyframe-color-correction", exportRef: "keyframe-color-correction" },
  { fixture: "video-filter-blur-sepia", exportRef: "video-filter-blur-sepia" },
  { fixture: "video-filter-grayscale", exportRef: "video-filter-grayscale" },
  { fixture: "video-filter-transform", exportRef: "video-filter-transform" },
  { fixture: "video-filter-transition", exportRef: "video-filter-transition" },
  { fixture: "chroma-key", exportRef: "chroma-key" },
  { fixture: "chroma-key-transform", exportRef: "chroma-key-transform" },
  { fixture: "chroma-key-blend", exportRef: "chroma-key-blend" },
  { fixture: "pip-corner-br", exportRef: "pip-corner-br" },
  { fixture: "pip-side-by-side", exportRef: "pip-side-by-side" },
  { fixture: "p5js-transform", exportRef: "p5js-transform" },
  { fixture: "p5js-multi-track", exportRef: "p5js-multi-track" },
  { fixture: "p5js-transition", exportRef: "p5js-transition" },
  { fixture: "p5js-flowfield", exportRef: "p5js-flowfield" },
  { fixture: "p5js-flowfield-multi-track", exportRef: "p5js-flowfield-multi-track" },
  { fixture: "feature-showcase", exportRef: "feature-showcase" },
];

async function countActualFrames(fixtureName: string): Promise<number> {
  try {
    return (await listFrames(path.join(CANVAS_ACTUAL_DIR, fixtureName))).length;
  } catch {
    return 0;
  }
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
  if (clip.speed != null && clip.speed !== 1) {
    props.push(verbose ? `speed: ${clip.speed}x` : `speed=${clip.speed}x`);
  }
  if (clip.chromaKey) {
    const ck = clip.chromaKey;
    props.push(verbose
      ? `chromaKey: color=${ck.color} similarity=${ck.similarity} blend=${ck.blend}`
      : `CK(${ck.color})`);
  }
  return props;
}

/** Property keys that get badge indicators on timeline clips. */
const BADGE_KEYS: Array<{ key: keyof Clip; label: string }> = [
  { key: "transform", label: "T" },
  { key: "crop", label: "C" },
  { key: "volume", label: "V" },
  { key: "text", label: "Tx" },
  { key: "speed", label: "S" },
  { key: "chromaKey", label: "CK" },
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

// ── Shared styles ──

const SHARED_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #FDF6E3; color: #5C6A72;
    padding: 24px; line-height: 1.5;
  }
  h1 { font-size: 22px; margin-bottom: 8px; }
  h2 { font-size: 16px; margin-bottom: 8px; font-weight: 600; }
  a { color: #3A94C5; text-decoration: none; }
  a:hover { text-decoration: underline; }

  .page-desc { font-size: 13px; color: #939F91; margin-bottom: 24px; }
  .breadcrumb { font-size: 13px; color: #939F91; margin-bottom: 16px; }

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

  /* ── Index list ── */
  .case-list { list-style: none; }
  .case-list li {
    border-bottom: 1px solid #EFE9D5; padding: 8px 0;
    display: flex; align-items: center; gap: 12px;
  }
  .case-list li:last-child { border-bottom: none; }
  .case-name { font-weight: 600; font-size: 14px; }
  .case-desc { font-size: 13px; color: #939F91; }
  .case-meta { font-size: 12px; color: #939F91; margin-left: auto; white-space: nowrap; }

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
  .video-wrap {
    display: flex; flex-direction: column; gap: 4px; width: 160px;
  }
  .asset-preview-video {
    width: 160px; height: 90px; background: #000; border-radius: 3px;
    image-rendering: pixelated; display: block;
  }
  .video-controls {
    display: flex; align-items: center; gap: 6px;
  }
  .video-play-btn {
    background: #3A94C5; color: #fff; border: none; border-radius: 3px;
    padding: 2px 10px; cursor: pointer; font-size: 11px;
  }
  .video-play-btn:hover { background: #2E7BA3; }
  .video-time {
    font-size: 11px; color: #939F91; font-variant-numeric: tabular-nums;
    margin-left: auto;
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
`;

const FILMSTRIP_SCRIPT = `
document.querySelectorAll('.filmstrip-player').forEach(player => {
  const frameBase = player.dataset.frameBase;
  const frameCount = parseInt(player.dataset.frameCount);
  let current = 1;
  let intervalId = null;

  const img = player.querySelector('.player-img');
  const counter = player.querySelector('.frame-counter');
  const thumbs = player.querySelectorAll('.thumb');

  function frameSrc(n) {
    return frameBase + String(n).padStart(4, '0') + '.png';
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

document.querySelectorAll('.video-wrap').forEach(wrap => {
  const video = wrap.querySelector('video');
  const btn = wrap.querySelector('.video-play-btn');
  const time = wrap.querySelector('.video-time');
  if (!video || !btn || !time) return;

  function fmt(s) { return isFinite(s) ? s.toFixed(1) : '\u2013'; }
  function updateTime() { time.textContent = fmt(video.currentTime) + ' / ' + fmt(video.duration); }

  video.onloadedmetadata = updateTime;
  video.ontimeupdate = updateTime;
  btn.onclick = () => {
    if (video.paused) {
      video.play();
      btn.textContent = '\u23F8';
    } else {
      video.pause();
      btn.textContent = '\u25B6';
    }
  };
  video.onended = () => { btn.textContent = '\u25B6'; };
});
`;

// ── Section renderers ──

function frameSrc(testName: string, n: number): string {
  return `/frames/${testName}/frame_${String(n).padStart(4, "0")}.png`;
}

function renderAssetPreview(a: ExportTestCase["assets"][number]): string {
  const fileName = path.basename(a.originalPath);
  const src = `/assets/${esc(fileName)}`;
  if (a.kind === "video") {
    return `<div class="video-wrap"><video src="${src}" muted preload="auto" class="asset-preview-video"></video><div class="video-controls"><button class="video-play-btn" data-testid="video-play-btn">\u25B6</button><span class="video-time" data-testid="video-time">0.0 / –</span></div></div>`;
  }
  if (a.kind === "image") {
    return `<img src="${src}" alt="${esc(a.id)}" class="asset-preview-img" loading="lazy">`;
  }
  if (a.kind === "audio") {
    return `<audio src="${src}" controls class="asset-preview-audio"></audio>`;
  }
  return `<span class="asset-preview-unknown">${esc(fileName)}</span>`;
}

function renderExportDetail(tc: ExportTestCase): string {
  const assetRows = tc.assets.map((a) =>
    `<span class="asset-tag" data-testid="asset-tag"><span class="kind-dot" style="background:${clipColor(a.kind)}"></span>${esc(a.id)} (${esc(a.kind)}${a.durationMs != null ? `, ${a.durationMs}ms` : ""})</span>`
  ).join(" ");

  const assetPreviews = tc.assets.map((a) => {
    const fileName = path.basename(a.originalPath);
    return `<div class="asset-preview-item" data-testid="asset-preview" data-asset-id="${esc(a.id)}">
      <div class="asset-preview-label"><span class="kind-dot" style="background:${clipColor(a.kind)}"></span>${esc(a.id)} <span class="asset-preview-file">${esc(fileName)}</span></div>
      ${renderAssetPreview(a)}
    </div>`;
  }).join("");

  let filmstripHtml = "";
  if (tc.frameCount > 0) {
    const thumbs = Array.from({ length: tc.frameCount }, (_, i) =>
      `<img src="${frameSrc(tc.name, i + 1)}" class="thumb" data-testid="frame-thumb" data-index="${i + 1}" alt="frame ${i + 1}" loading="lazy">`
    ).join("");

    filmstripHtml = `<div class="filmstrip-player" data-testid="filmstrip-player" data-test-name="${esc(tc.name)}" data-frame-base="/frames/${esc(tc.name)}/frame_" data-frame-count="${tc.frameCount}">
      <div class="player-display">
        <img class="player-img" data-testid="player-frame" src="${frameSrc(tc.name, 1)}" alt="preview">
        <div class="player-controls">
          <button class="btn-step-back" data-testid="btn-step-back" title="Step back">\u23EE</button>
          <button class="btn-play" data-testid="btn-play" title="Play">\u25B6</button>
          <button class="btn-pause" data-testid="btn-pause" title="Pause">\u23F8</button>
          <button class="btn-step-fwd" data-testid="btn-step-fwd" title="Step forward">\u23ED</button>
          <span class="frame-counter" data-testid="frame-counter">1 / ${tc.frameCount}</span>
        </div>
      </div>
      <div class="filmstrip-thumbs" data-testid="filmstrip-thumbs">${thumbs}</div>
    </div>`;
  } else {
    filmstripHtml = '<p class="no-frames" data-testid="no-frames">No reference frames</p>';
  }

  return `<div class="card export-card" data-testid="export-card" data-test-name="${esc(tc.name)}">
    <div class="export-header">
      <h2>${esc(tc.name)}</h2>
      <span class="export-desc">${esc(tc.description)}</span>
    </div>
    <div class="export-meta" data-testid="export-meta">
      <span class="meta-item">Canvas: ${tc.settings.canvasWidth}x${tc.settings.canvasHeight}</span>
      <span class="meta-item">Duration: ${tc.settings.durationMs}ms</span>
      <span class="meta-item">Frames: ${tc.frameCount}</span>
    </div>
    <div class="export-assets" data-testid="export-assets">Assets: ${assetRows}</div>
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

function renderSnapshotDetail(snap: Snapshot): string {
  return `<div class="card" data-testid="snapshot-card" data-test-name="${esc(snap.name)}">
    <h2>${esc(snap.name)}</h2>
    ${renderTimelineHtml(snap.sequence)}
    ${renderClipTable(snap.sequence)}
  </div>`;
}

// ── Page renderers ──

function wrapPage(title: string, body: string, { script = "" } = {}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} - Feature Catalog</title>
<style>${SHARED_STYLES}</style>
</head>
<body>
${body}
${script ? `<script>${script}</script>` : ""}
</body>
</html>`;
}

function renderIndexPage(
  snapshots: Snapshot[],
  exportTests: ExportTestCase[],
): string {
  const exportRows = exportTests.map((tc) =>
    `<li data-testid="export-item" data-test-name="${esc(tc.name)}">
      <a href="/exports/${esc(tc.name)}" class="case-name">${esc(tc.name)}</a>
      <span class="case-desc">${esc(tc.description)}</span>
      <span class="case-meta">${tc.frameCount} frames</span>
    </li>`
  ).join("\n");

  const snapRows = snapshots.map((s, i) =>
    `<li data-testid="snapshot-item" data-test-name="${esc(s.name)}">
      <a href="/snapshots/${i}" class="case-name">${esc(s.name)}</a>
    </li>`
  ).join("\n");

  return wrapPage("Index", `
<h1>Feature Catalog</h1>
<p class="page-desc">Video editor feature catalog with export examples and editor operation references.</p>

<div class="card" style="background:#F4F0D9;margin-bottom:24px">
  <a href="/parity" style="font-weight:600;font-size:15px">Canvas Export Parity Comparison \u2192</a>
  <span style="font-size:13px;color:#939F91;margin-left:8px">Side-by-side FFmpeg vs Canvas frames</span>
</div>

<div class="section-heading" data-testid="section-exports">Export Features (${exportTests.length})</div>
<div class="card">
  <ul class="case-list" data-testid="export-list">${exportRows}</ul>
</div>

<div class="section-heading" data-testid="section-snapshots">Editor Operations (${snapshots.length})</div>
<div class="card">
  <ul class="case-list" data-testid="snapshot-list">${snapRows}</ul>
</div>
  `);
}

function renderExportPage(tc: ExportTestCase): string {
  return wrapPage(tc.name, `
<div class="breadcrumb"><a href="/">\u2190 Index</a></div>
<h1>Feature: ${esc(tc.name)}</h1>
${renderExportDetail(tc)}
  `, { script: FILMSTRIP_SCRIPT });
}

function renderSnapshotPage(snap: Snapshot): string {
  return wrapPage(snap.name, `
<div class="breadcrumb"><a href="/">\u2190 Index</a></div>
<h1>Snapshot: ${esc(snap.name)}</h1>
${renderSnapshotDetail(snap)}
  `);
}

// ── Parity page renderers ──

const PARITY_STYLES = `
  .parity-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .parity-table th {
    text-align: left; padding: 8px 12px; background: #F4F0D9;
    border-bottom: 2px solid #D4CCAB; font-weight: 600;
  }
  .parity-table td { padding: 8px 12px; border-bottom: 1px solid #EFE9D5; }
  .parity-table tr:hover { background: #FDFAF0; }
  .status-ok { color: #8DA101; font-weight: 600; }
  .status-missing { color: #F85552; font-weight: 600; }
  .status-skip { color: #939F91; font-style: italic; }

  .compare-section { margin-bottom: 32px; }
  .compare-label {
    font-size: 13px; font-weight: 700; margin-bottom: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .compare-label .tag {
    font-size: 11px; font-weight: 400; padding: 1px 6px;
    border-radius: 3px; color: #fff;
  }
  .tag-ffmpeg { background: #E66868; }
  .tag-canvas { background: #3A94C5; }
  .compare-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 16px; margin-bottom: 16px;
  }
  .compare-filmstrip { min-width: 0; }
  .frame-pair {
    display: flex; gap: 4px; overflow-x: auto; padding: 4px 0;
  }
  .frame-pair img {
    width: 128px; height: 72px; object-fit: contain; background: #000;
    border-radius: 2px; image-rendering: pixelated; flex-shrink: 0;
  }
  .frame-number {
    font-size: 10px; color: #939F91; text-align: center;
    margin-top: 2px;
  }
  .frame-slot { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }

  .compare-side-by-side {
    display: flex; gap: 16px; flex-wrap: wrap; margin-top: 12px;
  }
  .compare-frame-pair {
    display: flex; flex-direction: column; gap: 4px;
    border: 1px solid #EFE9D5; border-radius: 6px; padding: 8px;
    background: #fff;
  }
  .compare-frame-pair .pair-row {
    display: flex; gap: 8px; align-items: flex-start;
  }
  .compare-frame-pair img {
    width: 192px; height: 108px; object-fit: contain; background: #000;
    border-radius: 3px; image-rendering: pixelated;
  }
  .compare-frame-pair .missing-frame {
    width: 192px; height: 108px; background: #F4F0D9;
    border-radius: 3px; display: flex; align-items: center;
    justify-content: center; color: #939F91; font-size: 12px;
  }
  .pair-label { font-size: 11px; font-weight: 600; text-align: center; }
`;

const PARITY_FILMSTRIP_SCRIPT = `
document.querySelectorAll('.parity-player').forEach(player => {
  const refBase = player.dataset.refBase;
  const actualBase = player.dataset.actualBase;
  const refCount = parseInt(player.dataset.refCount);
  const actualCount = parseInt(player.dataset.actualCount);
  const maxCount = Math.max(refCount, actualCount);
  let current = 1;
  let intervalId = null;

  const refImg = player.querySelector('.ref-display');
  const actualImg = player.querySelector('.actual-display');
  const counter = player.querySelector('.parity-counter');

  function frameSrc(base, n) {
    return base + String(n).padStart(4, '0') + '.png';
  }

  function show(n) {
    current = n;
    if (n <= refCount) {
      refImg.src = frameSrc(refBase, n);
      refImg.style.display = '';
    } else {
      refImg.style.display = 'none';
    }
    if (n <= actualCount) {
      actualImg.src = frameSrc(actualBase, n);
      actualImg.style.display = '';
    } else {
      actualImg.style.display = 'none';
    }
    counter.textContent = 'Frame ' + n + ' / ' + maxCount;
    player.querySelectorAll('.pair-thumb').forEach((t, i) => {
      t.classList.toggle('active', i + 1 === n);
    });
  }

  player.querySelector('.btn-play').onclick = () => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      show(current >= maxCount ? 1 : current + 1);
    }, 200);
  };
  player.querySelector('.btn-pause').onclick = () => {
    clearInterval(intervalId); intervalId = null;
  };
  player.querySelector('.btn-step-back').onclick = () => {
    clearInterval(intervalId); intervalId = null;
    show(current <= 1 ? maxCount : current - 1);
  };
  player.querySelector('.btn-step-fwd').onclick = () => {
    clearInterval(intervalId); intervalId = null;
    show(current >= maxCount ? 1 : current + 1);
  };

  player.querySelectorAll('.pair-thumb').forEach((thumb, i) => {
    thumb.onclick = () => {
      clearInterval(intervalId); intervalId = null;
      show(i + 1);
    };
  });

  show(1);
});
`;

function renderParityIndexPage(
  parityData: Array<{
    fixture: string;
    exportRef: string;
    skip?: string;
    refFrames: number;
    actualFrames: number;
  }>,
): string {
  const rows = parityData.map((p) => {
    let status: string;
    if (p.skip) {
      status = `<span class="status-skip">skipped: ${esc(p.skip)}</span>`;
    } else if (p.actualFrames > 0 && p.refFrames > 0) {
      status = `<span class="status-ok">ready</span>`;
    } else if (p.refFrames === 0) {
      status = `<span class="status-missing">no FFmpeg refs</span>`;
    } else {
      status = `<span class="status-missing">no Canvas frames (run parity test first)</span>`;
    }

    const link = p.skip
      ? `<span class="case-name" style="color:#939F91">${esc(p.fixture)}</span>`
      : `<a href="/parity/${esc(p.fixture)}" class="case-name">${esc(p.fixture)}</a>`;

    return `<tr>
      <td>${link}</td>
      <td>${p.refFrames}</td>
      <td>${p.actualFrames}</td>
      <td>${status}</td>
    </tr>`;
  }).join("\n");

  const readyCount = parityData.filter((p) => !p.skip && p.actualFrames > 0 && p.refFrames > 0).length;
  const skipCount = parityData.filter((p) => p.skip).length;
  const missingCount = parityData.length - readyCount - skipCount;

  return wrapPage("Canvas Export Parity", `
<div class="breadcrumb"><a href="/">\u2190 Index</a></div>
<h1>Canvas Export Parity</h1>
<p class="page-desc">
  Side-by-side comparison of FFmpeg export reference frames vs Canvas-rendered frames.<br>
  Run <code>bun test tools/canvas-export-test/canvas-export-parity.test.ts</code> to generate Canvas frames.
</p>
<div class="export-meta" style="margin-bottom:16px">
  <span class="meta-item">${readyCount} ready</span>
  <span class="meta-item">${missingCount} missing</span>
  <span class="meta-item">${skipCount} skipped</span>
</div>
<div class="card">
  <table class="parity-table">
    <thead><tr><th>Fixture</th><th>FFmpeg frames</th><th>Canvas frames</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
</div>
  `, { script: "" });
}

function renderParityDetailPage(
  fixture: string,
  exportRef: string,
  refFrameCount: number,
  actualFrameCount: number,
): string {
  const maxFrames = Math.max(refFrameCount, actualFrameCount);

  if (maxFrames === 0) {
    return wrapPage(`Parity: ${fixture}`, `
<div class="breadcrumb"><a href="/parity">\u2190 Parity Index</a></div>
<h1>Parity: ${esc(fixture)}</h1>
<p class="no-frames">No frames available. Run the parity test and ensure FFmpeg references exist.</p>
    `);
  }

  // Build frame-by-frame comparison
  const framePairs = Array.from({ length: maxFrames }, (_, i) => {
    const n = i + 1;
    const nStr = String(n).padStart(4, "0");
    const refSrc = n <= refFrameCount
      ? `/frames/${esc(exportRef)}/frame_${nStr}.png`
      : null;
    const actualSrc = n <= actualFrameCount
      ? `/actual-frames/${esc(fixture)}/frame_${nStr}.png`
      : null;

    const refEl = refSrc
      ? `<img src="${refSrc}" alt="FFmpeg frame ${n}" loading="lazy">`
      : `<div class="missing-frame">N/A</div>`;
    const actualEl = actualSrc
      ? `<img src="${actualSrc}" alt="Canvas frame ${n}" loading="lazy">`
      : `<div class="missing-frame">N/A</div>`;

    return `<div class="compare-frame-pair">
      <div class="pair-label">Frame ${n}</div>
      <div class="pair-row">
        <div style="text-align:center">
          ${refEl}
          <div class="frame-number"><span class="tag tag-ffmpeg">FFmpeg</span></div>
        </div>
        <div style="text-align:center">
          ${actualEl}
          <div class="frame-number"><span class="tag tag-canvas">Canvas</span></div>
        </div>
      </div>
    </div>`;
  }).join("");

  // Build thumbnail strip for interactive player
  const thumbs = Array.from({ length: maxFrames }, (_, i) => {
    const n = i + 1;
    const nStr = String(n).padStart(4, "0");
    const src = n <= refFrameCount
      ? `/frames/${esc(exportRef)}/frame_${nStr}.png`
      : `/actual-frames/${esc(fixture)}/frame_${nStr}.png`;
    return `<img src="${src}" class="thumb pair-thumb" data-index="${n}" alt="frame ${n}" loading="lazy">`;
  }).join("");

  const refDisplaySrc = refFrameCount > 0
    ? `/frames/${esc(exportRef)}/frame_0001.png`
    : "";
  const actualDisplaySrc = actualFrameCount > 0
    ? `/actual-frames/${esc(fixture)}/frame_0001.png`
    : "";

  return wrapPage(`Parity: ${fixture}`, `
<style>${PARITY_STYLES}</style>
<div class="breadcrumb"><a href="/parity">\u2190 Parity Index</a></div>
<h1>Parity: ${esc(fixture)}</h1>
<div class="export-meta" style="margin-bottom:16px">
  <span class="meta-item">Export ref: ${esc(exportRef)}</span>
  <span class="meta-item">FFmpeg frames: ${refFrameCount}</span>
  <span class="meta-item">Canvas frames: ${actualFrameCount}</span>
</div>

<div class="card">
  <h2>Interactive Player</h2>
  <div class="parity-player"
    data-ref-base="/frames/${esc(exportRef)}/frame_"
    data-actual-base="/actual-frames/${esc(fixture)}/frame_"
    data-ref-count="${refFrameCount}"
    data-actual-count="${actualFrameCount}">
    <div class="compare-grid">
      <div>
        <div class="compare-label"><span class="tag tag-ffmpeg">FFmpeg</span> Reference</div>
        <img class="player-img ref-display" src="${esc(refDisplaySrc)}" alt="FFmpeg frame"
             style="${refFrameCount === 0 ? "display:none" : ""}">
      </div>
      <div>
        <div class="compare-label"><span class="tag tag-canvas">Canvas</span> Actual</div>
        <img class="player-img actual-display" src="${esc(actualDisplaySrc)}" alt="Canvas frame"
             style="${actualFrameCount === 0 ? "display:none" : ""}">
      </div>
    </div>
    <div class="player-controls" style="flex-direction:row; gap:8px; margin-bottom:8px">
      <button class="btn-step-back" title="Step back">\u23EE</button>
      <button class="btn-play" title="Play">\u25B6</button>
      <button class="btn-pause" title="Pause">\u23F8</button>
      <button class="btn-step-fwd" title="Step forward">\u23ED</button>
      <span class="parity-counter frame-counter">Frame 1 / ${maxFrames}</span>
    </div>
    <div class="filmstrip-thumbs">${thumbs}</div>
  </div>
</div>

<div class="card">
  <h2>All Frames Side by Side</h2>
  <div class="compare-side-by-side">
    ${framePairs}
  </div>
</div>
  `, { script: PARITY_FILMSTRIP_SCRIPT });
}

// ── Data loaders with mtime cache ──

let snapCache: { mtimeMs: number; data: Snapshot[] } | null = null;

async function loadSnapshots(): Promise<Snapshot[]> {
  const { mtimeMs } = await stat(SNAP_PATH);
  if (snapCache && snapCache.mtimeMs === mtimeMs) return snapCache.data;
  const snapText = await Bun.file(SNAP_PATH).text();
  const data = parseSnapshots(snapText);
  snapCache = { mtimeMs, data };
  return data;
}

let exportCache: { mtimeMs: number; data: ExportTestCase[] } | null = null;

async function loadExportTests(): Promise<ExportTestCase[]> {
  // Use max mtime across all per-test subdirectories so frame additions invalidate the cache
  const mtimes = await Promise.all(
    EXPORT_TESTS.map(async (def) => {
      try { return (await stat(path.join(REFS_DIR, def.name))).mtimeMs; }
      catch { return 0; }
    }),
  );
  const mtimeMs = Math.max(0, ...mtimes);
  if (exportCache && exportCache.mtimeMs === mtimeMs) return exportCache.data;
  const data = await buildAllExportTestCases();
  exportCache = { mtimeMs, data };
  return data;
}


function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

// ── Server ──

const PORT = parseInt(process.env.PORT || "3001", 10);

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    // ── Index ──
    if (url.pathname === "/") {
      const [snapshots, exportTests] = await Promise.all([
        loadSnapshots(),
        loadExportTests(),
      ]);
      return htmlResponse(renderIndexPage(snapshots, exportTests));
    }

    // ── Export detail: /exports/:name ──
    const exportMatch = url.pathname.match(/^\/exports\/([^/]+)$/);
    if (exportMatch) {
      const name = decodeURIComponent(exportMatch[1]);
      const exportTests = await loadExportTests();
      const tc = exportTests.find((t) => t.name === name);
      if (!tc) return new Response("Not Found", { status: 404 });
      return htmlResponse(renderExportPage(tc));
    }

    // ── Parity index: /parity ──
    if (url.pathname === "/parity") {
      const parityData = await Promise.all(
        PARITY_FIXTURE_MAP.map(async (p) => ({
          fixture: p.fixture,
          exportRef: p.exportRef,
          skip: p.skip,
          refFrames: await countFrames(p.exportRef),
          actualFrames: await countActualFrames(p.fixture),
        })),
      );
      return htmlResponse(renderParityIndexPage(parityData));
    }

    // ── Parity detail: /parity/:fixture ──
    const parityMatch = url.pathname.match(/^\/parity\/([^/]+)$/);
    if (parityMatch) {
      const fixture = decodeURIComponent(parityMatch[1]);
      const mapping = PARITY_FIXTURE_MAP.find((p) => p.fixture === fixture);
      if (!mapping) return new Response("Not Found", { status: 404 });
      const [refFrameCount, actualFrameCount] = await Promise.all([
        countFrames(mapping.exportRef),
        countActualFrames(mapping.fixture),
      ]);
      return htmlResponse(
        renderParityDetailPage(fixture, mapping.exportRef, refFrameCount, actualFrameCount),
      );
    }

    // ── Snapshot detail: /snapshots/:index ──
    const snapMatch = url.pathname.match(/^\/snapshots\/(\d+)$/);
    if (snapMatch) {
      const index = parseInt(snapMatch[1], 10);
      const snapshots = await loadSnapshots();
      const snap = snapshots[index];
      if (!snap) return new Response("Not Found", { status: 404 });
      return htmlResponse(renderSnapshotPage(snap));
    }

    // ── API (JSON) ──
    if (url.pathname === "/api/snapshots") {
      const snapshots = await loadSnapshots();
      return Response.json(
        snapshots.map((s) => ({ name: s.name, sequence: s.sequence })),
      );
    }

    if (url.pathname === "/api/exports") {
      const exportTests = await loadExportTests();
      return Response.json(exportTests);
    }

    // ── Static: /assets/:file ──
    if (url.pathname.startsWith("/assets/")) {
      const fileName = url.pathname.slice("/assets/".length);
      const resolved = resolveUnder(ASSETS_DIR, fileName);
      if (!resolved) return new Response("Forbidden", { status: 403 });
      try {
        const file = Bun.file(resolved);
        return new Response(file, {
          headers: { "content-type": file.type || "application/octet-stream" },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }

    // ── Static: /frames/:testName/:file ──
    if (url.pathname.startsWith("/frames/")) {
      const rest = url.pathname.slice("/frames/".length);
      const slashIdx = rest.indexOf("/");
      if (slashIdx === -1) return new Response("Not Found", { status: 404 });
      const testName = rest.slice(0, slashIdx);
      const fileName = rest.slice(slashIdx + 1);
      const resolved = resolveUnder(REFS_DIR, testName, fileName);
      if (!resolved) return new Response("Forbidden", { status: 403 });
      try {
        return new Response(Bun.file(resolved), {
          headers: { "content-type": "image/png" },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }

    // ── Static: /actual-frames/:fixtureName/:file ──
    if (url.pathname.startsWith("/actual-frames/")) {
      const rest = url.pathname.slice("/actual-frames/".length);
      const slashIdx = rest.indexOf("/");
      if (slashIdx === -1) return new Response("Not Found", { status: 404 });
      const fixtureName = rest.slice(0, slashIdx);
      const fileName = rest.slice(slashIdx + 1);
      const resolved = resolveUnder(CANVAS_ACTUAL_DIR, fixtureName, fileName);
      if (!resolved) return new Response("Forbidden", { status: 403 });
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
