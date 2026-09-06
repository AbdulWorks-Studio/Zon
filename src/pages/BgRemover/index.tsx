import { useEffect, useRef, useState } from 'react';
import {
  Check,
  CloudOff,
  Download,
  Eraser,
  LockKeyhole,
  Paintbrush,
  RotateCcw,
  Sparkles,
  Undo2,
  X,
  Zap,
} from 'lucide-react';
import { UploadEmpty } from '@/components/UploadEmpty';
import { ImagePreview } from '@/components/ImagePreview';
import { ProcessingState } from '@/components/ProcessingState';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { Footer } from '@/components/Footer';
import { useImageProcessor, type BgFill } from './useImageProcessor';

export function RemoverPage() {
  const processor = useImageProcessor();
  const [adOpen, setAdOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [brushMode, setBrushMode] = useState<'restore' | 'erase' | null>(null);
  const [brushSize, setBrushSize] = useState(24);
  const [edgeAmount, setEdgeAmount] = useState(0);
  const [bgFill, setBgFill] = useState<BgFill>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const previewRef = useRef<HTMLDivElement>(null);
  const painting = useRef(false);

  const openAd = () => {
    setCountdown(5);
    setAdOpen(true);
  };
  useEffect(() => {
    if (!adOpen || countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [adOpen, countdown]);

  const download = () => {
    if (!processor.resultUrl || countdown > 0) return;
    const a = document.createElement('a');
    a.href = processor.resultUrl;
    a.download = `${processor.file?.name.replace(/\.[^/.]+$/, '') ?? 'zon-cutout'}-transparent.png`;
    a.click();
    setAdOpen(false);
  };

  const canvasPoint = (e: React.PointerEvent) => {
    const canvas = processor.getAlphaCanvas();
    const wrap = previewRef.current;
    if (!canvas || !wrap) return null;
    const img = wrap.querySelector('img');
    if (!img) return null;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!brushMode) return;
    e.preventDefault();
    e.stopPropagation();
    painting.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = canvasPoint(e);
    // Record undo snapshot only once at stroke start
    if (p) void processor.paintAlpha(p.x, p.y, brushSize, brushMode, { recordHistory: true, refresh: false });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!painting.current || !brushMode) return;
    e.preventDefault();
    const p = canvasPoint(e);
    if (p) void processor.paintAlpha(p.x, p.y, brushSize, brushMode, { recordHistory: false, refresh: false });
  };
  const onPointerUp = () => {
    if (painting.current) void processor.commitPaintStroke();
    painting.current = false;
  };

  const applyEdge = () => {
    if (edgeAmount === 0) return;
    void processor.refineEdges(edgeAmount);
  };

  const applyBg = () => {
    void processor.applyBackground(bgFill, bgColor);
  };

  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <section className="mb-12">
          <div className="section-label">how it works</div>
          <h1 className="mt-3 font-display text-[2.4rem] leading-[.98] tracking-[-.06em] text-[#f0f0d8] sm:text-[3.4rem]">
            Clear the background.
            <br />
            <span className="text-amber-400/90">Keep the subject.</span>
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              { n: '01', t: 'Drag & Drop', d: 'Drop any JPG, PNG or WebP. Files never leave your browser.' },
              { n: '02', t: 'Cutout + Refine', d: 'AI or local cutout, then fix edges with restore/erase brushes.' },
              { n: '03', t: 'Free Download', d: 'Export a transparent PNG (or solid/blur fill). No account needed.' },
            ].map((s) => (
              <div key={s.n} className="glass-panel rounded-2xl border border-white/10 p-5">
                <div className="font-display text-2xl text-amber-400">{s.n}</div>
                <div className="mt-2 font-display text-lg text-[#e8ecd8]">{s.t}</div>
                <p className="mt-1.5 text-sm text-[#8a9e7e]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-deep rounded-[1.75rem] border border-amber-400/15 p-3 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                <Sparkles size={15} />
              </span>
              <div>
                <div className="font-display text-sm font-semibold text-[#e8ecd8]">Background remover</div>
                <div className="font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#7a8f6e]">local-first image utility</div>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">
              <CloudOff size={13} /> no upload required
            </div>
          </div>

          {processor.status === 'idle' && <UploadEmpty onFile={processor.chooseFile} />}

          {processor.status === 'error' && (
            <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-[1.35rem] border border-red-400/30 bg-red-950/30 px-5 text-center">
              <X size={22} className="text-red-400" />
              <h3 className="mt-4 font-display text-2xl text-[#f0d0c8]">That one did not make it through.</h3>
              <p className="mt-2 max-w-md text-sm text-[#c9a09a]">{processor.error}</p>
              <button type="button" className="btn-quiet mt-6 rounded-xl px-4 py-2.5 text-sm" onClick={processor.reset}>
                <RotateCcw size={14} /> Try another image
              </button>
            </div>
          )}

          {processor.status === 'selected' && processor.previewUrl && (
            <div className="grid gap-3 lg:grid-cols-[1fr_17rem]">
              <ImagePreview src={processor.previewUrl} label="Original" />
              <div className="flex flex-col justify-between rounded-[1.35rem] border border-white/8 bg-white/[.03] p-6">
                <div>
                  <div className="font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">ready to trace</div>
                  <div className="mt-3 break-words font-display text-xl leading-tight tracking-[-.04em] text-[#e8ecd8]">{processor.file?.name}</div>
                  <div className="mt-2 text-sm text-[#7a8f6e]">
                    {processor.file ? `${(processor.file.size / 1024 / 1024).toFixed(1)} MB` : ''} · image file
                  </div>
                </div>
                <div className="mt-8">
                  <button type="button" className="btn-gold w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={processor.process}>
                    <Sparkles size={15} /> Remove background
                  </button>
                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-center gap-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#7a8f6e] hover:text-amber-300"
                    onClick={processor.reset}
                  >
                    <RotateCcw size={12} /> choose another
                  </button>
                </div>
              </div>
            </div>
          )}

          {processor.status === 'processing' && <ProcessingState progress={processor.progress} engine={processor.engine} />}

          {processor.status === 'completed' && processor.resultUrl && (
            <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
              <div
                ref={previewRef}
                className="relative touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onPointerCancel={onPointerUp}
                style={{ cursor: brushMode ? 'crosshair' : undefined }}
              >
                {/* Brush mode: result-only (no slider) so the compare bar does not steal the cursor */}
                {brushMode ? (
                  <div className="checkerboard relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.35rem] p-3">
                    <img
                      src={processor.resultUrl}
                      alt="Paint target"
                      className="max-h-[27rem] w-full rounded-xl object-contain pointer-events-none select-none"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#042f2e]/80 px-2.5 py-1 font-mono-zon text-[.5rem] uppercase tracking-[.1em] text-amber-300">
                      brush: {brushMode} · drag to paint
                    </div>
                  </div>
                ) : processor.previewUrl ? (
                  <ComparisonSlider original={processor.previewUrl} result={processor.resultUrl} interactive />
                ) : (
                  <div className="checkerboard relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.35rem] p-3">
                    <img src={processor.resultUrl} alt="Transparent result" className="max-h-[27rem] w-full rounded-xl object-contain" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 rounded-[1.35rem] border border-amber-400/20 bg-[#042f2e]/70 p-5 text-[#f2f0d8]">
                <div>
                  <div className="flex items-center gap-2 font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-amber-400">
                    <Check size={14} /> cutout complete
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#a9bd9a]">
                    {processor.engine === 'basic local fallback'
                      ? 'Basic local fallback used (color flood-fill). Not an AI model — refine edges below if needed.'
                      : 'Processed in your browser with the available removal engine. Refine edges if needed.'}
                  </p>
                </div>

                {/* Edge refine */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">
                    <span>edge refine</span>
                    <span>{edgeAmount === 0 ? 'none' : edgeAmount > 0 ? `feather +${edgeAmount}` : `harden ${edgeAmount}`}</span>
                  </div>
                  <input
                    type="range"
                    min={-1}
                    max={1}
                    step={0.25}
                    value={edgeAmount}
                    onChange={(e) => setEdgeAmount(Number(e.target.value))}
                    className="range-gold"
                  />
                  <button type="button" className="btn-quiet mt-2 w-full rounded-lg px-3 py-2 text-xs" onClick={applyEdge}>
                    Apply edge refine
                  </button>
                </div>

                {/* Brushes */}
                <div>
                  <div className="mb-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">brush tools</div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setBrushMode(brushMode === 'restore' ? null : 'restore')}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-[.65rem] ${brushMode === 'restore' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                    >
                      <Paintbrush size={13} /> Restore
                    </button>
                    <button
                      type="button"
                      onClick={() => setBrushMode(brushMode === 'erase' ? null : 'erase')}
                      className={`flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-[.65rem] ${brushMode === 'erase' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                    >
                      <Eraser size={13} /> Erase
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">
                    <span>size</span>
                    <span>{brushSize}px</span>
                  </div>
                  <input type="range" min={6} max={80} value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="range-gold" />
                  <button
                    type="button"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-2 text-[.65rem] text-[#a9bd9a] hover:text-amber-300"
                    onClick={() => void processor.undoRefine()}
                  >
                    <Undo2 size={13} /> Undo refine
                  </button>
                </div>

                {/* Background */}
                <div>
                  <div className="mb-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">background</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(['transparent', 'solid', 'blur'] as BgFill[]).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setBgFill(f)}
                        className={`rounded-lg px-2.5 py-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${bgFill === f ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  {bgFill === 'solid' && (
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="mt-2 h-9 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent" />
                  )}
                  <button type="button" className="btn-quiet mt-2 w-full rounded-lg px-3 py-2 text-xs" onClick={applyBg}>
                    Apply background
                  </button>
                </div>

                <button type="button" className="btn-gold mt-1 w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={openAd}>
                  <Download size={15} /> Download PNG
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#a9bd9a] hover:text-amber-300"
                  onClick={processor.reset}
                >
                  <RotateCcw size={12} /> start over
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="mt-4 flex flex-col justify-between gap-2 px-1 text-[.7rem] text-[#7a8f6e] sm:flex-row">
          <span className="flex items-center gap-2">
            <LockKeyhole size={13} className="text-amber-400/80" /> Your image never leaves this tab.
          </span>
          <span className="font-mono-zon text-[.55rem] uppercase tracking-[.1em]">
            {processor.status === 'completed' ? `${processor.engine} · png ready` : 'privacy is the feature'}
          </span>
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-6 backdrop-blur-md">
            <h3 className="font-display text-xl text-[#e8ecd8]">Technical notes</h3>
            <p className="mt-3 text-sm leading-relaxed text-[#8a9e7e]">
              When the primary AI engine (@imgly/background-removal) is available it runs fully in-browser via WebAssembly / ONNX. If unavailable, a local flood-fill samples edge colors and removes similar pixels with soft alpha. After cutout you can refine edges (feather/harden), restore or erase with brushes, and set transparent, solid, or blurred backgrounds. Export is PNG.
            </p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-6 backdrop-blur-md">
            <h3 className="font-display text-xl text-[#e8ecd8]">Privacy FAQs</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#8a9e7e]">
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-amber-400" /> Images stay in memory only for the session.
              </li>
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-amber-400" /> No server-side storage or analytics of media.
              </li>
              <li className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-amber-400" /> Auth is optional and only for saved-file features.
              </li>
            </ul>
          </div>
        </section>
        <Footer />
      </div>

      {adOpen && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6" role="dialog" aria-modal="true">
          <div className="glass-deep w-full max-w-md rounded-[1.75rem] border border-amber-400/20 p-6 shadow-2xl sm:p-8 animate-scale-in">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow !text-amber-400/90">one small pause</div>
                <h3 className="mt-2 font-display text-3xl tracking-[-.05em] text-[#f2f0d8]">A short sponsor message</h3>
              </div>
              <button type="button" onClick={() => setAdOpen(false)} className="rounded-xl p-2 text-[#8a9e7e] hover:bg-white/10 hover:text-[#f2f0d8]">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[.04] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-[#042f2e]">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-display font-semibold text-[#e8ecd8]">Zon is staying small and free.</div>
                  <div className="mt-1 text-xs text-[#8a9e7e]">A placeholder sponsor slot helps keep it that way.</div>
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-[width] duration-1000" style={{ width: `${((5 - countdown) / 5) * 100}%` }} />
              </div>
              <div className="mt-3 text-center font-mono-zon text-[.58rem] uppercase tracking-[.12em] text-[#8a9e7e]">
                {countdown > 0 ? `Your download is ready in ${countdown}` : 'Your download is ready'}
              </div>
            </div>
            <button
              type="button"
              disabled={countdown > 0}
              className="btn-gold mt-5 w-full rounded-xl px-4 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
              onClick={download}
            >
              <Download size={15} /> {countdown > 0 ? `Please wait ${countdown}s` : 'Download transparent PNG'}
            </button>
            <p className="mt-4 text-center text-[.65rem] text-[#6b7f62]">No download starts automatically. You choose when to continue.</p>
          </div>
        </div>
      )}
    </main>
  );
}
