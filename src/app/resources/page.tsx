"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  FlameIcon,
  AppleIcon,
  Activity01Icon,
  Brain01Icon,
  Activity02Icon,
  StethoscopeIcon,
  PillIcon,
  RunningShoesIcon,
  HelpCircleIcon,
  Message02Icon,
  ArrowRight01Icon,
  WaveIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { RouteTransition } from "@/components/ui/RouteTransition";
import AppHeader from "@/components/layout/AppHeader";
import { useLanguage } from "@/context/LanguageContext";
import { useHealth } from "@/context/HealthContext";
import { useMotionEnabled } from "@/hooks/useMotionEnabled";
import { cn } from "@/lib/utils";
import type { TranslationKey } from "@/lib/translations";
import {
  BODY_PARTS,
  resolveSemanticIntent,
  type BodyPartId,
  type EffortLevel,
} from "@/lib/resources/engine";
import { ResourceCard, type LocalizedResource } from "@/components/resources/ResourceCard";
import { BodySymptomMap } from "@/components/resources/BodySymptomMap";
import { FlareActionPlan } from "@/components/resources/FlareActionPlan";
import { PersonalizedResourceFeed } from "@/components/resources/PersonalizedResourceFeed";

type CategoryId =
  | "managingFlares"
  | "nutritionHydration"
  | "gentleMovement"
  | "mentalSupport";

const CATEGORY_KEYS: Record<CategoryId, TranslationKey> = {
  managingFlares: "resources.category.managingFlares",
  nutritionHydration: "resources.category.nutritionHydration",
  gentleMovement: "resources.category.gentleMovement",
  mentalSupport: "resources.category.mentalSupport",
};

const FILTER_CATEGORIES: Array<{ id: CategoryId | "all"; tKey: TranslationKey }> = [
  { id: "all", tKey: "resources.category.all" },
  { id: "managingFlares", tKey: "resources.category.managingFlares" },
  { id: "nutritionHydration", tKey: "resources.category.nutritionHydration" },
  { id: "gentleMovement", tKey: "resources.category.gentleMovement" },
  { id: "mentalSupport", tKey: "resources.category.mentalSupport" },
];

interface Resource {
  id: string;
  /** English fallback (image alt + graceful fallback). */
  title: string;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  category: CategoryId;
  effort: EffortLevel;
  icon: React.ReactNode;
  image: string;
  bannerGradient: string;
  color: {
    light: string;
    dark: string;
  };
  tipsKeys: TranslationKey[];
}

