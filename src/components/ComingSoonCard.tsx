import { Link } from 'wouter';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { useTilt } from '@/hooks/useTilt';

export function ComingSoonCard({ kind, title, detail, icon: Icon, accent, tags, live, href }: { kind: string; title: string; detail: string; icon: LucideIcon; accent: string; tags?: string[]; live?: boolean; href?: string }) {
  const { ref, handleMove, handleLeave } = useTilt();
  const inner = (
    <article ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} className="reveal-card group relative min-h-[17rem] overflow-hidden rounded-[1.5rem] border border-amber-400/15 bg-white/[.04] p-6 backdrop-blur-xl transition-shadow duration-300" style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease-out' }}>
      <div className={`absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-30 blur-3xl ${accent} transition-opacity group-hover:opacity-50`} />
      <div className="relative flex h-full flex-col" style={{ transform: 'translateZ(30px)' }}>
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/25 bg-white/5 text-amber-300"><Icon size={20} strokeWidth={1.5} /></div>
          <span className={`rounded-full border px-2.5 py-1 font-mono-zon text-[.52rem] uppercase tracking-[.1em] ${live ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300' : 'border-amber-400/30 bg-amber-400/10 text-amber-300'}`}>{live ? 'live' : 'soon'}</span>
        </div>
        <div className="mt-auto">
          <div className="font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-amber-400/70">{kind}</div>
          <h3 className="mt-1.5 font-display text-2xl tracking-[-.04em] text-[#f0f0d8]">{title}</h3>
          <p className="mt-2 max-w-[17rem] text-sm leading-relaxed text-[#8a9e7e]">{detail}</p>
          {tags && tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (<span key={tag} className="rounded-full border border-white/10 bg-white/[.04] px-2 py-0.5 font-mono-zon text-[.48rem] uppercase tracking-[.08em] text-[#a9bd9a]">{tag}</span>))}
            </div>
          )}
          {live && href && (
            <div className="mt-4 flex items-center gap-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-amber-300 opacity-0 transition-opacity group-hover:opacity-100">
              Open tool <ArrowRight size={12} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
  if (live && href) {
    return <Link href={href}><a className="block">{inner}</a></Link>;
  }
  return inner;
}
