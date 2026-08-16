"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockIcon,
  Delete01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { usePrivacy } from "./PrivacyLock";
import { useLanguage } from "@/context/LanguageContext";

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
  const { verifyPin, unlock } = usePrivacy();
  const { t } = useLanguage();
  const [digits, setDigits] = useState("");
  const [error, setError] = useState(false);
  const announceRef = useRef<HTMLParagraphElement>(null);

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
          if (announceRef.current) {
            announceRef.current.textContent = t("privacy.incorrectPin");
          }
        }
      });
    }
  };

  const backspace = () => {
    setError(false);
    setDigits((d) => d.slice(0, -1));
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
      className="flex flex-col items-center gap-7"
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
          className="text-center space-y-1.5"
        >
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            {t("privacy.lockedTitle")}
          </h1>
          <p className="text-[15px] text-muted-foreground font-medium">
            {t("privacy.enterPin")}
          </p>
        </motion.div>
      </div>

      {/* PIN dots */}
      <PinDots length={digits.length} error={error} />

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-sm text-red-500 font-medium"
            role="alert"
          >
            {t("privacy.incorrectPin")}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Numpad grid */}
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
          <HugeiconsIcon
            icon={Delete01Icon}
            className="h-5 w-5 text-muted-foreground group-hover:text-red-500"
            aria-hidden="true"
          />
        </motion.button>
      </motion.div>

      {/* Action links */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="flex items-center gap-6 mt-1"
      >
        <button
          type="button"
          className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 underline-offset-2 hover:underline cursor-pointer"
        >
          {t("privacy.forgotPin")}
        </button>
        <span className="h-1 w-1 rounded-full bg-border" />
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-150 underline-offset-2 hover:underline cursor-pointer"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
            <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
            <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
            <path d="M2 12a10 10 0 0 1 18-6" />
            <path d="M2 16h.01" />
            <path d="M21.8 16c.2-2 .131-5.354 0-6" />
            <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 0 .34-2" />
            <path d="M8.65 22c.21-.66.45-1.32.57-2" />
            <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
          </svg>
          {t("privacy.useBiometrics")}
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
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
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
          <HugeiconsIcon
            icon={Delete01Icon}
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
