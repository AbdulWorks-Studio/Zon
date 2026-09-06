import type { VoicePersona } from './types';

/**
 * Personas are matched to:
 * - Local browser voices via langCode + localVoiceHints
 * - Pro API voices via name (exact/partial) then hints (see matchRemoteVoice)
 * Hindi/Urdu male roster is tuned for natural Indo-Pak narration when Pro multilingual model is used.
 */
export const VOICE_PRESETS: VoicePersona[] = [
  // —— Hindi / Urdu (male) — best with Pro Multilingual model + Hindi/Urdu script ——
  { id: 'adam', name: 'Adam', gender: 'male', age: 'middle', style: 'Hindi / Urdu Narration', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Clear male narrator for Hindi and Urdu explainers, ads, and long-form reads.', localVoiceHints: ['adam', 'ravi', 'hemant', 'hindi', 'male'] },
  { id: 'brian-bunty', name: 'Brian Bunty', gender: 'male', age: 'young', style: 'Hindi / Urdu Casual', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Friendly, youthful tone for vlogs, reels, and conversational Hindi/Urdu scripts.', localVoiceHints: ['brian', 'bunty', 'ravi', 'male', 'hindi'] },
  { id: 'niraj', name: 'Niraj', gender: 'male', age: 'middle', style: 'Hindi News / Pro', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Steady, professional delivery for news-style and brand Hindi narration.', localVoiceHints: ['niraj', 'ravi', 'hemant', 'male', 'hindi'] },
  { id: 'raju', name: 'Raju', gender: 'male', age: 'young', style: 'Hindi Story / Warm', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Warm, approachable voice for stories, tutorials, and everyday Hindi/Urdu content.', localVoiceHints: ['raju', 'ravi', 'male', 'hindi'] },
  { id: 'vikrant-rudra', name: 'Vikrant Rudra', gender: 'male', age: 'mature', style: 'Hindi / Urdu Deep', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Deeper, weighty male voice for trailers, serious narration, and impactful reads.', localVoiceHints: ['vikrant', 'rudra', 'hemant', 'male', 'hindi'] },
  { id: 'ranbir', name: 'Ranbir', gender: 'male', age: 'young', style: 'Hindi Film / Smooth', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Smooth, cinematic male tone for promos and polished Hindi/Urdu voiceovers.', localVoiceHints: ['ranbir', 'ravi', 'male', 'hindi'] },
  { id: 'aakash', name: 'Aakash', gender: 'male', age: 'young', style: 'Hindi / Urdu Energetic', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Energetic male voice for ads, hooks, and upbeat social content.', localVoiceHints: ['aakash', 'akash', 'ravi', 'male', 'hindi'] },
  { id: 'krishna-gupta', name: 'Krishna Gupta', gender: 'male', age: 'middle', style: 'Hindi Corporate', language: 'Hindi · Urdu', langCode: 'hi-IN', description: 'Clean corporate Hindi/Urdu voice for product demos, apps, and training.', localVoiceHints: ['krishna', 'gupta', 'ravi', 'hemant', 'male'] },
  { id: 'imran', name: 'Imran', gender: 'male', age: 'middle', style: 'Urdu / Hindi Narration', language: 'Urdu · Hindi', langCode: 'ur-PK', description: 'Natural Urdu-leaning male narrator; also strong for mixed Hindi–Urdu scripts.', localVoiceHints: ['imran', 'urdu', 'hindi', 'male', 'ravi'] },

  // —— General / multilingual library ——
  { id: 'maya', name: 'Maya', gender: 'female', age: 'young', style: 'Narration', language: 'English (US)', langCode: 'en-US', description: 'Calm, clear narrator voice for audiobooks and explainers.', localVoiceHints: ['samantha', 'zira', 'female', 'aria', 'maya'] },
  { id: 'grant', name: 'Grant', gender: 'male', age: 'middle', style: 'Corporate', language: 'English (US)', langCode: 'en-US', description: 'Confident, professional tone for pitches and product demos.', localVoiceHints: ['david', 'guy', 'male', 'mark', 'grant'] },
  { id: 'nova', name: 'Nova', gender: 'female', age: 'young', style: 'Energetic Ad', language: 'English (US)', langCode: 'en-US', description: 'Upbeat, punchy delivery built for ads and social hooks.', localVoiceHints: ['jenny', 'female', 'samantha', 'nova'] },
  { id: 'silas', name: 'Silas', gender: 'male', age: 'mature', style: 'Documentary', language: 'English (UK)', langCode: 'en-GB', description: 'Deep, measured British voice for documentary narration.', localVoiceHints: ['daniel', 'george', 'male', 'ryan', 'silas'] },
  { id: 'priya', name: 'Priya', gender: 'female', age: 'young', style: 'Customer Support', language: 'English (India)', langCode: 'en-IN', description: 'Warm, friendly voice suited to support and onboarding scripts.', localVoiceHints: ['heera', 'female', 'neerja', 'priya'] },
  { id: 'kian', name: 'Kian', gender: 'male', age: 'young', style: 'YouTube / Vlog', language: 'English (US)', langCode: 'en-US', description: 'Casual, energetic voice for vlogs and YouTube intros.', localVoiceHints: ['guy', 'male', 'eric', 'kian'] },
  { id: 'elena', name: 'Elena', gender: 'female', age: 'middle', style: 'News Anchor', language: 'English (UK)', langCode: 'en-GB', description: 'Crisp, authoritative delivery for news-style reads.', localVoiceHints: ['libby', 'female', 'hazel', 'elena'] },
  { id: 'marco', name: 'Marco', gender: 'male', age: 'middle', style: 'Multilingual Narrator', language: 'Spanish', langCode: 'es-ES', description: 'Warm Spanish narrator voice for multilingual scripts.', localVoiceHints: ['jorge', 'diego', 'male', 'marco'] },
  { id: 'yuki', name: 'Yuki', gender: 'female', age: 'young', style: 'Soft / Meditation', language: 'Japanese', langCode: 'ja-JP', description: 'Gentle, unhurried voice for meditation and calm reads.', localVoiceHints: ['ayumi', 'kyoko', 'female', 'yuki'] },
  { id: 'hans', name: 'Hans', gender: 'male', age: 'mature', style: 'Deep Authoritative', language: 'German', langCode: 'de-DE', description: 'Deep, grounded German voice for serious, weighty scripts.', localVoiceHints: ['stefan', 'male', 'hans'] },
  { id: 'colette', name: 'Colette', gender: 'female', age: 'middle', style: 'Elegant', language: 'French', langCode: 'fr-FR', description: 'Elegant French voice for lifestyle and brand storytelling.', localVoiceHints: ['amelie', 'audrey', 'female', 'colette'] },
  { id: 'ravi', name: 'Ravi', gender: 'male', age: 'young', style: 'Friendly Multilingual', language: 'Hindi', langCode: 'hi-IN', description: 'Friendly, approachable Hindi voice for wide-reach content.', localVoiceHints: ['ravi', 'male', 'hemant', 'hindi'] },
];

export const SCRIPT_TEMPLATES: { label: string; text: string }[] = [
  { label: 'Ad read', text: 'Tired of the same old routine? Meet the tool that changes everything. Simple, fast, and built for you. Try it free today — no strings attached.' },
  { label: 'YouTube intro', text: "Hey everyone, welcome back to the channel! In today's video, we're diving into something I think you're really going to love. Let's get right into it." },
  { label: 'Hindi intro', text: 'नमस्ते दोस्तों, स्वागत है आपका। आज हम बात करेंगे एक आसान सी चीज़ की जो आपकी रोज़मर्रा की ज़िंदगी को आसान बना सकती है। चलिए शुरू करते हैं।' },
  { label: 'Urdu intro', text: 'السلام علیکم دوستو، خوش آمدید۔ آج ہم ایک اہم موضوع پر بات کریں گے جو آپ کی روزمرہ زندگی کو آسان بنا سکتا ہے۔ آئیے شروع کرتے ہیں۔' },
  { label: 'Hindi ad', text: 'क्या आप भी समय बचाना चाहते हैं? एक बार आज़माएँ — तेज़, आसान, और पूरी तरह मुफ़्त शुरू करें। अभी ट्राय करें।' },
  { label: 'Customer support', text: "Hi there, thanks for reaching out. I've looked into your request and I'm happy to help. Give me just a moment while I pull up your account details." },
  { label: 'Meditation', text: 'Find a comfortable position, and gently close your eyes. [pause:medium] Take a slow breath in... and let it go. [pause:long] With every breath, let your shoulders soften.' },
  { label: 'News', text: 'Good evening, and thank you for joining us. Our top story tonight: a major development that could reshape the conversation for months to come.' },
];
