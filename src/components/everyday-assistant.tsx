import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ArrowUp, ArrowUpRight, AudioLines, BookOpen, Check, Copy, FileText, Globe2, LoaderCircle, MessageCircle, Mic, Paperclip, PenLine, Sparkles, Square, Volume2, VolumeX } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { FilePicker } from '@/components/file-picker';
import { useVoice } from '@/components/assistant-panel';
import { askAssistant } from '@/lib/assistant.functions';
import { languages, type Attachment, type Mode } from '@/lib/assistant-options';
import workspaceImage from '@/assets/everyday-workspace.jpg';

type Message = { role: 'user' | 'assistant'; content: string; source?: string };
const modes = [
  { id: 'chat' as const, name: 'Chat', icon: MessageCircle, color: 'bg-sky text-brand', title: 'A little clarity. A new idea.', text: 'Questions, plans, and those “what if” moments.', example: 'Help me plan a productive week.' },
  { id: 'write' as const, name: 'Write', icon: PenLine, color: 'bg-peach text-primary', title: 'Find the right words.', text: 'From a first draft to a better way to say it.', example: 'Draft an email' },
  { id: 'study' as const, name: 'Study', icon: BookOpen, color: 'bg-mint text-secondary-foreground', title: 'Make it make sense.', text: 'Break down a topic. Build up your confidence.', example: 'Explain a topic' },
  { id: 'analyze' as const, name: 'Analyze a file', icon: FileText, color: 'bg-lemon text-foreground', title: 'Get the bigger picture.', text: 'Ask about a PDF, photo, or screenshot.', example: 'Summarize this file' },
];
const tasks = { chat: ['Ask anything', 'Brainstorm ideas', 'Make a plan'], write: ['Draft an email', 'Improve my text', 'Resume help', 'Change tone', 'Translate'], study: ['Explain a topic', 'Summarize notes', 'Practice questions'], analyze: ['Summarize this file', 'Ask about this file', 'Extract key details'] };

