import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { SHOWCASE_LOGOS } from '@/lib/showcaseLogos';

export function LogoShowcase() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setActive((i) => (i + 1) % SHOWCASE_LOGOS.length), 3200);
    return () => window.clearInterval(id);
  }, []);
  const current = SHOWCASE_LOGOS[active];
  return (
    <section className="relative mx-auto max-w-[1100px] px-4 pb-16 pt-4 sm:px-6 lg:px-8">
      <div className="section-label mb-6 justify-center">bg remover in action</div>
      <h2 className="text-center font-display text-[2rem] tracking-[-.05em] text-[#f0f0d8] sm:text-[2.8rem]">Watch backgrounds<span className="text-amber-400"> disappear.</span></h2>
      <div className="relative mt-12 flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-center lg:gap-6">
        <div className="order-2 flex w-full max-w-xs flex-col gap-3 lg:order-1 lg:w-56">
          {current.tags.map((tag, i) => (
            <div key={`${active}-${tag}`} className="float-badge glass-panel rounded-2xl border border-amber-400/20 px-4 py-3 backdrop-blur-xl" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300"><Check size={14} /></span>
                <span className="text-sm font-medium text-[#e8ecd8]">{tag}</span>
              </div>
            </div>
          ))}
          <p className="mt-1 px-1 text-xs leading-relaxed text-[#7a8f6e]">{current.detail}</p>
        </div>
        <div className="relative order-1 flex h-[280px] w-full max-w-[340px] items-center justify-center sm:h-[320px] lg:order-2">
          <div className="pointer-events-none absolute inset-4 rounded-full border border-amber-400/15" />
          <div className="pointer-events-none absolute inset-10 rounded-full border border-dashed border-white/8" />
          {SHOWCASE_LOGOS.map((logo, i) => {
            const isActive = i === active;
            const angle = ((i - active) * (360 / SHOWCASE_LOGOS.length) * Math.PI) / 180;
            const radius = isActive ? 0 : 110;
            const x = Math.sin(angle) * radius;
            const y = Math.cos(angle) * radius * 0.55;
            return (
              <button key={logo.name} type="button" onClick={() => setActive(i)} className={`absolute flex items-center justify-center transition-all duration-700 ease-out ${isActive ? 'z-20 scale-100 opacity-100' : 'z-10 scale-75 opacity-45 hover:opacity-70'}`} style={{ transform: `translate(${x}px, ${y}px) scale(${isActive ? 1 : 0.72})` }}>
                <div className={`checkerboard-sm relative flex h-36 w-36 items-center justify-center rounded-2xl p-3 sm:h-44 sm:w-44 ${isActive ? 'border border-amber-400/40 shadow-[0_0_40px_rgba(234,179,8,0.25)]' : 'border border-white/10'}`}>
                  <img src={logo.src} alt={logo.name} className={`max-h-full max-w-full object-contain drop-shadow-lg transition-transform duration-700 ${isActive ? 'scale-100' : 'scale-90'}`} />
                </div>
              </button>
            );
          })}
          <div className="absolute -bottom-2 left-1/2 z-30 -translate-x-1/2 rounded-full border border-amber-400/30 bg-[#042f2e]/90 px-4 py-1.5 backdrop-blur-md">
            <span className="font-mono-zon text-[.55rem] uppercase tracking-[.14em] text-amber-300">{current.name}</span>
          </div>
        </div>
        <div className="order-3 flex gap-2 lg:w-12 lg:flex-col lg:items-center lg:gap-3">
          {SHOWCASE_LOGOS.map((_, i) => (
            <button key={i} type="button" onClick={() => setActive(i)} className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-amber-400 lg:h-6 lg:w-2' : 'w-2 bg-white/20 hover:bg-white/40'}`} aria-label={`Show logo ${i + 1}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
