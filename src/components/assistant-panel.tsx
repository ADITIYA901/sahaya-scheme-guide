import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Mic, Send, Volume2, X, Sparkles, MessageCircle, LoaderCircle, Square } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { askAssistant } from '@/lib/assistant.functions';
import { languages } from '@/lib/schemes';

type Message = { role: 'user' | 'assistant'; content: string };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; start: () => void; stop: () => void; onresult: ((event: { results: { transcript: string }[][] }) => void) | null; onerror: ((event: { error: string }) => void) | null; onend: (() => void) | null };
export function useVoice(language: string, onText: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognition = useRef<Recognition | null>(null);
  useEffect(() => () => recognition.current?.stop(), []);
  function toggleVoice() {
    if (listening) { recognition.current?.stop(); return; }
    const speechWindow = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) { setVoiceError('Voice input is available in Chrome and Edge. You can also type your question.'); return; }
    const r = new Constructor(); recognition.current = r;
    r.lang = languages.find(l => l.name === language)?.code ?? 'en-IN'; r.continuous = false; r.interimResults = false;
    r.onresult = event => { const text = event.results[0]?.[0]?.transcript; if (text) onText(text); };
    r.onerror = event => { setVoiceError(event.error === 'not-allowed' ? 'Microphone access was denied. Allow access in your browser or type your question.' : 'Could not hear your question. Please try again or type it.'); setListening(false); };
    r.onend = () => setListening(false);
    setVoiceError(''); setListening(true);
    try { r.start(); } catch { setListening(false); setVoiceError('Microphone is unavailable. Please type your question.'); }
  }
  return { listening, voiceError, toggleVoice };
}

export function AssistantPanel({ open, onClose, language, setLanguage, initialQuestion }: { open: boolean; onClose: () => void; language: string; setLanguage: (value: string) => void; initialQuestion: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const textarea = useRef<HTMLTextAreaElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askAssistant);
  useEffect(() => { if (open) { setInput(initialQuestion); setTimeout(() => textarea.current?.focus(), 80); } }, [open, initialQuestion]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages, busy]);
  const voice = useVoice(language, setInput);
  async function send() {
    if (!input.trim() || busy) return;
    const next: Message[] = [...messages, { role: 'user', content: input.trim() }];
    setMessages(next); setInput(''); setBusy(true); setError(''); textarea.current?.focus();
    try {
      const result = await ask({ data: { language: language as 'English', messages: next.slice(-30) } });
      if (result.error) setError(result.error);
      else setMessages([...next, { role: 'assistant', content: result.text }]);
    } catch { setError('Unable to connect to AI. Please try again later.'); }
    finally { setBusy(false); textarea.current?.focus(); }
  }
  function speak(text: string) {
    if (!('speechSynthesis' in window)) { setError('Voice playback is not available in this browser.'); return; }
    window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text.replace(/[#*]/g, ''));
    utterance.lang = languages.find(l => l.name === language)?.code ?? 'en-IN'; window.speechSynthesis.speak(utterance);
  }
  if (!open) return null;
  return <aside aria-label="Sarkari-Sahayak AI chat" className="fixed bottom-6 right-6 z-40 flex h-[610px] max-h-[calc(100dvh-100px)] w-[390px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-lg border bg-card shadow-xl max-sm:bottom-4 max-sm:right-4">
    <header className="flex items-center justify-between bg-brand p-4 text-brand-foreground"><div className="flex items-center gap-3"><Sparkles size={22} /><div><h3 className="text-sm font-bold">Sarkari-Sahayak AI</h3><p className="mt-1 flex items-center gap-1.5 text-[11px] opacity-80"><span className="size-1.5 rounded-full bg-mint" />Here to help, in your language</p></div></div><Button variant="ghost" size="icon" aria-label="Close chat" onClick={onClose}><X /></Button></header>
    <div className="border-b px-4 py-2"><select aria-label="Chat language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-transparent text-xs outline-none">{languages.map(l => <option value={l.name} key={l.code}>{l.label}</option>)}</select></div>
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && <div className="py-6"><span className="mb-4 inline-flex size-11 items-center justify-center rounded-lg bg-mint text-brand"><MessageCircle size={23} /></span><h3 className="font-bold">Namaste! How can I help?</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">Ask about government schemes, who may qualify, or how to take the next step.</p><div className="mt-5 grid gap-2">{['Where can students find government scholarships?', 'How do I check Ayushman Bharat eligibility?', 'What documents might I need to apply?'].map(q => <Button key={q} variant="outline" className="h-auto justify-start whitespace-normal py-3 text-left text-xs" onClick={() => { setInput(q); textarea.current?.focus(); }}>{q}<Send className="ml-auto" /></Button>)}</div></div>}
      {messages.map((m, i) => <div key={i} className={`mb-4 ${m.role === 'user' ? 'ml-8 rounded-lg bg-secondary px-3 py-2' : 'mr-2'}`}><p className="mb-1 text-[10px] font-bold uppercase text-muted-foreground">{m.role === 'user' ? 'You' : 'Sahayak'}</p><div className="answer-text"><ReactMarkdown>{m.content}</ReactMarkdown></div>{m.role === 'assistant' && <Button variant="ghost" size="icon" title="Listen to answer" aria-label="Listen to answer" onClick={() => speak(m.content)}><Volume2 /></Button>}</div>)}
      {busy && <div role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><LoaderCircle className="animate-spin" size={15} />Finding an answer…</div>}
      {(error || voice.voiceError) && <p role="alert" className="mt-3 rounded-md bg-peach p-3 text-xs text-destructive">{error || voice.voiceError}</p>}<div ref={bottom} />
    </div>
    <form onSubmit={e => { e.preventDefault(); void send(); }} className="border-t p-3"><div className="flex items-end gap-2"><textarea ref={textarea} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask your question…" aria-label="Your question" rows={2} className="min-w-0 flex-1 resize-none rounded-md bg-muted p-3 text-sm outline-none focus:ring-1 focus:ring-ring" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} /><Button type="button" size="icon" variant="ghost" title="Ask with voice" aria-label="Chat voice input" onClick={voice.toggleVoice} className={voice.listening ? 'text-primary listening' : ''}>{voice.listening ? <Square /> : <Mic />}</Button><Button size="icon" type="submit" aria-label="Send question" disabled={busy || !input.trim()}><Send /></Button></div><p className="mt-2 text-center text-[10px] text-muted-foreground">AI guidance · Verify details with official sources</p></form>
  </aside>;
}
