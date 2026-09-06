import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  ChevronDown,
  Clapperboard,
  Crop,
  Eraser,
  FolderOpen,
  Headphones,
  Home,
  ImagePlus,
  Layers,
  LogIn,
  LogOut,
  Menu,
  Mic2,
  Palette,
  Scissors,
  Speaker,
  Settings,
  User,
  X,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import type { AuthUser } from '@/lib/types';

export function Nav({ user, onLogin, onSignup, onLogout }: { user: AuthUser | null; onLogin: () => void; onSignup: () => void; onLogout: () => void }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // Big tools get a permanent slot on the panel bar itself. Everything
  // else — live or coming soon — only lives inside the Workbench dropdown.
  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/remover', label: 'BG Remover', icon: Scissors },
    { href: '/eraser', label: 'Object Eraser', icon: Eraser },
    { href: '/voice-cleaner', label: 'Voice Cleaner', icon: Mic2 },
    { href: '/voice-generator', label: 'Voice Gen', icon: Speaker },
  ];

  const workbenchTools = [
    { href: '/remover', label: 'BG Remover', status: 'live', icon: Scissors },
    { href: '/eraser', label: 'Object Eraser 4K', status: 'live', icon: Eraser },
    { href: '/voice-cleaner', label: 'Voice Cleaner', status: 'live', icon: Mic2 },
    { href: '/voice-generator', label: 'AI Voice Generator', status: 'live', icon: Speaker },
    { href: '/crop', label: 'Smart Crop', status: 'live', icon: Crop },
    { href: '/color', label: 'Color Grade', status: 'live', icon: Palette },
    { href: '/resize', label: 'Image Resize', status: 'live', icon: ImagePlus },
    { href: '/#tools', label: 'AI Video Joiner', status: 'soon', icon: Clapperboard },
    { href: '/#tools', label: 'AI Music Stitcher', status: 'soon', icon: Headphones },
    { href: '/#tools', label: 'AI Image Upscaler', status: 'soon', icon: ImagePlus },
    { href: '/#tools', label: 'Auto Subtitle Generator', status: 'soon', icon: FolderOpen },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-amber-400/20 bg-[#042f2e]/90 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1340px] items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3 lg:px-8">
        <Logo compact />
        <nav className="hidden items-center gap-0.5 lg:flex">
          {links.map(({ href, label, icon: Icon }) => {
            const active = location === href || (href !== '/' && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <a className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono-zon text-[.65rem] uppercase tracking-[.1em] transition-all duration-300 ${active ? 'bg-amber-400/15 text-amber-300 shadow-[0_0_20px_rgba(234,179,8,.15)]' : 'text-[#b7ca9e] hover:bg-white/5 hover:text-amber-200'}`}>
                  <Icon size={15} />{label}
                </a>
              </Link>
            );
          })}
          <div className="relative" ref={toolsRef}>
            <button type="button" onClick={() => setToolsOpen((v) => !v)} className={`flex items-center gap-2 rounded-xl px-3 py-2 font-mono-zon text-[.65rem] uppercase tracking-[.1em] transition-all duration-300 ${toolsOpen ? 'bg-amber-400/15 text-amber-300' : 'text-[#b7ca9e] hover:bg-white/5 hover:text-amber-200'}`}>
              <Layers size={15} /> Workbench
              <ChevronDown size={13} className={`transition-transform ${toolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {toolsOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 overflow-hidden rounded-2xl border border-amber-400/20 bg-[#042f2e]/95 shadow-2xl backdrop-blur-xl animate-scale-in">
                <div className="border-b border-white/10 px-4 py-2.5">
                  <span className="font-mono-zon text-[.6rem] uppercase tracking-[.12em] text-amber-400/80">all tools</span>
                </div>
                <div className="max-h-80 overflow-y-auto p-1.5">
                  {workbenchTools.map((t) => (
                    <Link key={t.label} href={t.href}>
                      <a className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-[.95rem] text-[#c6d5b5] transition-colors hover:bg-white/8 hover:text-[#f2f0d8]" onClick={() => setToolsOpen(false)}>
                        <span className="flex items-center gap-2.5"><t.icon size={16} className="text-amber-400/70" />{t.label}</span>
                        <span className={`rounded-full px-2 py-0.5 font-mono-zon text-[.55rem] uppercase tracking-[.08em] ${t.status === 'live' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-[#7a8f6e]'}`}>{t.status}</span>
                      </a>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative" ref={profileRef}>
              <button type="button" onClick={() => setProfileOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-amber-400/25 bg-white/5 px-2.5 py-1.5 transition-all hover:bg-white/10">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-emerald-600 text-sm font-semibold text-[#042f2e]">{user.name.charAt(0).toUpperCase()}</div>
                <span className="hidden max-w-[100px] truncate text-sm text-[#e8ecd8] sm:block">{user.name}</span>
                <ChevronDown size={14} className={`text-[#a9bd9a] transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-2xl border border-amber-400/20 bg-[#042f2e]/95 shadow-2xl backdrop-blur-xl animate-scale-in">
                  <div className="border-b border-white/10 px-4 py-3">
                    <div className="text-sm font-medium text-[#f2f0d8]">{user.name}</div>
                    <div className="mt-0.5 truncate text-xs text-[#8a9e7e]">{user.email}</div>
                  </div>
                  <div className="p-1.5">
                    <Link href="/settings"><a className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:bg-white/8 hover:text-[#f2f0d8]" onClick={() => setProfileOpen(false)}><Settings size={15} /> Settings</a></Link>
                    <button type="button" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:bg-white/8 hover:text-[#f2f0d8]"><User size={15} /> My Profile</button>
                    <button type="button" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[#c6d5b5] transition-colors hover:bg-white/8 hover:text-[#f2f0d8]"><FolderOpen size={15} /> Saved Files</button>
                    <button type="button" onClick={() => { setProfileOpen(false); onLogout(); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-400/90 transition-colors hover:bg-red-500/10"><LogOut size={15} /> Logout</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/settings"><a className="hidden rounded-xl border border-white/10 bg-white/5 p-2 text-[#a9bd9a] transition-all hover:bg-white/10 hover:text-amber-200 sm:inline-flex" aria-label="Settings"><Settings size={18} /></a></Link>
              <button type="button" onClick={onLogin} className="hidden rounded-xl border border-amber-400/30 bg-white/5 px-4 py-2 font-mono-zon text-[.65rem] uppercase tracking-[.1em] text-amber-200 transition-all hover:bg-amber-400/10 hover:shadow-[0_0_18px_rgba(234,179,8,.2)] sm:inline-flex">Log In</button>
              <button type="button" onClick={onSignup} className="btn-gold rounded-xl px-3.5 py-2 text-[.75rem] font-semibold sm:px-4">Sign Up</button>
            </>
          )}
          <button type="button" className="rounded-xl border border-white/10 p-2.5 text-[#d8e2c9] lg:hidden" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="max-h-[min(80vh,32rem)] overflow-y-auto border-t border-white/10 bg-[#042f2e]/98 px-3 py-3 backdrop-blur-xl lg:hidden">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <a className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-base text-[#c6d5b5] transition-colors hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                <Icon size={18} /> {label}
              </a>
            </Link>
          ))}
          <div className="my-2 border-t border-white/10 pt-2">
            <div className="px-3 py-1.5 font-mono-zon text-[.6rem] uppercase tracking-[.12em] text-amber-400/80">Workbench</div>
            {workbenchTools.map((t) => (
              <Link key={t.label} href={t.href}>
                <a className="flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-[.95rem] text-[#c6d5b5] transition-colors hover:bg-white/5" onClick={() => setMenuOpen(false)}>
                  <span className="flex items-center gap-2.5"><t.icon size={16} className="text-amber-400/70" />{t.label}</span>
                  <span className={`rounded-full px-2 py-0.5 font-mono-zon text-[.5rem] uppercase tracking-[.08em] ${t.status === 'live' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-[#7a8f6e]'}`}>{t.status}</span>
                </a>
              </Link>
            ))}
          </div>
          <Link href="/settings"><a className="flex items-center gap-3 rounded-xl px-3 py-3.5 text-base text-[#c6d5b5] transition-colors hover:bg-white/5" onClick={() => setMenuOpen(false)}><Settings size={18} /> Settings</a></Link>
          {!user && (
            <button type="button" onClick={() => { setMenuOpen(false); onLogin(); }} className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-base text-amber-300">
              <LogIn size={18} /> Log In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
