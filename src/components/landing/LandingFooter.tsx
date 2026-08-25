"use client";

import * as React from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HeartIcon } from "@hugeicons/core-free-icons";
import { useLanguage } from "@/context/LanguageContext";

export function LandingFooter() {
  const { t } = useLanguage();
  // True only after hydration: the server snapshot is `false` and the client
  // snapshot `true`, so React flips `mounted` right after mount — without a
  // setState-in-effect (which the react-hooks rule forbids).
  const mounted = React.useSyncExternalStore(
    React.useCallback((onStoreChange: () => void) => {
      onStoreChange();
      return () => {};
    }, []),
    () => true,
    () => false
  );

  const RESOURCE_LINKS = [
    { href: "/resources/about", label: mounted ? t("landing.footer.about") : "عن الفيبروميالجيا" },
    { href: "/resources/diagnosis", label: mounted ? t("landing.footer.diagnosis") : "الحصول على التشخيص" },
    { href: "/resources/treatment", label: mounted ? t("landing.footer.treatment") : "خيارات العلاج" },
    { href: "/resources/exercises", label: mounted ? t("landing.footer.exercises") : "حركة لطيفة" },
    { href: "/resources/nutrition", label: mounted ? t("landing.footer.nutrition") : "التغذية" },
    { href: "/resources/faq", label: mounted ? t("landing.footer.faq") : "الأسئلة الشائعة" },
  ];

  const PRODUCT_LINKS = [
    { href: "/signup", label: mounted ? t("landing.start") : "ابدأ تسجيلك اليومي" },
    { href: "/login", label: mounted ? t("landing.signIn") : "تسجيل الدخول" },
    { href: "/resources", label: mounted ? t("landing.footer.resources") : "الموارد" },
    { href: "/privacy", label: mounted ? t("landing.footer.privacy") : "سياسة الخصوصية" },
    { href: "/terms", label: mounted ? t("landing.footer.terms") : "شروط الخدمة" },
  ];

  return (
    <footer className="relative z-10 w-full border-t border-border/40 bg-background py-12 md:py-16 mt-auto">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full min-w-0"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <HugeiconsIcon icon={HeartIcon} className="h-4 w-4 text-emerald-400" aria-hidden="true" />
              </span>
              <span className="whitespace-nowrap text-lg font-semibold tracking-tight text-foreground">
                FibroCare
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {mounted ? t("landing.footer.tagline") : "رفيق لطيف وخاص للحياة مع الفيبروميالجيا. ليس جهازًا طبيًا ولا بديلًا أبدًا عن فريق رعايتك."}
            </p>
          </div>

          <nav aria-label="Resources">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
              {mounted ? t("landing.footer.resources") : "الموارد"}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Product">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-foreground">
              {mounted ? t("landing.footer.product") : "المنتج"}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center">
          <p className="text-[13px] text-muted-foreground">
            {mounted
              ? `${t("landing.footer.copyright", { year: 2026 })} ${t("landing.footer.madeWith")}`
              : "© 2026 فيبروكير. صُنع بعناية."}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {mounted
              ? t("landing.footer.disclaimer")
              : "ليس أداة تشخيصية. إذا كنت في حالة طوارئ، يرجى التواصل مع خدمات الطوارئ المحلية."}
          </p>
        </div>
      </div>
    </footer>
  );
}