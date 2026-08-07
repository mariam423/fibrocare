"use client";

import React, { useEffect, useRef, useState } from "react";
import { Lock, Delete, ShieldCheck } from "lucide-react";
import { usePrivacy } from "./PrivacyLock";
import { cn } from "@/lib/utils";

const PIN_LENGTH = 4;

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
    <button
      type="button"
      onClick={() => onPress(value)}
      aria-label={label}
      className="h-16 w-16 rounded-full bg-card text-2xl font-semibold ring-1 ring-border transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
    >
      {value}
    </button>
  );
}

function PinDots({ length, error }: { length: number; error: boolean }) {
  return (
    <div
      className="flex gap-3"
      role="img"
      aria-label={`${length} of ${PIN_LENGTH} digits entered`}
    >
      {Array.from({ length: PIN_LENGTH }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-3.5 w-3.5 rounded-full transition-all",
            error
              ? "bg-red-500 animate-pulse"
              : i < length
                ? "bg-primary scale-110"
                : "bg-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}

export function PrivacyKeypad() {
  const { verifyPin, unlock } = usePrivacy();
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
            announceRef.current.textContent = "Incorrect PIN. Try again.";
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
    <div
      className="flex flex-col items-center gap-8"
      role="dialog"
      aria-modal="true"
      aria-label="Enter your PIN to unlock FibroCare"
    >
      <p ref={announceRef} aria-live="polite" className="sr-only" />

      <div className="flex flex-col items-center gap-3">
        <div className="p-4 rounded-2xl bg-primary/15 text-primary">
          <Lock className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold">Your space is locked</h1>
        <p className="text-sm text-muted-foreground">Enter your 4-digit PIN</p>
      </div>

      <PinDots length={digits.length} error={error} />
      {error && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          Incorrect PIN. Try again.
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <KeypadButton key={n} value={n} onPress={press} label={`Digit ${n}`} />
        ))}
        <div />
        <KeypadButton value="0" onPress={press} label="Digit 0" />
        <button
          type="button"
          onClick={backspace}
          aria-label="Delete last digit"
          className="h-16 w-16 rounded-full bg-card ring-1 ring-border transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Delete className="mx-auto h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function PrivacySetup() {
  const { setPin } = usePrivacy();
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
    <div
      className="flex flex-col items-center gap-8"
      role="dialog"
      aria-modal="true"
      aria-label="Set a privacy PIN"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="p-4 rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-8 w-8" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold">Protect your health data</h1>
        <p className="text-sm text-muted-foreground">
          {stage === "first"
            ? "Choose a 4-digit PIN"
            : "Confirm your PIN"}
        </p>
      </div>

      <PinDots
        length={stage === "first" ? first.length : second.length}
        error={error}
      />
      {error && (
        <p className="text-sm text-red-500 font-medium" role="alert">
          PINs did not match. Start over.
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <KeypadButton key={n} value={n} onPress={press} label={`Digit ${n}`} />
        ))}
        <div />
        <KeypadButton value="0" onPress={press} label="Digit 0" />
        <button
          type="button"
          onClick={backspace}
          aria-label="Delete last digit"
          className="h-16 w-16 rounded-full bg-card ring-1 ring-border transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Delete className="mx-auto h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
