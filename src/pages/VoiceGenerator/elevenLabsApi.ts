import type { RemoteVoice, VoicePersona } from './types';

const BASE_URL = 'https://api.elevenlabs.io/v1';

export const ELEVEN_MODELS = [
  { id: 'eleven_multilingual_v2', label: 'Multilingual v2 (best for Hindi / Urdu)' },
  { id: 'eleven_turbo_v2_5', label: 'Turbo v2.5 (fast)' },
  { id: 'eleven_flash_v2_5', label: 'Flash v2.5 (fastest)' },
] as const;

class ElevenLabsError extends Error {}

/**
 * Fetches the voices available on the caller's own account.
 * Live list only — hardcoded classic IDs are unreliable over time.
 */
export async function fetchRemoteVoices(apiKey: string): Promise<RemoteVoice[]> {
  const res = await fetch(`${BASE_URL}/voices`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) {
    if (res.status === 401) throw new ElevenLabsError('That API key was rejected. Double-check it in Settings.');
    throw new ElevenLabsError(`Pro voice API returned an error (${res.status}) while listing voices.`);
  }
  const data = (await res.json()) as { voices?: { voice_id: string; name: string; labels?: Record<string, string> }[] };
  return (data.voices ?? []).map((v) => ({ id: v.voice_id, name: v.name, gender: v.labels?.gender, labels: v.labels }));
}

function scoreRemoteMatch(persona: VoicePersona, remote: RemoteVoice): number {
  const name = remote.name.toLowerCase().trim();
  const personaName = persona.name.toLowerCase().trim();
  let score = 0;

  // Exact / strong name match (e.g. user cloned "Adam" or "Imran" on their account)
  if (name === personaName) score += 100;
  else if (name.includes(personaName) || personaName.includes(name)) score += 70;
  else {
    const parts = personaName.split(/\s+/).filter((p) => p.length > 2);
    for (const part of parts) {
      if (name.includes(part)) score += 25;
    }
  }

  for (const hint of persona.localVoiceHints) {
    const h = hint.toLowerCase();
    if (h.length < 2) continue;
    if (name.includes(h)) score += 15;
  }

  const gender = (remote.gender ?? remote.labels?.gender ?? '').toLowerCase();
  if (gender && gender === persona.gender) score += 10;

  // Prefer voices labeled Indian / Hindi / Urdu when persona is hi/ur
  const lang = persona.langCode.toLowerCase();
  if (lang.startsWith('hi') || lang.startsWith('ur')) {
    const blob = `${name} ${JSON.stringify(remote.labels ?? {})}`.toLowerCase();
    if (blob.includes('hindi') || blob.includes('urdu') || blob.includes('indian') || blob.includes('india') || blob.includes('pakistan')) {
      score += 20;
    }
  }

  return score;
}

/**
 * Pick the best account voice for a persona.
 * Priority: name match → hints → gender → first available.
 */
export function matchRemoteVoice(persona: VoicePersona, remoteVoices: RemoteVoice[]): RemoteVoice | null {
  if (remoteVoices.length === 0) return null;
  let best: RemoteVoice | null = null;
  let bestScore = -1;
  for (const remote of remoteVoices) {
    const s = scoreRemoteMatch(persona, remote);
    if (s > bestScore) {
      bestScore = s;
      best = remote;
    }
  }
  return best ?? remoteVoices[0];
}

export async function generateWithElevenLabs(
  apiKey: string,
  voiceId: string,
  text: string,
  settings: { stability: number; similarityBoost: number; style: number; modelId: string },
  signal?: AbortSignal,
): Promise<Blob> {
  // Higher-quality MP3; Multilingual v2 recommended for Hindi/Urdu
  const outputFormat = 'mp3_44100_128';
  const res = await fetch(`${BASE_URL}/text-to-speech/${voiceId}?output_format=${outputFormat}`, {
    method: 'POST',
    signal,
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: settings.modelId,
      voice_settings: {
        stability: settings.stability,
        similarity_boost: settings.similarityBoost,
        style: settings.style,
        use_speaker_boost: true,
      },
    }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = (await res.json()) as { detail?: { message?: string } | string };
      detail = typeof body.detail === 'string' ? body.detail : body.detail?.message ?? '';
    } catch {
      /* non-JSON */
    }
    if (res.status === 401) throw new ElevenLabsError('That API key was rejected. Double-check it in Settings.');
    if (res.status === 429) throw new ElevenLabsError('Rate limit or quota reached. Try again shortly.');
    throw new ElevenLabsError(detail || `Pro voice API returned an error (${res.status}).`);
  }
  return res.blob();
}
