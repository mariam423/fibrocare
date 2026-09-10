/**
 * At-rest encryption for free-text health notes.
 *
 * `encryptSensitiveData` / `decryptSensitiveData` are the single pair used
 * everywhere notes cross the database boundary:
 *
 *  - WRITE (`savePainLog`): encrypt before storing.
 *  - READ (log list, reports, AI memory/context, clinical summaries):
 *    decrypt after loading, so the rest of the app always sees plaintext.
 *
 * Format: base64(iv(12) || authTag(16) || ciphertext), AES-256-GCM with a
 * 32-byte hex key from `HEALTH_DATA_ENCRYPTION_KEY`.
 *
 * Dev-only fallback (NODE_ENV !== "production" and no key): base64 — an
 * obfuscation for local testing, never a security control. Production
 * refuses to store notes without the key (loud failure instead of
 * plaintext-at-rest).
 */

import crypto from "crypto";

export function hasEncryptionKey(): boolean {
  return Boolean(process.env.HEALTH_DATA_ENCRYPTION_KEY);
}

/** Encrypt sensitive health data using AES-256-GCM. */
export async function encryptSensitiveData(text: string): Promise<string> {
  const key = process.env.HEALTH_DATA_ENCRYPTION_KEY;
  if (!key) {
    // Dev-only fallback: base64 for local testing. Production must NEVER
    // silently store readable health data — fail loudly instead.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "HEALTH_DATA_ENCRYPTION_KEY is not configured — refusing to store plaintext health notes."
      );
    }
    return Buffer.from(text).toString("base64");
  }
  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== 32) {
    throw new Error(
      "HEALTH_DATA_ENCRYPTION_KEY must be a 32-byte hex string (openssl rand -hex 32)."
    );
  }
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBuf, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * Decrypt a value produced by `encryptSensitiveData`. Returns the original
 * plaintext; returns `null` when the value is not encrypted (legacy
 * plaintext rows) or cannot be decrypted (wrong/missing key, tampered
 * ciphertext — GCM auth will reject it).
 */
export async function decryptSensitiveData(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;

  const key = process.env.HEALTH_DATA_ENCRYPTION_KEY;
  if (!key) {
    // Dev fallback mirrors the write path: the value was stored as base64.
    // Validate strictly before decoding — Node's base64 decoder is lenient
    // and would happily return mojibake for legacy plaintext rows.
    if (process.env.NODE_ENV !== "production") {
      if (
        /^[A-Za-z0-9+/]*={0,2}$/.test(value) &&
        value.length % 4 === 0 &&
        value.length > 0
      ) {
        return Buffer.from(value, "base64").toString("utf8");
      }
      return value; // not base64 — treat as legacy plaintext
    }
    // Production without a key: cannot decrypt. Return null rather than
    // leaking ciphertext into the UI/AI context.
    return null;
  }

  const keyBuf = Buffer.from(key, "hex");
  if (keyBuf.length !== 32) return null;

  try {
    const raw = Buffer.from(value, "base64");
    if (raw.length < 29) return null; // iv(12) + authTag(16) + at least 1 byte
    const iv = raw.subarray(0, 12);
    const authTag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", keyBuf, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    // Wrong key, tampered ciphertext, or legacy plaintext that happens to
    // be base64 — never crash the read path.
    return null;
  }
}

/** Decrypt an array of log-shaped rows in place (mutates `notes`). */
export async function decryptLogNotes<T extends { notes?: string | null }>(
  logs: T[]
): Promise<T[]> {
  for (const log of logs) {
    if (log.notes) {
      log.notes = (await decryptSensitiveData(log.notes)) ?? undefined;
    }
  }
  return logs;
}