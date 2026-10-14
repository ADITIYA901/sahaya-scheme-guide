import { useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { FileText, Upload, Sparkles, X, LoaderCircle, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { askAssistant } from '@/lib/assistant.functions';

export function PdfAnalysis({ language }: { language: string }) {
  const [file, setFile] = useState<File | null>(null); const [name, setName] = useState(''); const [error, setError] = useState(''); const [result, setResult] = useState(''); const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null); const ask = useServerFn(askAssistant);
  function select(f?: File) { setResult(''); if (!f) return; if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) { setError('Please choose a PDF document.'); return; } if (f.size > 20 * 1024 * 1024 || f.size === 0) { setError('Choose a non-empty PDF up to 20 MB.'); return; } setFile(f); setError(''); }
  async function analyze() {
    if (!file || busy) return; setBusy(true); setError(''); setResult('');
    try { const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] ?? ''); reader.onerror = reject; reader.readAsDataURL(file); });
      const response = await ask({ data: { language: language as 'English', messages: [{ role: 'user', content: `Explain this government scheme document${name ? ` for ${name}` : ''}. Summarize the scheme, eligibility, benefits, required documents and how to apply. Only use information from the PDF.` }], pdf: { name: file.name, base64 } } });
      if (response.error) setError(response.error); else setResult(response.text);
    } catch { setError('Could not analyze the document. Please try again later.'); } finally { setBusy(false); }
  }
  return <div><div className="mb-5 flex items-center gap-3"><div className="flex size-10 items-center justify-center rounded-lg bg-lilac"><FileText size={20} /></div><div><h3 className="text-lg font-bold">Understand a scheme PDF</h3><p className="mt-1 text-xs text-muted-foreground">Official documents. Simple answers.</p></div><span className="ml-auto rounded bg-lilac px-2 py-1 text-[10px] font-bold">AI POWERED</span></div>
    <label htmlFor="scheme-name" className="text-xs font-semibold">Scheme name <span className="font-normal text-muted-foreground">(optional)</span></label><input id="scheme-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. PM-Kisan Samman Nidhi" className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-xs outline-none focus:ring-1 focus:ring-ring" />
    <input ref={input} type="file" accept="application/pdf,.pdf" className="hidden" aria-label="Upload government scheme PDF" onChange={e => select(e.target.files?.[0])} />
    <div className="relative mt-3" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); select(e.dataTransfer.files[0]); }}><Button variant="outline" className="h-[108px] w-full flex-col gap-2 border-dashed bg-muted/40" onClick={() => input.current?.click()} disabled={busy}>{file ? <CheckCircle2 className="text-brand" /> : <Upload className="text-muted-foreground" />}<span className="max-w-full truncate text-xs font-semibold">{file ? file.name : 'Click to upload or drag a PDF here'}</span><span className="text-[10px] font-normal text-muted-foreground">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Government scheme documents · Max 20 MB'}</span></Button>{file && !busy && <Button variant="ghost" size="icon" aria-label="Remove PDF" className="absolute right-1 top-1" onClick={() => { setFile(null); setResult(''); if (input.current) input.current.value = ''; }}><X /></Button>}</div>
    <Button className="mt-3 w-full bg-brand text-brand-foreground hover:bg-brand/90" disabled={!file || busy} onClick={() => void analyze()}>{busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{busy ? 'Reading your document…' : 'Analyze with AI'}</Button>
    {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}{result && <div className="answer-text mt-5 border-t pt-3"><ReactMarkdown>{result}</ReactMarkdown><p className="text-xs text-muted-foreground">Verify details with the issuing authority before applying.</p></div>}
  </div>;
}