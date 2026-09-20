"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FingerPrintScanIcon,
  LockIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { usePrivacy } from "./PrivacyLock";
import { useLanguage } from "@/context/LanguageContext";
import { biometricUnlock } from "@/app/actions";
import {
  BIOMETRIC_ERRORS,
  hasBiometricCredential,
  isBiometricSupported,
  unlockWithBiometric,
} from "@/lib/biometrics";

const PIN_LENGTH = 4;

/* ---------- Keypad button (premium micro-interactions) ---------- */

function KeypadButton({
  value,
  onPress,
  label,
}: {
  value: string;
  onPress: (v: string) => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={() => onPress(value)}
      aria-label={label}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="h-[68px] w-[68px] rounded-2xl bg-white/60 dark:bg-white/[0.06] text-2xl font-semibold tracking-wide text-foreground ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] hover:bg-white/80 dark:hover:bg-white/[0.1] hover:shadow-[0_2px_4px_rgba(0,0,0,0.08),0_8px_24px_rgba(0,0,0,0.06)] active:bg-white/50 dark:active:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-150 cursor-pointer"
    >
      {value}
    </motion.button>
  );
}

/* ---------- Animated PIN dots ---------- */

function PinDot({
  filled,
  error,
}: {
  filled: boolean;
  error: boolean;
}) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Neumorphic inset base */}
      <div className="h-4 w-4 rounded-full bg-black/[0.04] dark:bg-white/[0.06] shadow-[inset_0_2px_4px_rgba(0,0,0,0.12),inset_0_-1px_2px_rgba(255,255,255,0.5),0_1px_2px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.05),0_1px_2px_rgba(0,0,0,0.2)]" />

      {/* Filled dot overlay */}
      <AnimatePresence>
        {filled && !error && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20, mass: 0.5 }}
            className="absolute h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_12px_rgba(52,211,153,0.5),0_0_4px_rgba(52,211,153,0.3)]"
          />
        )}
      </AnimatePresence>

      {/* Error shake dot */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute h-4 w-4 rounded-full bg-gradient-to-br from-red-400 to-rose-500 shadow-[0_0_12px_rgba(248,113,113,0.5)]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PinDots({ length, error }: { length: number; error: boolean }) {
  const { t } = useLanguage();
  return (
    <motion.div
      animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex gap-5 items-center justify-center"
      role="img"
      aria-label={t("privacy.digitsEnteredAria", {
        length,
        total: PIN_LENGTH,
      })}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <PinDot key={i} filled={i < length} error={error} />
      ))}
    </motion.div>
  );
}

/* ---------- Main component ---------- */

