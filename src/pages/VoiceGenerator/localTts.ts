import type { VoicePersona } from './types';
import { parseScript, type ScriptUnit } from './script';

let cachedVoices: SpeechSynthesisVoice[] = [];

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!isSpeechSupported()) return Promise.resolve([]);
  const existing = window.speechSynthesis.getVoices();
  if (existing.length) {
    cachedVoices = existing;
    return Promise.resolve(existing);
  }
  return new Promise((resolve) => {
    const handler = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length) {
        cachedVoices = voices;
        window.speechSynthesis.removeEventListener('voiceschanged', handler);
        resolve(voices);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
    window.setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
      resolve(window.speechSynthesis.getVoices());
    }, 1200);
  });
}

export function pickVoiceForPersona(persona: VoicePersona, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const langPrefix = persona.langCode.split('-')[0].toLowerCase();
  const isIndic = langPrefix === 'hi' || langPrefix === 'ur';

  const sameLang = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  // Urdu often missing — fall back to Hindi, then English-India
  const hindi = voices.filter((v) => v.lang.toLowerCase().startsWith('hi'));
  const enIn = voices.filter((v) => v.lang.toLowerCase().startsWith('en-in') || v.lang.toLowerCase() === 'en-in');
  let pool = sameLang;
  if (pool.length === 0 && isIndic) pool = hindi.length ? hindi : enIn;
  if (pool.length === 0) pool = voices;

  for (const hint of persona.localVoiceHints) {
    const found = pool.find((v) => v.name.toLowerCase().includes(hint.toLowerCase()));
    if (found) return found;
  }
  // Prefer male/female by name heuristics when gender set
  if (persona.gender === 'male') {
    const m = pool.find((v) => /male|ravi|hemant|david|mark|guy/i.test(v.name));
    if (m) return m;
  }
  if (persona.gender === 'female') {
    const f = pool.find((v) => /female|zira|samantha|heera|neerja/i.test(v.name));
    if (f) return f;
  }
  return pool[0] ?? voices[0] ?? null;
}

export interface SpeakHandle {
  stop: () => void;
}

export function speakScript(
  script: string,
  options: {
    voice: SpeechSynthesisVoice | null;
    rate: number;
    pitch: number;
    onUnitStart?: (index: number, total: number) => void;
    onDone?: () => void;
    onError?: (message: string) => void;
  },
): SpeakHandle {
  if (!isSpeechSupported()) {
    options.onError?.('This browser does not support local speech playback.');
    return { stop: () => {} };
  }
  const units: ScriptUnit[] = parseScript(script);
  if (units.length === 0) {
    options.onError?.('Please write something to generate.');
    return { stop: () => {} };
  }

  let cancelled = false;
  let index = 0;

  // Slightly slower default for clearer Indic narration when rate is ~1
  const rate = Math.min(2, Math.max(0.5, options.rate));

  const runNext = () => {
    if (cancelled) return;
    if (index >= units.length) {
      options.onDone?.();
      return;
    }
    const unit = units[index];
    options.onUnitStart?.(index, units.length);
    index += 1;

    if (unit.type === 'pause') {
      window.setTimeout(runNext, unit.ms);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(unit.value);
    if (options.voice) {
      utterance.voice = options.voice;
      utterance.lang = options.voice.lang || utterance.lang;
    }
    utterance.rate = rate;
    utterance.pitch = Math.min(2, Math.max(0, options.pitch));
    utterance.onend = () => runNext();
    utterance.onerror = (e) => {
      if (e.error === 'interrupted' || e.error === 'canceled') return;
      options.onError?.('Local playback was interrupted.');
    };
    window.speechSynthesis.speak(utterance);
  };

  runNext();

  return {
    stop: () => {
      cancelled = true;
      window.speechSynthesis.cancel();
    },
  };
}
