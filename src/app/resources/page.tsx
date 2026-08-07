"use client";

import React, { useState, useMemo } from "react";
import { Search, BookOpen, Flame, Apple, Activity, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

type ResourceCategory = 'Managing Flares' | 'Nutrition & Hydration' | 'Gentle Movement' | 'Mental Support';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  icon: React.ReactNode;
  image: string;
  bannerGradient: string;
  color: {
    light: string;
    dark: string;
  };
  tips: string[];
}

const RESOURCES_DATA: Resource[] = [
  {
    id: 'flare-pacing',
    title: 'Pacing Techniques',
    description: 'Learn how to balance activity and rest to prevent crashes.',
    category: 'Managing Flares',
    icon: <Flame className="h-6 w-6 text-purple-600 dark:text-purple-300" />,
    image: '/images/resources/flare-pacing.svg',
    bannerGradient: 'from-purple-200 to-indigo-100 dark:from-purple-900/50 dark:to-indigo-950/50',
    color: {
      light: 'bg-purple-50 text-purple-700 ring-purple-100',
      dark: 'dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-900'
    },
    tips: [
      'Break tasks into smaller, manageable chunks.',
      'Set a timer for activities and take a break before you feel tired.',
      'Prioritize the most important tasks of the day.',
      'Listen to your body\'s early warning signs.'
    ]
  },
  {
    id: 'flare-heat',
    title: 'Gentle Heat Therapy',
    description: 'Using warmth to soothe stiff joints and relax muscles.',
    category: 'Managing Flares',
    icon: <Flame className="h-6 w-6 text-purple-600 dark:text-purple-300" />,
    image: '/images/resources/flare-heat.svg',
    bannerGradient: 'from-purple-200 to-pink-100 dark:from-purple-900/50 dark:to-pink-950/50',
    color: {
      light: 'bg-purple-50 text-purple-700 ring-purple-100',
      dark: 'dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-900'
    },
    tips: [
      'Use warm compresses or heating pads on affected areas.',
      'Try warm baths with Epsom salts to reduce muscle tension.',
      'Ensure heat sources are not too hot to avoid skin burns.',
      'Apply warmth for 15-20 minutes at a time.'
    ]
  },
  {
    id: 'nutri-antiinflam',
    title: 'Anti-Inflammatory Diet',
    description: 'Foods that may help reduce inflammation and joint pain.',
    category: 'Nutrition & Hydration',
    icon: <Apple className="h-6 w-6 text-teal-600 dark:text-teal-300" />,
    image: '/images/resources/nutri-antiinflam.svg',
    bannerGradient: 'from-teal-200 to-emerald-100 dark:from-teal-900/50 dark:to-emerald-950/50',
    color: {
      light: 'bg-teal-50 text-teal-700 ring-teal-100',
      dark: 'dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-900'
    },
    tips: [
      'Incorporate omega-3 rich foods like salmon, walnuts, and flaxseeds.',
      'Eat plenty of colorful berries and leafy greens.',
      'Reduce processed sugars and refined carbohydrates.',
      'Experiment with turmeric and ginger for natural anti-inflammatory properties.'
    ]
  },
  {
    id: 'nutri-hydration',
    title: 'Hydration Strategies',
    description: 'Tips for staying hydrated even when water feels like a chore.',
    category: 'Nutrition & Hydration',
    icon: <Apple className="h-6 w-6 text-teal-600 dark:text-teal-300" />,
    image: '/images/resources/nutri-hydration.svg',
    bannerGradient: 'from-cyan-200 to-teal-100 dark:from-cyan-900/50 dark:to-teal-950/50',
    color: {
      light: 'bg-teal-50 text-teal-700 ring-teal-100',
      dark: 'dark:bg-teal-900/30 dark:text-teal-300 dark:ring-teal-900'
    },
    tips: [
      'Carry a reusable water bottle with you at all times.',
      'Try infused water with cucumber or lemon for more flavor.',
      'Set reminders to drink water throughout the day.',
      'Eat water-rich foods like watermelon and cucumber.'
    ]
  },
  {
    id: 'move-stretching',
    title: 'Gentle Stretching',
    description: 'Low-impact ways to maintain flexibility without overexertion.',
    category: 'Gentle Movement',
    icon: <Activity className="h-6 w-6 text-green-600 dark:text-green-300" />,
    image: '/images/resources/move-stretching.svg',
    bannerGradient: 'from-green-200 to-emerald-100 dark:from-green-900/50 dark:to-emerald-950/50',
    color: {
      light: 'bg-green-50 text-green-700 ring-green-100',
      dark: 'dark:bg-green-900/30 dark:text-green-300 dark:ring-green-900'
    },
    tips: [
      'Focus on slow, rhythmic movements.',
      'Never push through sharp pain; stretch only to a point of mild tension.',
      'Use a chair or wall for support during stretches.',
      'Hold stretches for 15-30 seconds and breathe deeply.'
    ]
  },
  {
    id: 'move-walking',
    title: 'Low-Impact Walking',
    description: 'Ways to incorporate walking into your routine safely.',
    category: 'Gentle Movement',
    icon: <Activity className="h-6 w-6 text-green-600 dark:text-green-300" />,
    image: '/images/resources/move-walking.svg',
    bannerGradient: 'from-emerald-200 to-teal-100 dark:from-emerald-900/50 dark:to-teal-950/50',
    color: {
      light: 'bg-green-50 text-green-700 ring-green-100',
      dark: 'dark:bg-green-900/30 dark:text-green-300 dark:ring-green-900'
    },
    tips: [
      'Start with very short distances and gradually increase.',
      'Walk on flat, stable surfaces to avoid falls.',
      'Wear supportive, comfortable footwear.',
      'Take frequent breaks and walk in a pace that allows you to talk comfortably.'
    ]
  },
  {
    id: 'mental-mindfulness',
    title: 'Mindfulness Practices',
    description: 'Calming the mind to better manage the emotional toll of pain.',
    category: 'Mental Support',
    icon: <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />,
    image: '/images/resources/mental-mindfulness.svg',
    bannerGradient: 'from-indigo-200 to-purple-100 dark:from-indigo-900/50 dark:to-purple-950/50',
    color: {
      light: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
      dark: 'dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900'
    },
    tips: [
      'Practice deep belly breathing for 5 minutes daily.',
      'Try a guided meditation app for relaxation.',
      'Focus on a few things you are grateful for each morning.',
      'Use grounding techniques: find 5 things you can see, 4 you can touch, etc.'
    ]
  },
  {
    id: 'mental-sleep',
    title: 'Sleep Hygiene',
    description: 'Building a routine for deeper, more restorative sleep.',
    category: 'Mental Support',
    icon: <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />,
    image: '/images/resources/mental-sleep.svg',
    bannerGradient: 'from-slate-200 to-indigo-100 dark:from-slate-900/50 dark:to-indigo-950/50',
    color: {
      light: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
      dark: 'dark:bg-indigo-900/30 dark:text-indigo-300 dark:ring-indigo-900'
    },
    tips: [
      'Maintain a consistent sleep and wake schedule.',
      'Avoid screens at least one hour before bed.',
      'Create a calming bedtime ritual (e.g., herbal tea, light reading).',
      'Keep your bedroom cool, dark, and quiet.'
    ]
  },
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories: (ResourceCategory | "All")[] = [
    "All",
    "Managing Flares",
    "Nutrition & Hydration",
    "Gentle Movement",
    "Mental Support",
  ];

  const filteredResources = useMemo(() => {
    return RESOURCES_DATA.filter((res) => {
      const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            res.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || res.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <AppHeader backHref="/" backLabel="Back to Dashboard" />

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl">
        <section className="space-y-2 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">
            Care Resources
          </h1>
          <p className="text-lg text-muted-foreground">
            Gentle guidance and practical tips to help you navigate your journey with fibromyalgia.
          </p>
        </section>

        {/* Search & Filters */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              aria-label="Search resources"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border rounded-full"
            />
          </div>
          <div
            className="flex flex-wrap justify-center gap-2"
            role="group"
            aria-label="Filter resources by category"
          >
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`rounded-full px-4 transition-all ${
                  activeCategory === cat
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : "bg-card text-muted-foreground border-border"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <Card
              key={res.id}
              className={`border-none shadow-sm ring-1 transition-all hover:scale-[1.02] duration-200 overflow-hidden ${res.color.light} ${res.color.dark}`}
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={res.image}
                  alt={res.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 dark:opacity-40" />
              </div>
              <CardHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {res.category}
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
                        <BookOpen className="mr-2 h-4 w-4" />
                        Read Tips
                      </Button>
                    }
                  />
                  <DialogContent className="bg-card ring-1 ring-border">
                    <DialogHeader>
                      <DialogTitle className="text-2xl text-foreground">
                        {res.title}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        Practical tips for {res.category.toLowerCase()}.
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
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}