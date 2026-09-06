import { useEffect, useRef } from 'react';

export function Waveform({ peaks, progress = 0, color = '#f4ce47', label }: { peaks: number[]; progress?: number; color?: string; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const mid = height / 2;
    const barWidth = width / peaks.length;
    const playheadX = width * progress;

    peaks.forEach((p, i) => {
      const barHeight = Math.max(2, p * height * 0.92);
      const x = i * barWidth;
      ctx.fillStyle = x <= playheadX ? color : 'rgba(255,255,255,0.16)';
      ctx.fillRect(x, mid - barHeight / 2, Math.max(1, barWidth - 1), barHeight);
    });

    if (progress > 0) {
      ctx.fillStyle = color;
      ctx.fillRect(playheadX, 0, 1.5, height);
    }
  }, [peaks, progress, color]);

  return (
    <div className="canvas-frame relative flex h-24 items-center px-2">
      <canvas ref={canvasRef} className="h-full w-full" />
      {label && <span className="pointer-events-none absolute left-3 top-2 font-mono-zon text-[.5rem] uppercase tracking-[.1em] text-[#7a8f6e]">{label}</span>}
    </div>
  );
}
