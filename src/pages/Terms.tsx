import { Footer } from '@/components/Footer';

export function TermsPage() {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="section-label text-[.7rem]">legal</div>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[.98] tracking-[-.05em] text-[#f0f0d8] sm:text-[3.2rem]">Terms</h1>
        <p className="mt-4 text-base leading-relaxed text-[#8a9e7e]">
          By using Zon you agree to these simple terms. Zon is provided free for personal and commercial use of the core tools, as-is.
        </p>
        <div className="mt-8 space-y-6">
          <div className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
            <h2 className="font-display text-xl text-[#e8ecd8]">Use of the service</h2>
            <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
              You may use Zon to process your own media. You are responsible for having the rights to any content you process and for how you use the results.
            </p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
            <h2 className="font-display text-xl text-[#e8ecd8]">No warranty</h2>
            <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
              Tools are provided without guarantees of uptime, accuracy, or fitness for a particular purpose. Results may vary by browser and device.
            </p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
            <h2 className="font-display text-xl text-[#e8ecd8]">Changes</h2>
            <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
              Features and these terms may change as the product evolves. Continued use after updates means you accept the current terms.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
