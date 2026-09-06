import { useEffect, useState } from 'react';
import { Download, ImagePlus, RotateCcw } from 'lucide-react';
import { ToolShell } from '@/components/ToolShell';
import { UploadEmpty } from '@/components/UploadEmpty';
import { useSimpleImage } from '@/hooks/useSimpleImage';

export function ResizePage() {
  const img = useSimpleImage();
  const [mode, setMode] = useState<'scale' | 'custom'>('scale');
  const [scale, setScale] = useState(2);
  const [outW, setOutW] = useState(0);
  const [outH, setOutH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<'image/png' | 'image/jpeg'>('image/png');
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!img.url) {
      setDims({ w: 0, h: 0 });
      return;
    }
    const i = new Image();
    i.onload = () => {
      setDims({ w: i.naturalWidth, h: i.naturalHeight });
      setOutW(i.naturalWidth);
      setOutH(i.naturalHeight);
    };
    i.src = img.url;
  }, [img.url]);

  const targetW = mode === 'scale' ? Math.round(dims.w * scale) : outW;
  const targetH = mode === 'scale' ? Math.round(dims.h * scale) : outH;

  const onOutW = (v: number) => {
    setOutW(v);
    if (lockAspect && dims.w) setOutH(Math.round(v * (dims.h / dims.w)));
  };
  const onOutH = (v: number) => {
    setOutH(v);
    if (lockAspect && dims.h) setOutW(Math.round(v * (dims.w / dims.h)));
  };

  /** Multi-step downscale for sharper results when shrinking a lot. */
  const drawHighQuality = (src: ImageBitmap | HTMLCanvasElement, tw: number, th: number) => {
    let cur: HTMLCanvasElement | ImageBitmap = src;
    let cw = 'width' in src && !(src instanceof ImageBitmap) ? src.width : (src as ImageBitmap).width;
    let ch = 'height' in src && !(src instanceof ImageBitmap) ? src.height : (src as ImageBitmap).height;

    // Progressive downscale by ~50% steps when reducing size
    while (cw > tw * 2 || ch > th * 2) {
      const nw = Math.max(tw, Math.round(cw / 2));
      const nh = Math.max(th, Math.round(ch / 2));
      const step = document.createElement('canvas');
      step.width = nw;
      step.height = nh;
      const sctx = step.getContext('2d')!;
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(cur as CanvasImageSource, 0, 0, nw, nh);
      cur = step;
      cw = nw;
      ch = nh;
    }
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, tw);
    canvas.height = Math.max(1, th);
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cur as CanvasImageSource, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const runResize = async () => {
    if (!img.file || !targetW || !targetH) return;
    const bitmap = await createImageBitmap(img.file);
    const canvas = drawHighQuality(bitmap, targetW, targetH);
    bitmap.close();
    const type = format;
    const quality = format === 'image/jpeg' ? 0.92 : undefined;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        if (img.result) URL.revokeObjectURL(img.result);
        img.setResult(URL.createObjectURL(blob));
      },
      type,
      quality,
    );
  };

  const download = () => {
    if (!img.result) return;
    const a = document.createElement('a');
    a.href = img.result;
    const ext = format === 'image/jpeg' ? 'jpg' : 'png';
    a.download = `${img.file?.name.replace(/\.[^/.]+$/, '') ?? 'zon'}-${targetW}x${targetH}.${ext}`;
    a.click();
  };

  return (
    <ToolShell
      title="Image Resize"
      subtitle="Scale or set exact size with high-quality resampling. PNG or JPEG export."
      steps={[
        { n: '01', t: 'Drag & Drop', d: 'Drop any JPG, PNG or WebP. Files never leave your browser.' },
        { n: '02', t: 'Size', d: 'Use a scale preset or enter custom width × height.' },
        { n: '03', t: 'Free Download', d: 'Export sharp PNG or JPEG. No account needed.' },
      ]}
      technical="Resizing uses progressive high-quality canvas resampling (especially when downscaling) before re-encoding to PNG or JPEG — all client-side."
      faqs={['Images stay in memory only for the session.', 'No server-side storage or analytics of media.', 'Auth is optional and only for saved-file features.']}
    >
      {!img.url && <UploadEmpty onFile={img.choose} />}
      {img.url && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#0a2e28]/60 p-3">
            <img src={img.result || img.url} alt="Preview" className="max-h-[26rem] w-full rounded-xl object-contain" />
          </div>
          <div className="flex flex-col gap-3 rounded-[1.35rem] border border-white/8 bg-white/[.03] p-5">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('scale')}
                className={`flex-1 rounded-lg px-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${mode === 'scale' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
              >
                scale
              </button>
              <button
                type="button"
                onClick={() => setMode('custom')}
                className={`flex-1 rounded-lg px-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${mode === 'custom' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
              >
                custom
              </button>
            </div>

            {dims.w > 0 && (
              <p className="text-sm text-[#8a9e7e]">
                {dims.w}×{dims.h} → <span className="text-amber-300">{targetW}×{targetH}</span>
              </p>
            )}

            {mode === 'scale' && (
              <div className="flex flex-wrap gap-2">
                {[0.5, 1, 1.5, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setScale(s)}
                    className={`rounded-lg px-3 py-1.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${scale === s ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            )}

            {mode === 'custom' && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-[#a9bd9a]">
                  W
                  <input
                    type="number"
                    min={1}
                    max={8192}
                    value={outW || ''}
                    onChange={(e) => onOutW(Number(e.target.value) || 0)}
                    className="input-glass flex-1 rounded-lg px-3 py-2 text-sm text-[#e8ecd8]"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-[#a9bd9a]">
                  H
                  <input
                    type="number"
                    min={1}
                    max={8192}
                    value={outH || ''}
                    onChange={(e) => onOutH(Number(e.target.value) || 0)}
                    className="input-glass flex-1 rounded-lg px-3 py-2 text-sm text-[#e8ecd8]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setLockAspect(!lockAspect)}
                  className={`w-full rounded-lg px-3 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${lockAspect ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                >
                  lock aspect {lockAspect ? 'on' : 'off'}
                </button>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormat('image/png')}
                className={`flex-1 rounded-lg px-2 py-2 font-mono-zon text-[.55rem] uppercase ${format === 'image/png' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
              >
                PNG
              </button>
              <button
                type="button"
                onClick={() => setFormat('image/jpeg')}
                className={`flex-1 rounded-lg px-2 py-2 font-mono-zon text-[.55rem] uppercase ${format === 'image/jpeg' ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
              >
                JPEG
              </button>
            </div>

            <button type="button" className="btn-gold mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={runResize}>
              <ImagePlus size={15} /> Resize
            </button>
            {img.result && (
              <button type="button" className="btn-gold w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={download}>
                <Download size={15} /> Download
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
