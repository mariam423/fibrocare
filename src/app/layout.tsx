import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/themes.css";
import { HealthProvider } from "@/context/HealthContext";
import { PrivacyProvider, PrivacyGate } from "@/components/auth/PrivacyLock";
import { SessionProvider } from "@/components/auth/SessionProvider";
import ThemeManager from "@/components/ThemeManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FibroCare - Empathetic Health Companion",
    template: "%s | FibroCare",
  },
  description:
    "A gentle, state-aware space for managing fibromyalgia symptoms, flare-ups, and wellness.",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <HealthProvider>
          <ThemeManager />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-card focus:text-foreground focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
          >
            Skip to main content
          </a>
          <PrivacyProvider>
            <SessionProvider>
              <PrivacyGate>{children}</PrivacyGate>
            </SessionProvider>
          </PrivacyProvider>
        </HealthProvider>
      </body>
    </html>
  );
}
