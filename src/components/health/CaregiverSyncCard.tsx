"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SmartPhone01Icon, Link02Icon, LockKeyIcon, Loading01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";
import { getCaregiverShareStatus, toggleCaregiverShare } from "@/app/actions";
import { cn } from "@/lib/utils";

/**
 * Caregiver / Partner Sync (Point 15).
 *
 * Enables a read-only share link so a caregiver can see the next flare
 * forecast — never diaries, scores or notes. The token is a server-side
 * random UUID scoped to the user; toggling it off invalidates the link.
 * The share path is resolved from the current origin client-side.
 */
export function CaregiverSyncCard() {
  const { t } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getCaregiverShareStatus()
      .then((s) => {
        setEnabled(s.enabled);
        setToken(s.token);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    setCopied(false);
    try {
      const result = await toggleCaregiverShare();
      if (result.success) {
        setEnabled(result.enabled ?? false);
        setToken(result.token ?? null);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (!token || typeof window === "undefined") return;
    const url = `${window.location.origin}/caregiver/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard may be unavailable (e.g. iframe sandbox / file context).
      // The link is still visible in the UI for manual copying.
    }
  }

  const shareUrl = token && typeof window !== "undefined"
    ? `${window.location.origin}/caregiver/${token}`
    : null;

  return (
    <Card className="w-full h-full overflow-hidden border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <HugeiconsIcon icon={SmartPhone01Icon} className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <CardTitle className="text-lg font-semibold">{t("health.caregiver.title")}</CardTitle>
        </div>
        <CardDescription className="text-sm">{t("health.caregiver.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="animate-pulse text-sm text-muted-foreground">{t("dashboard.loading")}</div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <HugeiconsIcon
                  icon={LockKeyIcon}
                  className={cn("h-3.5 w-3.5", enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}
                  aria-hidden="true"
                />
                <span>{t("health.caregiver.viewOnly")}</span>
              </div>
              <Button variant={enabled ? "outline" : "default"} size="sm" onClick={handleToggle} disabled={busy}>
                {busy ? (
                  <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : enabled ? (
                  t("health.caregiver.disable")
                ) : (
                  t("health.caregiver.enable")
                )}
              </Button>
            </div>

            {enabled && shareUrl && (
              <div className="rounded-xl border border-emerald-500/25 bg-background/60 p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                  <HugeiconsIcon icon={Link02Icon} className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("health.caregiver.shareToken")}
                </div>
                <p className="break-all rounded-lg bg-muted/60 px-3 py-2 text-xs font-mono text-muted-foreground" dir="ltr">
                  {shareUrl}
                </p>
                <Button variant="outline" size="sm" className="w-full" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="me-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      {t("health.caregiver.copied")}
                    </>
                  ) : (
                    t("health.caregiver.shareToken")
                  )}
                </Button>
              </div>
            )}

            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t("health.caregiver.disclaimer")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}