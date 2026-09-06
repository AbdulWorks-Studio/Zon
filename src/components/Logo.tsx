import { useState } from 'react';
import zonLogo from '@/assets/zon-logo.png';

export function Logo({ compact = false }: { compact?: boolean }) {
  const [spinning, setSpinning] = useState(false);

  const handleReload = (e: React.MouseEvent) => {
    e.preventDefault();
    if (spinning) return;
    setSpinning(true);
    window.setTimeout(() => {
      window.location.reload();
    }, 650);
  };

  return (
    <button
      type="button"
      onClick={handleReload}
      className="flex items-center gap-2.5 rounded-xl text-left transition-all duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 sm:gap-3"
      aria-label="Reload Zon"
      data-testid="brand-logo"
    >
      <img
        src={zonLogo}
        alt="Zon"
        className={`object-contain drop-shadow-[0_0_14px_rgba(234,179,8,0.35)] ${
          compact ? 'h-12 w-12 sm:h-[3.25rem] sm:w-[3.25rem]' : 'h-14 w-14'
        } ${spinning ? 'logo-spin-reload' : 'logo-spin-idle'}`}
      />
      {compact ? (
        <span className="font-display text-[1.35rem] font-semibold tracking-[-.045em] text-[#f4f0d5] drop-shadow-[0_0_12px_rgba(234,179,8,0.25)] sm:text-[1.45rem]">
          Zon
        </span>
      ) : (
        <div className="leading-none">
          <div className="font-display text-[1.25rem] font-semibold tracking-[-.04em] text-[#f2f0d8]">Zon</div>
          <div className="mt-1 font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#b7ca9e]">by abdulworks-studio</div>
        </div>
      )}
    </button>
  );
}
