import { useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Trash2 } from 'lucide-react';
import { ELEVEN_MODELS } from './elevenLabsApi';

export function SettingsPanel({ apiKey, onSaveKey, onClearKey, modelId, onModelChange, mode }: { apiKey: string; onSaveKey: (key: string) => void; onClearKey: () => void; modelId: string; onModelChange: (id: string) => void; mode: 'local' | 'pro' }) {
  const [draft, setDraft] = useState(apiKey);
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono-zon text-[.62rem] uppercase tracking-[.08em] ${mode === 'pro' ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${mode === 'pro' ? 'bg-emerald-400' : 'bg-[#a9bd9a]'}`} />
        {mode === 'pro' ? 'Pro mode active' : 'Local mode (no key)'}
      </div>
      <div>
        <div className="mb-1.5 flex items-center gap-1.5 font-mono-zon text-[.62rem] uppercase tracking-[.1em] text-[#8a9e7e]"><KeyRound size={12} /> Pro voice API key</div>
        <div className="glass-input flex items-center gap-2 rounded-xl px-3 py-2.5">
          <input type={visible ? 'text' : 'password'} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="sk_…" className="w-full bg-transparent text-sm text-[#e8ecd8] outline-none placeholder:text-[#5f7458]" />
          <button type="button" onClick={() => setVisible((v) => !v)} className="text-[#8a9e7e] hover:text-amber-300">{visible ? <EyeOff size={15} /> : <Eye size={15} />}</button>
        </div>
        <p className="mt-1.5 text-[.72rem] leading-relaxed text-[#6b7f62]">Stored only in this browser. Used from your device for Pro voice mode — not sent to Zon servers.</p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={() => onSaveKey(draft.trim())} className="btn-quiet flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[.78rem]"><Check size={13} /> Save key</button>
          <button type="button" onClick={() => { setDraft(''); onClearKey(); }} className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-[.78rem] text-[#a9bd9a] hover:text-red-300"><Trash2 size={13} /></button>
        </div>
      </div>
      <div>
        <div className="mb-1.5 font-mono-zon text-[.62rem] uppercase tracking-[.1em] text-[#8a9e7e]">model (pro mode)</div>
        <select value={modelId} onChange={(e) => onModelChange(e.target.value)} className="glass-input w-full rounded-xl px-3 py-2.5 text-sm text-[#e8ecd8] outline-none">
          {ELEVEN_MODELS.map((m) => <option key={m.id} value={m.id} className="bg-[#042f2e]">{m.label}</option>)}
        </select>
      </div>
    </div>
  );
}
