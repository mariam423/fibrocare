"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { translations, type Locale, type TranslationKey } from "@/lib/translations";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, parseLocale } from "@/lib/locale";

export type Translate = (
  key: TranslationKey,
  params?: Record<string, string | number>
) => string;

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translate;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

// Legacy storage key kept for the one-time migration below (the pre-cookie
// implementation persisted the preference in localStorage only).
const LEGACY_STORAGE_KEY = "fibrocare-locale";

function readLegacyPreference(): Locale {
  try {
    return parseLocale(localStorage.getItem(LEGACY_STORAGE_KEY));
  } catch {
    return "en";
  }
}

function writeLocaleCookie(l: Locale) {
  try {
    document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  } catch {
    // Cookies can be blocked in some embedded contexts — the toggle still
    // updates the in-memory locale for the current session.
  }
}

interface LanguageProviderProps {
  children: React.ReactNode;
  /** Server-rendered locale (from the cookie) — the SSR/hydration source of truth. */
  initialLocale?: Locale;
}

export function LanguageProvider({ children, initialLocale }: LanguageProviderProps) {
  // Trust the server-rendered locale first: it comes from the cookie, so it
  // matches exactly what the server rendered — no hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(
    initialLocale ??
      (typeof window === "undefined" ? "en" : readLegacyPreference())
  );

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    writeLocaleCookie(l);
    try {
      localStorage.setItem(LEGACY_STORAGE_KEY, l);
    } catch {}
  }, []);

  // One-time migration: a locale persisted in localStorage before cookies
  // existed has no cookie yet, so SSR would keep rendering English. The
  // initializer above already picks up the legacy preference for state;
  // this effect folds it into the cookie so future server renders agree.
  // Runs post-hydration, so it never triggers a hydration mismatch.
  useEffect(() => {
    if (initialLocale) return; // cookie already present — nothing to migrate
    const legacy = readLegacyPreference();
    if (legacy === "ar") {
      writeLocaleCookie("ar");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      let text: string = translations[locale][key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          text = text.replaceAll(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [locale]
  );

  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
