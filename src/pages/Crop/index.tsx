import { useEffect, useRef, useState } from 'react';
import { Crop as CropIcon, Download, RotateCcw } from 'lucide-react';
import { ToolShell } from '@/components/ToolShell';
import { UploadEmpty } from '@/components/UploadEmpty';
import { useSimpleImage } from '@/hooks/useSimpleImage';

type RatioKey = '1:1' | '4:5' | '16:9' | '9:16' | 'free';

export function CropPage() {
  const img = useSimpleImage();
  const [ratio, setRatio] = useState<RatioKey>('1:1');
  const [guides, setGuides] = useState(true);
  const [nat, setNat] = useState({ w: 0, h: 0 });
  // Crop window in image pixel coords: center + size
  const [crop, setCrop] = useState({ cx: 0.5, cy: 0.5, w: 1, h: 1 });
  const dragRef = useRef<{ ox: number; oy: number; cx: number; cy: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const ratios: Record<RatioKey, number> = { '1:1': 1, '4:5': 4 / 5, '16:9': 16 / 9, '9:16': 9 / 16, free: 0 };

  useEffect(() => {
    if (!img.url) {
      setNat({ w: 0, h: 0 });
      return;
    }
    const i = new Image();
    i.onload = () => {
      setNat({ w: i.naturalWidth, h: i.naturalHeight });
      fitCrop(i.naturalWidth, i.naturalHeight, ratio);
    };
    i.src = img.url;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img.url]);

  useEffect(() => {
    if (nat.w) fitCrop(nat.w, nat.h, ratio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ratio]);

  const fitCrop = (iw: number, ih: number, rKey: RatioKey) => {
    const r = ratios[rKey];
    let cw = iw;
    let ch = ih;
    if (r > 0) {
      const srcR = iw / ih;
      if (srcR > r) {
        cw = ih * r;
        ch = ih;
      } else {
        cw = iw;
        ch = iw / r;
      }
    }
    setCrop({ cx: 0.5, cy: 0.5, w: cw / iw, h: ch / ih });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = frameRef.current;
    if (!el) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    dragRef.current = { ox: e.clientX, oy: e.clientY, cx: crop.cx, cy: crop.cy };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current || !frameRef.current || !nat.w) return;
    const rect = frameRef.current.getBoundingClientRect();
    const dx = (e.clientX - dragRef.current.ox) / rect.width;
    const dy = (e.clientY - dragRef.current.oy) / rect.height;
    const halfW = crop.w / 2;
    const halfH = crop.h / 2;
    setCrop((c) => ({
      ...c,
      cx: Math.min(1 - halfW, Math.max(halfW, dragRef.current!.cx + dx)),
      cy: Math.min(1 - halfH, Math.max(halfH, dragRef.current!.cy + dy)),
    }));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const runCrop = async () => {
    if (!img.file || !nat.w) return;
    const bitmap = await createImageBitmap(img.file);
    const sw = Math.round(crop.w * nat.w);
    const sh = Math.round(crop.h * nat.h);
    const sx = Math.round((crop.cx - crop.w / 2) * nat.w);
    const sy = Math.round((crop.cy - crop.h / 2) * nat.h);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, sw);
    canvas.height = Math.max(1, sh);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    canvas.toBlob((blob) => {
      if (!blob) return;
      if (img.result) URL.revokeObjectURL(img.result);
      img.setResult(URL.createObjectURL(blob));
    }, 'image/png');
  };

  const download = () => {
    if (!img.result) return;
    const a = document.createElement('a');
    a.href = img.result;
    a.download = `${img.file?.name.replace(/\.[^/.]+$/, '') ?? 'zon'}-crop.png`;
    a.click();
  };

  const leftPct = (crop.cx - crop.w / 2) * 100;
  const topPct = (crop.cy - crop.h / 2) * 100;
  const wPct = crop.w * 100;
  const hPct = crop.h * 100;

  return (
    <ToolShell
      title="Smart Crop"
      subtitle="Pick a ratio, drag the frame, export a sharp crop — all in your browser."
      steps={[
        { n: '01', t: 'Drag & Drop', d: 'Drop any JPG, PNG or WebP. Files never leave your browser.' },
        { n: '02', t: 'Frame it', d: 'Choose a ratio, drag to reposition, optional rule-of-thirds guides.' },
        { n: '03', t: 'Free Download', d: 'Export a clean cropped PNG. No account needed.' },
      ]}
      technical="Cropping runs on an HTML canvas in your browser. You can reposition the crop window; optional rule-of-thirds guides help composition. Export uses high-quality canvas resampling. No network request sees your file."
      faqs={['Images stay in memory only for the session.', 'No server-side storage or analytics of media.', 'Auth is optional and only for saved-file features.']}
    >
      {!img.url && <UploadEmpty onFile={img.choose} />}
      {img.url && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div
            ref={frameRef}
            className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#0a2e28]/60 p-3 touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <div className="relative max-h-[26rem] w-full">
              <img src={img.result || img.url} alt="Preview" className="max-h-[26rem] w-full rounded-xl object-contain" draggable={false} />
              {!img.result && (
                <div
                  className="pointer-events-none absolute border-2 border-amber-400/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
                  style={{ left: `${leftPct}%`, top: `${topPct}%`, width: `${wPct}%`, height: `${hPct}%` }}
                >
                  {guides && (
                    <>
                      <div className="absolute left-1/3 top-0 h-full w-px bg-amber-400/35" />
                      <div className="absolute left-2/3 top-0 h-full w-px bg-amber-400/35" />
                      <div className="absolute left-0 top-1/3 h-px w-full bg-amber-400/35" />
                      <div className="absolute left-0 top-2/3 h-px w-full bg-amber-400/35" />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3 rounded-[1.35rem] border border-white/8 bg-white/[.03] p-5">
            <div className="font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">aspect ratio</div>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ratios) as RatioKey[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRatio(k)}
                  className={`rounded-lg px-3 py-1.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${ratio === k ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                >
                  {k}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setGuides(!guides)}
              className={`rounded-lg px-3 py-2 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${guides ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
            >
              rule of thirds {guides ? 'on' : 'off'}
            </button>
            <p className="text-[.7rem] text-[#7a8f6e]">Drag on the image to move the crop frame.</p>
            <button type="button" className="btn-gold mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={runCrop}>
              <CropIcon size={15} /> Apply crop
            </button>
            {img.result && (
              <button type="button" className="btn-gold w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={download}>
                <Download size={15} /> Download PNG
              </button>
            )}
            <button
              type="button"
              className="mt-1 flex w-full items-center justify-center gap-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#7a8f6e] hover:text-amber-300"
              onClick={img.reset}
            >
              <RotateCcw size={12} /> start over
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