const CONTENT_NAV_ITEMS = [
  {
    href: "/resources/about",
    titleKey: "resources.about" as const,
    icon: Activity02Icon,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    href: "/resources/diagnosis",
    titleKey: "resources.diagnosis" as const,
    icon: StethoscopeIcon,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  {
    href: "/resources/treatment",
    titleKey: "resources.treatment" as const,
    icon: PillIcon,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/40",
  },
  {
    href: "/resources/nutrition",
    titleKey: "resources.nutrition" as const,
    icon: AppleIcon,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40",
  },
  {
    href: "/resources/exercises",
    titleKey: "resources.exercises" as const,
    icon: RunningShoesIcon,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/40",
  },
  {
    href: "/resources/faq",
    titleKey: "resources.faq" as const,
    icon: HelpCircleIcon,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/40",
  },
  {
    href: "/resources/community",
    titleKey: "resources.community" as const,
    icon: Message02Icon,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-100 dark:bg-rose-900/40",
  },
];

const RESOURCES_DATA: Resource[] = [
  {
    id: "flare-pacing",
    title: "Pacing Techniques",
    titleKey: "resources.card.flarePacing.title",
    descriptionKey: "resources.card.flarePacing.description",
    category: "managingFlares",
    effort: "low",
    icon: <HugeiconsIcon icon={FlameIcon} className="h-6 w-6 text-purple-600 dark:text-purple-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-purple-200 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-950/50",
    color: {
      light: "bg-purple-50 text-purple-700 ring-purple-100",
      dark: "dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-900"
    },
    tipsKeys: [
      "resources.card.flarePacing.tip1",
      "resources.card.flarePacing.tip2",
      "resources.card.flarePacing.tip3",
      "resources.card.flarePacing.tip4",
    ]
  },
  {
    id: "flare-heat",
    title: "Gentle Heat Therapy",
    titleKey: "resources.card.flareHeat.title",
    descriptionKey: "resources.card.flareHeat.description",
    category: "managingFlares",
    effort: "low",
    icon: <HugeiconsIcon icon={FlameIcon} className="h-6 w-6 text-purple-600 dark:text-purple-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-purple-200 to-pink-100 dark:from-purple-900/50 dark:to-pink-950/50",
    color: {
      light: "bg-purple-50 text-purple-700 ring-purple-100",
      dark: "dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-900"
    },
    tipsKeys: [
      "resources.card.flareHeat.tip1",
      "resources.card.flareHeat.tip2",
      "resources.card.flareHeat.tip3",
      "resources.card.flareHeat.tip4",
    ]
  },
  {
    id: "flare-breathwork",
    title: "Breathwork for Flares",
    titleKey: "resources.card.breathwork.title",
    descriptionKey: "resources.card.breathwork.description",
    category: "mentalSupport",
    effort: "low",
    icon: <HugeiconsIcon icon={Brain01Icon} className="h-6 w-6 text-sky-600 dark:text-sky-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-sky-200 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-950/50",
    color: {
      light: "bg-sky-50 text-sky-700 ring-sky-100",
      dark: "dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-900"
    },
    tipsKeys: [
      "resources.card.breathwork.tip1",
      "resources.card.breathwork.tip2",
      "resources.card.breathwork.tip3",
    ]
  },
  {
    id: "mental-audio",
    title: "Audio Therapy",
    titleKey: "resources.card.audioTherapy.title",
    descriptionKey: "resources.card.audioTherapy.description",
    category: "mentalSupport",
    effort: "low",
    icon: <HugeiconsIcon icon={WaveIcon} className="h-6 w-6 text-violet-600 dark:text-violet-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-violet-200 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-950/50",
    color: {
      light: "bg-violet-50 text-violet-700 ring-violet-100",
      dark: "dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-900"
    },
    tipsKeys: [
      "resources.card.audioTherapy.tip1",
      "resources.card.audioTherapy.tip2",
      "resources.card.audioTherapy.tip3",
    ]
  },
  {
    id: "nutri-antiinflam",
    title: "Anti-Inflammatory Diet",
    titleKey: "resources.card.antiInflammatory.title",
    descriptionKey: "resources.card.antiInflammatory.description",
    category: "nutritionHydration",
    effort: "medium",
    icon: <HugeiconsIcon icon={AppleIcon} className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-teal-200 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-950/50",
    color: {
      light: "bg-teal-50 text-teal-700 ring-teal-100",
      dark: "dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-900"
    },
    tipsKeys: [
      "resources.card.antiInflammatory.tip1",
      "resources.card.antiInflammatory.tip2",
      "resources.card.antiInflammatory.tip3",
      "resources.card.antiInflammatory.tip4",
    ]
  },
  {
    id: "nutri-hydration",
    title: "Hydration Strategies",
    titleKey: "resources.card.hydration.title",
    descriptionKey: "resources.card.hydration.description",
    category: "nutritionHydration",
    effort: "medium",
    icon: <HugeiconsIcon icon={AppleIcon} className="h-6 w-6 text-teal-600 dark:text-teal-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-cyan-200 to-teal-100 dark:from-cyan-900/50 dark:to-teal-950/50",
    color: {
      light: "bg-teal-50 text-teal-700 ring-teal-100",
      dark: "dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-900"
    },
    tipsKeys: [
      "resources.card.hydration.tip1",
      "resources.card.hydration.tip2",
      "resources.card.hydration.tip3",
      "resources.card.hydration.tip4",
    ]
  },
  {
    id: "move-stretching",
    title: "Gentle Stretching",
    titleKey: "resources.card.stretching.title",
    descriptionKey: "resources.card.stretching.description",
    category: "gentleMovement",
    effort: "medium",
    icon: <HugeiconsIcon icon={Activity01Icon} className="h-6 w-6 text-green-600 dark:text-green-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1758599879693-9e06f55a4ded?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-green-200 to-emerald-100 dark:from-green-900/50 dark:to-emerald-950/50",
    color: {
      light: "bg-green-50 text-green-700 ring-green-100",
      dark: "dark:bg-green-900/30 dark:text-green-300 dark:ring-green-900"
    },
    tipsKeys: [
      "resources.card.stretching.tip1",
      "resources.card.stretching.tip2",
      "resources.card.stretching.tip3",
      "resources.card.stretching.tip4",
    ]
  },
  {
    id: "move-walking",
    title: "Low-Impact Walking",
    titleKey: "resources.card.walking.title",
    descriptionKey: "resources.card.walking.description",
    category: "gentleMovement",
    effort: "medium",
    icon: <HugeiconsIcon icon={Activity01Icon} className="h-6 w-6 text-green-600 dark:text-green-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-emerald-200 to-teal-100 dark:from-emerald-900/50 dark:to-teal-950/50",
    color: {
      light: "bg-green-50 text-green-700 ring-green-100",
      dark: "dark:bg-green-900/30 dark:text-green-300 dark:ring-green-900"
    },
    tipsKeys: [
      "resources.card.walking.tip1",
      "resources.card.walking.tip2",
      "resources.card.walking.tip3",
      "resources.card.walking.tip4",
    ]
  },
  {
    id: "mental-mindfulness",
    title: "Mindfulness Practices",
    titleKey: "resources.card.mindfulness.title",
    descriptionKey: "resources.card.mindfulness.description",
    category: "mentalSupport",
    effort: "low",
    icon: <HugeiconsIcon icon={Brain01Icon} className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-indigo-200 to-purple-100 dark:from-indigo-900/50 dark:to-purple-950/50",
    color: {
      light: "bg-indigo-50 text-indigo-700 ring-indigo-100",
      dark: "dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900"
    },
    tipsKeys: [
      "resources.card.mindfulness.tip1",
      "resources.card.mindfulness.tip2",
      "resources.card.mindfulness.tip3",
      "resources.card.mindfulness.tip4",
    ]
  },
  {
    id: "mental-sleep",
    title: "Sleep Hygiene",
    titleKey: "resources.card.sleepHygiene.title",
    descriptionKey: "resources.card.sleepHygiene.description",
    category: "mentalSupport",
    effort: "medium",
    icon: <HugeiconsIcon icon={Brain01Icon} className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=800&q=80",
    bannerGradient: "from-slate-200 to-indigo-100 dark:from-slate-900/50 dark:to-indigo-950/50",
    color: {
      light: "bg-indigo-50 text-indigo-700 ring-indigo-100",
      dark: "dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900"
    },
    tipsKeys: [
      "resources.card.sleepHygiene.tip1",
      "resources.card.sleepHygiene.tip2",
      "resources.card.sleepHygiene.tip3",
      "resources.card.sleepHygiene.tip4",
    ]
  },
];

const EFFORT_RANK: Record<EffortLevel, number> = { low: 0, medium: 1 };

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [selectedBodyPart, setSelectedBodyPart] = useState<BodyPartId | null>(null);
  const { t } = useLanguage();
  const { currentPainLevel } = useHealth();
  const motionEnabled = useMotionEnabled();

  const highPain = currentPainLevel >= 7;

  const localizedResources = useMemo<LocalizedResource[]>(
    () =>
      RESOURCES_DATA.map((res) => ({
        id: res.id,
        title: t(res.titleKey),
        description: t(res.descriptionKey),
        categoryLabel: t(CATEGORY_KEYS[res.category]),
        icon: res.icon,
        image: res.image,
        bannerGradient: res.bannerGradient,
        color: res.color,
        tips: res.tipsKeys.map((key) => t(key)),
        effort: res.effort,
      })),
    [t]
  );

  const filteredResources = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const intent = resolveSemanticIntent(searchQuery);
    const semanticCardIds = new Set(
      intent.bodyParts.flatMap((part) => BODY_PARTS[part].cardIds)
    );
    const bodyCardIds = selectedBodyPart
      ? new Set(BODY_PARTS[selectedBodyPart].cardIds)
      : null;
    const categoryMatches = localizedResources.filter((res) =>
      activeCategory === "all" ||
      RESOURCES_DATA.find((r) => r.id === res.id)?.category === activeCategory
    );
    const categoryBodyIntersection = bodyCardIds
      ? categoryMatches.filter((res) => bodyCardIds.has(res.id))
      : categoryMatches;
    const effectiveBodyCardIds =
      bodyCardIds && categoryBodyIntersection.length > 0 ? bodyCardIds : null;

    const list = localizedResources.filter((res) => {
      const matchesSearch =
        q.length === 0 ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.categoryLabel.toLowerCase().includes(q) ||
        (intent.category !== undefined &&
          RESOURCES_DATA.find((r) => r.id === res.id)?.category === intent.category) ||
        (intent.bodyParts.length > 0 && semanticCardIds.has(res.id));
      const matchesCategory =
        activeCategory === "all" ||
        RESOURCES_DATA.find((r) => r.id === res.id)?.category === activeCategory;
      const matchesBodyPart =
        effectiveBodyCardIds === null || effectiveBodyCardIds.has(res.id);
      return matchesSearch && matchesCategory && matchesBodyPart;
    });

    // Pain-aware personalization: on high-pain days, surface low-effort
    // resources first (stable within each effort tier).
    if (!highPain) return list;
    return [...list].sort(
      (a, b) =>
        EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort] ||
        localizedResources.indexOf(a) - localizedResources.indexOf(b)
    );
  }, [localizedResources, searchQuery, activeCategory, selectedBodyPart, highPain]);

  const semanticIntent = useMemo(
    () => resolveSemanticIntent(searchQuery),
    [searchQuery]
  );

  return (
    <RouteTransition>
    <div className="text-foreground transition-colors duration-500">
      <AppHeader backHref="/dashboard" backLabel={t("nav.backToDashboard")} />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 pt-24 space-y-5 max-w-6xl pb-24 mb-10">
        <ScrollReveal as="section" className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">
            {t("resources.title")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("resources.subtitle")}
          </p>
        </ScrollReveal>

        {/* Content Navigation Cards */}
        <ScrollReveal delay={0.05}>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">
              {t("resources.title")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {CONTENT_NAV_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className="group">
                  <DepthCard tilt={3} delay={0} hover={false} className="h-full">
                    <SpotlightCard className="h-full !pb-0 -mb-2 rounded-2xl border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-0.5 hover:shadow-emerald-950/30 dark:bg-slate-900/60">
                      <CardContent className="p-6 flex items-center gap-3">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} transition-transform duration-300 group-hover:scale-110`}>
                          <HugeiconsIcon
                            icon={item.icon}
                            className={`h-5 w-5 ${item.color}`}
                            aria-hidden="true"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate transition-colors duration-300 group-hover:text-primary">
                            {t(item.titleKey)}
                          </p>
                        </div>
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          className="h-4 w-4 text-muted-foreground shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-1"
                          aria-hidden="true"
                        />
                      </CardContent>
                    </SpotlightCard>
                  </DepthCard>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Personalized AI feed */}
        <ScrollReveal delay={0.08}>
          <PersonalizedResourceFeed
            category={activeCategory}
            resources={localizedResources}
          />
        </ScrollReveal>

        {/* Search & Filters */}
        <ScrollReveal delay={0.1} className="flex flex-col items-center gap-4">
          <div className="relative w-full max-w-md rounded-full border border-emerald-500/20 bg-white/70 shadow-lg shadow-emerald-950/20 backdrop-blur-xl dark:bg-slate-900/60">
            <HugeiconsIcon icon={Search01Icon} className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder={t("resources.search")}
              aria-label={t("resources.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent ps-10 shadow-none focus-visible:ring-0"
            />
          </div>

          {/* Semantic symptom-match chip */}
          {searchQuery.trim() !== "" && semanticIntent.category && (
            <p className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <HugeiconsIcon icon={SparklesIcon} className="h-3.5 w-3.5" aria-hidden="true" />
              {t("resources.semantic.matched", { category: t(CATEGORY_KEYS[semanticIntent.category]) })}
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="ms-1 text-[11px] underline underline-offset-2 transition-colors hover:text-emerald-900 dark:hover:text-emerald-100"
              >
                {t("resources.semantic.clear")}
              </button>
            </p>
          )}

          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label={t("resources.filterAria")}
          >
            {FILTER_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat.id)}
                aria-pressed={activeCategory === cat.id}
                className={cn(
                  "rounded-full px-4 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
                  activeCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-[0_0_16px_rgba(16,185,129,0.35)] hover:bg-primary/90"
                    : "border-emerald-500/20 bg-white/70 text-muted-foreground backdrop-blur-xl dark:bg-slate-900/60"
                )}
              >
                {t(cat.tKey)}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Body Symptom Map */}
        <ScrollReveal delay={0.12}>
          <BodySymptomMap selected={selectedBodyPart} onSelect={setSelectedBodyPart} />
        </ScrollReveal>

        {/* AI Flare Action Plan */}
        <ScrollReveal delay={0.14}>
          <FlareActionPlan />
        </ScrollReveal>

        {/* Pain-aware banner */}
        {highPain && filteredResources.length > 0 && (
          <ScrollReveal delay={0.16}>
            <p
              role="status"
              className="flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 backdrop-blur-xl dark:text-red-300"
            >
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              {t("resources.painAware.banner")}
            </p>
          </ScrollReveal>
        )}

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredResources.map((res) => (
              <motion.div
                key={res.id}
                layout={motionEnabled}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: motionEnabled ? 0.2 : 0 }}
                className="h-full"
              >
                <ResourceCard res={res} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {filteredResources.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">{t("resources.empty")}</p>
        )}
      </main>
    </div>
    </RouteTransition>
  );
}
