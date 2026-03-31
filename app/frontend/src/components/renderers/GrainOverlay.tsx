import { useRef, useEffect } from "react";

const NOISE_SIZE = 64;

/** Generate a static noise ImageData of NOISE_SIZE x NOISE_SIZE pixels. */
function generateNoise(ctx: CanvasRenderingContext2D): ImageData {
  const imageData = ctx.createImageData(NOISE_SIZE, NOISE_SIZE);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  return imageData;
}

type Props = {
  width: number;
  height: number;
  strength: number; // 0.0 to 1.0
};

/**
 * Canvas-based film grain overlay.
 * Generates a small noise texture and tiles it across the canvas.
 * Updates the pattern every few frames for a film-like grain effect.
 */
export function GrainOverlay({ width, height, strength }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Create an offscreen canvas for the noise texture
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = NOISE_SIZE;
    noiseCanvas.height = NOISE_SIZE;
    noiseCanvasRef.current = noiseCanvas;
    const noiseCtx = noiseCanvas.getContext("2d");
    if (!noiseCtx) return;

    // Generate initial noise
    const noiseData = generateNoise(noiseCtx);
    noiseCtx.putImageData(noiseData, 0, 0);

    const loop = () => {
      frameCountRef.current += 1;

      // Regenerate noise every 3 frames for film-like grain
      if (frameCountRef.current % 3 === 0) {
        const newNoise = generateNoise(noiseCtx);
        noiseCtx.putImageData(newNoise, 0, 0);
      }

      // Draw tiled noise across the full canvas
      ctx.clearRect(0, 0, width, height);
      const pattern = ctx.createPattern(noiseCanvas, "repeat");
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [width, height]);

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
        mixBlendMode: "overlay",
        opacity: strength,
      }}
    />
  );
}
