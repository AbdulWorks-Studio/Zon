import { useState } from 'react';
import { Download, Palette, RotateCcw } from 'lucide-react';
import { ToolShell } from '@/components/ToolShell';
import { UploadEmpty } from '@/components/UploadEmpty';
import { useSimpleImage } from '@/hooks/useSimpleImage';

export function ColorPage() {
  const img = useSimpleImage();
  const [preset, setPreset] = useState('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const presets: Record<string, { filter: string; b?: number; c?: number; s?: number }> = {
    none: { filter: 'none' },
    warm: { filter: 'sepia(0.28) saturate(1.25) brightness(1.05)', b: 105, c: 105, s: 120 },
    cool: { filter: 'hue-rotate(18deg) saturate(1.12) brightness(1.03)', b: 103, c: 105, s: 112 },
    mono: { filter: 'grayscale(1) contrast(1.12)', b: 100, c: 112, s: 0 },
    vivid: { filter: 'saturate(1.65) contrast(1.18)', b: 102, c: 118, s: 165 },
    fade: { filter: 'contrast(0.88) brightness(1.1) saturate(0.8)', b: 110, c: 88, s: 80 },
    cinema: { filter: 'contrast(1.2) saturate(0.9) brightness(0.95) sepia(0.15)', b: 95, c: 120, s: 90 },
  };

  const liveFilter = () => {
    if (preset !== 'none' && preset !== 'custom') return presets[preset]?.filter ?? 'none';
    return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
  };

  const applyPreset = (k: string) => {
    setPreset(k);
    const p = presets[k];
    if (p?.b != null) setBrightness(p.b);
    if (p?.c != null) setContrast(p.c);
    if (p?.s != null) setSaturation(p.s);
  };

  const runGrade = async () => {
    if (!img.file) return;
    const bitmap = await createImageBitmap(img.file);
    const canvas = document.createElement('canvas');
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.filter = liveFilter();
    ctx.drawImage(bitmap, 0, 0);
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
    a.download = `${img.file?.name.replace(/\.[^/.]+$/, '') ?? 'zon'}-grade.png`;
    a.click();
  };

  return (
    <ToolShell
      title="Color Grade"
      subtitle="Presets plus brightness, contrast, and saturation — export a graded PNG."
      steps={[
        { n: '01', t: 'Drag & Drop', d: 'Drop any JPG, PNG or WebP. Files never leave your browser.' },
        { n: '02', t: 'Look + dials', d: 'Pick a preset or tune brightness, contrast, saturation live.' },
        { n: '03', t: 'Free Download', d: 'Export the graded PNG. No account needed.' },
      ]}
      technical="Color grading applies canvas CSS filters (brightness, contrast, saturation, and preset looks) to pixel data in-browser, then encodes PNG. Nothing leaves your device."
      faqs={['Images stay in memory only for the session.', 'No server-side storage or analytics of media.', 'Auth is optional and only for saved-file features.']}
    >
      {!img.url && <UploadEmpty onFile={img.choose} />}
      {img.url && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="relative flex min-h-[18rem] items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#0a2e28]/60 p-3">
            <img
              src={img.result || img.url}
              alt="Preview"
              className="max-h-[26rem] w-full rounded-xl object-contain"
              style={!img.result ? { filter: liveFilter() } : undefined}
            />
          </div>
          <div className="flex flex-col gap-3 rounded-[1.35rem] border border-white/8 bg-white/[.03] p-5">
            <div className="font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">look</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(presets).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => applyPreset(k)}
                  className={`rounded-lg px-3 py-1.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${preset === k ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="mt-1">
              <div className="mb-1 flex justify-between font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">
                <span>brightness</span><span>{brightness}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={brightness}
                onChange={(e) => {
                  setBrightness(Number(e.target.value));
                  setPreset('custom');
                }}
                className="range-gold"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">
                <span>contrast</span><span>{contrast}%</span>
              </div>
              <input
                type="range"
                min={50}
                max={150}
                value={contrast}
                onChange={(e) => {
                  setContrast(Number(e.target.value));
                  setPreset('custom');
                }}
                className="range-gold"
              />
            </div>
            <div>
              <div className="mb-1 flex justify-between font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#8a9e7e]">
                <span>saturation</span><span>{saturation}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={200}
                value={saturation}
                onChange={(e) => {
                  setSaturation(Number(e.target.value));
                  setPreset('custom');
                }}
                className="range-gold"
              />
            </div>

            <button type="button" className="btn-gold mt-2 w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={runGrade}>
              <Palette size={15} /> Apply grade
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
