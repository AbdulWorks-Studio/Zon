import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Download, History as HistoryIcon, KeyRound, Mic, Play, SlidersHorizontal, Sparkles, Square, Users } from 'lucide-react';
import { ToolShell } from '@/components/ToolShell';
import { VOICE_PRESETS } from './voicePresets';
import { VoiceLibrary } from './VoiceLibrary';
import { AdvancedControls } from './AdvancedControls';
import { ScriptTools } from './ScriptTools';
import { HistoryPanel } from './HistoryPanel';
import { SettingsPanel } from './SettingsPanel';
import { isSpeechSupported, loadVoices, pickVoiceForPersona, speakScript, type SpeakHandle } from './localTts';
import { fetchRemoteVoices, generateWithElevenLabs, matchRemoteVoice } from './elevenLabsApi';
import { addScriptHistoryItem, loadApiKey, loadModelId, loadScriptHistory, removeScriptHistoryItem, saveApiKey, saveModelId } from './storage';
import { plainText } from './script';
import type { EngineMode, GenerateStatus, GenerationRecord, RemoteVoice, ScriptHistoryItem, VoiceSettings } from './types';
import { Seo } from '@/components/Seo';

const SOFT_LIMIT = 5000;
type Tab = 'voices' | 'controls' | 'history' | 'settings';

