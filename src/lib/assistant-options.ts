import { z } from 'zod';

export const languages = [
  { name: 'English', label: 'English', code: 'en-IN' },
  { name: 'Hindi', label: 'हिन्दी', code: 'hi-IN' },
  { name: 'Kannada', label: 'ಕನ್ನಡ', code: 'kn-IN' },
  { name: 'Telugu', label: 'తెలుగు', code: 'te-IN' },
  { name: 'Tamil', label: 'தமிழ்', code: 'ta-IN' },
  { name: 'Marathi', label: 'मराठी', code: 'mr-IN' },
] as const;
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const mediaTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'] as const;
export const attachmentSchema = z.object({ name: z.string().min(1).max(200), base64: z.string().min(1).max(28000000), mediaType: z.enum(mediaTypes) });
export type Attachment = z.infer<typeof attachmentSchema>;
export type Mode = 'chat' | 'write' | 'study' | 'analyze';
export const requestSchema = z.object({
  language: z.enum(['English', 'Hindi', 'Kannada', 'Telugu', 'Tamil', 'Marathi']),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().min(1).max(12000) })).min(1).max(30),
  mode: z.enum(['chat', 'write', 'study', 'analyze']).default('chat'),
  detail: z.enum(['short', 'detailed']).default('short'),
  task: z.string().max(100).default(''),
  tone: z.enum(['Natural', 'Professional', 'Friendly', 'Confident']).default('Natural'),
  attachment: attachmentSchema.optional(),
  pdf: z.object({ name: z.string().max(200), base64: z.string().min(1).max(28000000) }).optional(),
});
export function fileError(file: { size: number; type: string }) {
  if (!mediaTypes.some(type => type === file.type)) return 'Choose a PDF, PNG, JPG or WebP image.';
  if (!file.size || file.size > MAX_FILE_BYTES) return 'Choose a non-empty file up to 20 MB.';
  return '';
}
export function validAttachment(file: Attachment) {
  let bytes: Uint8Array;
  try { bytes = Uint8Array.from(atob(file.base64), c => c.charCodeAt(0)); } catch { return false; }
  if (!bytes.length || bytes.length > MAX_FILE_BYTES) return false;
  if (file.mediaType === 'application/pdf') return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
  if (file.mediaType === 'image/png') return [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
  if (file.mediaType === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  return String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
}