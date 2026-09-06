import { Footer } from '@/components/Footer';

export function PrivacyPage() {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="section-label text-[.7rem]">legal</div>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[.98] tracking-[-.05em] text-[#f0f0d8] sm:text-[3.2rem]">Privacy</h1>
        <p className="mt-4 text-base leading-relaxed text-[#8a9e7e]">
          Zon is built local-first. Core tools process media in your browser when possible. Your files are not uploaded to our servers for those tools.
        </p>
        <div className="mt-8 space-y-6">
          <div className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
            <h2 className="font-display text-xl text-[#e8ecd8]">What stays on your device</h2>
            <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
              Images, audio, and other media you open in BG Remover, Object Eraser, Voice Cleaner, Smart Crop, Color Grade, and Image Resize are handled in the browser. We do not receive those files for core processing.
            </p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
            <h2 className="font-display text-xl text-[#e8ecd8]">Optional account</h2>
            <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
              Sign-in is optional and currently stored locally for demo purposes. You do not need an account to use core tools.
            </p>
          </div>
          <div className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
            <h2 className="font-display text-xl text-[#e8ecd8]">Analytics & third parties</h2>
            <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">
              We aim to keep tracking minimal. Browser APIs and model assets may load from CDNs; your media itself is not sent for core tool runs.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </main>
  );
}
