"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Book01Icon,
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
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { RouteTransition } from "@/components/ui/RouteTransition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppHeader from "@/components/layout/AppHeader";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import type { TranslationKey } from "@/lib/translations";

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
    id: "nutri-antiinflam",
    title: "Anti-Inflammatory Diet",
    titleKey: "resources.card.antiInflammatory.title",
    descriptionKey: "resources.card.antiInflammatory.description",
    category: "nutritionHydration",
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
    icon: <HugeiconsIcon icon={Activity01Icon} className="h-6 w-6 text-green-600 dark:text-green-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80",
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
    icon: <HugeiconsIcon icon={Brain01Icon} className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=800&q=80",
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
    icon: <HugeiconsIcon icon={Brain01Icon} className="h-6 w-6 text-indigo-600 dark:text-indigo-300" aria-hidden="true" />,
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
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

interface LocalizedResource {
  id: string;
  title: string;
  description: string;
  categoryLabel: string;
  icon: React.ReactNode;
  image: string;
  bannerGradient: string;
  color: { light: string; dark: string };
  tips: string[];
}

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const { t } = useLanguage();

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
      })),
    [t]
  );

  const filteredResources = useMemo(() => {
    return localizedResources.filter((res) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.categoryLabel.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "all" ||
        RESOURCES_DATA.find((r) => r.id === res.id)?.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [localizedResources, searchQuery, activeCategory]);

  return (
    <RouteTransition>
    <div className="min-h-[100dvh] text-foreground transition-colors duration-500">
      <AppHeader backHref="/dashboard" backLabel={t("nav.backToDashboard")} />

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl pt-20 pb-48 mb-20">
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
                    <SpotlightCard className="h-full rounded-2xl border border-border/60 bg-card/70 backdrop-blur-sm shadow-depth-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-depth-md dark:border-white/10 dark:bg-background/40 dark:backdrop-blur-xl dark:group-hover:border-emerald-400/30 dark:group-hover:shadow-[0_0_24px_rgba(16,185,129,0.16)]">
                      <CardContent className="p-4 flex items-center gap-3">
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

        {/* Search & Filters */}
        <ScrollReveal delay={0.1} className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-md">
            <HugeiconsIcon icon={Search01Icon} className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder={t("resources.search")}
              aria-label={t("resources.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-10 border-border rounded-full"
            />
          </div>
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
                className={`rounded-full px-4 transition-all ${
                  activeCategory === cat.id
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-card text-muted-foreground border-border"
                }`}
              >
                {t(cat.tKey)}
              </Button>
            ))}
          </div>
        </ScrollReveal>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res, index) => (
            <ScrollReveal key={res.id} delay={Math.min(index * 0.06, 0.3)} className="h-full">
            <DepthCard tilt={5} animateIn={false} className="h-full">
            <SpotlightCard className={`group h-full rounded-3xl border-none shadow-depth-sm ring-1 transition-all duration-300 overflow-hidden ${res.color.light} ${res.color.dark}`}>
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={res.image}
                  alt={res.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 dark:opacity-40" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium tracking-wide opacity-70">
                    {res.categoryLabel}
                  </span>
                </div>
                <CardTitle className="text-xl text-foreground">{res.title}</CardTitle>
                <CardDescription className="text-muted-foreground line-clamp-2">
                  {res.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger
                    render={
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-border hover:bg-muted"
                      >
                        <HugeiconsIcon icon={Book01Icon} className="me-2 h-4 w-4" aria-hidden="true" />
                        {t("common.readMore")}
                      </Button>
                    }
                  />
                  <DialogContent className="ring-1 ring-border">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-foreground">
                        {res.title}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {t("resources.tipsFor", { category: res.categoryLabel })}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <ul className="space-y-3">
                        {res.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-foreground">
                            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </SpotlightCard>
            </DepthCard>
            </ScrollReveal>
          ))}
        </div>
      </main>
    </div>
    </RouteTransition>
  );
}
