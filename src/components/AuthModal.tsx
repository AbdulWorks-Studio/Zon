import { useState } from 'react';
import { Eye, EyeOff, Github, LoaderCircle, LogIn, Sparkles, X } from 'lucide-react';
import type { AuthUser } from '@/lib/types';

export function AuthModal({ mode, onClose, onSuccess }: { mode: 'login' | 'signup'; onClose: () => void; onSuccess: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const user: AuthUser = {
      name: mode === 'signup' ? name.trim() : email.split('@')[0],
      email: email.trim(),
    };
    localStorage.setItem('zon-user', JSON.stringify(user));
    setLoading(false);
    onSuccess(user);
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-[100] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-deep w-full max-w-md rounded-[1.75rem] border border-amber-400/20 p-6 shadow-2xl sm:p-8 animate-scale-in">
        <div className="flex items-start justify-between">
          <div>
            <div className="eyebrow !text-amber-400/90">welcome to zon</div>
            <h3 className="mt-2 font-display text-3xl tracking-[-.05em] text-[#f2f0d8]">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-[#a9bd9a] transition-colors hover:bg-white/10 hover:text-[#f2f0d8]">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="mt-7 space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <input type="text" id="auth-name" value={name} onChange={(e) => setName(e.target.value)} className="peer input-glass w-full rounded-xl px-4 pt-5 pb-2 text-sm text-[#f2f0d8]" placeholder=" " autoComplete="name" />
              <label htmlFor="auth-name" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8a9e7e] transition-all peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[.65rem] peer-focus:text-amber-400/80 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[.65rem]">Full name</label>
            </div>
          )}
          <div className="relative">
            <input type="email" id="auth-email" value={email} onChange={(e) => setEmail(e.target.value)} className="peer input-glass w-full rounded-xl px-4 pt-5 pb-2 text-sm text-[#f2f0d8]" placeholder=" " autoComplete="email" />
            <label htmlFor="auth-email" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8a9e7e] transition-all peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[.65rem] peer-focus:text-amber-400/80 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[.65rem]">Email address</label>
          </div>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} id="auth-pass" value={password} onChange={(e) => setPassword(e.target.value)} className="peer input-glass w-full rounded-xl px-4 pt-5 pb-2 pr-11 text-sm text-[#f2f0d8]" placeholder=" " autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            <label htmlFor="auth-pass" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8a9e7e] transition-all peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-[.65rem] peer-focus:text-amber-400/80 peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[.65rem]">Password</label>
            <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#8a9e7e] hover:text-amber-400">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-sm text-red-400/90">{error}</p>}
          <button type="submit" disabled={loading} className="btn-gold mt-2 w-full rounded-xl px-4 py-3.5 text-sm font-semibold disabled:opacity-50">
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : mode === 'login' ? (<><LogIn size={16} /> Sign in</>) : (<><Sparkles size={16} /> Create account</>)}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-[#7a8f6e]">or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-glass flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[#d8e2c9]" onClick={() => { const user: AuthUser = { name: 'Google User', email: 'user@gmail.com' }; localStorage.setItem('zon-user', JSON.stringify(user)); onSuccess(user); }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Google
          </button>
          <button type="button" className="btn-glass flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-[#d8e2c9]" onClick={() => { const user: AuthUser = { name: 'GitHub User', email: 'user@github.com' }; localStorage.setItem('zon-user', JSON.stringify(user)); onSuccess(user); }}>
            <Github size={16} /> GitHub
          </button>
        </div>
        <p className="mt-5 text-center text-[.7rem] text-[#7a8f6e]">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" className="text-amber-400/90 underline-offset-2 hover:underline">{mode === 'login' ? 'Sign up' : 'Sign in'}</button>
        </p>
      </div>
    </div>
  );
}
