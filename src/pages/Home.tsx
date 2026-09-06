import { ArrowDown, ArrowRight, Clapperboard, Eraser, FolderOpen, Headphones, ImagePlus, Mic2, Scissors, ShieldCheck, Speaker } from 'lucide-react';
import { Link } from 'wouter';
import { ComingSoonCard } from '@/components/ComingSoonCard';
import { LogoShowcase } from '@/components/LogoShowcase';
import { Footer } from '@/components/Footer';

const liveTools = [
  {
    href: '/remover',
    title: 'BG Remover',
    benefit: 'Cut subjects clean in one click — no green screen needed.',
    icon: Scissors,
    badge: null as string | null,
  },
  {
    href: '/eraser',
    title: 'Object Eraser 4K',
    benefit: 'Paint out distractions and fill the gap at up to 4K.',
    icon: Eraser,
    badge: 'New',
  },
  {
    href: '/voice-cleaner',
    title: 'Voice Cleaner',
    benefit: 'Strip noise and hum so speech sounds clear and present.',
    icon: Mic2,
    badge: 'New',
  },
  {
    href: '/voice-generator',
    title: 'AI Voice Generator',
    benefit: 'Turn a script into natural speech with a voice you pick.',
    icon: Speaker,
    badge: 'New',
  },
];

const faqs = [
  {
    q: 'Are my files uploaded?',
    a: 'No. Processing runs in your browser. Media stays on your device.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Core tools are free.',
  },
  {
    q: 'Do I need an account?',
    a: 'No for core tools. Sign-in is optional.',
  },
  {
    q: 'Which browsers work best?',
    a: 'Latest Chrome, Edge, or Firefox (desktop/mobile).',
  },
];

