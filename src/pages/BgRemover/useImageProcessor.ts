import { useEffect, useRef, useState } from 'react';
import type { ToolStatus } from '@/lib/types';

export type BgEngine = 'AI model' | 'basic local fallback';
export type BgFill = 'transparent' | 'solid' | 'blur';

export function useImageProcessor() {
  const [status, setStatus] = useState<ToolStatus>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [engine, setEngine] = useState<BgEngine>('AI model');
  const [error, setError] = useState('');
  const alphaCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const refineHistory = useRef<ImageData[]>([]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);
  useEffect(() => {
    if (!resultUrl) return;
    return () => URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  const chooseFile = (nextFile: File) => {
    if (!nextFile.type.startsWith('image/')) {
      setError('Please choose a JPG, PNG, or WebP image.');
      setStatus('error');
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setResultUrl('');
    setProgress(0);
    setError('');
    setStatus('selected');
    alphaCanvasRef.current = null;
    originalCanvasRef.current = null;
    refineHistory.current = [];
  };

  /** Improved local cutout: multi-sample corners + edge feather. */
  const localCutout = async (source: File) => {
    const bitmap = await createImageBitmap(source);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('This browser cannot create a processing canvas.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = image;

    // Sample a ring of edge pixels for more robust background color
    const samples: [number, number][] = [];
    for (let i = 0; i < width; i += Math.max(1, Math.floor(width / 8))) {
      samples.push([i, 0], [i, height - 1]);
    }
    for (let j = 0; j < height; j += Math.max(1, Math.floor(height / 8))) {
      samples.push([0, j], [width - 1, j]);
    }
    const bg = samples
      .reduce(
        (acc, [x, y]) => {
          const i = (y * width + x) * 4;
          return [acc[0] + data[i], acc[1] + data[i + 1], acc[2] + data[i + 2]];
        },
        [0, 0, 0],
      )
      .map((v) => v / samples.length);

    const threshold = 78;
    const seen = new Uint8Array(width * height);
    const queue: number[] = [];
    for (const [x, y] of samples) queue.push(y * width + x);
    while (queue.length) {
      const pixel = queue.pop() as number;
      if (seen[pixel]) continue;
      seen[pixel] = 1;
      const index = pixel * 4;
      const dist = Math.hypot(data[index] - bg[0], data[index + 1] - bg[1], data[index + 2] - bg[2]);
      if (dist > threshold) continue;
      // Soft edge: partial alpha near threshold
      const softness = Math.max(0, 1 - dist / threshold);
      data[index + 3] = Math.round(data[index + 3] * (1 - softness * 0.95));
      const x = pixel % width;
      const y = (pixel / width) | 0;
      if (x > 0) queue.push(pixel - 1);
      if (x < width - 1) queue.push(pixel + 1);
      if (y > 0) queue.push(pixel - width);
      if (y < height - 1) queue.push(pixel + width);
    }

    // Light edge blur on alpha only
    const alpha = new Uint8ClampedArray(width * height);
    for (let i = 0; i < width * height; i++) alpha[i] = data[i * 4 + 3];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        if (alpha[i] === 0 || alpha[i] === 255) continue;
        const avg =
          (alpha[i] +
            alpha[i - 1] +
            alpha[i + 1] +
            alpha[i - width] +
            alpha[i + width]) /
          5;
        data[i * 4 + 3] = avg;
      }
    }

    context.putImageData(image, 0, 0);
    return canvas;
  };

  const storeResultFromCanvas = async (canvas: HTMLCanvasElement) => {
    originalCanvasRef.current = (() => {
      const c = document.createElement('canvas');
      c.width = canvas.width;
      c.height = canvas.height;
      c.getContext('2d')?.drawImage(canvas, 0, 0);
      return c;
    })();
    alphaCanvasRef.current = canvas;
    refineHistory.current = [];
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export PNG.'))), 'image/png'),
    );
    setResultUrl(URL.createObjectURL(blob));
  };

  const process = async () => {
    if (!file) return;
    setStatus('processing');
    setProgress(6);
    setError('');
    const timer = window.setInterval(() => setProgress((c) => Math.min(c + 6, 86)), 200);
    try {
      let canvas: HTMLCanvasElement | null = null;
      let usedModel = false;
      try {
        const moduleName = '@imgly/background-removal';
        const imgly = (await import(/* @vite-ignore */ moduleName)) as {
          removeBackground?: (input: Blob | File, config?: object) => Promise<Blob>;
          default?: (input: Blob | File) => Promise<Blob>;
        };
        const remover = imgly.removeBackground ?? imgly.default;
        if (remover) {
          const blob = await remover(file, {
            progress: (_key: string, current: number, total: number) => {
              if (total > 0) setProgress(Math.min(90, Math.round((current / total) * 90)));
            },
          } as object);
          const bmp = await createImageBitmap(blob);
          canvas = document.createElement('canvas');
          canvas.width = bmp.width;
          canvas.height = bmp.height;
          canvas.getContext('2d')?.drawImage(bmp, 0, 0);
          bmp.close();
          usedModel = true;
        }
      } catch {
        usedModel = false;
      }

      if (!canvas) {
        setEngine('basic local fallback');
        canvas = await localCutout(file);
      } else {
        setEngine('AI model');
      }

      // Keep full-res export path: if model returned smaller, still use what we have
      window.clearInterval(timer);
      setProgress(100);
      await storeResultFromCanvas(canvas);
      setStatus('completed');
      void usedModel;
    } catch (cause) {
      window.clearInterval(timer);
      setError(cause instanceof Error ? cause.message : 'Something went wrong while processing this image.');
      setStatus('error');
    }
  };

  /** Feather / harden alpha edges. amount: -1 harden … +1 feather */
  const refineEdges = async (amount: number) => {
    const canvas = alphaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    pushRefineHistory(canvas);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = img;
    const alpha = new Float32Array(width * height);
    for (let i = 0; i < width * height; i++) alpha[i] = data[i * 4 + 3];

    if (amount > 0) {
      // Feather: blur alpha
      const passes = Math.max(1, Math.round(amount * 4));
      let src = alpha;
      for (let p = 0; p < passes; p++) {
        const dst = new Float32Array(src.length);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = y * width + x;
            let sum = src[i];
            let n = 1;
            if (x > 0) {
              sum += src[i - 1];
              n++;
            }
            if (x < width - 1) {
              sum += src[i + 1];
              n++;
            }
            if (y > 0) {
              sum += src[i - width];
              n++;
            }
            if (y < height - 1) {
              sum += src[i + width];
              n++;
            }
            dst[i] = sum / n;
          }
        }
        src = dst;
      }
      for (let i = 0; i < width * height; i++) data[i * 4 + 3] = Math.round(src[i]);
    } else if (amount < 0) {
      // Harden: threshold alpha toward 0/255
      const t = 0.35 + Math.abs(amount) * 0.4;
      for (let i = 0; i < width * height; i++) {
        const a = alpha[i] / 255;
        data[i * 4 + 3] = a > t ? 255 : a < 1 - t ? 0 : Math.round(alpha[i]);
      }
    }
    ctx.putImageData(img, 0, 0);
    await refreshResultUrl();
  };

  const pushRefineHistory = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    refineHistory.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (refineHistory.current.length > 20) refineHistory.current.shift();
  };

  const undoRefine = async () => {
    const canvas = alphaCanvasRef.current;
    const snap = refineHistory.current.pop();
    if (!canvas || !snap) return;
    canvas.getContext('2d')?.putImageData(snap, 0, 0);
    await refreshResultUrl();
  };

  /**
   * Paint on alpha. Call with recordHistory on stroke start, refresh on stroke end.
   * Mid-stroke should pass recordHistory=false and refresh=false for smooth brushes.
   */
  const paintAlpha = async (
    x: number,
    y: number,
    radius: number,
    mode: 'restore' | 'erase',
    opts: { recordHistory?: boolean; refresh?: boolean } = {},
  ) => {
    const canvas = alphaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    if (opts.recordHistory) pushRefineHistory(canvas);

    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else if (originalCanvasRef.current) {
      // Restore: clip a circle and draw original RGB+alpha into it (no full-size temp canvas)
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(originalCanvasRef.current, 0, 0);
      ctx.restore();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.refresh) await refreshResultUrl();
  };

  const commitPaintStroke = async () => {
    await refreshResultUrl();
  };

  const applyBackground = async (fill: BgFill, color = '#ffffff') => {
    const canvas = alphaCanvasRef.current;
    if (!canvas) return;
    const out = document.createElement('canvas');
    out.width = canvas.width;
    out.height = canvas.height;
    const ctx = out.getContext('2d')!;
    if (fill === 'solid') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(canvas, 0, 0);
    } else if (fill === 'blur') {
      // Blurred original as backdrop
      if (originalCanvasRef.current) {
        ctx.filter = 'blur(24px)';
        ctx.drawImage(originalCanvasRef.current, 0, 0, out.width, out.height);
        ctx.filter = 'none';
      } else {
        ctx.fillStyle = '#0a2e28';
        ctx.fillRect(0, 0, out.width, out.height);
      }
      ctx.drawImage(canvas, 0, 0);
    } else {
      ctx.drawImage(canvas, 0, 0);
    }
    const blob = await new Promise<Blob>((resolve, reject) =>
      out.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed.'))), 'image/png'),
    );
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(URL.createObjectURL(blob));
  };

  const refreshResultUrl = async () => {
    const canvas = alphaCanvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed.'))), 'image/png'),
    );
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl(URL.createObjectURL(blob));
  };

  const getAlphaCanvas = () => alphaCanvasRef.current;

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null);
    setPreviewUrl('');
    setResultUrl('');
    setProgress(0);
    setError('');
    setStatus('idle');
    alphaCanvasRef.current = null;
    originalCanvasRef.current = null;
    refineHistory.current = [];
  };

  return {
    status,
    file,
    previewUrl,
    resultUrl,
    progress,
    engine,
    error,
    chooseFile,
    process,
    reset,
    refineEdges,
    undoRefine,
    paintAlpha,
    commitPaintStroke,
    applyBackground,
    getAlphaCanvas,
    canUndoRefine: () => refineHistory.current.length > 0,
  };
}