export function PrivacyKeypad() {
  const router = useRouter();
  const { verifyPin, unlock } = usePrivacy();
  const { t } = useLanguage();
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bioSupported, setBioSupported] = useState(false);
  const [bioConfigured, setBioConfigured] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const announceRef = useRef<HTMLParagraphElement>(null);

  // Derive "available" as: the platform authenticator exists AND a credential
  // has actually been registered for this origin. Split into two states so the
  // UI can tell users *why* the button is disabled (unsupported device vs.
  // biometrics not enabled yet) instead of failing silently.
  const bioAvailable = bioSupported && bioConfigured;

  // Offer biometrics only when the platform authenticator really is available
  // (and a credential has been registered) — never in headless browsers,
  // where this button used to just toast "success" without any actual check.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supported = await isBiometricSupported();
        if (cancelled) return;
        setBioSupported(supported);
        setBioConfigured(hasBiometricCredential());
      } catch {
        if (!cancelled) {
          setBioSupported(false);
          setBioConfigured(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const press = (value: string) => {
    setError(false);
    if (digits.length >= PIN_LENGTH) return;
    const next = digits + value;
    setDigits(next);
    if (next.length === PIN_LENGTH) {
      verifyPin(next).then((ok) => {
        if (ok) {
          unlock();
        } else {
          setError(true);
          setDigits("");
          const msg = t("privacy.incorrectPin");
          setErrorMessage(msg);
          if (announceRef.current) {
            announceRef.current.textContent = msg;
          }
        }
      });
    }
  };

  const backspace = () => {
    setError(false);
    setDigits((d) => d.slice(0, -1));
  };

  const handleForgotPin = () => {
    router.push("/forgot-password");
  };

  const handleBiometrics = async () => {
    if (bioBusy) return;
    setError(false);
    setBioBusy(true);
    try {
      // Real OS-level verification (Touch ID / Windows Hello / Face ID /
      // hardware security key). navigator.credentials.get works on desktop
      // clicks as well as mobile touch — the native browser prompt opens the
      // platform authenticator either way.
      const authenticated = await unlockWithBiometric();
      if (!authenticated) {
        // User closed the native prompt without verifying — not a failure.
        if (announceRef.current) announceRef.current.textContent = "";
        return;
      }
      // The browser just proved the human; record the unlock server-side
      // (rate-limited) so the cookie is issued with the same ceremony as
      // a PIN entry.
      const result = await biometricUnlock();
      if (result.success) {
        unlock();
      } else {
        const message = result.error || t("privacy.biometricFailed");
        setErrorMessage(message);
        setError(true);
        if (announceRef.current) announceRef.current.textContent = message;
      }
    } catch (err) {
      const sentinel = err instanceof Error ? err.message : "";
      if (sentinel === BIOMETRIC_ERRORS.canceled) {
        // User dismissed the OS/security-key prompt — stay calm, no error.
        if (announceRef.current) announceRef.current.textContent = "";
        return;
      }
      const message =
        sentinel === BIOMETRIC_ERRORS.unsupported ||
        sentinel === BIOMETRIC_ERRORS.notConfigured
          ? t("profile.biometricUnsupported")
          : t("privacy.biometricFailed");
      setErrorMessage(message);
      setError(true);
      if (announceRef.current) announceRef.current.textContent = message;
    } finally {
      setBioBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      if (e.key === "Backspace") backspace();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex w-full flex-col items-center py-1"
      role="dialog"
      aria-modal="true"
      aria-label={t("privacy.unlockDialogAria")}
    >
      <p ref={announceRef} aria-live="polite" className="sr-only" />

      {/* Header with glowing lock badge */}
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="relative"
        >
          {/* Ambient glow behind badge */}
          <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-xl scale-150" />
          <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-white/50 dark:bg-white/[0.08] backdrop-blur-sm ring-1 ring-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]">
            <HugeiconsIcon
              icon={LockIcon}
              className="h-7 w-7 text-emerald-500 dark:text-emerald-400"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center space-y-2"
        >
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("privacy.lockedTitle")}
          </h1>
          <p className="text-[15px] text-muted-foreground font-medium">
            {t("privacy.enterPin")}
          </p>
        </motion.div>
      </div>

      {/* PIN dots */}
      <div className="mt-8">
        <PinDots length={digits.length} error={error} />
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="mt-4 text-sm text-red-500 font-medium"
            role="alert"
          >
            {errorMessage}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Numpad grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-7 grid grid-cols-3 gap-3"
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <KeypadButton
            key={n}
            value={n}
            onPress={press}
            label={t("privacy.digitAria", { digit: n })}
          />
        ))}
        <div />
        <KeypadButton
          value="0"
          onPress={press}
          label={t("privacy.digitAria", { digit: "0" })}
        />
        <motion.button
          type="button"
          onClick={backspace}
          aria-label={t("privacy.deleteDigitAria")}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="h-[68px] w-[68px] rounded-2xl bg-white/40 dark:bg-white/[0.04] ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-red-50 dark:hover:bg-red-500/10 hover:ring-red-300/50 dark:hover:ring-red-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-150 flex items-center justify-center cursor-pointer"
        >
          <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Biometric unlock — fingerprint button under the numpad, always part
          of the layout so the lock matches the original design. It only
          performs a real WebAuthn check when the platform has a registered
          authenticator; otherwise it stays disabled instead of faking success. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="mt-9 flex flex-col items-center gap-2.5"
      >
        <motion.button
          type="button"
          onClick={handleBiometrics}
          disabled={!bioAvailable || bioBusy}
          aria-label={t("privacy.biometricUnlockAria")}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="relative h-16 w-16 rounded-full bg-emerald-500/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/25 dark:ring-emerald-400/25 shadow-[0_0_16px_rgba(52,211,153,0.15)] hover:bg-emerald-500/15 dark:hover:bg-emerald-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-150 flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
          <HugeiconsIcon
            icon={FingerPrintScanIcon}
            className={bioBusy ? "h-7 w-7 animate-pulse" : "h-7 w-7"}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </motion.button>
        <p
          className="text-[13px] text-muted-foreground font-medium"
          role="status"
        >
          {bioBusy
            ? t("privacy.biometricScanning")
            : !bioSupported
              ? t("profile.biometricUnsupported")
              : t("privacy.biometricHint")}
        </p>
      </motion.div>

      {/* Action links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="relative z-20 mt-6 flex items-center pointer-events-auto"
      >
        <button
          type="button"
          onClick={handleForgotPin}
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 underline-offset-2 hover:underline cursor-pointer"
        >
          {t("privacy.forgotPin")}
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Privacy Setup (PIN creation flow) ---------- */

export function PrivacySetup() {
  const { setPin } = usePrivacy();
  const { t } = useLanguage();
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");
  const [stage, setStage] = useState<"first" | "confirm">("first");
  const [error, setError] = useState(false);

  const press = (value: string) => {
    setError(false);
    if (stage === "first") {
      if (first.length >= PIN_LENGTH) return;
      const next = first + value;
      setFirst(next);
      if (next.length === PIN_LENGTH) {
        setStage("confirm");
        setSecond("");
      }
    } else {
      if (second.length >= PIN_LENGTH) return;
      const next = second + value;
      setSecond(next);
      if (next.length === PIN_LENGTH) {
        if (next === first) {
          setPin(next);
        } else {
          setError(true);
          setFirst("");
          setSecond("");
          setStage("first");
        }
      }
    }
  };

  const backspace = () => {
    setError(false);
    if (stage === "confirm") setSecond((d) => d.slice(0, -1));
    else setFirst((d) => d.slice(0, -1));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") press(e.key);
      if (e.key === "Backspace") backspace();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [first, second, stage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-7"
      role="dialog"
      aria-modal="true"
      aria-label={t("privacy.setupDialogAria")}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-full bg-emerald-400/25 blur-xl scale-150" />
          <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-white/50 dark:bg-white/[0.08] backdrop-blur-sm ring-1 ring-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.15),inset_0_1px_0_rgba(255,255,255,0.4)]">
            <HugeiconsIcon
              icon={Shield01Icon}
              className="h-7 w-7 text-emerald-500 dark:text-emerald-400"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center space-y-1.5"
        >
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {t("privacy.protectTitle")}
          </h1>
          <p className="text-[15px] text-muted-foreground font-medium">
            {stage === "first" ? t("privacy.choosePin") : t("privacy.confirmPin")}
          </p>
        </motion.div>
      </div>

      <PinDots
        length={stage === "first" ? first.length : second.length}
        error={error}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-sm text-red-500 font-medium"
            role="alert"
          >
            {t("privacy.pinMismatch")}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="grid grid-cols-3 gap-3"
      >
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <KeypadButton
            key={n}
            value={n}
            onPress={press}
            label={t("privacy.digitAria", { digit: n })}
          />
        ))}
        <div />
        <KeypadButton
          value="0"
          onPress={press}
          label={t("privacy.digitAria", { digit: "0" })}
        />
        <motion.button
          type="button"
          onClick={backspace}
          aria-label={t("privacy.deleteDigitAria")}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="h-[68px] w-[68px] rounded-2xl bg-white/40 dark:bg-white/[0.04] ring-1 ring-black/[0.06] dark:ring-white/[0.08] shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-red-50 dark:hover:bg-red-500/10 hover:ring-red-300/50 dark:hover:ring-red-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-150 flex items-center justify-center cursor-pointer"
        >
          <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" />
            <line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
