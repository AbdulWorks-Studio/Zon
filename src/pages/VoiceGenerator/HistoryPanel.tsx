import { Download, FileClock, History, Trash2 } from 'lucide-react';
import type { GenerationRecord, ScriptHistoryItem } from './types';

export function HistoryPanel({ sessionItems, scriptItems, onUseScript, onDeleteScript }: { sessionItems: GenerationRecord[]; scriptItems: ScriptHistoryItem[]; onUseScript: (text: string) => void; onDeleteScript: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 flex items-center gap-1.5 font-mono-zon text-[.62rem] uppercase tracking-[.1em] text-[#8a9e7e]"><History size={12} /> this session's audio</div>
        {sessionItems.length === 0 && <p className="text-[.8rem] text-[#6b7f62]">Generations from this visit will appear here.</p>}
        <div className="flex flex-col gap-2">
          {sessionItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5">
              <div className="min-w-0">
                <div className="truncate text-[.82rem] text-[#e8ecd8]">{item.personaName} · {item.mode === 'pro' ? 'Pro' : 'Local'}</div>
                <div className="truncate text-[.68rem] text-[#7a8f6e]">{item.textSnippet}</div>
              </div>
              {item.audioUrl && (
                <a href={item.audioUrl} download={`zon-voice-${item.id}.mp3`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-[#a9bd9a] hover:border-amber-400/50 hover:text-amber-300" aria-label="Download">
                  <Download size={13} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-1.5 font-mono-zon text-[.62rem] uppercase tracking-[.1em] text-[#8a9e7e]"><FileClock size={12} /> recent scripts</div>
        {scriptItems.length === 0 && <p className="text-[.8rem] text-[#6b7f62]">Saved on this device — scripts you generate will show up here.</p>}
        <div className="flex flex-col gap-2">
          {scriptItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2.5">
              <button type="button" onClick={() => onUseScript(item.text)} className="min-w-0 flex-1 truncate text-left text-[.8rem] text-[#c6d5b5] hover:text-amber-300">{item.text}</button>
              <button type="button" onClick={() => onDeleteScript(item.id)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6b7f62] hover:text-red-300" aria-label="Delete"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
