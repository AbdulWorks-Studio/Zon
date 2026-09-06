/** App-wide preferences stored only in this browser (localStorage). */

export type DownloadQuality = 'png' | 'smaller';

export interface AppSettings {
  reduceMotion: boolean;
  downloadQuality: DownloadQuality;
  /** Pro voice API key — used only from this browser for optional Pro TTS. */
  proVoiceApiKey: string;
}

const KEY = 'zon-app-settings';
const LEGACY_VOICE_KEY = 'zon-elevenlabs-key';

const defaults: AppSettings = {
  reduceMotion: false,
  downloadQuality: 'png',
  proVoiceApiKey: '',
};

export function loadAppSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<AppSettings>) : {};
    let proKey = parsed.proVoiceApiKey ?? '';
    if (!proKey) {
      try {
        proKey = localStorage.getItem(LEGACY_VOICE_KEY) ?? '';
      } catch {
        /* ignore */
      }
    }
    return {
      reduceMotion: !!parsed.reduceMotion,
      downloadQuality: parsed.downloadQuality === 'smaller' ? 'smaller' : 'png',
      proVoiceApiKey: proKey,
    };
  } catch {
    return { ...defaults };
  }
}

export function saveAppSettings(partial: Partial<AppSettings>): AppSettings {
  const next = { ...loadAppSettings(), ...partial };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    // Keep voice generator storage in sync for Pro mode
    if (partial.proVoiceApiKey !== undefined) {
      if (partial.proVoiceApiKey) localStorage.setItem(LEGACY_VOICE_KEY, partial.proVoiceApiKey);
      else localStorage.removeItem(LEGACY_VOICE_KEY);
    }
  } catch {
    /* ignore */
  }
  applyReduceMotion(next.reduceMotion);
  return next;
}

export function applyReduceMotion(on: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('reduce-motion', on);
}

export function clearLocalZonData(opts: { includeApiKey: boolean }) {
  const keys = [
    'zon-user',
    'zon-app-settings',
    'zon-voicegen-history',
    'zon-elevenlabs-model',
  ];
  if (opts.includeApiKey) {
    keys.push('zon-elevenlabs-key');
  }
  for (const k of keys) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  // Re-save settings without API key if we cleared it
  if (opts.includeApiKey) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ ...defaults, reduceMotion: false, downloadQuality: 'png', proVoiceApiKey: '' }),
      );
    } catch {
      /* ignore */
    }
  }
  applyReduceMotion(false);
}

/** Call once on app boot. */
export function initAppSettings() {
  const s = loadAppSettings();
  applyReduceMotion(s.reduceMotion);
  return s;
}
