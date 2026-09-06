import { Eraser, Gauge, Redo2, RotateCcw, Sparkles, Undo2, ZoomIn, ZoomOut } from 'lucide-react';
import type { FillQuality } from './inpaint';

export function EraserToolbar({
  brushSize, setBrushSize,
  hardness, setHardness,
  mode, setMode,
  quality, setQuality,
  zoom, setZoom,
  onUndo, onRedo, canUndo, canRedo,
  onClearMask, onApplyFill, filling,
}: {
  brushSize: number; setBrushSize: (n: number) => void;
  hardness: number; setHardness: (n: number) => void;
  mode: 'erase' | 'restore'; setMode: (m: 'erase' | 'restore') => void;
  quality: FillQuality; setQuality: (q: FillQuality) => void;
  zoom: number; setZoom: (n: number) => void;
  onUndo: () => void; onRedo: () => void; canUndo: boolean; canRedo: boolean;
  onClearMask: () => void; onApplyFill: () => void; filling: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/8 bg-white/[.03] p-5">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">
          <span className="flex items-center gap-1.5"><Eraser size={12} /> brush size</span><span>{brushSize}px</span>
        </div>
        <input type="range" min={8} max={120} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="range-gold" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">
          <span>hardness</span><span>{Math.round(hardness * 100)}%</span>
        </div>
        <input type="range" min={10} max={100} value={Math.round(hardness * 100)} onChange={(e) => setHardness(Number(e.target.value) / 100)} className="range-gold" />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('erase')} className={`flex-1 rounded-lg px-3 py-2.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${mode === 'erase' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>Paint mask</button>
        <button type="button" onClick={() => setMode('restore')} className={`flex-1 rounded-lg px-3 py-2.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${mode === 'restore' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>Restore</button>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]"><Gauge size={12} /> quality</div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setQuality('fast')} className={`flex-1 rounded-lg px-3 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${quality === 'fast' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>Fast</button>
          <button type="button" onClick={() => setQuality('precision4k')} className={`flex-1 rounded-lg px-3 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${quality === 'precision4k' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>4K Precision</button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]"><span>zoom</span><span>{Math.round(zoom * 100)}%</span></div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setZoom(Math.max(0.5, +(zoom - 0.25).toFixed(2)))} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-[#a9bd9a] hover:text-amber-300"><ZoomOut size={14} className="mx-auto" /></button>
          <button type="button" onClick={() => setZoom(1)} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 font-mono-zon text-[.55rem] text-[#a9bd9a] hover:text-amber-300">fit</button>
          <button type="button" onClick={() => setZoom(Math.min(3, +(zoom + 0.25).toFixed(2)))} className="flex-1 rounded-lg border border-white/10 bg-white/5 py-2.5 text-[#a9bd9a] hover:text-amber-300"><ZoomIn size={14} className="mx-auto" /></button>
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" disabled={!canUndo} onClick={onUndo} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2.5 font-mono-zon text-[.55rem] uppercase tracking-[.08em] text-[#a9bd9a] disabled:opacity-30 hover:text-amber-300"><Undo2 size={13} /> undo</button>
        <button type="button" disabled={!canRedo} onClick={onRedo} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2.5 font-mono-zon text-[.55rem] uppercase tracking-[.08em] text-[#a9bd9a] disabled:opacity-30 hover:text-amber-300"><Redo2 size={13} /> redo</button>
      </div>
      <button type="button" onClick={onClearMask} className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2.5 font-mono-zon text-[.55rem] uppercase tracking-[.08em] text-[#a9bd9a] hover:text-red-300"><RotateCcw size={12} /> clear mask</button>

      <button type="button" disabled={filling} onClick={onApplyFill} className="btn-gold mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-50">
        <Sparkles size={15} /> {filling ? 'Filling…' : 'Apply smart fill'}
      </button>
      <p className="text-center text-[.7rem] leading-relaxed text-[#7a8f6e]">Paint over the object, then apply fill. Content-aware diffusion + patch seed runs on your device.</p>
    </div>
  );
}