export function HomePage() {
  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-10 pt-12 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="float-orb absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-[100px]" />
          <div className="float-orb-delayed absolute right-10 top-40 h-56 w-56 rounded-full bg-amber-400/15 blur-[80px]" />
          <div className="float-orb absolute bottom-10 left-1/3 h-48 w-48 rounded-full bg-teal-400/10 blur-[90px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1100px] text-center">
          <div className="eyebrow float-in mx-auto inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-[.7rem]">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f4ce47]" />
            100% free · private by design
          </div>
          <h1 className="display-tight float-in delay-1 mt-6 font-display text-[3.2rem] font-medium text-[#f4f0d5] sm:text-[5rem] lg:text-[6.5rem]">
            Make room<br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">for the good stuff.</span>
          </h1>
          <p className="float-in delay-2 mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#a9bd9a] sm:text-lg">
            High-speed, client-side media tools. No accounts required for core features. Drop something in — leave with something polished.
          </p>
          <div className="float-in delay-3 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/remover">
              <a className="btn-gold rounded-xl px-6 py-3.5 text-base font-semibold">
                <Scissors size={18} /> Try BG Remover
              </a>
            </Link>
            <a href="#tools" className="btn-glass rounded-xl px-6 py-3.5 text-base font-medium text-[#d8e2c9]">
              Explore tools <ArrowDown size={16} />
            </a>
          </div>
        </div>

        {/* 01 / local / free strip */}
        <div className="relative z-10 mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-3 sm:mt-20 sm:gap-4">
          {[
            { num: '01', label: 'no account', sub: 'start instantly' },
            { num: 'local', label: 'your files stay', sub: 'in the browser' },
            { num: 'free', label: 'always free', sub: 'no paywalls' },
          ].map((item) => (
            <div key={item.num} className="glass-panel rounded-2xl border border-white/10 p-3 text-center sm:p-6">
              <div className="font-display text-lg text-amber-400 sm:text-2xl">{item.num}</div>
              <div className="mt-1 font-mono-zon text-[.6rem] uppercase tracking-[.1em] text-[#a9bd9a] sm:text-[.65rem]">{item.label}</div>
              <div className="mt-0.5 text-[.75rem] text-[#6b7f62] sm:text-sm">{item.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* A) Live big tools row */}
      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-6 sm:mb-8">
            <div className="section-label text-[.7rem]">ready now</div>
            <h2 className="mt-2 font-display text-[1.75rem] leading-[1] tracking-[-.04em] text-[#f0f0d8] sm:text-[2.4rem]">
              Live tools
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {liveTools.map((tool) => (
              <div
                key={tool.href}
                className="glass-panel group relative flex flex-col rounded-2xl border border-white/10 p-5 transition-all duration-300 hover:border-amber-400/30 hover:bg-white/[.05] sm:p-6"
              >
                {tool.badge && (
                  <span className="absolute right-4 top-4 rounded-full bg-amber-400/20 px-2.5 py-0.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-amber-300">
                    {tool.badge}
                  </span>
                )}
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/10 text-amber-400">
                  <tool.icon size={20} />
                </div>
                <h3 className="font-display text-xl tracking-[-.02em] text-[#e8ecd8] sm:text-[1.35rem]">{tool.title}</h3>
                <p className="mt-2 flex-1 text-[.95rem] leading-relaxed text-[#8a9e7e]">{tool.benefit}</p>
                <Link href={tool.href}>
                  <a className="btn-gold mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold sm:w-auto">
                    Open tool <ArrowRight size={15} />
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B) Trust strip */}
      <section className="px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-2xl border border-white/8 bg-white/[.03] px-5 py-4 text-center backdrop-blur-md sm:gap-x-12 sm:px-8 sm:py-5">
          {['No upload', 'Free core tools', 'Works in browser'].map((point) => (
            <div key={point} className="flex items-center gap-2 font-mono-zon text-[.7rem] uppercase tracking-[.1em] text-[#a9bd9a] sm:text-[.75rem]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400 shadow-[0_0_6px_#eab308]" />
              {point}
            </div>
          ))}
        </div>
      </section>

      <LogoShowcase />

      {/* Soon tools — homepage Workbench section */}
      <section id="tools" className="px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="section-label text-[.7rem]">on the workbench</div>
              <h2 className="mt-3 max-w-lg font-display text-[2.2rem] leading-[.98] tracking-[-.06em] text-[#f0f0d8] sm:text-[3.4rem]">
                More ways to shape<br />
                <span className="text-amber-400/90">the moment.</span>
              </h2>
            </div>
            <p className="max-w-[16rem] text-base leading-relaxed text-[#7a8f6e]">
              Focused tools. No bloat. Built in the open, one at a time.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ComingSoonCard kind="video" title="AI Video Joiner" detail="Stitch clips, trim edges, leave with one clean story." icon={Clapperboard} accent="bg-amber-400" tags={['auto-cut', 'fade']} />
            <ComingSoonCard kind="music" title="AI Music Stitcher" detail="Gentle cuts, clean fades, zero studio jargon." icon={Headphones} accent="bg-emerald-400" tags={['crossfade', 'bpm']} />
            <ComingSoonCard kind="upscaler" title="AI Image Upscaler" detail="Enlarge photos to 4× with sharp, clean detail." icon={ImagePlus} accent="bg-cyan-400" tags={['4×', 'denoise']} />
            <ComingSoonCard kind="subtitles" title="Auto Subtitle Generator" detail="Transcribe speech and drop in clean, timed captions." icon={FolderOpen} accent="bg-rose-400" tags={['srt', 'timed']} />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px] overflow-hidden rounded-[1.75rem] border border-amber-400/15 bg-[#042f2e]/60 p-6 backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <div className="eyebrow text-[.7rem]">about zon</div>
              <h2 className="mt-4 font-display text-[2.4rem] leading-[.94] tracking-[-.06em] text-[#f2f0d8] sm:text-[3.3rem]">
                A tiny studio,<br />
                <span className="text-amber-400">made on purpose.</span>
              </h2>
              <div className="mt-6 flex items-center gap-2 font-mono-zon text-[.65rem] uppercase tracking-[.12em] text-[#a9bd9a]">
                <ShieldCheck size={15} className="text-amber-400" /> privacy first
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { t: 'What Zon is', d: 'Free, focused browser tools that do one job well — starting with a clean background remover.' },
                { t: 'Why local-first', d: 'Your files are processed in the browser whenever possible. Nothing leaves your device.' },
                { t: "Who it's for", d: 'Anyone who wants a polished result without learning a full editor or creating another account.' },
                { t: "What's next", d: 'More tools on the workbench, built one at a time, keeping the same simple approach.' },
              ].map((c) => (
                <div key={c.t} className="rounded-2xl border border-white/8 bg-white/[.03] p-5">
                  <div className="font-display text-lg tracking-[-.03em] text-[#e8ecd8] sm:text-xl">{c.t}</div>
                  <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* C) FAQ */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="mb-8">
            <div className="section-label text-[.7rem]">common questions</div>
            <h2 className="mt-2 font-display text-[1.75rem] leading-[1] tracking-[-.04em] text-[#f0f0d8] sm:text-[2.4rem]">
              FAQ
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map((item) => (
              <div key={item.q} className="glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
                <h3 className="font-display text-lg tracking-[-.02em] text-[#e8ecd8] sm:text-xl">{item.q}</h3>
                <p className="mt-2 text-[.95rem] leading-relaxed text-[#8a9e7e]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1100px]">
          <Footer />
        </div>
      </div>
    </main>
  );
}
