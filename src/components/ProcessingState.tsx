import { LoaderCircle } from 'lucide-react';

export function ProcessingState({ progress, engine, label = 'tracing edges', title = 'The quiet work\nis happening.', note }: { progress: number; engine: string; label?: string; title?: string; note?: string }) {
  return (
    <div className="flex min-h-[18rem] flex-col justify-center rounded-[1.35rem] bg-[#042f2e]/80 p-7 text-[#f2f0d8] backdrop-blur-xl">
      <div className="flex items-center justify-between font-mono-zon text-[.62rem] uppercase tracking-[.12em] text-[#b7ca9e]">
        <span className="flex items-center gap-2"><LoaderCircle size={14} className="animate-spin text-amber-400" /> {label}</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-7 h-1 w-full overflow-hidden rounded-full bg-white/10">
        <div className="processing-line h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400" style={{ width: `${Math.max(progress, 9)}%` }} />
      </div>
      <div className="mt-8 whitespace-pre-line font-display text-[2.2rem] leading-none tracking-[-.05em]">{title}</div>
      <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a9bd9a]">{note ?? (engine === 'local fallback' ? 'Using the local processing fallback. It is not AI, and your file stays in this browser.' : 'Preparing a private browser-side result. Your file stays in this browser.')}</p>
    </div>
  );
}
