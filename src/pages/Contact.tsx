import { Mail } from 'lucide-react';
import { Footer } from '@/components/Footer';

export function ContactPage() {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="section-label text-[.7rem]">get in touch</div>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[.98] tracking-[-.05em] text-[#f0f0d8] sm:text-[3.2rem]">Contact</h1>
        <p className="mt-4 text-base leading-relaxed text-[#8a9e7e]">
          Questions, feedback, or partnership ideas — we read every message.
        </p>
        <div className="mt-8 glass-panel rounded-2xl border border-white/10 p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-400">
            <Mail size={22} />
          </div>
          <h2 className="mt-4 font-display text-xl text-[#e8ecd8]">Email</h2>
          <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
            Reach the studio at:
          </p>
          <a
            href="mailto:hello@abdulworks.studio?subject=Zon%20inquiry"
            className="btn-gold mt-5 inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
          >
            hello@abdulworks.studio
          </a>
          <p className="mt-4 text-sm text-[#6b7f62]">
            No backend form — this opens your mail app. Placeholder address for demo.
          </p>
        </div>
        <Footer />
      </div>
    </main>
  );
}
