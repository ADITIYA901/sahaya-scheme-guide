import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { AudioLines, LoaderCircle, Mic, Send, Square, Volume2, VolumeX, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { askAssistant } from '@/lib/assistant.functions';
import { languages, schemes } from '@/lib/schemes';
import { useVoice } from '@/components/assistant-panel';

type Message = { role: 'user' | 'assistant'; content: string };

const sections: { id: string; words: string[]; label: string }[] = [
  { id: 'home', words: ['home', 'top', 'start'], label: 'home' },
  { id: 'schemes', words: ['scheme', 'yojana', 'योजना'], label: 'schemes' },
  { id: 'eligibility', words: ['eligib', 'check', 'पात्र'], label: 'eligibility checker' },
  { id: 'advisory', words: ['farm', 'weather', 'advis', 'मौसम', 'खेती'], label: 'farmer advisory' },
  { id: 'centers', words: ['center', 'centre', 'office', 'help cent', 'केंद्र'], label: 'help centers' },
  { id: 'voice', words: ['pdf', 'upload', 'document'], label: 'PDF analysis' },
];

const navVerbs = /\b(go to|open|show|take me|navigate|scroll to|jump to)\b|दिखाओ|खोलो/i;

function runCommand(text: string, actions: { openScheme: (id: string) => void }): string | null {
  const t = text.toLowerCase();
  if (/^(help|what can you do|commands)\b/.test(t) || /what can you do/.test(t)) return 'You can say "go to schemes", "open eligibility", "show help centers", "open PM-Kisan", "stop speaking", or just ask any question.';
  if (navVerbs.test(t)) {
    const scheme = schemes.find(s => t.includes((s.name.toLowerCase().split(' ')[0] ?? '').replace(/[^a-z-]/g, '')) || t.includes(s.id.replace('-', ' ')) || t.includes(s.id));
    if (scheme && !/\bschemes\b/.test(t)) { actions.openScheme(scheme.id); return `Opening ${scheme.name}.`; }
    const section = sections.find(s => s.words.some(w => t.includes(w)));
    if (section) { document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' }); return `Taking you to ${section.label}.`; }
  }
  return null;
}

export function VoiceAssistant({ language, onOpenScheme }: { language: string; onOpenScheme: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askAssistant);
  const historyRef = useRef<Message[]>([]);
  historyRef.current = messages;

  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy]);
  useEffect(() => () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel(); }, []);

  function speak(text: string) {
    if (muted) return;
    if (!('speechSynthesis' in window)) { setError('Spoken answers are not supported in this browser. You can read the reply below.'); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[#*_`>]/g, '').slice(0, 2500));
    const code = languages.find(l => l.name === language)?.code ?? 'en-IN';
    u.lang = code;
    const voice = window.speechSynthesis.getVoices().find(v => v.lang === code) ?? window.speechSynthesis.getVoices().find(v => v.lang.startsWith(code.slice(0, 2)));
    if (voice) u.voice = voice;
    u.onstart = () => setSpeaking(true); u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }
  function stopSpeaking() { window.speechSynthesis?.cancel(); setSpeaking(false); }

  async function handle(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    setError(''); setInput('');
    if (/^(stop|quiet|silence|chup|रुको)\b/i.test(text)) { stopSpeaking(); return; }
    const withUser: Message[] = [...historyRef.current, { role: 'user', content: text }];
    const commandReply = runCommand(text, { openScheme: onOpenScheme });
    if (commandReply) { setMessages([...withUser, { role: 'assistant', content: commandReply }]); speak(commandReply); return; }
    setMessages(withUser); setBusy(true);
    try {
      const result = await ask({ data: { language: language as 'English', messages: withUser.slice(-30) } });
      if (result.error) { setError(result.error); speak(result.error); }
      else { setMessages([...withUser, { role: 'assistant', content: result.text }]); speak(result.text); }
    } catch { setError('Unable to reach the AI service right now. Please try again in a moment.'); }
    finally { setBusy(false); }
  }

  const voice = useVoice(language, t => { void handle(t); });
  const status = voice.listening ? 'Listening…' : busy ? 'Thinking…' : speaking ? 'Speaking…' : 'Tap the mic and talk';

  if (!open) return <Button aria-label="Open voice assistant" title="Voice assistant" onClick={() => setOpen(true)} className="fixed bottom-6 left-6 z-40 size-14 rounded-full shadow-lg [&_svg]:size-6 max-sm:bottom-4 max-sm:left-4"><Mic /></Button>;

  return <aside aria-label="Voice assistant" className="fixed bottom-6 left-6 z-40 flex h-[560px] max-h-[calc(100dvh-100px)] w-[360px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border bg-card shadow-xl max-sm:bottom-4 max-sm:left-4">
    <header className="flex items-center justify-between bg-brand p-4 text-brand-foreground">
      <div className="flex items-center gap-3"><AudioLines size={22} /><div><h3 className="text-sm font-bold">Voice Assistant</h3><p className="mt-1 text-[11px] opacity-80" aria-live="polite">{status} · {language}</p></div></div>
      <div className="flex">
        <Button variant="ghost" size="icon" aria-label={muted ? 'Turn spoken replies on' : 'Mute spoken replies'} onClick={() => { setMuted(!muted); stopSpeaking(); }}>{muted ? <VolumeX /> : <Volume2 />}</Button>
        <Button variant="ghost" size="icon" aria-label="Close voice assistant" onClick={() => { stopSpeaking(); setOpen(false); }}><X /></Button>
      </div>
    </header>
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && <div className="py-4 text-sm text-muted-foreground"><p className="font-bold text-foreground">Speak or type to get started.</p><p className="mt-2 leading-6">Try: “Go to schemes”, “Open PM-Kisan”, “Show help centers”, or ask “Am I eligible for Ayushman Bharat?”</p></div>}
      {messages.map((m, i) => <div key={i} className={`mb-3 ${m.role === 'user' ? 'ml-8 rounded-lg bg-secondary px-3 py-2' : 'mr-2'}`}><p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">{m.role === 'user' ? 'You' : 'Sahayak'}</p><div className="answer-text"><ReactMarkdown>{m.content}</ReactMarkdown></div>{m.role === 'assistant' && <Button variant="ghost" size="icon" aria-label="Play this answer" onClick={() => speak(m.content)}><Volume2 /></Button>}</div>)}
      {busy && <div role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="animate-spin" size={15} />Finding an answer…</div>}
      {(error || voice.voiceError) && <p role="alert" className="mt-3 rounded-md bg-peach p-3 text-xs text-destructive">{error || voice.voiceError}</p>}
      <div ref={bottom} />
    </div>
    <div className="flex flex-col items-center gap-2 border-t p-3">
      <div className="flex items-center gap-3">
        <Button size="icon" aria-label={voice.listening ? 'Stop listening' : 'Start listening'} onClick={voice.toggleVoice} disabled={busy} className={`size-14 rounded-full [&_svg]:size-6 ${voice.listening ? 'listening' : ''}`}>{voice.listening ? <Square /> : <Mic />}</Button>
        {speaking && <Button variant="outline" size="sm" onClick={stopSpeaking} className="text-xs"><span className="flex h-3 items-end gap-0.5" aria-hidden>{[0, 1, 2].map(b => <span key={b} className="w-0.5 animate-pulse rounded bg-primary" style={{ height: `${6 + b * 3}px`, animationDelay: `${b * 150}ms` }} />)}</span>Stop speaking</Button>}
      </div>
      <form onSubmit={e => { e.preventDefault(); void handle(input); }} className="flex w-full gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Or type here…" aria-label="Type to the voice assistant" className="min-w-0 flex-1 rounded-md bg-muted px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring" />
        <Button size="icon" type="submit" aria-label="Send" disabled={busy || !input.trim()}><Send /></Button>
      </form>
    </div>
  </aside>;
}
