/**
 * Bilingual SEO metadata generator.
 *
 * One helper produces localized <Metadata> (title, description, OpenGraph,
 * alternates) for any route, in English and Arabic. Keywords target
 * fibromyalgia and somatic-health terms people actually search for, and the
 * `alternates.languages` pair lets search engines index both locales.
 */

import type { Metadata } from "next";
import type { Locale } from "@/lib/translations";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://fibrocare.app";

export interface SeoPageInput {
  page: "home" | "resources" | "toolkit" | "reports" | "login" | "signup";
  locale: Locale;
  /** Relative path for canonical/alternate links, e.g. "/resources". */
  path?: string;
}

interface PageCopy {
  title: string;
  description: string;
  keywords: string[];
}

const COPY: Record<SeoPageInput["page"], Record<Locale, PageCopy>> = {
  home: {
    en: {
      title: "FibroCare — track fibromyalgia pain, flares & energy",
      description:
        "A private, offline-friendly app for fibromyalgia: log pain and spoons, map flares against weather, and share clean 30-day reports with your care team.",
      keywords: ["fibromyalgia tracker", "chronic pain app", "spoon theory", "flare diary", "pain log"],
    },
    ar: {
      title: "فيبروكير — تتبّع ألم الفيبروميالغيا والنوبات والطاقة",
      description:
        "تطبيق خاص يعمل دون اتصال للفيبروميالغيا: سجّل الألم والملاعق، واربط النوبات بالطقس، وشارك تقارير 30 يومًا مع فريقك الطبي.",
      keywords: ["تتبع الفيبروميالغيا", "تطبيق الألم المزمن", "سجل النوبات", "نظرية الملاعق"],
    },
  },
  resources: {
    en: {
      title: "Fibromyalgia resources & guides",
      description:
        "Evidence-informed guides on fibromyalgia: diagnosis criteria, treatments, gentle exercise, sleep, and nutrition.",
      keywords: ["fibromyalgia guidelines", "fibromyalgia exercise", "fibromyalgia sleep"],
    },
    ar: {
      title: "مصادر وأدلة الفيبروميالغيا",
      description: "أدلة مبنيّة على الأدلة عن الفيبروميالغيا: التشخيص، العلاج، التمارين اللطيفة، النوم، والتغذية.",
      keywords: ["أدلة الفيبروميالغيا", "تمارين الفيبروميالغيا", "نوم الفيبروميالغيا"],
    },
  },
  toolkit: {
    en: {
      title: "Somatic movement & flare relief toolkit",
      description:
        "Gentle somatic exercises, offline breathing audio, sleep and HRV tracking, and medication safety checks for fibromyalgia flares.",
      keywords: ["somatic exercises", "fibromyalgia flare relief", "breathing exercise", "4-7-8 breathing"],
    },
    ar: {
      title: "أدوات الحركة الجسدية وتخفيف النوبات",
      description: "تمارين جسدية لطيفة وصوت تنفس دون اتصال وتتبّع النوم وHRV وفحص سلامة الأدوية لنوبات الفيبروميالغيا.",
      keywords: ["تمارين جسدية", "تخفيف نوبات الفيبروميالغيا", "تمرين التنفس"],
    },
  },
  reports: {
    en: {
      title: "Clinical reports for your doctor",
      description: "Turn 30 days of logs into a one-page clinical brief and PDF your specialist can actually use.",
      keywords: ["fibromyalgia report", "doctor report", "clinical summary"],
    },
    ar: {
      title: "تقارير سريرية لطبيبك",
      description: "حوّل 30 يومًا من السجلات إلى ملخص سريري من صفحة واحدة وPDF يفيد طبيبك المختص.",
      keywords: ["تقرير الفيبروميالغيا", "ملخص سريري"],
    },
  },
  login: {
    en: { title: "Sign in", description: "Sign in to FibroCare to continue tracking your health.", keywords: [] },
    ar: { title: "تسجيل الدخول", description: "سجّل الدخول إلى فيبروكير لمتابعة تتبّع صحتك.", keywords: [] },
  },
  signup: {
    en: { title: "Create your account", description: "Start tracking fibromyalgia symptoms privately and free.", keywords: [] },
    ar: { title: "أنشئ حسابك", description: "ابدأ تتبّع أعراض الفيبروميالغيا بخصوصية ومجانًا.", keywords: [] },
  },
};

/** Build localized route metadata (title/description/OG/alternates). */
export function buildMetadata({ page, locale, path }: SeoPageInput): Metadata {
  const copy = COPY[page][locale];
  const other: Locale = locale === "en" ? "ar" : "en";
  const url = `${SITE_URL}${path ?? (page === "home" ? "" : `/${page}`)}`;

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}${path ?? (page === "home" ? "" : `/${page}`)}`,
        ar: `${SITE_URL}${path ?? (page === "home" ? "" : `/${page}`)}`,
        "x-default": `${SITE_URL}${path ?? ""}`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url,
      siteName: "FibroCare",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? "en_US" : "ar_SA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: copy.title,
      description: copy.description,
    },
    robots: page === "login" || page === "signup" || page === "reports"
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/** Schema.org JSON-LD for a fibromyalgia content page, in either locale. */
export function buildMedicalWebPageJsonLd(page: SeoPageInput["page"], locale: Locale) {
  const copy = COPY[page][locale];
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: copy.title,
    description: copy.description,
    inLanguage: locale === "ar" ? "ar" : "en",
    url: SITE_URL,
    about: { "@type": "MedicalCondition", name: "Fibromyalgia", alternateName: locale === "ar" ? "الفيبروميالغيا" : undefined },
    lastReviewed: new Date().toISOString().slice(0, 10),
  };
}

/** Schema.org JSON-LD for a guided exercise (used on somatic pages). */
export function buildExerciseActionJsonLd(exerciseName: string, minutes: number, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseAction",
    name: exerciseName,
    duration: `PT${minutes}M`,
    inLanguage: locale === "ar" ? "ar" : "en",
    instrument: { "@type": "MedicalCondition", name: "Fibromyalgia" },
  };
}
