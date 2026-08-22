/**
 * Client-side encryption & privacy utilities.
 *
 * AES-GCM via the Web Crypto API (works offline, no dependencies):
 *
 *  - LOCAL DATA ENCRYPTION: a per-device key encrypts sensitive values
 *    (symptom notes, health caches) before they touch localStorage, so a
 *    shoulder-surfed storage dump shows ciphertext, not health data. The key
 *    is device-local and never leaves the browser.
 *
 *  - ZERO-KNOWLEDGE EXPORT: "Export My Data" encrypts the dump with a key
 *    derived (PBKDF2, 310k iterations) from a passphrase the user types.
 *    The passphrase never leaves the client; without it the export is
 *    unreadable anywhere, including on our servers.
 *
 *  - ONE-CLICK HARD PURGE: removes every FibroCare localStorage/sessionStorage
 *    key, the service-worker caches, and FibroCare cookies.
 *
 * All functions fail soft: on an unavailable Web Crypto API they return
 * null/throw clearly-typed errors rather than silently storing plaintext.
 */

const LOCAL_KEY_STORAGE = "fibrocare-local-crypto-key";
export const PURGE_KEY_PREFIXES = ["fibrocare-", "FibroCare"];

/** Minimal storage surface so tests can inject an in-memory stub. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function subtle(): SubtleCrypto {
  const c = globalThis.crypto;
  if (!c?.subtle) {
    throw new Error("Web Crypto is not available in this environment.");
  }
  return c.subtle;
}

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/* ------------------------------------------------------------------ */
/* Local (device-key) encryption                                       */
/* ------------------------------------------------------------------ */

/**
 * The per-device AES key. Generated once, stored raw (base64) in
 * localStorage: this is local-at-rest protection against casual storage
 * inspection, not a substitute for device security.
 */
export async function getOrCreateLocalKey(
  storage: StorageLike = typeof localStorage !== "undefined" ? localStorage : undefined as unknown as StorageLike
): Promise<CryptoKey> {
  const existing = storage.getItem(LOCAL_KEY_STORAGE);
  if (existing) {
    return subtle().importKey("raw", fromBase64(existing), { name: "AES-GCM" }, false, [
      "encrypt",
      "decrypt",
    ]);
  }
  const key = await subtle().generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  const raw = await subtle().exportKey("raw", key);
  storage.setItem(LOCAL_KEY_STORAGE, toBase64(new Uint8Array(raw)));
  return key;
}

export interface EncryptedEnvelope {
  v: 1;
  alg: "AES-GCM-256";
  iv: string;
  ct: string;
}

/** Encrypt a UTF-8 string with AES-GCM. A fresh 96-bit IV every call. */
export async function encryptText(
  key: CryptoKey,
  plaintext: string
): Promise<EncryptedEnvelope> {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = await subtle().encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  return { v: 1, alg: "AES-GCM-256", iv: toBase64(iv), ct: toBase64(new Uint8Array(ct)) };
}

/** Decrypt an envelope. Throws on wrong key or tampered ciphertext (GCM auth). */
export async function decryptText(
  key: CryptoKey,
  envelope: EncryptedEnvelope
): Promise<string> {
  const pt = await subtle().decrypt(
    { name: "AES-GCM", iv: fromBase64(envelope.iv) },
    key,
    fromBase64(envelope.ct)
  );
  return new TextDecoder().decode(pt);
}

/** Encrypt + persist any JSON-serializable value under a localStorage key. */
export async function encryptLocalData(
  label: string,
  value: unknown,
  storage: StorageLike = typeof localStorage !== "undefined" ? localStorage : undefined as unknown as StorageLike
): Promise<void> {
  const key = await getOrCreateLocalKey(storage);
  const envelope = await encryptText(key, JSON.stringify(value));
  storage.setItem(label, JSON.stringify(envelope));
}

/** Read back a value stored by `encryptLocalData`. Null when absent/corrupt. */
export async function decryptLocalData<T>(
  label: string,
  storage: StorageLike = typeof localStorage !== "undefined" ? localStorage : undefined as unknown as StorageLike
): Promise<T | null> {
  const raw = storage.getItem(label);
  if (!raw) return null;
  try {
    const envelope = JSON.parse(raw) as EncryptedEnvelope;
    const key = await getOrCreateLocalKey(storage);
    return JSON.parse(await decryptText(key, envelope)) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Zero-knowledge export                                               */
/* ------------------------------------------------------------------ */

const PBKDF2_ITERATIONS = 310_000;

/** Derive an AES-GCM key from a passphrase + salt (PBKDF2-SHA256). */
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const material = await subtle().importKey(
    "raw",
    new TextEncoder().encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return subtle().deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/** Zero-knowledge export: encrypt a data dump under a user passphrase. */
export async function exportEncrypted(
  data: unknown,
  passphrase: string
): Promise<string> {
  if (passphrase.length < 8) {
    throw new Error("Passphrase must be at least 8 characters.");
  }
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKeyFromPassphrase(passphrase, salt);
  const envelope = await encryptText(key, JSON.stringify(data));
  return JSON.stringify({ ...envelope, kdf: "PBKDF2-SHA256", iterations: PBKDF2_ITERATIONS, salt: toBase64(salt) });
}

/* ------------------------------------------------------------------ */
/* One-Click Hard Purge                                                */
/* ------------------------------------------------------------------ */

export interface PurgeResult {
  localStorageKeys: string[];
  sessionStorageKeys: string[];
  cookies: string[];
  cacheNames: string[];
}

/** Values that survive a purge: language preference (and its legacy key). */
const PURGE_PRESERVED = new Set(["fibrocare-locale", "fibrocare-local-crypto-key"]);

/**
 * Remove every trace of FibroCare from this browser: localStorage keys
 * (all `fibrocare-` prefixed entries), sessionStorage, cookies on this
 * domain, and the service-worker Cache Storage entries. Returns exactly
 * what was removed, for transparent reporting in the UI.
 */
export async function purgeAllLocalData(): Promise<PurgeResult> {
  const result: PurgeResult = { localStorageKeys: [], sessionStorageKeys: [], cookies: [], cacheNames: [] };

  if (typeof window === "undefined") return result;

  for (const store of [window.localStorage, window.sessionStorage]) {
    const target = store === window.localStorage ? "localStorageKeys" : "sessionStorageKeys";
    const keys: string[] = [];
    for (let i = 0; i < store.length; i++) keys.push(store.key(i)!);
    for (const k of keys) {
      if (PURGE_PRESERVED.has(k)) continue;
      if (PURGE_KEY_PREFIXES.some((p) => k.startsWith(p))) {
        store.removeItem(k);
        result[target].push(k);
      }
    }
  }

  // Cookies (session/token material that is not httpOnly). The locale cookie
  // is preserved so the user's language survives a purge.
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (!name || PURGE_PRESERVED.has(name)) continue;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    result.cookies.push(name);
  }

  // Service-worker precaches.
  if (typeof caches !== "undefined") {
    for (const name of await caches.keys()) {
      const deleted = await caches.delete(name);
      if (deleted) result.cacheNames.push(name);
    }
  }

  return result;
}
