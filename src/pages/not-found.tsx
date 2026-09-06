import { Home, Mic2, RefreshCw, Scissors, Sparkles, Eraser } from 'lucide-react';
import { Link } from 'wouter';
import { Seo } from '@/components/Seo';
import { Footer } from '@/components/Footer';

export default function NotFound() {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-16 sm:px-6 lg:px-8">
      <Seo
        title="Page Not Found | Zon"
        description="This page doesn’t exist or something went wrong. Refresh, go home, or open a free Zon media tool."
        path="/404"
      />
      <div className="mx-auto max-w-[640px] text-center">
        <div className="eyebrow mx-auto inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-[.7rem]">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          404
        </div>
        <h1 className="mt-6 font-display text-[2.6rem] leading-[.95] tracking-[-.05em] text-[#f0f0d8] sm:text-[3.4rem]">
          Something went wrong
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[#8a9e7e]">
          This page doesn’t exist, or something went wrong — try again later. You can also refresh the page or head back home.
        </p>

        <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold"
          >
            <RefreshCw size={18} /> Refresh page
          </button>
          <Link href="/">
            <a className="btn-glass inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-medium text-[#d8e2c9]">
              <Home size={18} /> Go Home
            </a>
          </Link>
        </div>

        <div className="mt-14">
          <div className="font-mono-zon text-[.65rem] uppercase tracking-[.12em] text-[#7a8f6e]">try a tool</div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Link href="/remover">
              <a className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:border-amber-400/30 hover:text-amber-200">
                <Scissors size={15} className="text-amber-400/80" /> BG Remover
              </a>
            </Link>
            <Link href="/eraser">
              <a className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:border-amber-400/30 hover:text-amber-200">
                <Eraser size={15} className="text-amber-400/80" /> Object Eraser
              </a>
            </Link>
            <Link href="/voice-generator">
              <a className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:border-amber-400/30 hover:text-amber-200">
                <Mic2 size={15} className="text-amber-400/80" /> Voice Gen
              </a>
            </Link>
            <Link href="/voice-cleaner">
              <a className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:border-amber-400/30 hover:text-amber-200">
                <Sparkles size={15} className="text-amber-400/80" /> Voice Cleaner
              </a>
            </Link>
          </div>
        </div>

        <div className="mt-16 text-left">
          <Footer />
        </div>
      </div>
    </main>
  );
}
