// Client-side audio cleanup: high-pass, noise gate (strength-scaled),
// normalize, trim. No server / no upload.
// Intentionally avoids heavy FFT/spectral loops that freeze the browser.

export interface CleanOptions {
  highpassFreq: number;
  gateThreshold: number;
  /** 0–1 overall denoise strength (scales gate aggressiveness) */
  strength: number;
  normalize: boolean;
  trimSilence: boolean;
  onProgress?: (percent: number) => void;
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    return await ctx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    void ctx.close();
  }
}

async function applyHighpass(buffer: AudioBuffer, freq: number): Promise<AudioBuffer> {
  if (freq <= 20) return buffer;
  const OfflineCtx =
    window.OfflineAudioContext ||
    (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext }).webkitOfflineAudioContext;
  const offline = new OfflineCtx(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  const filter = offline.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = freq;
  filter.Q.value = 0.707;
  source.connect(filter);
  filter.connect(offline.destination);
  source.start();
  return offline.startRendering();
}

/** Soft noise gate with strength-scaled threshold — yields so UI stays responsive. */
async function applyNoiseGate(
  buffer: AudioBuffer,
  threshold: number,
  strength: number,
  onProgress?: (p: number) => void,
) {
  if (threshold <= 0 && strength <= 0) return;
  const t = threshold * (0.5 + strength * 0.9);
  const floor = Math.max(0.02, 1 - strength * 0.85);
  const windowSize = Math.max(1, Math.round(buffer.sampleRate * 0.015));
  const attack = 0.4;
  const release = 0.05 + (1 - strength) * 0.04;

  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    let gain = 1;
    let steps = 0;
    for (let i = 0; i < data.length; i += windowSize) {
      const end = Math.min(data.length, i + windowSize);
      let peak = 0;
      for (let j = i; j < end; j++) peak = Math.max(peak, Math.abs(data[j]));
      const target =
        peak < t ? Math.max(floor * 0.05, (peak / Math.max(t, 1e-4)) * floor * 0.2) : 1;
      for (let j = i; j < end; j++) {
        gain += (target - gain) * (target > gain ? attack : release);
        data[j] *= gain;
      }
      steps++;
      if (steps % 80 === 0) {
        onProgress?.(Math.min(90, Math.round((i / data.length) * 90)));
        await yieldToMain();
      }
    }
  }
}

function normalizeBuffer(buffer: AudioBuffer) {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  }
  if (peak <= 0.0001 || peak >= 0.98) return;
  const gain = 0.97 / peak;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) data[i] *= gain;
  }
}

function trimSilenceFromBuffer(buffer: AudioBuffer, threshold = 0.008): AudioBuffer {
  const channels = buffer.numberOfChannels;
  const length = buffer.length;
  let start = 0;
  let end = length - 1;
  const isSilentAt = (i: number) => {
    for (let ch = 0; ch < channels; ch++) if (Math.abs(buffer.getChannelData(ch)[i]) > threshold) return false;
    return true;
  };
  while (start < length && isSilentAt(start)) start++;
  while (end > start && isSilentAt(end)) end--;
  if (start === 0 && end === length - 1) return buffer;
  const newLength = Math.max(1, end - start + 1);
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new AudioCtx();
  const out = ctx.createBuffer(channels, newLength, buffer.sampleRate);
  for (let ch = 0; ch < channels; ch++) {
    out.getChannelData(ch).set(buffer.getChannelData(ch).subarray(start, start + newLength));
  }
  void ctx.close();
  return out;
}

export async function cleanAudioBuffer(input: AudioBuffer, options: CleanOptions): Promise<AudioBuffer> {
  const strength = Math.max(0, Math.min(1, options.strength ?? 0.55));
  options.onProgress?.(8);
  await yieldToMain();

  let buffer = await applyHighpass(input, options.highpassFreq);
  options.onProgress?.(28);
  await yieldToMain();

  await applyNoiseGate(buffer, options.gateThreshold, strength, (p) =>
    options.onProgress?.(28 + Math.round(p * 0.5)),
  );
  options.onProgress?.(82);
  await yieldToMain();

  if (options.normalize) normalizeBuffer(buffer);
  options.onProgress?.(90);
  await yieldToMain();

  if (options.trimSilence) buffer = trimSilenceFromBuffer(buffer);
  options.onProgress?.(100);
  return buffer;
}

export function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  const channelData: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) channelData.push(buffer.getChannelData(ch));
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channelData[ch][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export function getWaveformPeaks(buffer: AudioBuffer, bucketCount: number): number[] {
  const data = buffer.getChannelData(0);
  const samplesPerBucket = Math.max(1, Math.floor(data.length / bucketCount));
  const peaks: number[] = [];
  for (let i = 0; i < bucketCount; i++) {
    const start = i * samplesPerBucket;
    const end = Math.min(data.length, start + samplesPerBucket);
    let peak = 0;
    for (let j = start; j < end; j++) peak = Math.max(peak, Math.abs(data[j]));
    peaks.push(peak);
  }
  return peaks;
}
