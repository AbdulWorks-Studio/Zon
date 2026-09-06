import { useEffect, useRef } from 'react';

export interface EraserCanvasHandle {
  getSourceCanvas: () => HTMLCanvasElement | null;
  getMaskCanvas: () => HTMLCanvasElement | null;
  clearMask: () => void;
  loadMaskSnapshot: (data: ImageData | null) => void;
  getMaskSnapshot: () => ImageData | null;
}

export function EraserCanvas({
  imageUrl,
  brushSize,
  mode,
  zoom,
  hardness = 0.7,
  onStroke,
  registerRef,
}: {
  imageUrl: string;
  brushSize: number;
  mode: 'erase' | 'restore';
  zoom: number;
  hardness?: number;
  onStroke: () => void;
  registerRef: (handle: EraserCanvasHandle) => void;
}) {
  const imgCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const brushSizeRef = useRef(brushSize);
  const modeRef = useRef(mode);
  const hardnessRef = useRef(hardness);
  brushSizeRef.current = brushSize;
  modeRef.current = mode;
  hardnessRef.current = hardness;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const imgCanvas = imgCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imgCanvas || !maskCanvas) return;
      imgCanvas.width = img.naturalWidth;
      imgCanvas.height = img.naturalHeight;
      maskCanvas.width = img.naturalWidth;
      maskCanvas.height = img.naturalHeight;
      imgCanvas.getContext('2d')?.drawImage(img, 0, 0);
      maskCanvas.getContext('2d')?.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      registerRef({
        getSourceCanvas: () => imgCanvasRef.current,
        getMaskCanvas: () => maskCanvasRef.current,
        clearMask: () => {
          const ctx = maskCanvasRef.current?.getContext('2d');
          if (ctx && maskCanvasRef.current) ctx.clearRect(0, 0, maskCanvasRef.current.width, maskCanvasRef.current.height);
        },
        loadMaskSnapshot: (data) => {
          const canvas = maskCanvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!ctx || !canvas) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (data) ctx.putImageData(data, 0, 0);
        },
        getMaskSnapshot: () => {
          const canvas = maskCanvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!ctx || !canvas) return null;
          return ctx.getImageData(0, 0, canvas.width, canvas.height);
        },
      });
    };
    img.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = maskCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const paintAt = (x: number, y: number) => {
    const canvas = maskCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    const r = brushSizeRef.current;
    const hard = Math.max(0.05, Math.min(1, hardnessRef.current));
    ctx.globalCompositeOperation = modeRef.current === 'erase' ? 'source-over' : 'destination-out';

    // Soft radial brush
    const grad = ctx.createRadialGradient(x, y, r * hard * 0.4, x, y, r);
    grad.addColorStop(0, 'rgba(244,206,71,0.92)');
    grad.addColorStop(Math.max(0.2, hard), 'rgba(244,206,71,0.75)');
    grad.addColorStop(1, 'rgba(244,206,71,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  const strokeLine = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const step = Math.max(1, brushSizeRef.current * 0.25);
    const n = Math.max(1, Math.ceil(dist / step));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      paintAt(from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawing.current = true;
    const p = pointFromEvent(e);
    if (p) {
      paintAt(p.x, p.y);
      lastPoint.current = p;
    }
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const p = pointFromEvent(e);
    if (p && lastPoint.current) {
      strokeLine(lastPoint.current, p);
      lastPoint.current = p;
    } else if (p) {
      paintAt(p.x, p.y);
      lastPoint.current = p;
    }
  };
  const handlePointerUp = () => {
    if (drawing.current) onStroke();
    drawing.current = false;
    lastPoint.current = null;
  };

  return (
    <div className="canvas-frame checkerboard flex max-h-[min(70vh,32rem)] items-center justify-center overflow-auto p-2">
      <div className="relative" style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}>
        <canvas ref={imgCanvasRef} className="block max-w-full rounded-lg" />
        <canvas
          ref={maskCanvasRef}
          className="absolute inset-0 max-w-full cursor-crosshair rounded-lg opacity-55"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
    </div>
  );
}