export function VoiceGeneratorPage() {
  const [script, setScript] = useState('');
  const [personaId, setPersonaId] = useState('adam');
  const [settings, setSettings] = useState<VoiceSettings>({ stability: 0.45, clarity: 0.85, speed: 0.92, pitch: 1, styleExaggeration: 0.35 });
  const [apiKey, setApiKey] = useState('');
  const [modelId, setModelId] = useState('eleven_multilingual_v2');
  const [status, setStatus] = useState<GenerateStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resultAudioUrl, setResultAudioUrl] = useState('');
  const [sessionHistory, setSessionHistory] = useState<GenerationRecord[]>([]);
  const [scriptHistory, setScriptHistory] = useState<ScriptHistoryItem[]>([]);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('voices');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const localHandleRef = useRef<SpeakHandle | null>(null);
  const previewHandleRef = useRef<SpeakHandle | null>(null);
  const remoteVoicesRef = useRef<{ key: string; voices: RemoteVoice[] } | null>(null);

  useEffect(() => {
    setApiKey(loadApiKey());
    setModelId(loadModelId());
    setScriptHistory(loadScriptHistory());
    void loadVoices();
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const mode: EngineMode = apiKey ? 'pro' : 'local';
  const persona = useMemo(() => VOICE_PRESETS.find((p) => p.id === personaId) ?? VOICE_PRESETS[0], [personaId]);
  const charCount = useMemo(() => plainText(script).length, [script]);
  const overSoftLimit = charCount > SOFT_LIMIT;

  const pushSessionRecord = (record: GenerationRecord) => setSessionHistory((prev) => [record, ...prev].slice(0, 12));

  const generate = async (opts?: { jitter?: boolean }) => {
    const text = script.trim();
    if (!text) { setStatus('error'); setErrorMsg('Please write something to generate.'); return; }
    setStatus('generating'); setErrorMsg(''); setResultAudioUrl('');

    const plain = plainText(text);
    if (plain.length > 3) setScriptHistory(addScriptHistoryItem({ id: crypto.randomUUID(), text, personaId: persona.id, createdAt: Date.now() }));

    if (mode === 'pro') {
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        let cache = remoteVoicesRef.current;
        if (!cache || cache.key !== apiKey) { const voices = await fetchRemoteVoices(apiKey); cache = { key: apiKey, voices }; remoteVoicesRef.current = cache; }
        const remoteVoice = matchRemoteVoice(persona, cache.voices);
        if (!remoteVoice) throw new Error('No voices were found on this Pro voice account.');
        const blob = await generateWithElevenLabs(apiKey, remoteVoice.id, plain, { stability: settings.stability, similarityBoost: settings.clarity, style: settings.styleExaggeration, modelId }, controller.signal);
        const url = URL.createObjectURL(blob);
        setResultAudioUrl(url);
        setStatus('ready');
        pushSessionRecord({ id: crypto.randomUUID(), mode: 'pro', personaName: persona.name, textSnippet: plain.slice(0, 90), createdAt: Date.now(), audioUrl: url });
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === 'AbortError') { setStatus('idle'); return; }
        setStatus('error');
        setErrorMsg(cause instanceof Error ? cause.message : 'Something went wrong while generating audio.');
      }
      return;
    }

    if (!isSpeechSupported()) { setStatus('error'); setErrorMsg('This browser does not support local speech playback. Add a Pro API key in Settings instead.'); return; }
    const voices = await loadVoices();
    const voice = pickVoiceForPersona(persona, voices);
    const rateJitter = opts?.jitter ? settings.speed + (Math.random() - 0.5) * 0.12 : settings.speed;
    const handle = speakScript(text, {
      voice,
      rate: rateJitter,
      pitch: settings.pitch,
      onDone: () => {
        setStatus('ready');
        pushSessionRecord({ id: crypto.randomUUID(), mode: 'local', personaName: persona.name, textSnippet: plain.slice(0, 90), createdAt: Date.now() });
      },
      onError: (message) => { setStatus('error'); setErrorMsg(message); },
    });
    localHandleRef.current = handle;
  };

  const stop = () => {
    if (mode === 'pro') abortRef.current?.abort();
    else localHandleRef.current?.stop();
    setStatus('idle');
  };

  const previewVoice = (target = persona) => {
    if (previewingId === target.id) { previewHandleRef.current?.stop(); setPreviewingId(null); return; }
    previewHandleRef.current?.stop();
    loadVoices().then((voices) => {
      const voice = pickVoiceForPersona(target, voices);
      setPreviewingId(target.id);
      previewHandleRef.current = speakScript(`Hi, I'm ${target.name}. This is a quick preview of my voice.`, {
        voice, rate: 1, pitch: 1,
        onDone: () => setPreviewingId(null),
        onError: () => setPreviewingId(null),
      });
    });
  };

  const deleteScriptHistory = (id: string) => setScriptHistory(removeScriptHistoryItem(id));

  const tabs: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'voices', label: 'Voices', icon: Users },
    { key: 'controls', label: 'Controls', icon: SlidersHorizontal },
    { key: 'history', label: 'History', icon: HistoryIcon },
    { key: 'settings', label: 'Settings', icon: KeyRound },
  ];

  return (
    <>
      <Seo
        title="Free AI Voice Generator — Text to Speech Online | Zon"
        description="Free AI voice generator and text to speech online. Create natural speech in your browser with local or optional Pro voice mode."
        path="/voice-generator"
        keywords="AI voice generator, text to speech, free TTS, online voice"
      />
      <ToolShell
      title="AI Voice Generator"
      subtitle="Write a script, pick a voice, and generate — free in your browser, or higher quality with your own Pro voice key."
      steps={[
        { n: '01', t: 'Write Script', d: 'Type or paste your script. Add pauses and templates from the toolbar.' },
        { n: '02', t: 'Pick Voice & Settings', d: 'Choose a persona and tune stability, clarity, speed, and more.' },
        { n: '03', t: 'Generate & Download', d: 'Generate audio. Pro mode gives you a downloadable MP3.' },
      ]}
      technical="Local mode uses your browser's built-in Web Speech API — text is spoken directly by your operating system's voices and never leaves your device, but browsers don't expose that audio as an exportable file, so local mode is playback-only. Pro mode sends only your script text to the Pro voice API using an API key you provide (stored solely in this browser's local storage) and returns a downloadable MP3. Zon has no server in either path — there is no Zon backend involved in generating your audio."
      faqs={['Local mode never sends your script anywhere — it stays in this browser tab.', 'Pro mode sends text only to Pro voice, using your own key.', 'Your API key is stored in localStorage on this device only, never on a Zon server.', 'Script history (text only) is saved locally so you can reuse past scripts.']}
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300"><Mic size={15} /></span>
              <div>
                <div className="font-display text-sm font-semibold text-[#e8ecd8]">Voice generator studio</div>
                <div className="font-mono-zon text-[.6rem] uppercase tracking-[.1em] text-[#7a8f6e]">{persona.name} · {persona.style}</div>
              </div>
            </div>
            <span className={`rounded-full px-2.5 py-1 font-mono-zon text-[.6rem] uppercase tracking-[.08em] ${mode === 'pro' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/5 text-[#a9bd9a]'}`}>{mode === 'pro' ? 'pro mode' : 'local mode'}</span>
          </div>

          <ScriptTools textareaRef={textareaRef} script={script} setScript={setScript} />
          <textarea
            ref={textareaRef}
            value={script}
            onChange={(e) => setScript(e.target.value)}
            placeholder="Write or paste your script here…"
            rows={10}
            className="glass-input w-full resize-y rounded-2xl px-4 py-3.5 text-sm leading-relaxed text-[#e8ecd8] outline-none placeholder:text-[#5f7458]"
          />
          <div className="flex items-center justify-between text-[.72rem] text-[#6b7f62]">
            <span className={overSoftLimit ? 'text-amber-300' : ''}>{charCount.toLocaleString()} / {SOFT_LIMIT.toLocaleString()} characters{overSoftLimit ? ' — long scripts work best split into shorter pieces' : ''}</span>
          </div>

          <div className="flex gap-2">
            {status === 'generating' ? (
              <button type="button" onClick={stop} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"><Square size={14} /> Stop</button>
            ) : (
              <button type="button" onClick={() => void generate()} className="btn-gold flex-1 rounded-xl px-4 py-3 text-sm font-semibold"><Sparkles size={15} /> Generate</button>
            )}
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-[#c9a09a]"><AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" /> {errorMsg}</div>
          )}

          {status === 'generating' && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-white/[.03] px-4 py-4 text-sm text-[#a9bd9a]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" /> {mode === 'pro' ? 'Generating with Pro voice…' : 'Speaking your script…'}
            </div>
          )}

          {status === 'ready' && mode === 'pro' && resultAudioUrl && (
            <div className="rounded-xl border border-amber-400/20 bg-white/[.03] p-4">
              <audio controls src={resultAudioUrl} className="w-full" />
              <a href={resultAudioUrl} download={`zon-voice-${persona.id}.mp3`} className="btn-gold mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"><Download size={15} /> Download MP3</a>
            </div>
          )}

          {status === 'ready' && mode === 'local' && (
            <div className="rounded-xl border border-amber-400/20 bg-white/[.03] p-4">
              <p className="text-sm text-[#a9bd9a]">Played back locally. Browsers can't export Web Speech audio to a file — add a Pro voice key in Settings for a downloadable MP3.</p>
              <button type="button" onClick={() => void generate()} className="btn-quiet mt-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm"><Play size={14} /> Replay</button>
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-2xl border border-white/8 bg-white/[.03] p-4">
          <div className="mb-4 flex gap-1 rounded-xl bg-white/5 p-1">
            {tabs.map((t) => (
              <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 font-mono-zon text-[.58rem] uppercase tracking-[.06em] ${tab === t.key ? 'bg-amber-400/20 text-amber-300' : 'text-[#8a9e7e]'}`}>
                <t.icon size={12} /> {t.label}
              </button>
            ))}
          </div>
          {tab === 'voices' && <VoiceLibrary personas={VOICE_PRESETS} selectedId={personaId} onSelect={setPersonaId} onPreview={previewVoice} previewingId={previewingId} />}
          {tab === 'controls' && <AdvancedControls settings={settings} onChange={setSettings} mode={mode} onRegenerate={() => void generate({ jitter: true })} canRegenerate={status === 'ready'} />}
          {tab === 'history' && <HistoryPanel sessionItems={sessionHistory} scriptItems={scriptHistory} onUseScript={setScript} onDeleteScript={deleteScriptHistory} />}
          {tab === 'settings' && (
            <SettingsPanel
              apiKey={apiKey}
              onSaveKey={(key) => { setApiKey(key); saveApiKey(key); remoteVoicesRef.current = null; }}
              onClearKey={() => { setApiKey(''); saveApiKey(''); remoteVoicesRef.current = null; }}
              modelId={modelId}
              onModelChange={(id) => { setModelId(id); saveModelId(id); }}
              mode={mode}
            />
          )}
        </div>
      </div>
    </ToolShell>
    </>
  );
}