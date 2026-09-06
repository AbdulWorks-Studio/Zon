import { RefreshCw } from 'lucide-react';
import type { EngineMode, VoiceSettings } from './types';

export function AdvancedControls({ settings, onChange, mode, onRegenerate, canRegenerate }: { settings: VoiceSettings; onChange: (next: VoiceSettings) => void; mode: EngineMode; onRegenerate: () => void; canRegenerate: boolean }) {
  const set = (key: keyof VoiceSettings) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...settings, [key]: Number(e.target.value) });

  return (
    <div className="flex flex-col gap-4">
      <Slider label="Stability" hint="Lower = more expressive, higher = more consistent." value={settings.stability} onChange={set('stability')} format={(v) => `${Math.round(v * 100)}%`} />
      <Slider label="Clarity / similarity" hint="How closely output should match the base voice character." value={settings.clarity} onChange={set('clarity')} format={(v) => `${Math.round(v * 100)}%`} />
      <Slider label="Speed" hint="Speaking rate." value={settings.speed} min={0.5} max={2} step={0.05} onChange={set('speed')} format={(v) => `${v.toFixed(2)}×`} />
      <Slider
        label="Pitch"
        hint={mode === 'pro' ? 'Local mode only — Pro API does not expose pitch.' : 'Adjusts voice pitch.'}
        value={settings.pitch}
        min={0}
        max={2}
        step={0.05}
        onChange={set('pitch')}
        format={(v) => `${v.toFixed(2)}×`}
        disabled={mode === 'pro'}
      />
      <Slider
        label="Style exaggeration"
        hint={mode === 'local' ? 'Pro API only (Multilingual v2 model).' : 'Pushes delivery further from a neutral read.'}
        value={settings.styleExaggeration}
        onChange={set('styleExaggeration')}
        format={(v) => `${Math.round(v * 100)}%`}
        disabled={mode === 'local'}
      />
      <button type="button" disabled={!canRegenerate} onClick={onRegenerate} className="btn-quiet flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm disabled:opacity-40">
        <RefreshCw size={13} /> Regenerate variation
      </button>
    </div>
  );
}

function Slider({ label, hint, value, onChange, format, min = 0, max = 1, step = 0.02, disabled }: { label: string; hint: string; value: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; format: (v: number) => string; min?: number; max?: number; step?: number; disabled?: boolean }) {
  return (
    <div className={disabled ? 'opacity-40' : ''}>
      <div className="mb-1.5 flex items-center justify-between font-mono-zon text-[.62rem] uppercase tracking-[.1em] text-[#8a9e7e]">
        <span>{label}</span><span>{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} disabled={disabled} className="range-gold" />
      <p className="mt-1 text-[.72rem] leading-relaxed text-[#6b7f62]">{hint}</p>
    </div>
  );
}
