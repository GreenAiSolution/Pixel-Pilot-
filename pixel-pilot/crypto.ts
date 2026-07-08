// ─── PIXEL PILOT · SECRET CRYPTO ─────────────────────────────────────────────
// Symmetric encryption for secrets at rest (AES-256-GCM). The key comes from
// PP_ENCRYPTION_KEY and is shared across connectors, so anything that must sit in
// the KV store (see ./store) — OAuth refresh tokens, etc. — goes through here
// first. GCM gives us tamper detection (auth tag) for free.
//
// Env:
//   PP_ENCRYPTION_KEY — a 32-byte key. Accepts base64 (`openssl rand -base64 32`),
//   64-char hex, or a raw 32-character string. Missing/invalid → callers detect
//   via tokenEncryptionConfigured() and refuse to store secrets.

import crypto from 'crypto';

const VERSION = 'v1';
const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // 96-bit nonce, the GCM standard.

// Resolve a 32-byte key from PP_ENCRYPTION_KEY, being forgiving about encoding.
function resolveKey(): Buffer | null {
  const raw = process.env.PP_ENCRYPTION_KEY;
  if (!raw) return null;

  // base64 (the recommended form)
  const b64 = Buffer.from(raw, 'base64');
  if (b64.length === 32) return b64;

  // 64-char hex
  if (/^[0-9a-f]{64}$/i.test(raw)) return Buffer.from(raw, 'hex');

  // raw utf8, exactly 32 bytes
  const utf8 = Buffer.from(raw, 'utf8');
  if (utf8.length === 32) return utf8;

  return null;
}

/** True when a valid 32-byte PP_ENCRYPTION_KEY is present. */
export function tokenEncryptionConfigured(): boolean {
  return resolveKey() !== null;
}

/** Encrypt UTF-8 plaintext → compact payload "v1.<iv>.<tag>.<ciphertext>" (base64 parts). */
export function encryptSecret(plaintext: string): string {
  const key = resolveKey();
  if (!key) throw new Error('PP_ENCRYPTION_KEY missing or not 32 bytes (base64/hex/raw)');

  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [VERSION, iv.toString('base64'), tag.toString('base64'), ct.toString('base64')].join('.');
}

/** Reverse of encryptSecret. Throws on a malformed payload or a tampered tag. */
export function decryptSecret(payload: string): string {
  const key = resolveKey();
  if (!key) throw new Error('PP_ENCRYPTION_KEY missing or not 32 bytes (base64/hex/raw)');

  const [version, ivB64, tagB64, ctB64] = payload.split('.');
  if (version !== VERSION || !ivB64 || !tagB64 || !ctB64) {
    throw new Error('Malformed ciphertext payload');
  }

  const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  const pt = Buffer.concat([decipher.update(Buffer.from(ctB64, 'base64')), decipher.final()]);
  return pt.toString('utf8');
}
