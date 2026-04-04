import type { Project, Clip, ClipText, ClipChromaKey, VideoFilter } from "@video/shared";
import { getAnimatedValue, hasKeyframes } from "@video/shared";
import {
  findAllActiveClips,
  findAllActiveEmptyClips,
  type ActiveClip,
  type ActiveEmptyClip,
} from "./preview-renderer-registry";
import { buildColorCorrectionFilter } from "./color-correction-css";
import { buildVideoFilterCss } from "./video-filter-css";
import { transitionPreviewRegistry } from "./transition-preview-registry";

// ── Types ──

/** Map from assetId to a drawable source (video element, image, canvas, etc.). */
export type FrameSources = Map<string, CanvasImageSource>;

/** Parsed transition effect values for canvas operations. */
export type ParsedTransitionEffect = {
  opacity?: number;
  translateX?: number; // percentage of canvas width (-100 to 100)
  translateY?: number; // percentage of canvas height (-100 to 100)
  scale?: number;
  clipInset?: { top: number; right: number; bottom: number; left: number }; // percentages
  filter?: string;
  whiteBlend?: number; // 0=no blend, 1=full white (for fade-white transition)
};

// ── WebGL Shaders (reused from ChromaKeyOverlay) ──

const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D u_texture;
uniform vec3 u_keyColor;
uniform float u_similarity;
uniform float u_blend;
varying vec2 v_texCoord;

