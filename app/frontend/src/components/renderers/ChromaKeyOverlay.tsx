import { useRef, useEffect, useCallback } from "react";
import type { ClipChromaKey } from "@video/shared";

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

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  return [r, g, b];
}

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

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
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

type Props = {
  mediaElement: HTMLVideoElement | HTMLImageElement | null;
  chromaKey: ClipChromaKey;
  width: number;
  height: number;
};

/**
 * WebGL-based chroma key overlay.
 * Renders video/image frames through a fragment shader that removes
 * pixels close to the specified key color.
 */
export function ChromaKeyOverlay({ mediaElement, chromaKey, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const rafRef = useRef<number>(0);

  const setupGl = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    glRef.current = gl;

    const program = createProgram(gl);
    if (!program) return;
    programRef.current = program;

    // Quad covering full canvas (two triangles)
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]);
    // Texture coords (flip Y for video)
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

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;
  }, []);

  const renderFrame = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;
    if (!gl || !program || !texture || !mediaElement) return;

    // For video elements, skip if no data available
    if (mediaElement instanceof HTMLVideoElement && mediaElement.readyState < 2) return;

    gl.useProgram(program);

    // Upload current frame
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mediaElement);

    // Set uniforms
    const [r, g, b] = hexToRgb(chromaKey.color);
    gl.uniform3f(gl.getUniformLocation(program, "u_keyColor"), r, g, b);
    gl.uniform1f(gl.getUniformLocation(program, "u_similarity"), chromaKey.similarity);
    gl.uniform1f(gl.getUniformLocation(program, "u_blend"), chromaKey.blend);
    gl.uniform1i(gl.getUniformLocation(program, "u_texture"), 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [mediaElement, chromaKey]);

  // Setup WebGL on mount
  useEffect(() => {
    setupGl();
  }, [setupGl]);

  // Animation loop
  useEffect(() => {
    if (!mediaElement) return;

    const loop = () => {
      renderFrame();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [mediaElement, renderFrame]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
