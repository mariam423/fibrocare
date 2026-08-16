"use client";

import { useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  HeartIcon,
  Call02Icon,
  HandHelpingIcon,
  Shield02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepthCard } from "@/components/ui/DepthCard";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { cn } from "@/lib/utils";

const EMERGENCY_KEY = "fibrocare:emergency-mode";

/**
 * Flare Emergency Mode toggle.
 *
 * When armed it dims the screen for sensory rest (Sensitive theme + motion
 * off, the same soothing pipeline the "Calming Mode" toast and Recovery
 * panel use) and surfaces immediate crisis-resource contacts. It is a
 * user-initiated safety control: it is never turned on automatically, and
 * the dimming overlay is dropped under reduced-transparency / high-contrast
 * like the other sensory surfaces. State persists across sessions via
 * localStorage so a mid-flare decision survives a refresh.
 */
export default function FlareEmergencyMode() {
  const { isFlareUp, setTheme, setMotionEnabled } = useHealth();
  const { t } = useLanguage();
  const [armed, setArmed] = useLocalStorage<boolean>(EMERGENCY_KEY, false);

  const isActive = armed === true;

  const crisisLinks = [
    {
      label: t("flare.crisis.emergencyLabel"),
      value: t("flare.crisis.emergencyValue"),
    },
    {
      label: t("flare.crisis.suicideLabel"),
      value: t("flare.crisis.suicideValue"),
    },
    {
      label: t("flare.crisis.samaritansLabel"),
      value: t("flare.crisis.samaritansValue"),
    },
  ];

  useEffect(() => {
    if (!isActive) return;
    setTheme("Sensitive");
    setMotionEnabled(false);
    document.body.classList.add("emergency-mode");
    return () => {
      document.body.classList.remove("emergency-mode");
    };
  }, [isActive, setTheme, setMotionEnabled]);

  const toggle = () => {
    const next = !isActive;
    setArmed(next);
    if (!next) {
      setTheme("Standard");
      setMotionEnabled(true);
    }
  };

  const autoSuggests = isFlareUp && !isActive;

  return (
    <DepthCard
      tilt={3}
      delay={0.02}
      className={cn(
        "transition-colors duration-500",
        isActive &&
          "ring-2 ring-rose-300/60 dark:ring-rose-500/50",
        autoSuggests && "ring-1 ring-rose-200/70 dark:ring-rose-400/40"
      )}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                  isActive
                    ? "bg-rose-600 text-white shadow-[0_4px_14px_-4px_rgba(225,29,72,0.5)]"
                    : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                )}
              >
                <HugeiconsIcon
                  icon={isActive ? Shield02Icon : Alert02Icon}
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </span>
              <CardTitle className="text-base">{t("flare.title")}</CardTitle>
            </div>
            <Button
              variant={isActive ? "default" : "ghost"}
              onClick={toggle}
              aria-pressed={isActive}
              aria-label={
                isActive
                  ? t("flare.deactivateAria")
                  : t("flare.activateAria")
              }
              className={cn(
                "shrink-0 rounded-full text-xs font-medium gap-1.5",
                isActive
                  ? "bg-rose-600 text-white hover:bg-rose-700"
                  : "bg-muted hover:bg-muted/80 text-foreground"
              )}
            >
              <HugeiconsIcon
                icon={isActive ? HeartIcon : HandHelpingIcon}
                className="h-4 w-4"
                aria-hidden="true"
              />
              {isActive ? t("flare.on") : t("flare.off")}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {isActive ? (
            <>
              <p className="leading-relaxed text-muted-foreground">
                {t("flare.dimmedMessage")}
              </p>
              <ul className="space-y-1.5" aria-label={t("flare.crisisOptionsAria")}>
                {crisisLinks.map((link) => (
                  <li
                    key={link.label}
                    className="flex items-start gap-2 rounded-lg border border-rose-200/70 bg-rose-50/70 p-2.5 text-xs leading-relaxed dark:border-rose-900/60 dark:bg-rose-950/40"
                  >
                    <HugeiconsIcon
                      icon={Call02Icon}
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-300"
                      aria-hidden="true"
                    />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {link.value}
                      </span>{" "}
                      — {link.label}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="leading-relaxed text-muted-foreground">
              {t("flare.armedDescription")}
              {autoSuggests && t("flare.suggestion")}
            </p>
          )}
        </CardContent>
      </Card>
    </DepthCard>
  );
}