export type ScriptUnit = { type: 'text'; value: string } | { type: 'pause'; ms: number };

const PAUSE_PATTERN = /\[pause:(\d+)\]/g;

/** Splits a script (with [pause:ms] tokens) into alternating text/pause units, and further splits long text into sentence-sized chunks so local TTS engines don't choke on very long utterances. */
export function parseScript(raw: string): ScriptUnit[] {
  const units: ScriptUnit[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  PAUSE_PATTERN.lastIndex = 0;
  while ((match = PAUSE_PATTERN.exec(raw))) {
    const textPart = raw.slice(lastIndex, match.index);
    if (textPart.trim()) units.push(...chunkText(textPart));
    units.push({ type: 'pause', ms: Number(match[1]) });
    lastIndex = PAUSE_PATTERN.lastIndex;
  }
  const rest = raw.slice(lastIndex);
  if (rest.trim()) units.push(...chunkText(rest));
  return units;
}

function chunkText(text: string): ScriptUnit[] {
  const clean = stripEmphasis(text).replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?]+[.!?]*|\S+$/g) ?? [clean];
  const chunks: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > 220 && current) { chunks.push(current.trim()); current = sentence; }
    else current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.map((value) => ({ type: 'text', value }) as ScriptUnit);
}

/** Removes *emphasis* markers, returning clean plain text (used before sending to any TTS engine). */
export function stripEmphasis(text: string): string {
  return text.replace(/\*([^*]+)\*/g, '$1');
}

/** Strips all Zon script markup ([pause:ms] tokens and *emphasis*) down to plain text — used for character counts and the Pro API payload. */
export function plainText(raw: string): string {
  return stripEmphasis(raw.replace(PAUSE_PATTERN, ' ')).replace(/\s+/g, ' ').trim();
}

export const PAUSE_TOKENS = { short: 400, medium: 900, long: 1800 } as const;
