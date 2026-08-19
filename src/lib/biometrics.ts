"use client";

/**
 * WebAuthn helpers for the app-level privacy lock.
 *
 * The lock is a local convenience layer on top of the signed-in session, so
 * the biometric credential is a *platform authenticator* (Touch ID, Windows
 * Hello, Face ID…) registered for this origin. The credential id is persisted
 * in localStorage; the actual key material stays in the device's secure
 * enclave, so nothing sensitive ever touches app storage.
 */

const BIOMETRIC_STORAGE_KEY = "fibrocare-privacy-biometric";

export interface BiometricCredential {
  /** base64url-encoded credential id. */
  id: string;
}

/** Sentinel error names surfaced to the UI so it can pick a friendly message. */
export const BIOMETRIC_ERRORS = {
  unsupported: "biometric-unsupported",
  notConfigured: "biometric-not-configured",
  canceled: "biometric-canceled",
} as const;

function readStoredCredential(): BiometricCredential | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BiometricCredential;
    return parsed && typeof parsed.id === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function hasBiometricCredential(): boolean {
  return readStoredCredential() !== null;
}

export function clearBiometricCredential(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
}

/**
 * True when the browser exposes WebAuthn AND the platform has a user-
 * verifying authenticator (Touch ID / Windows Hello / Face ID) available.
 */
export async function isBiometricSupported(): Promise<boolean> {
  if (
    typeof window === "undefined" ||
    !window.PublicKeyCredential ||
    typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !==
      "function"
  ) {
    return false;
  }
  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Registers a platform authenticator credential for the current origin and
 * persists its id. Throws with a `BIOMETRIC_ERRORS` name when the platform
 * can't support it or the user cancels the native prompt.
 */
export async function registerBiometricCredential(opts: {
  userName: string;
  userEmail: string;
}): Promise<BiometricCredential> {
  if (!(await isBiometricSupported())) {
    throw new Error(BIOMETRIC_ERRORS.unsupported);
  }

  const displayName = opts.userName || opts.userEmail || "FibroCare user";
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { id: window.location.hostname, name: "FibroCare" },
      user: {
        id: randomBytes(16),
        name: opts.userEmail || displayName,
        displayName,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 }, // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      timeout: 60_000,
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!credential) {
    throw new Error(BIOMETRIC_ERRORS.canceled);
  }

  const stored: BiometricCredential = { id: toBase64Url(credential.rawId) };
  try {
    window.localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable — registration still succeeded this session.
  }
  return stored;
}

/**
 * Prompts the platform authenticator to verify the user and returns true on
 * success. Throws with a `BIOMETRIC_ERRORS` name when unsupported, not
 * configured, or canceled/failed.
 */
export async function unlockWithBiometric(): Promise<boolean> {
  const stored = readStoredCredential();
  if (!stored) {
    throw new Error(BIOMETRIC_ERRORS.notConfigured);
  }
  if (!(await isBiometricSupported())) {
    throw new Error(BIOMETRIC_ERRORS.unsupported);
  }

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      rpId: window.location.hostname,
      allowCredentials: [
        { type: "public-key", id: fromBase64Url(stored.id) },
      ],
      userVerification: "required",
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;

  return assertion != null;
}
