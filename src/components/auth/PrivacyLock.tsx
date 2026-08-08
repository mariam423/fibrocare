"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";
import { usePathname } from "next/navigation";
import { PrivacyKeypad } from "./PrivacyKeypad";

const STORAGE_KEY = "fibrocare-privacy-pin";

/** Routes that must stay accessible before sign-in (no privacy gate). */
const PUBLIC_AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isPublicAuthPath(pathname: string): boolean {
  return PUBLIC_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export interface PrivacyContextValue {
  /** True while the app content is hidden behind the lock screen. */
  isLocked: boolean;
  /** True once a PIN has been set up. */
  isEnabled: boolean;
  /** Whether the lock has been configured at all (setup screen shown). */
  isConfigured: boolean;
  /** Re-lock the app immediately. */
  lock: () => void;
  /** Unlock the app after a valid PIN (used by the lock screen). */
  unlock: () => void;
  /** Verify a PIN against the stored hash. */
  verifyPin: (pin: string) => Promise<boolean>;
  /** Set a new PIN (overwrites any existing one). */
  setPin: (pin: string) => Promise<void>;
  /** Remove the PIN and disable the lock entirely. */
  disable: () => Promise<void>;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

async function sha256(input: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(`fibrocare::${input}`);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback for non-secure contexts: simple deterministic hash.
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return `fallback-${Math.abs(hash)}`;
}

function readStoredPin(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribeToPinStore(onChange: () => void) {
  window.addEventListener("fibrocare-pin-change", onChange);
  return () => window.removeEventListener("fibrocare-pin-change", onChange);
}

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const storedPin = useSyncExternalStore(
    subscribeToPinStore,
    readStoredPin,
    () => null
  );
  const [isLocked, setIsLocked] = useState(true);

  const verifyPin = useCallback(
    async (pin: string) => {
      if (!storedPin) return false;
      const hash = await sha256(pin);
      return hash === storedPin;
    },
    [storedPin]
  );

  const setPin = useCallback(async (pin: string) => {
    const hash = await sha256(pin);
    try {
      window.localStorage.setItem(STORAGE_KEY, hash);
    } catch {
      // storage unavailable — still unlock for this session
    }
    // Force a re-read of the store by bumping a key on window.
    window.dispatchEvent(new Event("fibrocare-pin-change"));
    setIsLocked(false);
  }, []);

  const disable = useCallback(async () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event("fibrocare-pin-change"));
    setIsLocked(false);
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(() => setIsLocked(false), []);

  // Re-lock when the tab is hidden (screen / app switch).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && storedPin) setIsLocked(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [storedPin]);

  return (
    <PrivacyContext.Provider
      value={{
        isLocked,
        isEnabled: !!storedPin,
        isConfigured: !!storedPin,
        lock,
        unlock,
        verifyPin,
        setPin,
        disable,
      }}
    >
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyContextValue {
  const ctx = useContext(PrivacyContext);
  if (!ctx) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return ctx;
}

/**
 * Gates the app behind the privacy lock. The lock is optional: it only kicks
 * in once a PIN has been configured. Public auth routes (/login, /signup,
 * /forgot-password, /reset-password) are always accessible.
 */
export function PrivacyGate({ children }: { children: React.ReactNode }) {
  const { isLocked, isConfigured } = usePrivacy();
  const pathname = usePathname();

  if (!isLocked || !isConfigured || isPublicAuthPath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background p-4 overflow-y-auto">
      <PrivacyKeypad />
    </div>
  );
}
