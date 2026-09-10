/**
 * Unit tests for the server-side at-rest encryption of health notes
 * (`src/lib/security/atRest.ts`).
 *
 * The contract under test:
 *  - AES-256-GCM round-trip with a real 32-byte hex key.
 *  - Fresh IV per encryption (same plaintext never encrypts identically).
 *  - Tamper detection: GCM authentication rejects modified ciphertext.
 *  - Wrong key: decryption returns null instead of crashing the read path.
 *  - Dev fallback without a key: base64 round-trip (obfuscation only).
 *  - Production without a key: refuse to store, refuse to leak ciphertext.
 *  - Legacy plaintext rows decrypt to null (never leak raw values into the UI).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import crypto from "crypto";

import {
  decryptLogNotes,
  decryptSensitiveData,
  encryptSensitiveData,
  hasEncryptionKey,
} from "./atRest";

const TEST_KEY = crypto.randomBytes(32).toString("hex");

function withKey<T>(fn: () => Promise<T>): Promise<T> {
  process.env.HEALTH_DATA_ENCRYPTION_KEY = TEST_KEY;
  return fn();
}

afterEach(() => {
  delete process.env.HEALTH_DATA_ENCRYPTION_KEY;
  vi.unstubAllEnvs();
});

describe("hasEncryptionKey", () => {
  it("reflects whether HEALTH_DATA_ENCRYPTION_KEY is set", () => {
    delete process.env.HEALTH_DATA_ENCRYPTION_KEY;
    expect(hasEncryptionKey()).toBe(false);
    process.env.HEALTH_DATA_ENCRYPTION_KEY = TEST_KEY;
    expect(hasEncryptionKey()).toBe(true);
  });
});

describe("encryptSensitiveData / decryptSensitiveData (keyed)", () => {
  it("round-trips plaintext through AES-256-GCM", async () => {
    await withKey(async () => {
      const note = "left shoulder pain 8/10, slept badly";
      const stored = await encryptSensitiveData(note);
      expect(stored).not.toBe(note);
      expect(stored).not.toContain("shoulder");
      expect(await decryptSensitiveData(stored)).toBe(note);
    });
  });

  it("uses a fresh IV per call — same plaintext never re-encrypts identically", async () => {
    await withKey(async () => {
      const a = await encryptSensitiveData("same note");
      const b = await encryptSensitiveData("same note");
      expect(a).not.toBe(b);
    });
  });

  it("rejects tampered ciphertext (GCM authentication)", async () => {
    await withKey(async () => {
      const stored = await encryptSensitiveData("secret note");
      const raw = Buffer.from(stored, "base64");
      raw[raw.length - 1] ^= 0x01; // flip one bit
      expect(await decryptSensitiveData(raw.toString("base64"))).toBeNull();
    });
  });

  it("returns null when decrypted with the wrong key", async () => {
    await withKey(async () => {
      const stored = await encryptSensitiveData("secret note");
      process.env.HEALTH_DATA_ENCRYPTION_KEY = crypto
        .randomBytes(32)
        .toString("hex");
      expect(await decryptSensitiveData(stored)).toBeNull();
    });
  });

  it("rejects a malformed key with a loud error", async () => {
    process.env.HEALTH_DATA_ENCRYPTION_KEY = "too-short";
    await expect(encryptSensitiveData("note")).rejects.toThrow(
      /32-byte hex/
    );
  });

  it("returns null for values too short to be a valid envelope", async () => {
    await withKey(async () => {
      // base64 of fewer than 29 bytes (iv 12 + tag 16 + >=1 byte)
      expect(await decryptSensitiveData("AAAA")).toBeNull();
      expect(await decryptSensitiveData("")).toBeNull();
      expect(await decryptSensitiveData(null)).toBeNull();
      expect(await decryptSensitiveData(undefined)).toBeNull();
    });
  });
});

describe("dev fallback (no key, not production)", () => {
  it("stores base64 and round-trips it", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.HEALTH_DATA_ENCRYPTION_KEY;
    const stored = await encryptSensitiveData("dev note");
    expect(Buffer.from(stored, "base64").toString("utf8")).toBe("dev note");
    expect(await decryptSensitiveData(stored)).toBe("dev note");
  });

  it("treats non-base64 legacy values as plaintext on read", async () => {
    vi.stubEnv("NODE_ENV", "development");
    delete process.env.HEALTH_DATA_ENCRYPTION_KEY;
    expect(await decryptSensitiveData("not base64 !!")).toBe("not base64 !!");
  });
});

describe("production without a key (fail closed)", () => {
  it("refuses to encrypt health notes at all", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.HEALTH_DATA_ENCRYPTION_KEY;
    await expect(encryptSensitiveData("secret")).rejects.toThrow(
      /HEALTH_DATA_ENCRYPTION_KEY is not configured/
    );
  });

  it("never leaks ciphertext to readers when decryption is impossible", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.HEALTH_DATA_ENCRYPTION_KEY;
    // Any legacy/unknown value must read back as null, not as raw data.
    expect(await decryptSensitiveData("ciphertext-or-plaintext")).toBeNull();
  });
});

describe("legacy plaintext rows", () => {
  it("decrypt to null under a configured key (no plaintext passthrough)", async () => {
    await withKey(async () => {
      // A row stored before encryption existed must NOT be surfaced as-is.
      expect(await decryptSensitiveData("old plain note")).toBeNull();
    });
  });
});

describe("decryptLogNotes", () => {
  it("decrypts notes in place and leaves other fields untouched", async () => {
    await withKey(async () => {
      const stored = await encryptSensitiveData("flare all day");
      const logs = [
        { id: "1", pain: 8, notes: stored },
        { id: "2", pain: 3, notes: null },
      ];
      const result = await decryptLogNotes(logs);
      expect(result[0].notes).toBe("flare all day");
      expect(result[0].pain).toBe(8);
      expect(result[1].notes).toBeNull();
    });
  });

  it("maps undecryptable notes to undefined rather than ciphertext", async () => {
    await withKey(async () => {
      const logs = [{ id: "1", notes: "tampered-garbage" }];
      const result = await decryptLogNotes(logs);
      expect(result[0].notes).toBeUndefined();
    });
  });
});
