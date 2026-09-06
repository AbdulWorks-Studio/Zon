import { LockKeyhole } from 'lucide-react';
import { Link } from 'wouter';
import zonLogo from '@/assets/zon-logo.png';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-8 text-[#7a8f6e]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <img src={zonLogo} alt="Zon" className="h-9 w-9 object-contain drop-shadow-[0_0_10px_rgba(234,179,8,0.3)] logo-spin-idle" />
          <span className="font-mono-zon text-[.6rem] uppercase tracking-[.1em]">Zon by abdulworks-studio</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono-zon text-[.6rem] uppercase tracking-[.1em]">
          <Link href="/privacy"><a className="transition-colors hover:text-amber-300">Privacy</a></Link>
          <Link href="/terms"><a className="transition-colors hover:text-amber-300">Terms</a></Link>
          <Link href="/contact"><a className="transition-colors hover:text-amber-300">Contact</a></Link>
          <Link href="/about"><a className="transition-colors hover:text-amber-300">About</a></Link>
        </nav>
      </div>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em]">
          <LockKeyhole size={12} /> files stay local
        </span>
        <span className="font-mono-zon text-[.55rem] uppercase tracking-[.1em]">made for the next thing</span>
      </div>
    </footer>
  );
}
