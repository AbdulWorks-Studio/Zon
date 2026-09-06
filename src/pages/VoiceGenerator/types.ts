export type EngineMode = 'local' | 'pro';

export interface VoicePersona {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  age: 'young' | 'middle' | 'mature';
  style: string;
  language: string;
  langCode: string;
  description: string;
  /** Keywords tried (in order) against the browser's installed voice names to find a close local match. */
  localVoiceHints: string[];
}

export interface RemoteVoice {
  id: string;
  name: string;
  gender?: string;
  labels?: Record<string, string>;
}

export interface GenerationRecord {
  id: string;
  mode: EngineMode;
  personaName: string;
  textSnippet: string;
  createdAt: number;
  audioUrl?: string;
  durationLabel?: string;
}

export interface ScriptHistoryItem {
  id: string;
  text: string;
  personaId: string;
  createdAt: number;
}

export type GenerateStatus = 'idle' | 'generating' | 'ready' | 'error';

export interface VoiceSettings {
  stability: number; // 0–1
  clarity: number; // 0–1 (similarity boost)
  speed: number; // 0.5–2 (rate)
  pitch: number; // 0–2, local mode only
  styleExaggeration: number; // 0–1, pro mode only (eleven_multilingual_v2 "style")
}
