import { useState } from 'react';
import { Bold, ChevronDown, Clipboard, PauseCircle } from 'lucide-react';
import { SCRIPT_TEMPLATES } from './voicePresets';
import { PAUSE_TOKENS } from './script';

export function ScriptTools({ textareaRef, script, setScript }: { textareaRef: React.RefObject<HTMLTextAreaElement | null>; script: string; setScript: (next: string) => void }) {
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const insertAtCursor = (token: string) => {
    const el = textareaRef.current;
    if (!el) { setScript(script + token); return; }
    const start = el.selectionStart ?? script.length;
    const end = el.selectionEnd ?? script.length;
    const next = script.slice(0, start) + token + script.slice(end);
    setScript(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + token.length, start + token.length); });
  };

  const wrapSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    if (start === end) return;
    const selected = script.slice(start, end);
    const next = `${script.slice(0, start)}*${selected}*${script.slice(end)}`;
    setScript(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start, end + 2); });
  };

  const pasteClean = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const cleaned = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
      insertAtCursor(cleaned);
    } catch {
      // clipboard permission denied — silently no-op, the user can paste manually
    }
  };

  const applyTemplate = (text: string) => {
    if (script.trim() && !window.confirm('Replace the current script with this template?')) return;
    setScript(text);
    setTemplatesOpen(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={pasteClean} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[.72rem] text-[#a9bd9a] hover:text-amber-300"><Clipboard size={12} /> Paste clean</button>
      <button type="button" onClick={wrapSelection} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[.72rem] text-[#a9bd9a] hover:text-amber-300"><Bold size={12} /> Emphasize</button>
      {(Object.keys(PAUSE_TOKENS) as (keyof typeof PAUSE_TOKENS)[]).map((key) => (
        <button key={key} type="button" onClick={() => insertAtCursor(`[pause:${PAUSE_TOKENS[key]}]`)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[.72rem] text-[#a9bd9a] hover:text-amber-300">
          <PauseCircle size={12} /> {key} pause
        </button>
      ))}
      <div className="relative">
        <button type="button" onClick={() => setTemplatesOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-[.72rem] text-[#a9bd9a] hover:text-amber-300">
          Templates <ChevronDown size={12} className={`transition-transform ${templatesOpen ? 'rotate-180' : ''}`} />
        </button>
        {templatesOpen && (
          <div className="absolute left-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-amber-400/20 bg-[#042f2e]/97 shadow-2xl backdrop-blur-xl">
            {SCRIPT_TEMPLATES.map((t) => (
              <button key={t.label} type="button" onClick={() => applyTemplate(t.text)} className="block w-full px-3.5 py-2.5 text-left text-[.82rem] text-[#c6d5b5] hover:bg-white/8 hover:text-[#f2f0d8]">{t.label}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
