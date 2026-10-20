import { useRef } from 'react';
import { FileText, Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fileError, type Attachment } from '@/lib/assistant-options';

export function FilePicker({ file, onChange, onError, disabled = false }: { file: Attachment | null; onChange: (file: Attachment | null) => void; onError: (message: string) => void; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  async function select(f?: File) {
    if (!f || disabled) return;
    const error = fileError(f); if (error) { onError(error); return; }
    try {
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] ?? ''); reader.onerror = reject; reader.readAsDataURL(f); });
      onChange({ name: f.name.slice(0,200), base64, mediaType: f.type as Attachment['mediaType'] }); onError('');
    } catch { onError('This file could not be read. Try another file.'); }
    if (input.current) input.current.value = '';
  }
  return <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void select(e.dataTransfer.files[0]); }}>
    <input ref={input} type="file" accept="application/pdf,image/png,image/jpeg,image/webp" aria-label="Upload PDF or image" className="hidden" onChange={e => void select(e.target.files?.[0])} />
    <div className="flex gap-2"><Button variant="outline" disabled={disabled} onClick={() => input.current?.click()} className="h-auto min-h-24 min-w-0 flex-1 flex-col border-dashed bg-muted/50 py-4">{file ? file.mediaType === 'application/pdf' ? <FileText /> : <Image /> : <Upload />}<span className="max-w-full break-all whitespace-normal">{file ? file.name : 'Choose a file or drop it here'}</span><span className="text-xs font-normal text-muted-foreground">PDF, PNG, JPG, WebP · Up to 20 MB</span></Button>{file && <Button disabled={disabled} variant="ghost" size="icon" aria-label="Remove attachment" onClick={() => onChange(null)}><X /></Button>}</div>
    {file?.mediaType.startsWith('image/') && <img src={`data:${file.mediaType};base64,${file.base64}`} alt="Selected attachment preview" className="mt-3 max-h-40 max-w-full rounded-md object-contain" />}
  </div>;
}