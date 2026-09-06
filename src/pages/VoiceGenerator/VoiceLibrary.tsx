import { useMemo, useState } from 'react';
import { Check, Play, Search, Square } from 'lucide-react';
import type { VoicePersona } from './types';

type FilterKey = 'all' | 'hindi-urdu' | 'male' | 'female' | 'multilingual';

function isHindiUrdu(p: VoicePersona) {
  const code = p.langCode.toLowerCase();
  const lang = p.language.toLowerCase();
  return code.startsWith('hi') || code.startsWith('ur') || lang.includes('hindi') || lang.includes('urdu');
}

export function VoiceLibrary({
  personas,
  selectedId,
  onSelect,
  onPreview,
  previewingId,
}: {
  personas: VoicePersona[];
  selectedId: string;
  onSelect: (id: string) => void;
  onPreview: (persona: VoicePersona) => void;
  previewingId: string | null;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    return personas.filter((p) => {
      if (filter === 'male' && p.gender !== 'male') return false;
      if (filter === 'female' && p.gender !== 'female') return false;
      if (filter === 'hindi-urdu' && !isHindiUrdu(p)) return false;
      if (filter === 'multilingual' && p.langCode.startsWith('en') && !isHindiUrdu(p)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.style.toLowerCase().includes(q) ||
          p.language.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [personas, filter, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="glass-input flex flex-1 items-center gap-2 rounded-xl px-3 py-2.5">
          <Search size={15} className="text-[#7a8f6e]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Adam, Imran, Hindi…"
            className="w-full bg-transparent text-sm text-[#e8ecd8] outline-none placeholder:text-[#5f7458]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {([
            ['all', 'all'],
            ['hindi-urdu', 'HI / UR'],
            ['male', 'male'],
            ['female', 'female'],
            ['multilingual', 'multi'],
          ] as [FilterKey, string][]).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-lg px-2.5 py-2 font-mono-zon text-[.62rem] uppercase tracking-[.06em] ${
                filter === k ? 'border border-amber-400/40 bg-amber-400/20 text-amber-300' : 'border border-white/10 bg-white/5 text-[#a9bd9a]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid max-h-[26rem] grid-cols-1 gap-2.5 overflow-y-auto pr-1 sm:grid-cols-2">
        {filtered.map((p) => {
          const active = p.id === selectedId;
          const previewing = previewingId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p.id)}
              className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                active ? 'border-amber-400/50 bg-amber-400/10' : 'border-white/10 bg-white/[.03] hover:border-white/20'
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm ${
                  active ? 'bg-amber-400 text-[#042f2e]' : 'bg-white/10 text-[#c6d5b5]'
                }`}
              >
                {p.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-display text-[.98rem] text-[#e8ecd8]">{p.name}</span>
                  {active && <Check size={13} className="shrink-0 text-amber-400" />}
                </div>
                <div className="mt-0.5 truncate text-xs text-[#8a9e7e]">
                  {p.style} · {p.language}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(p);
                }}
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#a9bd9a] hover:border-amber-400/50 hover:text-amber-300"
                aria-label={`Preview ${p.name}`}
              >
                {previewing ? <Square size={11} /> : <Play size={11} className="ml-0.5" />}
              </button>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="col-span-full py-6 text-center text-sm text-[#7a8f6e]">No voices match that search.</p>}
      </div>
    </div>
  );
}
