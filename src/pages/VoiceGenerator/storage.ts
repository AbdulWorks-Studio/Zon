import type { ScriptHistoryItem } from './types';

const HISTORY_KEY = 'zon-voicegen-history';
const API_KEY_STORAGE = 'zon-elevenlabs-key';
const MODEL_KEY_STORAGE = 'zon-elevenlabs-model';
const MAX_HISTORY = 20;

export function loadScriptHistory(): ScriptHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ScriptHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveScriptHistory(items: ScriptHistoryItem[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    // storage full or unavailable — history simply won't persist this session
  }
}

export function addScriptHistoryItem(item: ScriptHistoryItem): ScriptHistoryItem[] {
  const next = [item, ...loadScriptHistory().filter((h) => h.text !== item.text)].slice(0, MAX_HISTORY);
  saveScriptHistory(next);
  return next;
}

export function removeScriptHistoryItem(id: string): ScriptHistoryItem[] {
  const next = loadScriptHistory().filter((h) => h.id !== id);
  saveScriptHistory(next);
  return next;
}

export function loadApiKey(): string {
  try { return localStorage.getItem(API_KEY_STORAGE) ?? ''; } catch { return ''; }
}
export function saveApiKey(key: string) {
  try { key ? localStorage.setItem(API_KEY_STORAGE, key) : localStorage.removeItem(API_KEY_STORAGE); } catch { /* ignore */ }
}
export function loadModelId(): string {
  try { return localStorage.getItem(MODEL_KEY_STORAGE) ?? 'eleven_multilingual_v2'; } catch { return 'eleven_multilingual_v2'; }
}
export function saveModelId(id: string) {
  try { localStorage.setItem(MODEL_KEY_STORAGE, id); } catch { /* ignore */ }
}
