import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { audiences, schemes, type Scheme } from '@/lib/schemes';

const supportAreas = ['Any support', 'Education & Skills', 'Health', 'Housing', 'Insurance', 'Agriculture'];

export function Eligibility({ onDetails, onExplore }: { onDetails: (scheme: Scheme) => void; onExplore: (audience?: string, category?: string) => void }) {
  const [step, setStep] = useState(0);
  const [audience, setAudience] = useState('');
  const [category, setCategory] = useState('');
  const [complete, setComplete] = useState(false);
  const recommended = useMemo(() => schemes.filter(s => (!audience || s.audiences.includes(audience)) && (!category || category === 'Any support' || s.category === category)), [audience, category]);

  function reset() { setStep(0); setAudience(''); setCategory(''); setComplete(false); }

  return <section id="eligibility" className="bg-mint py-16"><div className="section-wrap grid items-start gap-12 md:grid-cols-[.85fr_1.15fr]">
    <div><span className="eyebrow text-brand">A clearer way to get started</span><h2 className="section-title mt-3">Find support that<br />fits your situation.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">Choose who you’re looking for and what kind of help you need. We’ll show relevant programs to explore.</p><div className="mt-7 flex items-center gap-2 text-xs text-brand"><ShieldCheck size={17} />No personal details needed. Your choices stay in this session.</div></div>
    <div className="min-h-[280px] rounded-xl border border-brand/10 bg-card p-5 shadow-sm sm:p-7">
      {complete ? <><div className="mb-5 flex items-start justify-between gap-3"><div><span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-brand"><Sparkles size={14} />Your starting points</span><h3 className="mt-2 text-lg font-bold">Programs to explore</h3></div><Button variant="ghost" size="sm" onClick={reset}><RotateCcw />Start over</Button></div>
        <p className="mb-4 text-xs leading-5 text-muted-foreground">These are suggestions, not an eligibility decision. Requirements vary; confirm details on each official portal.</p>
        {recommended.length ? <div className="space-y-2">{recommended.map(s => <Button key={s.id} variant="outline" className="h-auto w-full justify-between gap-3 bg-background py-3 text-left" onClick={() => onDetails(s)}><span className="min-w-0 whitespace-normal"><span className="block font-semibold">{s.name}</span><span className="mt-1 block text-[11px] font-normal text-muted-foreground">{s.benefit}</span></span><ArrowRight className="shrink-0" /></Button>)}</div> : <div className="rounded-lg bg-muted p-4"><p className="text-sm font-semibold">No direct match in this guide yet.</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Browse the official national scheme finder for central and state programs, or ask the assistant to help explain what you find.</p><div className="mt-2 flex flex-wrap gap-3"><Button variant="link" className="h-auto p-0 text-brand" onClick={() => onExplore(audience, category)}>Explore this guide<ArrowRight /></Button><Button variant="link" asChild className="h-auto p-0 text-brand"><a href="https://www.myscheme.gov.in/" target="_blank" rel="noopener noreferrer">Open myScheme<ArrowUpRight /></a></Button></div></div>}
        <Button variant="link" className="mt-4 h-auto p-0 text-xs text-brand" onClick={() => onExplore(audience, category)}>See these in the full catalog<ArrowRight /></Button>
      </> : <>
        <div className="flex items-center justify-between text-xs"><span className="font-semibold text-brand">Step {step + 1} of 2</span><span className="text-muted-foreground">{step === 0 ? 'Who are you looking for?' : 'What support do you need?'}</span></div><div className="my-4 flex gap-1.5">{[0, 1].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-brand' : 'bg-brand/15'}`} />)}</div>
        {step === 0 ? <><h3 className="mb-4 mt-6 text-xl font-bold">Who are you looking for?</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{audiences.map(item => { const Icon = item.icon; return <Button key={item.id} variant="outline" className={`relative h-auto min-h-[68px] flex-col items-start justify-center gap-1.5 whitespace-normal px-3 py-2 text-left text-xs ${audience === item.id ? 'border-brand bg-secondary text-brand ring-1 ring-brand' : 'bg-background'}`} onClick={() => setAudience(value => value === item.id ? '' : item.id)}><Icon size={17} />{item.label}{audience === item.id && <Check className="absolute right-2 top-2" size={14} />}</Button>; })}</div><p className="mt-3 text-[11px] text-muted-foreground">You can skip this and explore for anyone.</p></> : <><h3 className="mb-4 mt-6 text-xl font-bold">What kind of support?</h3><div className="grid grid-cols-2 gap-3">{supportAreas.map(item => { const value = item === 'Any support' ? '' : item; return <Button key={item} variant="outline" className={`h-auto min-h-12 justify-between gap-2 whitespace-normal bg-background px-3 py-3 text-left text-xs ${category === value && (value || !category) ? 'border-brand bg-secondary text-brand ring-1 ring-brand' : ''}`} onClick={() => setCategory(value)}>{item}{category === value && <Check size={15} />}</Button>; })}</div></>}
        <div className="mt-6 flex items-center justify-between"><Button variant="ghost" disabled={step === 0} onClick={() => setStep(0)}><ArrowLeft />Back</Button><Button className="bg-brand text-brand-foreground hover:bg-brand/90" onClick={() => step === 0 ? setStep(1) : setComplete(true)}>{step === 0 ? 'Choose support type' : 'Show programs'}<ArrowRight /></Button></div>
      </>}
    </div>
  </div></section>;
}
