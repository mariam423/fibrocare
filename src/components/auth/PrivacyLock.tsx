"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { PrivacyKeypad, PrivacySetup } from "./PrivacyKeypad";
import {
  getPrivacyStatus,
  removePrivacyPin,
  setPrivacyPin,
  verifyPrivacyPin,
} from "@/app/actions";

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
  /** True once a PIN has been set up (enables the lock). */
  isEnabled: boolean;
  /** True when the PIN+unlock state has been resolved from the server. */
  isConfigured: boolean;
  /** "checking" while the server-backed state is still loading. */
  status: "checking" | "ready";
  /** Re-lock the app immediately (client-side; the cookie stays valid). */
  lock: () => void;
  /** Mark the app unlocked and remount the app tree so data refetches. */
  unlock: () => void;
  /** Verify a PIN against the server-side bcrypt hash. */
  verifyPin: (pin: string) => Promise<boolean>;
  /** Set a new PIN server-side (overwrites any existing one). */
  setPin: (pin: string) => Promise<boolean>;
  /** Remove the PIN and disable the lock entirely. */
  disable: () => Promise<boolean>;
  /** Incremented on each unlock/setup/disable — remounts the app tree. */
  mountKey: number;
}

const PrivacyContext = createContext<PrivacyContextValue | null>(null);

/**
 * Server-backed privacy lock.
 *
 * The PIN and the "unlocked" decision now live on the server:
 *  - `privacyPinConfigured` / `pinHash` come from the signed-in user's row;
 *  - unlocking sets an httpOnly, HMAC-signed cookie that client scripts
 *    cannot read or forge — a stolen session cookie alone no longer
 *    bypasses the lock;
 *  - the data server actions refuse to return health data while locked.
 *
 * localStorage is no longer the authority; the legacy
 * `fibrocare-privacy-pin` key (if present from an old session) is ignored.
 */
export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "ready">("checking");
  const [configured, setConfigured] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  // Bumping this key remounts the app tree below — on a successful unlock
  // every page's data actions re-run now that the unlock cookie is valid.
  const [mountKey, setMountKey] = useState(0);

  // Resolve the lock state from the server once on mount (per full load).
  useEffect(() => {
    let cancelled = false;
    getPrivacyStatus()
      .then(({ configured: isOn }) => {
        if (cancelled) return;
        setConfigured(isOn);
        setIsLocked(isOn);
      })
      .catch(() => {
        if (cancelled) return;
        setConfigured(false);
        setIsLocked(false);
      })
      .finally(() => {
        if (!cancelled) setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const verifyPin = useCallback(async (pin: string) => {
    const result = await verifyPrivacyPin(pin);
    return result.success;
  }, []);

  const setPin = useCallback(async (pin: string) => {
    const result = await setPrivacyPin(pin);
    if (!result.success) return false;
    setConfigured(true);
    setIsLocked(false);
    setMountKey((k) => k + 1);
    return true;
  }, []);

  const disable = useCallback(async () => {
    const result = await removePrivacyPin();
    if (!result.success) return false;
    setConfigured(false);
    setIsLocked(false);
    setMountKey((k) => k + 1);
    return true;
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);
  // unlock() also remounts the tree so freshly-unlocked pages refetch their
  // data (the actions only succeed once the unlock cookie exists).
  const unlock = useCallback(() => {
    setIsLocked(false);
    setMountKey((k) => k + 1);
  }, []);

  // Re-lock when the tab is hidden (screen / app switch).
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden && configured) setIsLocked(true);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [configured]);

  return (
    <PrivacyContext.Provider
      value={{
        isLocked,
        isEnabled: configured,
        isConfigured: configured,
        status,
        lock,
        unlock,
        verifyPin,
        setPin,
        disable,
        mountKey,
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
 * in once a PIN has been configured server-side. Public auth routes (/login,
 * /signup, /forgot-password, /reset-password) are always accessible.
 *
 * While locked (or before the server state resolves) the app content is NOT
 * rendered at all — no data actions run behind the gate.
 */
export function PrivacyGate({ children }: { children: React.ReactNode }) {
  const { isLocked, isConfigured, status, mountKey } = usePrivacy();
  const pathname = usePathname();

  if (
    pathname === PUBLIC_LANDING_PATH ||
    PUBLIC_LEGAL_PATHS.includes(pathname) ||
    isPublicAuthPath(pathname)
  ) {
    return <>{children}</>;
  }

  if (status === "checking") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      </div>
    );
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

  // Unlocked: render the app content. The keyed, display:contents wrapper
  // remounts this subtree after an unlock so data actions re-run with the
  // (now valid) unlock cookie — without adding a layout box.
  return (
    <div key={mountKey} className="contents">
      {children}
    </div>
  );
}