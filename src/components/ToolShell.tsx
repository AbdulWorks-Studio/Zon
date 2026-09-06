import type { ReactNode } from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import { Footer } from '@/components/Footer';

export function ToolShell({ title, subtitle, steps, technical, faqs, children }: { title: string; subtitle: string; steps: { n: string; t: string; d: string }[]; technical: string; faqs: string[]; children: ReactNode }) {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1100px]">
        <section className="mb-12">
          <div className="section-label text-[.7rem]">how it works</div>
          <h1 className="mt-3 font-display text-[2.2rem] leading-[.98] tracking-[-.06em] text-[#f0f0d8] sm:text-[3.2rem]">{title}</h1>
          <p className="mt-3 max-w-lg text-base text-[#8a9e7e]">{subtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="glass-panel rounded-2xl border border-white/10 p-5">
                <div className="font-display text-2xl text-amber-400">{s.n}</div>
                <div className="mt-2 font-display text-lg text-[#e8ecd8] sm:text-xl">{s.t}</div>
                <p className="mt-1.5 text-[.95rem] text-[#8a9e7e]">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
        <div className="glass-deep rounded-[1.75rem] border border-amber-400/15 p-3 sm:p-5">{children}</div>
        <div className="mt-4 flex flex-col justify-between gap-2 px-1 text-sm text-[#7a8f6e] sm:flex-row">
          <span className="flex items-center gap-2"><LockKeyhole size={14} className="text-amber-400/80" /> Runs entirely in your browser — nothing is uploaded.</span>
          <span className="font-mono-zon text-[.6rem] uppercase tracking-[.1em]">privacy is the feature</span>
        </div>
        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-6 backdrop-blur-md">
            <h3 className="font-display text-xl text-[#e8ecd8] sm:text-2xl">Technical notes</h3>
            <p className="mt-3 text-[.95rem] leading-relaxed text-[#8a9e7e]">{technical}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/[.03] p-6 backdrop-blur-md">
            <h3 className="font-display text-xl text-[#e8ecd8] sm:text-2xl">Privacy FAQs</h3>
            <ul className="mt-3 space-y-2.5 text-[.95rem] text-[#8a9e7e]">
              {faqs.map((f) => (<li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-amber-400" /> {f}</li>))}
            </ul>
          </div>
        </section>
        <Footer />
      </div>
    </main>
  );
}
