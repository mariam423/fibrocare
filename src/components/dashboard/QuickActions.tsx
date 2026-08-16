"use client";

import Link from "next/link";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  HeartIcon,
  ClipboardListIcon,
  File01Icon,
  BookOpen01Icon,
  ChevronRightIcon,
} from "@hugeicons/core-free-icons";
import { DepthCard } from "@/components/ui/DepthCard";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface QuickAction {
  href: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  icon: IconSvgElement;
  hoverBorder: string;
}

const ACTIONS: QuickAction[] = [
  {
    href: "#daily-checkin",
    titleKey: "quickActions.checkin.title",
    descriptionKey: "quickActions.checkin.description",
    icon: HeartIcon,
    hoverBorder: "group-hover:border-purple-300 dark:group-hover:border-purple-700",
  },
  {
    href: "/health-logs",
    titleKey: "quickActions.logs.title",
    descriptionKey: "quickActions.logs.description",
    icon: ClipboardListIcon,
    hoverBorder: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
  },
  {
    href: "/reports",
    titleKey: "quickActions.reports.title",
    descriptionKey: "quickActions.reports.description",
    icon: File01Icon,
    hoverBorder: "group-hover:border-violet-300 dark:group-hover:border-violet-700",
  },
  {
    href: "/resources",
    titleKey: "quickActions.resources.title",
    descriptionKey: "quickActions.resources.description",
    icon: BookOpen01Icon,
    hoverBorder: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700",
  },
];

export function QuickActions() {
  const { t } = useLanguage();
  return (
    <section aria-label={t("quickActions.ariaLabel")}>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action, index) => (
          <li key={action.href} className="h-full">
            <Link
              href={action.href}
              className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <DepthCard tilt={4} delay={index * 0.06} className="h-full">
                <SpotlightCard
                  className={cn(
                    "flex h-full flex-col gap-4 rounded-2xl border border-border bg-card/70 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5 transition-all duration-300 ease-out dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4),0_0_24px_rgba(16,185,129,0.16)]",
                    "hover:-translate-y-1 hover:shadow-[0_12px_28px_-8px_rgba(15,23,42,0.14)]",
                    action.hoverBorder
                  )}
                >
                  <div className="icon-badge h-11 w-11 rounded-xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                    <HugeiconsIcon
                      icon={action.icon}
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground transition-colors duration-300 group-hover:text-primary">
                        {t(action.titleKey)}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t(action.descriptionKey)}
                      </p>
                    </div>
                    <HugeiconsIcon
                      icon={ChevronRightIcon}
                      className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 rtl:scale-x-[-1] rtl:group-hover:-translate-x-1 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                </SpotlightCard>
              </DepthCard>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
