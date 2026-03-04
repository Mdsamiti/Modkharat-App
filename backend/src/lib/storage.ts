import { supabaseAdmin } from './supabase.js';
import crypto from 'crypto';

const RECEIPTS_BUCKET = 'receipts';
const VOICE_BUCKET = 'voice-recordings';

export function hashFile(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export async function uploadReceipt(
  householdId: string,
  buffer: Buffer,
  originalName: string,
  hash: string,
): Promise<string> {
  const ext = originalName.split('.').pop() ?? 'jpg';
  const path = `${householdId}/${hash}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(RECEIPTS_BUCKET)
    .upload(path, buffer, { contentType: `image/${ext}`, upsert: false });

  if (error && !error.message.includes('already exists')) {
    throw new Error(`Failed to upload receipt: ${error.message}`);
  }
  return path;
}

export async function uploadVoiceRecording(
  householdId: string,
  buffer: Buffer,
  originalName: string,
): Promise<string> {
  const ext = originalName.split('.').pop() ?? 'webm';
  const path = `${householdId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(VOICE_BUCKET)
    .upload(path, buffer, { contentType: `audio/${ext}` });

  if (error) {
    throw new Error(`Failed to upload voice recording: ${error.message}`);
  }
  return path;
}

export async function downloadFile(bucket: string, path: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);

  if (error || !data) {
    throw new Error(`Failed to download file: ${error?.message ?? 'not found'}`);
  }
  return Buffer.from(await data.arrayBuffer());
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? 'unknown'}`);
  }
  return data.signedUrl;
}
