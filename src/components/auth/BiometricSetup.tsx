"use client";

import { useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FingerPrintScanIcon,
  Loading01Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import {
  registerBiometricCredential,
  clearBiometricCredential,
  hasBiometricCredential,
  BIOMETRIC_ERRORS,
} from "@/lib/biometrics";

/**
 * "Fingerprint unlock" control for the Profile → Privacy Lock card.
 *
 * Enrolling creates a platform-authenticator credential (Touch ID / Windows
 * Hello / Face ID) that the lock screen's "Use Biometrics" button verifies
 * against. Falls back to a clear alert when the device/browser can't do it.
 */
export function BiometricSetup() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(hasBiometricCredential());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleEnable = useCallback(async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await registerBiometricCredential({
        userName: session?.user?.name || "",
        userEmail: session?.user?.email || "",
      });
      setEnabled(true);
      setNotice(t("profile.biometricEnabled"));
    } catch (err) {
      const name = (err as Error)?.name;
      setError(
        name === BIOMETRIC_ERRORS.unsupported
          ? t("profile.biometricUnsupported")
          : t("privacy.biometricFailed")
      );
    } finally {
      setBusy(false);
    }
  }, [session, t]);

  const handleDisable = useCallback(() => {
    clearBiometricCredential();
    setEnabled(false);
    setError(null);
    setNotice(null);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-muted/40 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <HugeiconsIcon
              icon={FingerPrintScanIcon}
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              {t("profile.biometricTitle")}
            </p>
            <p className="text-sm leading-relaxed text-foreground/75">
              {enabled
                ? t("profile.biometricEnabled")
                : t("privacy.useBiometrics")}
            </p>
          </div>
        </div>

        {enabled ? (
          <button
            type="button"
            onClick={handleDisable}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon icon={Shield01Icon} className="h-3.5 w-3.5" aria-hidden="true" />
            {t("profile.biometricDisable")}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleEnable()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <HugeiconsIcon
                icon={Loading01Icon}
                className="h-3.5 w-3.5 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <HugeiconsIcon
                icon={FingerPrintScanIcon}
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            )}
            {busy ? t("privacy.biometricScanning") : t("profile.biometricEnable")}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm leading-relaxed font-medium text-red-500">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-sm leading-relaxed font-medium text-emerald-600 dark:text-emerald-400">
          {notice}
        </p>
      )}
    </div>
  );
}