export function EverydayAssistant() {
  const [mode, setMode] = useState<Mode>('chat');
  const [task, setTask] = useState('Ask anything');
  const [tone, setTone] = useState<'Natural' | 'Professional' | 'Friendly' | 'Confident'>('Natural');
  const [language, setLanguage] = useState('English');
  const [detail, setDetail] = useState<'short' | 'detailed'>('short');
  const [input, setInput] = useState('');
  const [heroInput, setHeroInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [file, setFile] = useState<Attachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<number | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const answer = useRef<HTMLDivElement>(null);
  const ask = useServerFn(askAssistant);
  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  function stopSpeaking() { window.speechSynthesis?.cancel(); setSpeaking(false); }
  function speak(text: string) {
    if (!('speechSynthesis' in window)) { setError('Spoken answers are unavailable in this browser. You can read the answer instead.'); return; }
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[#*_`>]/g, ''));
    const code = languages.find(l => l.name === language)?.code ?? 'en-IN'; utterance.lang = code;
    const available = window.speechSynthesis.getVoices().find(v => v.lang.startsWith(code.slice(0,2))); if (available) utterance.voice = available;
    utterance.onstart = () => setSpeaking(true); utterance.onend = () => setSpeaking(false); utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }
  function focusWorkspace(nextMode?: Mode) {
    if (nextMode) { setMode(nextMode); setTask(tasks[nextMode][0] ?? 'Ask anything'); }
    document.getElementById('assistant')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => textarea.current?.focus({ preventScroll: true }), 350);
  }
  async function send(raw = input, selectedMode = mode, selectedTask = task) {
    if (!raw.trim() || busy) return;
    if (selectedMode === 'analyze' && !file) { setError('Choose a PDF or image first.'); focusWorkspace(); return; }
    const next: Message[] = [...messages, { role: 'user', content: raw.trim(), source: file?.name }];
    setMessages(next); setInput(''); setHeroInput(''); setError(''); setBusy(true); focusWorkspace();
    try {
      const result = await ask({ data: { language: language as 'English', mode: selectedMode, detail, task: selectedTask, tone, messages: next.slice(-30).map(({ role, content }) => ({ role, content })), ...(file ? { attachment: file } : {}) } });
      if (result.error) { setError(result.error); setInput(raw); }
      else { setMessages([...next, { role: 'assistant', content: result.text, source: file?.name }]); if (autoSpeak) speak(result.text); setTimeout(() => answer.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 100); }
    } catch { setError('Could not connect to the assistant. Your question is still here; try again later.'); setInput(raw); }
    finally { setBusy(false); }
  }
  const voice = useVoice(language, text => { setInput(text); focusWorkspace(); });
  async function copy(text: string, i: number) { try { await navigator.clipboard.writeText(text); setCopied(i); setTimeout(() => setCopied(null), 1800); } catch { setError('Copy is unavailable in this browser. Select the answer to copy it.'); } }
  return <>
    <section id="home" className="everyday-hero relative overflow-hidden bg-mint">
      <img src={workspaceImage} width={1536} height={1024} alt="Blue notebooks, a pencil and headphones on a bright creative desk" className="hero-image" />
      <div className="hero-fade" />
      <div className="section-wrap relative py-14 text-center md:py-16">
        <p className="mb-5 flex items-center justify-center gap-2 text-xs font-semibold text-brand"><Sparkles size={15} /> A little help, a lot of possibility</p>
        <h1 className="text-5xl font-extrabold leading-tight text-foreground max-sm:text-4xl">Sahayak<span className="text-primary">.</span></h1>
        <p className="mt-3 text-2xl font-semibold md:text-3xl">Your everyday AI companion.</p>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-muted-foreground">Big questions. Blank pages. New things to learn.<br className="hidden sm:block" /> Let’s make your next step a little easier.</p>
        <form onSubmit={e => { e.preventDefault(); setMode('chat'); setTask('Ask anything'); void send(heroInput, 'chat', 'Ask anything'); }} className="hero-composer mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-lg border border-brand/15 bg-card p-2.5 text-left">
          <Sparkles className="ml-2 shrink-0 text-primary" size={20} /><input aria-label="Ask anything" placeholder="Ask anything. Start somewhere." value={heroInput} onChange={e => setHeroInput(e.target.value)} className="h-11 min-w-0 flex-1 bg-transparent text-sm outline-none" />
          <Button type="button" variant="ghost" size="icon" aria-label="Ask with voice" title="Ask with voice" onClick={() => { focusWorkspace(); voice.toggleVoice(); }}><Mic /></Button>
          <Button type="submit" size="icon" aria-label="Ask Sahayak" title="Ask Sahayak" disabled={busy || !heroInput.trim()} className="size-11"><ArrowUp /></Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground"><span>Try asking</span>{['Explain something simply', 'Help me write an email', 'Give me a fresh idea'].map((text,i) => <Button key={text} variant="link" className="h-auto p-0 text-xs text-foreground" onClick={() => { focusWorkspace(i === 1 ? 'write' : 'chat'); setInput(i === 0 ? 'Explain a topic simply: ' : i === 1 ? 'Draft an email about ' : 'Brainstorm ideas for '); }}>{text}<ArrowUpRight size={12} /></Button>)}</div>
        <p className="mt-6 text-[11px] text-muted-foreground">No account needed <span className="mx-2">·</span> Six languages <span className="mx-2">·</span> Just this conversation</p>
      </div>
    </section>
    <section id="tools" className="py-12 md:py-14"><div className="section-wrap">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><p className="eyebrow text-primary">A good place to start</p><h2 className="section-title mt-2">What’s on your mind?</h2></div><p className="text-sm text-muted-foreground">For your work, your studies, your everyday.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{modes.map(m => <article key={m.id} className="action-card flex flex-col rounded-lg border bg-card p-5"><div className="flex items-center justify-between"><span className={`flex size-10 items-center justify-center rounded-md ${m.color}`}><m.icon size={20} /></span><ArrowUpRight size={17} className="text-muted-foreground" /></div><h3 className="mt-5 text-base font-bold">{m.name}</h3><p className="mt-2 text-sm font-medium">{m.title}</p><p className="mb-5 mt-2 text-xs leading-6 text-muted-foreground">{m.text}</p><Button variant="link" className="mt-auto h-auto justify-start p-0 text-xs text-brand" onClick={() => focusWorkspace(m.id)}>Let’s {m.id === 'analyze' ? 'take a look' : m.id}<ArrowUpRight /></Button></article>)}</div>
    </div></section>
    <section id="assistant" className="border-y bg-card py-12 md:py-14"><div className="section-wrap">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-primary">Your space to think</p><h2 className="section-title mt-2">Let’s work on it together.</h2></div><label className="flex items-center gap-2 text-xs text-muted-foreground"><Globe2 size={16} /><select aria-label="Assistant language" value={language} onChange={e => { setLanguage(e.target.value); stopSpeaking(); }} className="rounded-md border bg-card p-2 text-foreground">{languages.map(l => <option key={l.code} value={l.name}>{l.label}</option>)}</select></label></div>
      <div className="workspace-grid grid gap-8 lg:grid-cols-[290px_minmax(0,1fr)]">
        <div className="space-y-5 lg:border-r lg:pr-7">
          <div className="grid grid-cols-2 gap-2" aria-label="Assistant mode">{modes.map(m => <Button key={m.id} variant={mode === m.id ? 'secondary' : 'ghost'} aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setTask(tasks[m.id][0] ?? 'Ask anything'); setError(''); }} className="justify-start px-3 text-xs"><m.icon size={15} />{m.name}</Button>)}</div>
          <label className="block text-xs font-semibold">{mode === 'write' ? 'Writing task' : mode === 'study' ? 'Study task' : 'What shall we do?'}<select aria-label="Assistant task" value={task} onChange={e => setTask(e.target.value)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm">{tasks[mode].map(t => <option key={t}>{t}</option>)}</select></label>
          {mode === 'write' && <label className="block text-xs font-semibold">Tone<select aria-label="Writing tone" value={tone} onChange={e => setTone(e.target.value as typeof tone)} className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm">{['Natural','Professional','Friendly','Confident'].map(t => <option key={t}>{t}</option>)}</select></label>}
          <div><p className="mb-2 text-xs font-semibold">Answer length</p><div className="flex rounded-md bg-muted p-1">{(['short','detailed'] as const).map(d => <Button key={d} size="sm" variant={detail === d ? 'outline' : 'ghost'} aria-pressed={detail === d} onClick={() => setDetail(d)} className="flex-1 text-xs">{d === 'short' ? 'Short' : 'Detailed'}</Button>)}</div></div>
          <div><p className="mb-2 flex items-center gap-2 text-xs font-semibold"><Paperclip size={14} />{mode === 'analyze' ? 'Your file' : 'Attach a file (optional)'}</p><FilePicker file={file} onChange={setFile} onError={setError} disabled={busy} /><p className="mt-2 text-[11px] leading-5 text-muted-foreground">Readable PDF text, images, and screenshots. Blurry text and complex layouts may be missed. Files aren’t saved to an account.</p></div>
        </div>
        <div className="min-w-0">
          <div className="conversation min-h-48 max-h-[560px] overflow-y-auto" aria-label="Conversation" aria-live="polite">
            {messages.length === 0 && <div className="py-8 text-center"><Sparkles className="mx-auto mb-4 text-primary" size={28} /><h3 className="text-lg font-semibold">A fresh conversation.</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{mode === 'study' ? 'What are you learning today?' : mode === 'write' ? 'What would you like to put into words?' : mode === 'analyze' ? 'Bring a file. We’ll find the useful details.' : 'What would make your day a little easier?'}</p></div>}
            {messages.map((m,i) => <div key={i} ref={i === messages.length-1 ? answer : undefined} className={`mb-6 ${m.role === 'user' ? 'ml-auto max-w-[90%] rounded-lg bg-muted px-4 py-3' : 'pr-2'}`}><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">{m.role === 'assistant' && <Sparkles size={14} className="text-primary" />}{m.role === 'user' ? 'You' : 'Sahayak'}</p><div className="answer-text"><ReactMarkdown>{m.content}</ReactMarkdown></div>{m.source && <p className="mt-3 flex items-center gap-2 break-all text-[11px] text-muted-foreground"><Paperclip size={12} className="shrink-0" />{m.role === 'assistant' ? 'Provided file: ' : ''}{m.source}</p>}{m.role === 'assistant' && <div className="mt-2 flex gap-1"><Button variant="ghost" size="icon" title="Copy answer" aria-label="Copy answer" onClick={() => void copy(m.content,i)}>{copied === i ? <Check /> : <Copy />}</Button><Button variant="ghost" size="icon" title="Listen to answer" aria-label="Listen to answer" onClick={() => speak(m.content)}><Volume2 /></Button></div>}</div>)}
            {busy && <p role="status" className="flex items-center gap-2 py-4 text-sm text-muted-foreground"><LoaderCircle size={17} className="animate-spin" />{file ? 'Reading and thinking…' : 'Thinking it through…'}</p>}
          </div>
          {(error || voice.voiceError) && <p role="alert" className="mb-4 rounded-md bg-peach p-3 text-sm text-destructive">{error || voice.voiceError}</p>}
          <form onSubmit={e => { e.preventDefault(); void send(); }} className="rounded-lg border bg-background p-3 focus-within:ring-2 focus-within:ring-ring/30"><textarea ref={textarea} aria-label="Your question" value={input} onChange={e => setInput(e.target.value)} maxLength={12000} placeholder={mode === 'write' ? 'Describe your draft or paste text to improve…' : mode === 'study' ? 'Enter a topic or paste your notes…' : mode === 'analyze' ? 'What would you like to know about your file?' : 'Ask a question, explore an idea…'} rows={3} className="w-full resize-none bg-transparent p-1 text-sm leading-6 outline-none" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} /><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" aria-label={voice.listening ? 'Stop listening' : 'Start listening'} title="Voice input" disabled={busy} onClick={voice.toggleVoice} className={voice.listening ? 'listening text-primary' : ''}>{voice.listening ? <Square /> : <Mic />}</Button><Button type="button" variant="ghost" size="icon" aria-label={autoSpeak ? 'Disable spoken replies' : 'Enable spoken replies'} title={autoSpeak ? 'Disable spoken replies' : 'Enable spoken replies'} aria-pressed={autoSpeak} onClick={() => { setAutoSpeak(!autoSpeak); stopSpeaking(); }}>{autoSpeak ? <Volume2 /> : <VolumeX />}</Button>{speaking && <Button type="button" variant="ghost" size="icon" title="Stop speaking" aria-label="Stop speaking" onClick={stopSpeaking}><Square /></Button>}<span className="text-[11px] text-muted-foreground">{voice.listening ? 'Listening…' : language}</span></div><Button type="submit" disabled={busy || !input.trim()} aria-label="Send question" className="gap-2 text-xs">{busy ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}Send</Button></div></form>
          <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">AI can make mistakes. File-based answers name your source; other answers use general knowledge, not live web results.</p>
        </div>
      </div>
    </div></section>
    <section id="voice" className="bg-mint/50 py-12"><div className="section-wrap flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left"><div className="flex items-center gap-5"><span className="hidden size-14 items-center justify-center rounded-lg bg-mint text-brand sm:flex"><AudioLines size={28} /></span><div><p className="eyebrow text-brand">In your own words</p><h2 className="mt-2 text-2xl font-bold">Less typing. More talking.</h2><p className="mt-3 text-sm text-muted-foreground">English, हिन्दी, ಕನ್ನಡ, తెలుగు, தமிழ், मराठी.</p></div></div><Button onClick={() => { focusWorkspace(); voice.toggleVoice(); }} className="h-11 gap-3"><Mic />Let’s talk<ArrowUpRight /></Button></div></section>
  </>;
}
