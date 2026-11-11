import { describe, expect, it } from 'vitest';
import { fileError, requestSchema, validAttachment } from '@/lib/assistant-options';
describe('Everyday assistant rules', () => {
  const request = { language: 'English', messages: [{ role: 'user', content: 'Hello' }] };
  it('accepts short and detailed responses', () => { expect(requestSchema.parse({ ...request, detail: 'short' }).detail).toBe('short'); expect(requestSchema.parse({ ...request, detail: 'detailed' }).detail).toBe('detailed'); expect(requestSchema.safeParse({ ...request, detail: 'other' }).success).toBe(false); });
  it('supports chat, write, study and analysis', () => { for (const mode of ['chat','write','study','analyze']) expect(requestSchema.parse({ ...request, mode }).mode).toBe(mode); });
  it('preserves six voice languages', () => { for (const language of ['English','Hindi','Kannada','Telugu','Tamil','Marathi']) expect(requestSchema.parse({ ...request, language }).language).toBe(language); });
  it('accepts PDF and image formats, not unrelated files', () => { for (const type of ['application/pdf','image/png','image/jpeg','image/webp']) expect(fileError({ size: 100, type })).toBe(''); expect(fileError({ size: 100, type: 'text/html' })).not.toBe(''); });
  it('rejects empty or oversized files and accepts 20 MB', () => { expect(fileError({ size: 20*1024*1024, type: 'application/pdf' })).toBe(''); expect(fileError({ size: 20*1024*1024+1, type: 'application/pdf' })).not.toBe(''); expect(fileError({ size: 0, type: 'image/png' })).not.toBe(''); });
  it('validates actual file signatures', () => { expect(validAttachment({ name: 'x.pdf', mediaType: 'application/pdf', base64: btoa('%PDF-1.7') })).toBe(true); expect(validAttachment({ name: 'x.pdf', mediaType: 'application/pdf', base64: btoa('not a PDF') })).toBe(false); });
});