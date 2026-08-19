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
import { PrivacyKeypad, PrivacySetup } from "./PrivacyKeypad";

const STORAGE_KEY = "fibrocare-privacy-pin";

/** Routes that must stay accessible before sign-in (no privacy gate). */
const PUBLIC_AUTH_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

/** Legal pages linked from the public landing; carry no personal data. */
const PUBLIC_LEGAL_PATHS = ["/privacy", "/terms"];

/**
 * The public marketing landing page (`/`). It carries no personal data, so a
 * returning visitor who configured a privacy PIN is never locked out of it.
 */
const PUBLIC_LANDING_PATH = "/";

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

  if (
    pathname === PUBLIC_LANDING_PATH ||
    PUBLIC_LEGAL_PATHS.includes(pathname) ||
    isPublicAuthPath(pathname)
  ) {
    return <>{children}</>;
  }

  if (!isConfigured) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 overflow-y-auto overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[420px] w-[420px] shrink-0 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-300/10 blur-[100px] dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-cyan-400/8" />
        </div>
        <div className="relative glass-surface card-depth rounded-3xl p-8 sm:p-10 max-w-sm w-full backdrop-blur-xl bg-card/70 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <PrivacySetup />
        </div>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 overflow-y-auto overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[420px] w-[420px] shrink-0 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-300/10 blur-[100px] dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-cyan-400/8" />
        </div>
        <div className="relative glass-surface card-depth rounded-3xl p-8 sm:p-10 max-w-sm w-full backdrop-blur-xl bg-card/70 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_2.8px_2.2px_rgba(0,0,0,0.034),_0_6.7px_5.3px_rgba(0,0,0,0.048),_0_12.5px_10px_rgba(0,0,0,0.06),_0_22.3px_17.9px_rgba(0,0,0,0.072),_0_41.8px_33.4px_rgba(0,0,0,0.086),_0_100px_80px_rgba(0,0,0,0.12)]">
          <PrivacyKeypad />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
