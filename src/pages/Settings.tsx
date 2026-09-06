import { useState } from 'react';
import { Check, Eye, EyeOff, KeyRound, Link as LinkIcon, ShieldCheck, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { Seo } from '@/components/Seo';
import { Footer } from '@/components/Footer';
import {
  clearLocalZonData,
  loadAppSettings,
  saveAppSettings,
  type DownloadQuality,
} from '@/lib/appSettings';

export function SettingsPage() {
  const [settings, setSettings] = useState(() => loadAppSettings());
  const [keyDraft, setKeyDraft] = useState(settings.proVoiceApiKey);
  const [keyVisible, setKeyVisible] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [clearNote, setClearNote] = useState('');

  const persist = (partial: Parameters<typeof saveAppSettings>[0]) => {
    const next = saveAppSettings(partial);
    setSettings(next);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1600);
  };

  const saveKey = () => {
    persist({ proVoiceApiKey: keyDraft.trim() });
  };

  const clearKey = () => {
    setKeyDraft('');
    persist({ proVoiceApiKey: '' });
  };

  const onClearData = (includeApiKey: boolean) => {
    const msg = includeApiKey
      ? 'Clear all local Zon data including your Pro voice API key?'
      : 'Clear local Zon data (history & prefs)? Your API key will be kept unless you choose otherwise.';
    if (!window.confirm(msg)) return;
    clearLocalZonData({ includeApiKey });
    const next = loadAppSettings();
    setSettings(next);
    setKeyDraft(includeApiKey ? '' : next.proVoiceApiKey);
    setClearNote(includeApiKey ? 'Local data and API key cleared.' : 'Local data cleared. API key kept.');
    window.setTimeout(() => setClearNote(''), 2500);
  };

  return (
    <main className="grain zon-shell min-h-[calc(100dvh-4rem)] overflow-x-hidden px-4 py-12 sm:px-6 lg:px-8">
      <Seo
        title="Settings | Zon"
        description="Zon settings — reduce motion, download preference, Pro voice API key (browser-only), and clear local data."
        path="/settings"
      />
      <div className="mx-auto max-w-[720px]">
        <div className="section-label text-[.7rem]">preferences</div>
        <h1 className="mt-3 font-display text-[2.4rem] leading-[.98] tracking-[-.05em] text-[#f0f0d8] sm:text-[3rem]">Settings</h1>
        <p className="mt-3 text-base text-[#8a9e7e]">Saved only on this device. Core tools still process in your browser.</p>
        {savedFlash && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-300">
            <Check size={15} /> Saved
          </div>
        )}

        {/* Appearance */}
        <section className="mt-8 glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
          <h2 className="font-display text-xl text-[#e8ecd8]">Appearance</h2>
          <button
            type="button"
            onClick={() => persist({ reduceMotion: !settings.reduceMotion })}
            className={`mt-4 flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left ${
              settings.reduceMotion
                ? 'border border-amber-400/40 bg-amber-400/15 text-amber-200'
                : 'border border-white/10 bg-white/5 text-[#c6d5b5]'
            }`}
          >
            <div>
              <div className="text-sm font-medium">Reduce motion</div>
              <div className="mt-0.5 text-[.8rem] text-[#7a8f6e]">Softens or disables heavy animations</div>
            </div>
            <span className="font-mono-zon text-[.6rem] uppercase tracking-[.1em]">{settings.reduceMotion ? 'on' : 'off'}</span>
          </button>
        </section>

        {/* Voice / Pro API */}
        <section className="mt-4 glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
          <h2 className="font-display text-xl text-[#e8ecd8]">Voice Generator</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#8a9e7e]">
            Optional Pro voice API key. Stored only in this browser and used from your device for Pro voice mode — never sent to Zon servers.
          </p>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center gap-1.5 font-mono-zon text-[.6rem] uppercase tracking-[.1em] text-[#8a9e7e]">
              <KeyRound size={12} /> Pro voice API key
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5">
              <input
                type={keyVisible ? 'text' : 'password'}
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="Paste key…"
                className="w-full bg-transparent text-sm text-[#e8ecd8] outline-none placeholder:text-[#5f7458]"
                autoComplete="off"
              />
              <button type="button" onClick={() => setKeyVisible((v) => !v)} className="text-[#8a9e7e] hover:text-amber-300" aria-label="Toggle key visibility">
                {keyVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={saveKey} className="btn-quiet flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm">
                <Check size={14} /> Save key
              </button>
              <button
                type="button"
                onClick={clearKey}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#a9bd9a] hover:text-red-300"
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section className="mt-4 glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
          <h2 className="font-display text-xl text-[#e8ecd8]">Downloads</h2>
          <p className="mt-2 text-sm text-[#8a9e7e]">Preference for image exports where tools support it.</p>
          <div className="mt-4 flex gap-2">
            {(
              [
                { id: 'png' as DownloadQuality, label: 'PNG (max quality)' },
                { id: 'smaller' as DownloadQuality, label: 'Smaller file' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => persist({ downloadQuality: opt.id })}
                className={`flex-1 rounded-xl px-3 py-3 text-sm ${
                  settings.downloadQuality === opt.id
                    ? 'border border-amber-400/40 bg-amber-400/15 text-amber-200'
                    : 'border border-white/10 bg-white/5 text-[#a9bd9a]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section className="mt-4 glass-panel rounded-2xl border border-white/10 p-5 sm:p-6">
          <h2 className="font-display text-xl text-[#e8ecd8]">Privacy & data</h2>
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-[#8a9e7e]">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-amber-400" />
            Core tools process media in your browser when possible. Keys and history stay on this device unless you clear them.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => onClearData(false)} className="btn-quiet flex-1 rounded-xl py-3 text-sm">
              Clear local data (keep key)
            </button>
            <button
              type="button"
              onClick={() => onClearData(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-500/10 py-3 text-sm text-red-300 hover:bg-red-500/15"
            >
              <Trash2 size={14} /> Clear everything
            </button>
          </div>
          {clearNote && <p className="mt-3 text-sm text-emerald-300/90">{clearNote}</p>}
          <div className="mt-5 flex flex-wrap gap-4 font-mono-zon text-[.6rem] uppercase tracking-[.1em] text-[#7a8f6e]">
            <Link href="/privacy">
              <a className="hover:text-amber-300">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="hover:text-amber-300">Terms</a>
            </Link>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-1 border-t border-white/10 pt-6 text-[#7a8f6e]">
          <div className="font-display text-lg text-[#c6d5b5]">Zon</div>
          <div className="font-mono-zon text-[.6rem] uppercase tracking-[.1em]">version 1.0.0-dev</div>
          <p className="mt-2 text-sm">Free private browser media toolkit by abdulworks-studio.</p>
        </div>

        <Footer />
      </div>
    </main>
  );
}
