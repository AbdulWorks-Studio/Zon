import { Scissors, Sparkles, Volume2, Waves, Wind } from 'lucide-react';

export function NoiseControls({
  highpassFreq, setHighpassFreq,
  gateThreshold, setGateThreshold,
  strength, setStrength,
  normalize, setNormalize,
  trimSilence, setTrimSilence,
  onClean, cleaning,
}: {
  highpassFreq: number; setHighpassFreq: (n: number) => void;
  gateThreshold: number; setGateThreshold: (n: number) => void;
  strength: number; setStrength: (n: number) => void;
  normalize: boolean; setNormalize: (b: boolean) => void;
  trimSilence: boolean; setTrimSilence: (b: boolean) => void;
  onClean: () => void; cleaning: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-[1.35rem] border border-white/8 bg-white/[.03] p-5">
      <div>
        <div className="mb-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">
          <span className="flex items-center gap-1.5"><Sparkles size={12} /> denoise strength</span>
          <span>{Math.round(strength * 100)}%</span>
        </div>
        <input type="range" min={0} max={100} value={Math.round(strength * 100)} onChange={(e) => setStrength(Number(e.target.value) / 100)} className="range-gold" />
        <p className="mt-1.5 text-[.65rem] leading-relaxed text-[#7a8f6e]">Overall cleanup intensity. Higher = quieter room noise, more processing.</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">
          <span className="flex items-center gap-1.5"><Wind size={12} /> rumble / hum filter</span><span>{highpassFreq} Hz</span>
        </div>
        <input type="range" min={20} max={400} step={5} value={highpassFreq} onChange={(e) => setHighpassFreq(Number(e.target.value))} className="range-gold" />
        <p className="mt-1.5 text-[.65rem] leading-relaxed text-[#7a8f6e]">Cuts everything below this frequency — fan noise, AC hum, low rumble.</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#8a9e7e]">
          <span className="flex items-center gap-1.5"><Waves size={12} /> noise gate</span><span>{Math.round(gateThreshold * 100)}%</span>
        </div>
        <input type="range" min={0} max={20} value={Math.round(gateThreshold * 100)} onChange={(e) => setGateThreshold(Number(e.target.value) / 100)} className="range-gold" />
        <p className="mt-1.5 text-[.65rem] leading-relaxed text-[#7a8f6e]">Quiets background hiss between words. Higher can clip soft speech.</p>
      </div>

      <button type="button" onClick={() => setNormalize(!normalize)} className={`flex items-center justify-between rounded-lg px-3 py-2.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${normalize ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>
        <span className="flex items-center gap-1.5"><Volume2 size={13} /> normalize volume</span>
        <span>{normalize ? 'on' : 'off'}</span>
      </button>
      <button type="button" onClick={() => setTrimSilence(!trimSilence)} className={`flex items-center justify-between rounded-lg px-3 py-2.5 font-mono-zon text-[.58rem] uppercase tracking-[.08em] ${trimSilence ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>
        <span className="flex items-center gap-1.5"><Scissors size={13} /> trim silence</span>
        <span>{trimSilence ? 'on' : 'off'}</span>
      </button>

      <button type="button" disabled={cleaning} onClick={onClean} className="btn-gold mt-1 w-full rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-50">
        <Sparkles size={15} /> {cleaning ? 'Cleaning…' : 'Clean audio'}
      </button>
      <p className="text-center text-[.7rem] leading-relaxed text-[#7a8f6e]">Adjust and re-run as many times as you like — nothing leaves your device.</p>
    </div>
  );
}
