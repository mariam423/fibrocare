"use client";

/**
 * Privacy & Security settings card: local encryption status, analytics
 * opt-out, zero-knowledge encrypted data export, and a hard purge with a
 * secondary confirmation. Purely additive; nothing here touches existing
 * contexts or routes.
 */

import React, { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Shield01Icon, Download01Icon, Delete01Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { exportEncrypted, purgeAllLocalData } from "@/lib/security/crypto";

const ANALYTICS_OPT_OUT_KEY = "fibrocare-analytics-opt-out";

/* Client-only snapshots read through useSyncExternalStore instead of
   setState-in-effect: the server snapshot renders first (no hydration
   mismatch), then the client value flips in after hydration. The analytics
   opt-out lives in localStorage behind a tiny subscriber set so the toggle
   below can notify this card to re-read it. */
const emptySubscribe = () => () => {};

const analyticsSubscribers = new Set<() => void>();

function subscribeAnalytics(callback: () => void): () => void {
  analyticsSubscribers.add(callback);
  return () => {
    analyticsSubscribers.delete(callback);
  };
}

function readAnalyticsOptOut(): boolean {
  return (
    typeof window !== "undefined" &&
    window.localStorage.getItem(ANALYTICS_OPT_OUT_KEY) === "true"
  );
}

function writeAnalyticsOptOut(next: boolean): void {
  window.localStorage.setItem(ANALYTICS_OPT_OUT_KEY, String(next));
  analyticsSubscribers.forEach((callback) => callback());
}

export function PrivacySecurityCard() {
  const { t } = useLanguage();
  // Local crypto is available when Web Crypto exists in this browser.
  const encryptionActive = useSyncExternalStore(
    emptySubscribe,
    () => typeof window !== "undefined" && Boolean(window.crypto?.subtle),
    () => null
  );
  const analyticsOptOut = useSyncExternalStore(
    subscribeAnalytics,
    readAnalyticsOptOut,
    () => false
  );
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeReport, setPurgeReport] = useState<string | null>(null);
  const [passphrase, setPassphrase] = useState("");
  const [exportState, setExportState] = useState<"idle" | "done" | "error">("idle");

  const toggleAnalytics = () => {
    writeAnalyticsOptOut(!analyticsOptOut);
  };

  const handleExport = async () => {
    if (passphrase.trim().length < 8) {
      setExportState("error");
      return;
    }
    setExportState("idle");
    try {
      // Collect every local FibroCare value; the passphrase encrypts the
      // dump in the browser and never leaves it.
      const dump: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)!;
        if (key.startsWith("fibrocare-") && key !== "fibrocare-local-crypto-key") {
          dump[key] = window.localStorage.getItem(key) ?? "";
        }
      }
      dump["exportedAt"] = new Date().toISOString();
      const encrypted = await exportEncrypted(dump, passphrase);
      const blob = new Blob([encrypted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fibrocare-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportState("done");
    } catch {
      setExportState("error");
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      const result = await purgeAllLocalData();
      const total =
        result.localStorageKeys.length +
        result.sessionStorageKeys.length +
        result.cookies.length +
        result.cacheNames.length;
      setPurgeReport(
        t("privacy.security.purged", {
          count: total,
          items: [
            ...result.localStorageKeys.slice(0, 3),
            ...result.cacheNames.slice(0, 2),
          ].join(", "),
        })
      );
      setConfirmPurge(false);
    } finally {
      setPurging(false);
    }
  };

  return (
    <DepthCard tilt={3}>
      <Card className="h-full border-none shadow-depth-sm ring-1 ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
            {t("privacy.security.title")}
          </CardTitle>
          <CardDescription>{t("privacy.security.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* Local encryption status */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div>
              <p className="font-medium">{t("privacy.security.encryption")}</p>
              <p className="text-xs text-muted-foreground">{t("privacy.security.encryptionDesc")}</p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                encryptionActive
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-border bg-muted text-muted-foreground"
              )}
              role="status"
            >
              {encryptionActive === null
                ? "…"
                : encryptionActive
                  ? t("privacy.security.active")
                  : t("privacy.security.unavailable")}
            </span>
          </div>

          {/* Analytics opt-out */}
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
            <div>
              <p className="font-medium">{t("privacy.security.analytics")}</p>
              <p className="text-xs text-muted-foreground">{t("privacy.security.analyticsDesc")}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analyticsOptOut}
              aria-label={t("privacy.security.analytics")}
              onClick={toggleAnalytics}
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                analyticsOptOut ? "bg-primary" : "bg-muted-foreground/30"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
                  analyticsOptOut ? "start-[22px]" : "start-0.5"
                )}
              />
            </button>
          </div>

          {/* Zero-knowledge export */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
            <p className="font-medium">{t("privacy.security.export")}</p>
            <p className="text-xs text-muted-foreground">{t("privacy.security.exportDesc")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="password"
                value={passphrase}
                onChange={(e) => {
                  setPassphrase(e.target.value);
                  setExportState("idle");
                }}
                placeholder={t("privacy.security.passphrase")}
                aria-label={t("privacy.security.passphrase")}
                className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
              <Button size="sm" className="rounded-xl" onClick={() => void handleExport()}>
                <HugeiconsIcon icon={Download01Icon} className="me-1 h-4 w-4" aria-hidden="true" />
                {t("privacy.security.exportBtn")}
              </Button>
            </div>
            {exportState === "done" && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">{t("privacy.security.exportDone")}</p>
            )}
            {exportState === "error" && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{t("privacy.security.exportError")}</p>
            )}
          </div>

          {/* Hard purge */}
          <div className="rounded-xl border border-red-300/60 bg-red-50/50 p-3 dark:border-red-900/60 dark:bg-red-950/20">
            <p className="font-medium text-red-800 dark:text-red-300">{t("privacy.security.purge")}</p>
            <p className="text-xs text-red-700/80 dark:text-red-400/80">{t("privacy.security.purgeDesc")}</p>
            <Button
              size="sm"
              variant="destructive"
              className="mt-2 rounded-xl"
              onClick={() => setConfirmPurge(true)}
            >
              <HugeiconsIcon icon={Delete01Icon} className="me-1 h-4 w-4" aria-hidden="true" />
              {t("privacy.security.purgeBtn")}
            </Button>
            {purgeReport && <p className="mt-2 text-xs text-muted-foreground">{purgeReport}</p>}
          </div>

          {/* Secondary confirmation modal */}
          <AnimatePresence>
            {confirmPurge && (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="dialog"
                aria-modal="true"
                aria-label={t("privacy.security.purge")}
              >
                <motion.div
                  className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-depth"
                  initial={{ scale: 0.95, y: 8 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 8 }}
                >
                  <p className="font-semibold">{t("privacy.security.purgeConfirmTitle")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t("privacy.security.purgeConfirmBody")}</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="rounded-xl" onClick={() => setConfirmPurge(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => void handlePurge()} disabled={purging}>
                      {purging && <HugeiconsIcon icon={Loading03Icon} className="me-1 h-4 w-4 animate-spin" aria-hidden="true" />}
                      {t("privacy.security.purgeBtn")}
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </DepthCard>
  );
}
