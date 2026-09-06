import { ShieldCheck } from 'lucide-react';
import { Footer } from '@/components/Footer';

export function AboutPage() {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="section-label text-[.7rem]">about</div>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[.98] tracking-[-.05em] text-[#f0f0d8] sm:text-[3.2rem]">About Zon</h1>
        <p className="mt-4 text-base leading-relaxed text-[#8a9e7e]">
          Zon is a free, private browser-based media toolkit by abdulworks-studio. Core tools run in your browser when possible — no account required.
        </p>
        <div className="mt-8 space-y-4">
          {[
            { t: 'Local-first', d: 'Files process on your device for core tools. Privacy is the feature, not an afterthought.' },
            { t: 'Focused tools', d: 'One job per tool. BG Remover, Object Eraser, Voice Cleaner, and more — without the bloat of a full suite.' },
            { t: 'Always free core', d: 'Core tools stay free. Optional sign-in is for future convenience, not a paywall.' },
          ].map((c) => (
            <div key={c.t} className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
              <h2 className="font-display text-xl text-[#e8ecd8]">{c.t}</h2>
              <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">{c.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-2 font-mono-zon text-[.7rem] uppercase tracking-[.12em] text-[#a9bd9a]">
          <ShieldCheck size={16} className="text-amber-400" /> privacy first · built on purpose
        </div>
        <Footer />
      </div>
    </main>
  );
}
