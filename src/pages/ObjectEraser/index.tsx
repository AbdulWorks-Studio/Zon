import { useRef, useState } from 'react';
import { Check, Download, Eraser as EraserIcon, RotateCcw, X } from 'lucide-react';
import { ToolShell } from '@/components/ToolShell';
import { UploadEmpty } from '@/components/UploadEmpty';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { ProcessingState } from '@/components/ProcessingState';
import { EraserCanvas, type EraserCanvasHandle } from './EraserCanvas';
import { EraserToolbar } from './EraserToolbar';
import { runContentFill, type FillQuality } from './inpaint';

type Stage = 'idle' | 'editing' | 'filling' | 'done';

export function ObjectEraserPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [brushSize, setBrushSize] = useState(28);
  const [hardness, setHardness] = useState(0.7);
  const [mode, setMode] = useState<'erase' | 'restore'>('erase');
  const [quality, setQuality] = useState<FillQuality>('fast');
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [error, setError] = useState('');

  const handleRef = useRef<EraserCanvasHandle | null>(null);

  const chooseFile = (f: File) => {
    if (!f.type.startsWith('image/')) { setError('Please choose a JPG, PNG, or WebP image.'); return; }
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setHistory([]); setHistoryIndex(-1); setResultUrl(''); setError('');
    setStage('editing');
  };

  const pushHistory = () => {
    const snap = handleRef.current?.getMaskSnapshot();
    if (!snap) return;
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      const next = [...trimmed, snap];
      setHistoryIndex(next.length - 1);
      return next;
    });
  };

  const undo = () => {
    if (historyIndex <= 0) { handleRef.current?.clearMask(); setHistoryIndex(-1); return; }
    const prevSnap = history[historyIndex - 1];
    handleRef.current?.loadMaskSnapshot(prevSnap);
    setHistoryIndex(historyIndex - 1);
  };
  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const nextSnap = history[historyIndex + 1];
    handleRef.current?.loadMaskSnapshot(nextSnap);
    setHistoryIndex(historyIndex + 1);
  };
  const clearMask = () => { handleRef.current?.clearMask(); setHistory([]); setHistoryIndex(-1); };

  const applyFill = async () => {
    const source = handleRef.current?.getSourceCanvas();
    const mask = handleRef.current?.getMaskCanvas();
    if (!source || !mask) return;
    setStage('filling'); setProgress(4); setError('');
    try {
      const filled = await runContentFill(source, mask, { quality, onProgress: setProgress });
      const blob: Blob = await new Promise((resolve, reject) => filled.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not export the result.'))), 'image/png'));
      setResultUrl(URL.createObjectURL(blob));
      setStage('done');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong while filling this image.');
      setStage('editing');
    }
  };

  const download = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '') ?? 'zon'}-erased.png`;
    a.click();
  };

  const reset = () => {
    setStage('idle'); setFile(null); setImageUrl(''); setResultUrl(''); setHistory([]); setHistoryIndex(-1); setError('');
  };

  return (
    <ToolShell
      title="Object Eraser 4K"
      subtitle="Paint over anything you don't want. Zon fills it in — right in your browser, up to 3840px."
      steps={[
        { n: '01', t: 'Drag & Drop', d: 'Drop a JPG, PNG, or WebP photo. It never leaves your browser.' },
        { n: '02', t: 'Paint the Object', d: 'Brush over what you want gone, then hit Apply Smart Fill.' },
        { n: '03', t: 'Free Download', d: 'Compare before/after and export the finished PNG.' },
      ]}
      technical="Object Eraser uses patch-seeded diffusion fill (not a hosted neural model) — Zon has no server to run one on. Painted areas are seeded with a plausible color and relaxed toward their unmasked neighbors over dozens of passes, with feathered edges for a smooth blend. It's excellent on skies, walls, skin, water, and blurred backdrops; it will not reconstruct sharp patterns or fine texture under the erased area. 4K Precision mode processes at up to 3840px on the long edge."
      faqs={['Images and masks stay in memory only for this session.', 'No server-side storage or analytics of your photo.', 'Undo/redo and Clear mask let you retry without reloading.', 'Auth is optional and only for saved-file features.']}
    >
      {stage === 'idle' && <UploadEmpty onFile={chooseFile} title="Drop a photo to erase from" hint="JPG, PNG, or WebP · up to 20 MB" />}

      {error && stage === 'idle' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-[#c9a09a]"><X size={15} className="shrink-0 text-red-400" /> {error}</div>
      )}

      {stage === 'editing' && imageUrl && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div>
            <EraserCanvas imageUrl={imageUrl} brushSize={brushSize} hardness={hardness} mode={mode} zoom={zoom} onStroke={pushHistory} registerRef={(h) => (handleRef.current = h)} />
            {error && <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-[#c9a09a]"><X size={15} className="shrink-0 text-red-400" /> {error}</div>}
          </div>
          <EraserToolbar
            brushSize={brushSize} setBrushSize={setBrushSize}
            hardness={hardness} setHardness={setHardness}
            mode={mode} setMode={setMode}
            quality={quality} setQuality={setQuality}
            zoom={zoom} setZoom={setZoom}
            onUndo={undo} onRedo={redo} canUndo={historyIndex >= 0} canRedo={historyIndex < history.length - 1}
            onClearMask={clearMask} onApplyFill={applyFill} filling={false}
          />
        </div>
      )}

      {stage === 'filling' && <ProcessingState progress={progress} engine="private engine" label="diffusing pixels" title={'Filling the\ngap, gently.'} note="Running the content-aware fill in your browser. Larger images and 4K Precision mode take a little longer." />}

      {stage === 'done' && resultUrl && imageUrl && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <ComparisonSlider original={imageUrl} result={resultUrl} leftLabel="Original" rightLabel="Erased" />
          <div className="flex flex-col justify-between rounded-[1.35rem] border border-amber-400/20 bg-[#042f2e]/70 p-6 text-[#f2f0d8]">
            <div>
              <div className="flex items-center gap-2 font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-amber-400"><Check size={14} /> fill complete</div>
              <div className="mt-4 font-display text-[1.9rem] leading-[.95] tracking-[-.05em]">Gone without<br />a trace.</div>
              <p className="mt-4 text-sm leading-relaxed text-[#a9bd9a]">Not happy with a spot? Go back and paint over more, or start fresh.</p>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <button type="button" className="btn-gold w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={download}><Download size={15} /> Download PNG</button>
              <button type="button" className="btn-quiet w-full rounded-xl px-4 py-3 text-sm" onClick={() => setStage('editing')}><EraserIcon size={14} /> Keep editing</button>
              <button type="button" className="mt-1 flex w-full items-center justify-center gap-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#a9bd9a] hover:text-amber-300" onClick={reset}><RotateCcw size={12} /> start over</button>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
