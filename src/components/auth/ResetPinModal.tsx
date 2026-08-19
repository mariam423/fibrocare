"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, LockIcon, Loading01Icon } from "@hugeicons/core-free-icons";
import { usePrivacy } from "./PrivacyLock";
import { useLanguage } from "@/context/LanguageContext";

const PIN_LENGTH = 4;

/**
 * "Forgot PIN?" recovery surface. The PIN is a local convenience lock on top
 * of the signed-in session, so an active session is the recovery gate: a
 * signed-in user can set a new PIN directly; a signed-out user is pointed at
 * the (public) sign-in page instead of being left with a dead button.
 */
export function ResetPinModal({ onClose }: { onClose: () => void }) {
  const { setPin } = usePrivacy();
  const { status, data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();

  const [pin, setPinValue] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  const signedIn = status === "authenticated";
  const email = session?.user?.email || "";

  const handleReset = useCallback(async () => {
    if (pin.length !== PIN_LENGTH || busy) return;
    if (pin !== confirm) {
      setError(true);
      return;
    }
    setError(false);
    setBusy(true);
    try {
      // setPin persists the new hash and unlocks the app for this session.
      await setPin(pin);
      onClose();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }, [pin, confirm, busy, setPin, onClose]);

  const handleSignIn = useCallback(() => {
    onClose();
    router.push("/login");
  }, [onClose, router]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        role="dialog"
        aria-modal="true"
        aria-label={t("privacy.resetPinTitle")}
        className="relative w-full max-w-sm rounded-3xl glass-surface card-depth bg-card/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_2.8px_2.2px_rgba(0,0,0,0.034),0_6.7px_5.3px_rgba(0,0,0,0.048),0_12.5px_10px_rgba(0,0,0,0.06),0_22.3px_17.9px_rgba(0,0,0,0.072),0_41.8px_33.4px_rgba(0,0,0,0.086),0_100px_80px_rgba(0,0,0,0.12)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("privacy.resetPinCloseAria")}
          className="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 pe-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <HugeiconsIcon
              icon={LockIcon}
              className="h-5 w-5 text-emerald-500 dark:text-emerald-400"
              aria-hidden="true"
            />
          </div>
          <h2 className="text-base font-semibold text-foreground">
            {t("privacy.resetPinTitle")}
          </h2>
        </div>

        {status === "loading" ? (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            {t("privacy.biometricScanning")}
          </p>
        ) : signedIn ? (
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleReset();
            }}
          >
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("privacy.resetPinPrompt", { email: email || session?.user?.name || "" })}
            </p>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-pin"
                className="text-sm font-medium text-foreground"
              >
                {t("privacy.resetPinNew")}
              </label>
              <input
                id="reset-pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={PIN_LENGTH}
                pattern="\d{4}"
                value={pin}
                onChange={(e) =>
                  setPinValue(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
                }
                placeholder="••••"
                className="w-full rounded-xl border border-border bg-muted px-3.5 py-2.5 text-base tracking-widest text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="reset-pin-confirm"
                className="text-sm font-medium text-foreground"
              >
                {t("privacy.resetPinConfirm")}
              </label>
              <input
                id="reset-pin-confirm"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                maxLength={PIN_LENGTH}
                pattern="\d{4}"
                value={confirm}
                onChange={(e) =>
                  setConfirm(e.target.value.replace(/\D/g, "").slice(0, PIN_LENGTH))
                }
                placeholder="••••"
                className="w-full rounded-xl border border-border bg-muted px-3.5 py-2.5 text-base tracking-widest text-foreground outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-red-500">
                {t("privacy.pinMismatch")}
              </p>
            )}

            <button
              type="submit"
              disabled={
                pin.length !== PIN_LENGTH || confirm.length !== PIN_LENGTH || busy
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {busy && (
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {t("privacy.resetPinAction")}
            </button>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            <p role="alert" className="text-sm leading-relaxed text-muted-foreground">
              {t("privacy.resetPinNotSignedIn")}
            </p>
            <button
              type="button"
              onClick={handleSignIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-primary/90"
            >
              {t("privacy.resetPinSignIn")}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
