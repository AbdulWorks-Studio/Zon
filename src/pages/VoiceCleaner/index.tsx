import { useEffect, useRef, useState } from 'react';
import { Check, Download, Pause, Play, RotateCcw, X } from 'lucide-react';
import { ToolShell } from '@/components/ToolShell';
import { UploadEmpty } from '@/components/UploadEmpty';
import { ProcessingState } from '@/components/ProcessingState';
import { Waveform } from './Waveform';
import { NoiseControls } from './NoiseControls';
import { bufferToWav, cleanAudioBuffer, decodeAudioFile, getWaveformPeaks } from './audioEngine';

type Stage = 'idle' | 'loaded' | 'cleaning' | 'done';

function usePlayback(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setPlaying(false); setProgress(0);
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    const onTime = () => setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnd);
    return () => { audio.pause(); audio.removeEventListener('timeupdate', onTime); audio.removeEventListener('ended', onEnd); };
  }, [url]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  return { playing, progress, toggle };
}

export function VoiceCleanerPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [originalPeaks, setOriginalPeaks] = useState<number[]>([]);
  const [cleanedUrl, setCleanedUrl] = useState('');
  const [cleanedPeaks, setCleanedPeaks] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const [highpassFreq, setHighpassFreq] = useState(90);
  const [gateThreshold, setGateThreshold] = useState(0.04);
  const [strength, setStrength] = useState(0.55);
  const [normalize, setNormalize] = useState(true);
  const [trimSilence, setTrimSilence] = useState(false);

  const original = usePlayback(originalUrl);
  const cleaned = usePlayback(cleanedUrl);

  const chooseFile = async (f: File) => {
    if (!f.type.startsWith('audio/')) { setError('Please choose an MP3, WAV, M4A, or OGG file.'); return; }
    setError('');
    try {
      const buffer = await decodeAudioFile(f);
      setFile(f);
      setOriginalUrl(URL.createObjectURL(f));
      setOriginalPeaks(getWaveformPeaks(buffer, 220));
      setCleanedUrl(''); setCleanedPeaks([]);
      setStage('loaded');
    } catch {
      setError('This browser could not decode that audio file.');
    }
  };

  const runClean = async () => {
    if (!file) return;
    setStage('cleaning'); setProgress(2); setError('');
    try {
      const buffer = await decodeAudioFile(file);
      const cleanedBuffer = await cleanAudioBuffer(buffer, { highpassFreq, gateThreshold, strength, normalize, trimSilence, onProgress: setProgress });
      const blob = bufferToWav(cleanedBuffer);
      setCleanedUrl(URL.createObjectURL(blob));
      setCleanedPeaks(getWaveformPeaks(cleanedBuffer, 220));
      setStage('done');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong while cleaning this audio.');
      setStage('loaded');
    }
  };

  const download = () => {
    if (!cleanedUrl) return;
    const a = document.createElement('a');
    a.href = cleanedUrl;
    a.download = `${file?.name.replace(/\.[^/.]+$/, '') ?? 'zon'}-cleaned.wav`;
    a.click();
  };

  const reset = () => {
    setStage('idle'); setFile(null); setOriginalUrl(''); setOriginalPeaks([]); setCleanedUrl(''); setCleanedPeaks([]); setError('');
  };

  return (
    <ToolShell
      title="Voice Cleaner"
      subtitle="Strip hum, tame background noise, and even out levels — all in your browser."
      steps={[
        { n: '01', t: 'Drag & Drop', d: 'Drop an MP3, WAV, M4A, or OGG file. It never leaves your browser.' },
        { n: '02', t: 'Tune the Cleanup', d: 'Adjust the rumble filter and noise gate, then hit Clean audio.' },
        { n: '03', t: 'Free Download', d: 'Compare before/after and export a clean WAV file.' },
      ]}
      technical="Voice Cleaner runs a Web Audio high-pass filter, strength-scaled noise gate, and optional spectral denoise (BiquadFilterNode) to remove low rumble/hum, then a custom envelope-following noise gate to quiet hiss between words, with optional peak normalization and silence trimming. Everything happens in an OfflineAudioContext and typed-array math in your browser — there is no server, no upload, and no third-party speech API involved. Output is exported as a standard 16-bit PCM WAV file."
      faqs={['Your audio file never leaves this browser tab.', 'No server-side storage, transcription, or analytics.', 'Re-run cleanup as many times as you like with different settings.', 'Auth is optional and only for saved-file features.']}
    >
      {stage === 'idle' && <UploadEmpty onFile={chooseFile} accept="audio/*" title="Drop an audio file to clean" hint="MP3, WAV, M4A, or OGG · up to 40 MB" />}

      {error && stage === 'idle' && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-[#c9a09a]"><X size={15} className="shrink-0 text-red-400" /> {error}</div>
      )}

      {stage === 'loaded' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
              <div>
                <div className="font-display text-sm font-semibold text-[#e8ecd8]">{file?.name}</div>
                <div className="font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#7a8f6e]">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : ''} · original</div>
              </div>
              <button type="button" onClick={original.toggle} className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-[#042f2e]">{original.playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}</button>
            </div>
            <Waveform peaks={originalPeaks} progress={original.progress} label="original" />
            {error && <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-[#c9a09a]"><X size={15} className="shrink-0 text-red-400" /> {error}</div>}
          </div>
          <NoiseControls
            highpassFreq={highpassFreq} setHighpassFreq={setHighpassFreq}
            gateThreshold={gateThreshold} setGateThreshold={setGateThreshold}
            strength={strength} setStrength={setStrength}
            normalize={normalize} setNormalize={setNormalize}
            trimSilence={trimSilence} setTrimSilence={setTrimSilence}
            onClean={runClean} cleaning={false}
          />
        </div>
      )}

      {stage === 'cleaning' && <ProcessingState progress={progress} engine="private engine" label="cleaning audio" title={'Quieting the\nroom noise.'} note="Filtering, gating, and normalizing in your browser. Longer files take a little more time." />}

      {stage === 'done' && (
        <div className="grid gap-4 lg:grid-cols-[1fr_16rem]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
              <span className="font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#7a8f6e]">original</span>
              <button type="button" onClick={original.toggle} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#e8ecd8]">{original.playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}</button>
            </div>
            <Waveform peaks={originalPeaks} progress={original.progress} color="#8a9e7e" />
            <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3">
              <span className="flex items-center gap-1.5 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-amber-300"><Check size={12} /> cleaned</span>
              <button type="button" onClick={cleaned.toggle} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-[#042f2e]">{cleaned.playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}</button>
            </div>
            <Waveform peaks={cleanedPeaks} progress={cleaned.progress} />
            {error && <div className="flex items-center gap-2 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-[#c9a09a]"><X size={15} className="shrink-0 text-red-400" /> {error}</div>}
          </div>
          <div className="flex flex-col justify-between rounded-[1.35rem] border border-amber-400/20 bg-[#042f2e]/70 p-6 text-[#f2f0d8]">
            <div>
              <div className="flex items-center gap-2 font-mono-zon text-[.55rem] uppercase tracking-[.12em] text-amber-400"><Check size={14} /> cleanup complete</div>
              <div className="mt-4 font-display text-[1.9rem] leading-[.95] tracking-[-.05em]">Sounds like<br />a quieter room.</div>
              <p className="mt-4 text-sm leading-relaxed text-[#a9bd9a]">Not quite right? Adjust the sliders and clean it again — the original stays untouched.</p>
            </div>
            <div className="mt-8 flex flex-col gap-2">
              <button type="button" className="btn-gold w-full rounded-xl px-4 py-3 text-sm font-semibold" onClick={download}><Download size={15} /> Download WAV</button>
              <button type="button" className="btn-quiet w-full rounded-xl px-4 py-3 text-sm" onClick={() => setStage('loaded')}>Adjust & re-clean</button>
              <button type="button" className="mt-1 flex w-full items-center justify-center gap-2 py-2 font-mono-zon text-[.55rem] uppercase tracking-[.1em] text-[#a9bd9a] hover:text-amber-300" onClick={reset}><RotateCcw size={12} /> start over</button>
            </div>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
