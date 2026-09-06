import { useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

export function ComparisonSlider({
  original,
  result,
  leftLabel = 'Original',
  rightLabel = 'Transparent',
  /** When false, the handle does not respond to drag (use while painting/refining). */
  interactive = true,
}: {
  original: string;
  result: string;
  leftLabel?: string;
  rightLabel?: string;
  interactive?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = (clientX: number) => {
    if (!containerRef.current || !interactive) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-h-[18rem] overflow-hidden rounded-[1.35rem] select-none ${interactive ? '' : 'pointer-events-none'}`}
      onMouseDown={() => {
        if (!interactive) return;
        dragging.current = true;
      }}
      onMouseUp={() => {
        dragging.current = false;
      }}
      onMouseLeave={() => {
        dragging.current = false;
      }}
      onMouseMove={(e) => {
        if (dragging.current) update(e.clientX);
      }}
      onTouchStart={() => {
        if (!interactive) return;
        dragging.current = true;
      }}
      onTouchEnd={() => {
        dragging.current = false;
      }}
      onTouchMove={(e) => {
        if (!interactive || !dragging.current) return;
        update(e.touches[0].clientX);
      }}
    >
      <img src={original} alt={leftLabel} className="absolute inset-0 h-full w-full object-contain" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={result}
          alt={rightLabel}
          className="h-full w-full object-contain"
          style={{ width: containerRef.current?.offsetWidth }}
          draggable={false}
        />
      </div>
      <div className="absolute top-0 bottom-0 z-10 w-0.5 bg-amber-400 shadow-[0_0_12px_rgba(234,179,8,.6)]" style={{ left: `${pos}%` }}>
        <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-amber-400 bg-[#042f2e] text-amber-300 shadow-lg">
          <ArrowRight size={14} className="-rotate-90" />
        </div>
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-[#042f2e]/70 px-2.5 py-1 font-mono-zon text-[.5rem] uppercase tracking-[.1em] text-[#b7ca9e] backdrop-blur">
        {leftLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-[#042f2e]/70 px-2.5 py-1 font-mono-zon text-[.5rem] uppercase tracking-[.1em] text-amber-300 backdrop-blur">
        {rightLabel}
      </span>
    </div>
  );
}