void main() {
  vec4 color = texture2D(u_texture, v_texCoord);
  float dist = distance(color.rgb, u_keyColor);
  float alpha = smoothstep(u_similarity, u_similarity + u_blend, dist);
  gl_FragColor = vec4(color.rgb, color.a * alpha);
}
`;

// ── Helpers ──

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/** Map CSS blend mode identifiers to Canvas2D globalCompositeOperation values. */
function blendModeToCompositeOp(blendMode: string): GlobalCompositeOperation {
  switch (blendMode) {
    case "multiply":
      return "multiply";
    case "screen":
      return "screen";
    case "overlay":
      return "overlay";
    case "add":
      return "lighter";
    case "difference":
      return "difference";
    case "opacity":
      return "source-over"; // opacity is handled via globalAlpha
    case "cover":
    default:
      return "source-over";
  }
}

/** Get a video filter strength, or 0 if absent. */
function getFilterStrength(filters: VideoFilter[] | undefined, type: string): number {
  if (!filters) return 0;
  const f = filters.find((v) => v.type === type);
  return f && f.strength > 0 ? f.strength : 0;
}

const NOISE_SIZE = 64;

/** Find the next clip on the same track that has a transition overlapping this clip. */
function findNextTransitionClip(clip: Clip, project: Project): Clip | null {
  const clipEnd = clip.startMs + clip.durationMs;
  for (const track of project.sequence.tracks) {
    const idx = track.clips.findIndex((c) => c.id === clip.id);
    if (idx < 0) continue;
    for (let i = idx + 1; i < track.clips.length; i++) {
      const next = track.clips[i];
      if (!next.transition) continue;
      if (next.startMs < clipEnd && next.startMs > clip.startMs) return next;
    }
    break;
  }
  return null;
}

/** Compute transition progress (0..1) for a clip's fade-in. Returns -1 if not in transition. */
function incomingProgress(clip: Clip, currentTimeMs: number): number {
  if (!clip.transition) return -1;
  const elapsed = currentTimeMs - clip.startMs;
  if (elapsed >= clip.transition.durationMs) return -1;
  return Math.max(0, Math.min(1, elapsed / clip.transition.durationMs));
}

/** Compute outgoing transition info. Returns null if not in transition. */
function outgoingTransition(
  clip: Clip,
  project: Project,
  currentTimeMs: number,
): { progress: number; next: Clip } | null {
  const next = findNextTransitionClip(clip, project);
  if (!next) return null;
  const fadeOutStart = next.startMs;
  if (currentTimeMs < fadeOutStart) return null;
  const progress = Math.max(0, Math.min(1, (currentTimeMs - fadeOutStart) / next.transition!.durationMs));
  return { progress, next };
}

/**
 * Parse CSS transition style properties into canvas-usable numeric values.
 *
 * Transition handlers return CSSProperties objects (opacity, transform, clipPath, filter).
 * This function extracts those into structured numeric values for canvas rendering.
 */
export function parseTransitionStyle(style: Record<string, unknown>): ParsedTransitionEffect {
  const result: ParsedTransitionEffect = {};

  if (style.opacity !== undefined) {
    result.opacity = Number(style.opacity);
  }

  if (style.transform) {
    const transform = String(style.transform);
    const txMatch = transform.match(/translateX\(([-\d.]+)%\)/);
    if (txMatch) result.translateX = parseFloat(txMatch[1]);
    const tyMatch = transform.match(/translateY\(([-\d.]+)%\)/);
    if (tyMatch) result.translateY = parseFloat(tyMatch[1]);
    const scaleMatch = transform.match(/scale\(([-\d.]+)\)/);
    if (scaleMatch) result.scale = parseFloat(scaleMatch[1]);
  }

  if (style.clipPath) {
    const clipPath = String(style.clipPath);
    // Match forms like "inset(0 50% 0 0)" and "inset(25% 25% 25% 25%)"
    const insetMatch = clipPath.match(
      /inset\(([\d.]+)%?\s+([\d.]+)%?\s+([\d.]+)%?\s+([\d.]+)%?\)/,
    );
    if (insetMatch) {
      result.clipInset = {
        top: parseFloat(insetMatch[1]),
        right: parseFloat(insetMatch[2]),
        bottom: parseFloat(insetMatch[3]),
        left: parseFloat(insetMatch[4]),
      };
    }
  }

  if (style.filter) {
    result.filter = String(style.filter);
  }

  if (style.__whiteBlend !== undefined) {
    result.whiteBlend = Number(style.__whiteBlend);
  }

  return result;
}

/** Find all active text (title) clips at the given time. */
function findActiveTextClips(project: Project, timeMs: number): { clip: Clip; text: ClipText }[] {
  const result: { clip: Clip; text: ClipText }[] = [];
  for (const track of project.sequence.tracks) {
    if (track.muted) continue;
    for (const clip of track.clips) {
      if (clip.clipKind !== "title") continue;
      if (timeMs >= clip.startMs && timeMs < clip.startMs + clip.durationMs && clip.text) {
        result.push({ clip, text: clip.text });
      }
    }
  }
  return result;
}

/** Parse a background color that might use the "black@0.5" syntax. */
function parseBgColor(bgColor: string): string {
  const atMatch = bgColor.match(/^(\w+)@([\d.]+)$/);
  if (atMatch) {
    const color = atMatch[1];
    const alpha = parseFloat(atMatch[2]);
    // Map named colors to rgb
    if (color === "black") return `rgba(0,0,0,${alpha})`;
    if (color === "white") return `rgba(255,255,255,${alpha})`;
    return `rgba(128,128,128,${alpha})`;
  }
  return bgColor;
}

// ── WebGL helpers ──

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createChromaKeyProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// ── CanvasCompositor ──

export class CanvasCompositor {
  private canvas: HTMLCanvasElement | OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  // Optional WebGL canvas for chroma key
  private glCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private gl: WebGLRenderingContext | null = null;
  private chromaKeyProgram: WebGLProgram | null = null;
  private glTexture: WebGLTexture | null = null;
  private glInitialized = false;

  // Noise canvas for grain effect
  private noiseCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  private noiseCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null = null;
  private noiseFrame = 0;

  constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d") as
      | CanvasRenderingContext2D
      | OffscreenCanvasRenderingContext2D
      | null;
    if (!ctx) {
      throw new Error("Failed to get 2D rendering context from canvas");
    }
    this.ctx = ctx;
  }

  /**
   * Render a single frame of the project at the given time.
   *
   * @param project   The full Project data (sequence, assets, settings)
   * @param timeMs    The current playback time in milliseconds
   * @param sources   Map from assetId to a CanvasImageSource (video frame, image, etc.)
   */
  renderFrame(project: Project, timeMs: number, sources: FrameSources): void {
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;
    const ctx = this.ctx;

    // 1. Clear canvas to black
    ctx.save();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();

    // 2. Find all active media clips (video, image, p5js)
    const activeClips = findAllActiveClips(project, timeMs);

    // 3. Find active empty clips (placeholder with solid color)
    const activeEmptyClips = findAllActiveEmptyClips(project, timeMs);

    // 4. Find active text clips
    const textClips = findActiveTextClips(project, timeMs);

    // Build a combined draw list sorted by trackIndex (bottom to top)
    type DrawItem =
      | { kind: "media"; data: ActiveClip }
      | { kind: "empty"; data: ActiveEmptyClip };

    const drawList: DrawItem[] = [];
    for (const ac of activeClips) {
      drawList.push({ kind: "media", data: ac });
    }
    for (const ec of activeEmptyClips) {
      drawList.push({ kind: "empty", data: ec });
    }
    drawList.sort((a, b) => a.data.trackIndex - b.data.trackIndex);

    // 5. Draw each item
    for (const item of drawList) {
      if (item.kind === "media") {
        this.renderMediaClip(item.data, project, timeMs, sources, canvasW, canvasH);
      } else {
        this.renderEmptyClip(item.data, canvasW, canvasH);
      }
    }

    // 6. Draw text overlays on top
    for (const { text } of textClips) {
      this.renderText(text, canvasW, canvasH);
    }
  }

  /**
   * Render a single media clip (video, image, p5js) onto the canvas.
   */
  private renderMediaClip(
    activeClip: ActiveClip,
    project: Project,
    timeMs: number,
    sources: FrameSources,
    canvasW: number,
    canvasH: number,
  ): void {
    const ctx = this.ctx;
    const clip = activeClip.clip;
    const asset = activeClip.asset;

    // Get the frame source for this clip's asset
    let source = sources.get(clip.assetId);
    if (!source) return;

    const assetW = asset.width ?? canvasW;
    const assetH = asset.height ?? canvasH;

    // Time relative to clip start for keyframe evaluation
    const clipLocalTimeMs = activeClip.clipTimeMs - clip.inMs;

    // ── Compute transform values ──
    const tracks = clip.keyframeTracks;
    const transform = clip.transform;
    const translateX = getAnimatedValue(tracks, "transform.x", clipLocalTimeMs, transform?.x ?? 0);
    const translateY = getAnimatedValue(tracks, "transform.y", clipLocalTimeMs, transform?.y ?? 0);
    const scale = getAnimatedValue(tracks, "transform.scale", clipLocalTimeMs, transform?.scale ?? 1);
    const rotation = getAnimatedValue(tracks, "transform.rotation", clipLocalTimeMs, transform?.rotation ?? 0);

    const crop = clip.crop;
    const effectiveW = crop?.width ?? assetW;
    const effectiveH = crop?.height ?? assetH;

    // Destination dimensions in canvas pixels
    const destW = (effectiveW / canvasW) * canvasW * scale; // = effectiveW * scale
    const destH = (effectiveH / canvasH) * canvasH * scale; // = effectiveH * scale

    // Center position with translate offset
    const centerX = canvasW / 2 + translateX;
    const centerY = canvasH / 2 + translateY;

    // ── Chroma key: if enabled, render through WebGL and use the result as source ──
    if (clip.chromaKey) {
      const chromaResult = this.renderChromaKey(source, clip.chromaKey, assetW, assetH);
      if (chromaResult) {
        source = chromaResult;
      }
    }

    // ── Compute transition effects ──
    const transEffect = this.computeTransitionEffect(clip, project, timeMs);

    // ── Blend mode ──
    const blendMode = clip.blendMode ?? "cover";
    const compositeOp = blendModeToCompositeOp(blendMode);

    // ── Build CSS filter string ──
    const filterParts: string[] = [];
    const ccFilter = buildColorCorrectionFilter(clip.colorCorrection);
    if (ccFilter) filterParts.push(ccFilter);
    const vfFilter = buildVideoFilterCss(clip.videoFilters);
    if (vfFilter) filterParts.push(vfFilter);
    // Append transition filter if present
    if (transEffect.filter) filterParts.push(transEffect.filter);

    // ── Keyframe opacity ──
    let opacity = 1.0;
    if (hasKeyframes(tracks, "opacity")) {
      opacity = getAnimatedValue(tracks, "opacity", clipLocalTimeMs, 1.0);
    }
    // Blend mode "opacity" gives a fixed 50% alpha
    if (blendMode === "opacity") {
      opacity *= 0.5;
    }
    // Transition opacity
    if (transEffect.opacity !== undefined) {
      opacity *= transEffect.opacity;
    }

    // ── Draw ──
    ctx.save();

    ctx.globalCompositeOperation = compositeOp;
    ctx.globalAlpha = opacity;
    if (filterParts.length > 0) {
      ctx.filter = filterParts.join(" ");
    }

    // Apply transition translate
    let drawCenterX = centerX;
    let drawCenterY = centerY;
    if (transEffect.translateX !== undefined) {
      drawCenterX += (transEffect.translateX / 100) * canvasW;
    }
    if (transEffect.translateY !== undefined) {
      drawCenterY += (transEffect.translateY / 100) * canvasH;
    }

    // Apply transition scale
    let drawScale = 1;
    if (transEffect.scale !== undefined) {
      drawScale = transEffect.scale;
    }

    // Apply transition clip (inset)
    if (transEffect.clipInset) {
      const { top, right, bottom, left } = transEffect.clipInset;
      const clipX = (left / 100) * canvasW;
      const clipY = (top / 100) * canvasH;
      const clipW = canvasW - ((right / 100) * canvasW) - clipX;
      const clipH = canvasH - ((bottom / 100) * canvasH) - clipY;
      ctx.beginPath();
      ctx.rect(clipX, clipY, clipW, clipH);
      ctx.clip();
    }

    // Move to center, rotate, then draw
    ctx.translate(drawCenterX, drawCenterY);
    if (rotation !== 0) {
      ctx.rotate((rotation * Math.PI) / 180);
    }
    if (drawScale !== 1) {
      ctx.scale(drawScale, drawScale);
    }

    // ── Fade-white: blend toward/from white using an offscreen canvas ──
    // FFmpeg fade color=white blends each pixel toward white BEFORE applying alpha.
    // We replicate this by rendering the clip to a temporary canvas, blending white
    // on top with "lighter" composite, then drawing the result at the target alpha.
    if (transEffect.whiteBlend != null && transEffect.whiteBlend > 0) {
      // Render clip + white blend to a temporary canvas
      const tmpCanvas = new OffscreenCanvas(destW, destH);
      const tmpCtx = tmpCanvas.getContext("2d")!;
      if (filterParts.length > 0) {
        tmpCtx.filter = filterParts.join(" ");
      }
      if (crop) {
        tmpCtx.drawImage(source, crop.x, crop.y, crop.width, crop.height, 0, 0, destW, destH);
      } else {
        tmpCtx.drawImage(source, 0, 0, destW, destH);
      }
      // Additive white blend on the temporary canvas
      tmpCtx.globalCompositeOperation = "lighter";
      tmpCtx.globalAlpha = transEffect.whiteBlend;
      tmpCtx.filter = "none";
      tmpCtx.fillStyle = "#ffffff";
      tmpCtx.fillRect(0, 0, destW, destH);

      // Draw the blended result to the main canvas (filter already applied in tmp)
      ctx.filter = "none";
      ctx.drawImage(tmpCanvas, -destW / 2, -destH / 2, destW, destH);
    } else if (crop) {
      ctx.drawImage(
        source,
        crop.x, crop.y, crop.width, crop.height, // source rect
        -destW / 2, -destH / 2, destW, destH,    // dest rect
      );
    } else {
      ctx.drawImage(source, -destW / 2, -destH / 2, destW, destH);
    }

    ctx.restore();

    // ── Post-draw overlays (vignette, grain) drawn in clip space ──
    const vignetteStrength = getFilterStrength(clip.videoFilters, "vignette");
    if (vignetteStrength > 0) {
      this.renderVignette(vignetteStrength, canvasW, canvasH);
    }

    const grainStrength = getFilterStrength(clip.videoFilters, "grain");
    if (grainStrength > 0) {
      this.renderGrain(grainStrength, canvasW, canvasH);
    }
  }

  /**
   * Compute the combined transition effect for a clip at a given time.
   * Mirrors the logic in computeTransitionStyle from preview-renderer-registry.
   */
  private computeTransitionEffect(
    clip: Clip,
    project: Project,
    currentTimeMs: number,
  ): ParsedTransitionEffect {
    let combined: ParsedTransitionEffect = {};

    // ── Incoming transition (this clip fades/slides in) ──
    const transType = clip.transition?.type;
    const inProg = incomingProgress(clip, currentTimeMs);
    if (inProg >= 0 && transType) {
      const handler = transitionPreviewRegistry.get(transType);
      if (handler) {
        const style = handler.computeIncomingStyle(inProg);
        combined = parseTransitionStyle(style as Record<string, unknown>);
      }
    }

    // ── Outgoing transition (this clip fades/slides out for the NEXT clip's transition) ──
    const out = outgoingTransition(clip, project, currentTimeMs);
    if (out) {
      const nextType = out.next.transition?.type;
      const handler = nextType ? transitionPreviewRegistry.get(nextType) : undefined;
      if (handler?.computeOutgoingStyle) {
        const outStyle = handler.computeOutgoingStyle(out.progress);
        const parsed = parseTransitionStyle(outStyle as Record<string, unknown>);

        // Multiply opacity (don't replace)
        if (parsed.opacity !== undefined) {
          combined.opacity = (combined.opacity ?? 1) * parsed.opacity;
        }
        // Merge other properties
        if (parsed.translateX !== undefined) combined.translateX = parsed.translateX;
        if (parsed.translateY !== undefined) combined.translateY = parsed.translateY;
        if (parsed.scale !== undefined) combined.scale = parsed.scale;
        if (parsed.clipInset !== undefined) combined.clipInset = parsed.clipInset;
        if (parsed.filter !== undefined) {
          combined.filter = combined.filter
            ? `${combined.filter} ${parsed.filter}`
            : parsed.filter;
        }
        if (parsed.whiteBlend !== undefined) {
          combined.whiteBlend = Math.max(combined.whiteBlend ?? 0, parsed.whiteBlend);
        }
      }
    }

    return combined;
  }

  /**
   * Render a text overlay onto the canvas.
   */
  private renderText(text: ClipText, canvasW: number, canvasH: number): void {
    const ctx = this.ctx;
    const fontSize = text.fontSize ?? 48;
    const fontFamily = text.fontFamily ?? "sans-serif";
    const color = text.color ?? "#ffffff";
    const bgColor = text.backgroundColor ?? "rgba(0,0,0,0.5)";
    const align = text.align ?? "center";
    const padding = 8;
    const borderRadius = 4;

    ctx.save();
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.textBaseline = "top";

    // Multi-line: split by newline, measure each line
    const lines = (text.value ?? "").split("\n");
    const lineHeight = fontSize * 1.2;
    const metrics = lines.map((l) => ctx.measureText(l));
    const maxWidth = Math.max(...metrics.map((m) => m.width), 0);
    const totalHeight = lines.length * lineHeight;

    // Position at bottom-center (matching TextOverlayRenderer layout)
    const bgW = maxWidth + padding * 2;
    const bgH = totalHeight + padding * 2;
    const bottomPadding = 40;
    const bgX = (canvasW - bgW) / 2;
    const bgY = canvasH - bottomPadding - bgH;

    // Background
    const parsedBg = parseBgColor(bgColor);
    ctx.fillStyle = parsedBg;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(bgX, bgY, bgW, bgH, borderRadius);
    } else {
      // Fallback for environments without roundRect
      ctx.rect(bgX, bgY, bgW, bgH);
    }
    ctx.fill();

    // Text
    ctx.fillStyle = color;
    ctx.textAlign = align as CanvasTextAlign;
    for (let i = 0; i < lines.length; i++) {
      let x: number;
      if (align === "center") {
        x = canvasW / 2;
      } else if (align === "right") {
        x = bgX + bgW - padding;
      } else {
        x = bgX + padding;
      }
      const y = bgY + padding + i * lineHeight;
      ctx.fillText(lines[i], x, y);
    }

    ctx.restore();
  }

  /**
   * Render an empty asset clip as a solid color placeholder.
   */
  private renderEmptyClip(
    emptyClip: ActiveEmptyClip,
    canvasW: number,
    canvasH: number,
  ): void {
    const ctx = this.ctx;
    ctx.save();
    // Use a dark gray as placeholder
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  /**
   * Render vignette effect as a radial gradient overlay.
   */
  private renderVignette(strength: number, w: number, h: number): void {
    const ctx = this.ctx;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) * 0.7;
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.4 / 0.7, cx, cy, r);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(1, `rgba(0,0,0,${strength})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  /**
   * Render film grain effect using a tiled noise pattern.
   */
  private renderGrain(strength: number, w: number, h: number): void {
    // Initialize or regenerate noise every 3 frames
    if (!this.noiseCanvas || this.noiseFrame % 3 === 0) {
      this.noiseCanvas = this.createNoiseCanvas();
      this.noiseCtx = null; // reset ctx reference
    }
    this.noiseFrame++;

    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = strength;
    const pattern = ctx.createPattern(this.noiseCanvas as CanvasImageSource, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  /**
   * Create a small noise canvas for the grain effect.
   */
  private createNoiseCanvas(): HTMLCanvasElement | OffscreenCanvas {
    let noiseCanvas: HTMLCanvasElement | OffscreenCanvas;
    let noiseCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

    if (typeof OffscreenCanvas !== "undefined") {
      noiseCanvas = new OffscreenCanvas(NOISE_SIZE, NOISE_SIZE);
      noiseCtx = noiseCanvas.getContext("2d");
    } else if (typeof document !== "undefined") {
      noiseCanvas = document.createElement("canvas");
      noiseCanvas.width = NOISE_SIZE;
      noiseCanvas.height = NOISE_SIZE;
      noiseCtx = noiseCanvas.getContext("2d");
    } else {
      // Fallback: return a minimal object that createPattern can accept
      // This path is only hit in test/headless environments without OffscreenCanvas or DOM
      return { width: NOISE_SIZE, height: NOISE_SIZE } as unknown as HTMLCanvasElement;
    }

    if (noiseCtx) {
      const imageData = noiseCtx.createImageData(NOISE_SIZE, NOISE_SIZE);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
      noiseCtx.putImageData(imageData, 0, 0);
    }

    return noiseCanvas;
  }

  /**
   * Render a source through the chroma key WebGL pipeline.
   * Returns a canvas with the chroma-keyed result, or null if WebGL is unavailable.
   */
  private renderChromaKey(
    source: CanvasImageSource,
    chromaKey: ClipChromaKey,
    width: number,
    height: number,
  ): HTMLCanvasElement | OffscreenCanvas | null {
    // Lazy-initialize WebGL canvas
    if (!this.glInitialized) {
      this.glInitialized = true;
      try {
        if (typeof OffscreenCanvas !== "undefined") {
          this.glCanvas = new OffscreenCanvas(width, height);
        } else if (typeof document !== "undefined") {
          this.glCanvas = document.createElement("canvas");
          this.glCanvas.width = width;
          this.glCanvas.height = height;
        }
        if (this.glCanvas) {
          this.gl = (this.glCanvas as HTMLCanvasElement).getContext("webgl", {
            premultipliedAlpha: false,
            alpha: true,
          });
          if (this.gl) {
            this.chromaKeyProgram = createChromaKeyProgram(this.gl);
            if (this.chromaKeyProgram) {
              this.setupGlBuffers(this.gl, this.chromaKeyProgram);
              this.glTexture = this.gl.createTexture();
              if (this.glTexture) {
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
              }
            }
          }
        }
      } catch {
        // WebGL not available — graceful skip
        this.gl = null;
      }
    }

    const gl = this.gl;
    const program = this.chromaKeyProgram;
    const texture = this.glTexture;
    if (!gl || !program || !texture || !this.glCanvas) return null;

    // Resize GL canvas if needed
    if (this.glCanvas.width !== width || this.glCanvas.height !== height) {
      this.glCanvas.width = width;
      this.glCanvas.height = height;
    }

    gl.useProgram(program);

    // Upload source as texture
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

    // Set uniforms
    const [r, g, b] = hexToRgb(chromaKey.color);
    gl.uniform3f(gl.getUniformLocation(program, "u_keyColor"), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, "u_similarity"), chromaKey.similarity);
    gl.uniform1f(gl.getUniformLocation(program, "u_blend"), chromaKey.blend);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);

    gl.viewport(0, 0, width, height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    return this.glCanvas;
  }

  /**
   * Set up vertex/texcoord buffers for the chroma key quad.
   */
  private setupGlBuffers(gl: WebGLRenderingContext, program: WebGLProgram): void {
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    const texCoords = new Float32Array([
      0, 1, 1, 1, 0, 0,
      0, 0, 1, 1, 1, 0,
    ]);

    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tcBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tcBuf);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    const aTc = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(aTc);
    gl.vertexAttribPointer(aTc, 2, gl.FLOAT, false, 0, 0);
  }

  /**
   * Dispose of WebGL resources. Call when the compositor is no longer needed.
   */
  dispose(): void {
    if (this.gl && this.chromaKeyProgram) {
      this.gl.deleteProgram(this.chromaKeyProgram);
      this.chromaKeyProgram = null;
    }
    if (this.gl && this.glTexture) {
      this.gl.deleteTexture(this.glTexture);
      this.glTexture = null;
    }
    this.gl = null;
    this.glCanvas = null;
    this.noiseCanvas = null;
    this.noiseCtx = null;
  }
}
