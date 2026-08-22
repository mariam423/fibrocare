import { describe, expect, it, beforeAll } from "vitest";
import {
  encryptText,
  decryptText,
  encryptLocalData,
  decryptLocalData,
  getOrCreateLocalKey,
  deriveKeyFromPassphrase,
  exportEncrypted,
  type StorageLike,
} from "./crypto";

function memoryStorage(): StorageLike & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, v),
    removeItem: (k) => data.delete(k),
  };
}

describe("AES-GCM local encryption", () => {
  let key: CryptoKey;

  beforeAll(async () => {
    key = await getOrCreateLocalKey(memoryStorage());
  });

  it("round-trips text", async () => {
    const envelope = await encryptText(key, "left shoulder pain 8/10, slept badly");
    expect(envelope.ct).not.toContain("shoulder");
    expect(await decryptText(key, envelope)).toBe("left shoulder pain 8/10, slept badly");
  });

  it("uses a fresh IV per call", async () => {
    const a = await encryptText(key, "same");
    const b = await encryptText(key, "same");
    expect(a.iv).not.toBe(b.iv);
    expect(a.ct).not.toBe(b.ct);
  });

  it("rejects tampered ciphertext (GCM authentication)", async () => {
    const envelope = await encryptText(key, "secret note");
    const flipped = { ...envelope, ct: envelope.ct.slice(0, -2) + (envelope.ct.endsWith("AA") ? "BB" : "AA") };
    await expect(decryptText(key, flipped)).rejects.toThrow();
  });

  it("fails with the wrong key", async () => {
    const envelope = await encryptText(key, "secret note");
    const other = await getOrCreateLocalKey(memoryStorage());
    await expect(decryptText(other, envelope)).rejects.toThrow();
  });
});

describe("local data helpers", () => {
  it("encrypts and reads back JSON values", async () => {
    const storage = memoryStorage();
    await encryptLocalData("fibrocare-note", { pain: 7, note: "flare" }, storage);
    // Stored raw value must not contain the plaintext.
    expect(storage.data.get("fibrocare-note")!).not.toContain("flare");
    const back = await decryptLocalData<{ pain: number; note: string }>("fibrocare-note", storage);
    expect(back).toEqual({ pain: 7, note: "flare" });
  });

  it("returns null for missing or corrupted entries", async () => {
    const storage = memoryStorage();
    expect(await decryptLocalData("fibrocare-missing", storage)).toBeNull();
    storage.setItem("fibrocare-bad", "not-json");
    expect(await decryptLocalData("fibrocare-bad", storage)).toBeNull();
  });

  it("reuses the same device key across calls", async () => {
    const storage = memoryStorage();
    const k1 = await getOrCreateLocalKey(storage);
    const k2 = await getOrCreateLocalKey(storage);
    const msg = await encryptText(k1, "persisted");
    expect(await decryptText(k2, msg)).toBe("persisted");
  });
});

describe("zero-knowledge export", () => {
  it("round-trips through a passphrase and hides the plaintext", async () => {
    const data = { notes: ["severe flare"], pain: 8 };
    const blob = await exportEncrypted(data, "correct horse battery");
    expect(blob).not.toContain("severe flare");
    expect(blob).toContain("PBKDF2");

    const parsed = JSON.parse(blob);
    const saltBytes = Uint8Array.from(atob(parsed.salt), (c) => c.charCodeAt(0));
    const key = await deriveKeyFromPassphrase("correct horse battery", saltBytes);
    const plain = await decryptText(key, { v: 1, alg: "AES-GCM-256", iv: parsed.iv, ct: parsed.ct });
    expect(JSON.parse(plain)).toEqual(data);
  });

  it("round-trips with a different passphrase key derivation (wrong passphrase fails)", async () => {
    const blob = await exportEncrypted({ a: 1 }, "passphrase-one");
    const parsed = JSON.parse(blob);
    const saltBytes = Uint8Array.from(atob(parsed.salt), (c) => c.charCodeAt(0));
    const wrongKey = await deriveKeyFromPassphrase("passphrase-two", saltBytes);
    await expect(
      decryptText(wrongKey, { v: 1, alg: "AES-GCM-256", iv: parsed.iv, ct: parsed.ct })
    ).rejects.toThrow();
  });

  it("rejects short passphrases", async () => {
    await expect(exportEncrypted({ a: 1 }, "short")).rejects.toThrow();
  });
});
