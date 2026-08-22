"use client";

/**
 * Graceful Pro-feature gate. Wraps any Pro-only surface: unlocked users see
 * the children untouched; free users get a friendly preview banner with a
 * button that opens the pricing modal. Never blocks navigation or breaks
 * offline behavior.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { FlashIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useProFeature } from "@/hooks/useProFeature";
import type { Permission } from "@/lib/auth/rbac";

export function ProPreviewBanner({
  onUpgrade,
}: {
  onUpgrade: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/10 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20">
          <HugeiconsIcon icon={FlashIcon} className="h-4 w-4 text-primary" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold">{t("pricing.previewTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("pricing.previewBody")}</p>
        </div>
      </div>
      <Button size="sm" className="rounded-xl" onClick={onUpgrade}>
        {t("pricing.upgradeCta")}
      </Button>
    </div>
  );
}

/**
 * Render-gate: children render only when unlocked; otherwise the preview
 * banner replaces them. Use `ProPreviewBanner` directly when you want the
 * banner above a free preview instead of replacing content.
 */
export function ProFeatureGate({
  feature,
  children,
  onUpgrade,
}: {
  feature: Permission;
  children: React.ReactNode;
  onUpgrade: () => void;
}) {
  const { canUse } = useProFeature();
  if (canUse(feature)) return <>{children}</>;
  return <ProPreviewBanner onUpgrade={onUpgrade} />;
}
