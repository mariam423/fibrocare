import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Readex_Pro } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import "../styles/themes.css";
import { HealthProvider } from "@/context/HealthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { NotificationProvider } from "@/lib/notifications";
import { LOCALE_COOKIE, parseLocale } from "@/lib/locale";
import { translations, type Locale } from "@/lib/translations";
import { AiStatusProvider } from "@/context/AiStatusContext";
import { PrivacyProvider, PrivacyGate } from "@/components/auth/PrivacyLock";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { AmbientAurora } from "@/components/ui/AmbientAurora";
import ThemeManager from "@/components/ThemeManager";
import { PwaPrompt } from "@/components/pwa/PwaPrompt";

const readexPro = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale: Locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const t = translations[locale];
  const isAr = locale === "ar";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const ogImageEn = {
    url: `${baseUrl}/og?lang=en`,
    width: 1200,
    height: 630,
    alt: translations.en["meta.ogImageAlt"],
  };
  const ogImageAr = {
    url: `${baseUrl}/og?lang=ar`,
    width: 1200,
    height: 630,
    alt: translations.ar["meta.ogImageAlt"],
  };

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t["meta.title"],
      template: isAr ? "%s | فيبروكير" : "%s | FibroCare",
    },
    description: t["meta.description"],
    manifest: "/manifest.json",
    applicationName: "FibroCare",
    appleWebApp: {
      capable: true,
      title: "FibroCare",
      statusBarStyle: "black-translucent",
    },
    formatDetection: {
      telephone: false,
    },
    icons: {
      icon: [
        { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
      type: "website",
      siteName: "FibroCare",
      url: "/",
      title: t["meta.ogTitle"],
      description: t["meta.ogDescription"],
      locale: isAr ? "ar_AR" : "en_US",
      alternateLocale: isAr ? "en_US" : "ar_AR",
      images: [ogImageEn, ogImageAr],
    },
    twitter: {
      card: "summary_large_image",
      title: t["meta.ogTitle"],
      description: t["meta.ogDescription"],
      images: [ogImageEn, ogImageAr],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3B6B48" },
    { media: "(prefers-color-scheme: dark)", color: "#0B101B" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // SSR-aware locale: read the persisted preference from the cookie so the
  // server renders the same lang/dir/translated strings the client will
  // hydrate with — eliminating the hydration mismatch that a client-only
  // localStorage read caused.
  const locale = parseLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${readexPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning={true}>
        <AmbientAurora />
        <PwaPrompt />
        <HealthProvider>
          <LanguageProvider initialLocale={locale}>
            <NotificationProvider>
              <ThemeManager />
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[200] focus:bg-card focus:text-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
              >
                Skip to main content
              </a>
              <PrivacyProvider>
                <SessionProvider>
                  <AiStatusProvider>
                    <PrivacyGate>
                      <main id="main-content" className="pt-20 sm:pt-24 pb-16">
                        {children}
                      </main>
                    </PrivacyGate>
                  </AiStatusProvider>
                </SessionProvider>
              </PrivacyProvider>
              <Toaster richColors position="bottom-right" />
            </NotificationProvider>
          </LanguageProvider>
        </HealthProvider>
      </body>
    </html>
  );
}
