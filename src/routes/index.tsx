import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Menu, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EverydayAssistant } from '@/components/everyday-assistant';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Sahayak — Your everyday AI companion' },
    { name: 'description', content: 'Ask questions, write better, study smarter, and understand PDFs and images with Sahayak. A multilingual AI companion with no account required.' },
    { property: 'og:title', content: 'Sahayak — Your everyday AI companion' },
    { property: 'og:description', content: 'A welcoming space for everyday questions, writing, studying, file analysis and multilingual voice conversations.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});
const navigation = [{ id: 'home', name: 'Home' }, { id: 'tools', name: 'Explore tools' }, { id: 'assistant', name: 'Your assistant' }, { id: 'voice', name: 'Voice' }];
function Index() {
  const [menu, setMenu] = useState(false);
  return <div>
    <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-md"><div className="section-wrap flex h-[72px] items-center justify-between gap-4"><a href="#home" aria-label="Sahayak home" className="flex items-center gap-2.5 text-xl font-bold"><span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground"><Sparkles size={21} /></span>Sahayak<span className="text-primary">.</span></a><nav aria-label="Main navigation" className="hidden gap-7 md:flex">{navigation.map(n => <a key={n.id} href={`#${n.id}`} className="text-xs font-semibold text-muted-foreground transition-colors hover:text-brand">{n.name}</a>)}</nav><div className="flex gap-2"><Button asChild size="sm" className="text-xs"><a href="#assistant">Let’s begin<ArrowUpRight /></a></Button><Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</Button></div></div>{menu && <nav className="section-wrap flex flex-wrap gap-5 border-t py-4 md:hidden">{navigation.map(n => <a key={n.id} href={`#${n.id}`} onClick={() => setMenu(false)} className="text-sm">{n.name}</a>)}</nav>}</header>
    <main><EverydayAssistant /></main>
    <footer className="border-t bg-card py-7"><div className="section-wrap flex flex-wrap items-center justify-between gap-4"><a href="#home" className="flex items-center gap-2 text-sm font-bold"><Sparkles size={17} className="text-brand" />Sahayak.</a><p className="text-xs text-muted-foreground">A helping hand for whatever’s next.</p><p className="text-[11px] text-muted-foreground">Session-only · No account required</p></div></footer>
  </div>;
}
