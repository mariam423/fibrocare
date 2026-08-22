"use client";

import React, { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  SaveIcon,
  Loading01Icon,
  UserIcon,
  ZapIcon,
  File01Icon,
  LockIcon,
  Shield01Icon,
  Logout01Icon,
  FastWindIcon,
} from "@hugeicons/core-free-icons";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { RouteTransition } from "@/components/ui/RouteTransition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DepthCard } from "@/components/ui/DepthCard";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";
import { useHealth } from "@/context/HealthContext";
import { usePrivacy } from "@/components/auth/PrivacyLock";
import { getCurrentUser, updateUserName, getStreak, getAllHealthLogs } from "../actions";
import AppHeader from "@/components/layout/AppHeader";
import { PrivacySecurityCard } from "@/components/settings/PrivacySecurityCard";
import { PricingModal } from "@/components/pricing/PricingModal";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const { motionEnabled, setMotionEnabled } = useHealth();
  const { isEnabled, lock, disable, setPin } = usePrivacy();
  const [name, setName] = useState("");
  const [pricingOpen, setPricingOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [streak, setStreak] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [pinBusy, setPinBusy] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [user, currentStreak, logs] = await Promise.all([
          getCurrentUser(),
          getStreak(),
          getAllHealthLogs(),
        ]);
        if (!user) {
          window.location.assign("/login");
          return;
        }
        setName(user.name);
        setEmail(user.email);
        setStreak(currentStreak);
        setTotalLogs(logs.length);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsFetching(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);
    try {
      const result = await updateUserName(name);
      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert(result.error || t("profile.updateFailed"));
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(t("profile.updateError"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <RouteTransition>
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p>{t("profile.loading")}</p>
        </div>
      </div>
      </RouteTransition>
    );
  }

  return (
    <RouteTransition>
    <div className="min-h-[100dvh] text-foreground transition-colors duration-500">
      <AppHeader backHref="/dashboard" />

      <main className="pb-16 px-4 sm:px-6 lg:px-8 space-y-8 max-w-2xl mx-auto">
        {/* Hero Header */}
        <ScrollReveal as="section" className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {t("profile.pageTitle")}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t("profile.pageSubtitle")}
          </p>
        </ScrollReveal>

        {/* Profile Overview Card */}
        <DepthCard tilt={3} delay={0.05}>
        <Card className="border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/40 to-secondary/60" />
          <CardContent className="pt-0 relative">
            <div className="flex flex-col items-center -mt-12 pb-6 text-center">
              {/* Ambient glow orb behind avatar */}
              <div className="relative">
                <div className="absolute inset-0 -m-6 rounded-full bg-emerald-500/10 blur-[100px]" aria-hidden="true" />
                {/* Gradient border ring */}
                <div className="relative h-24 w-24 rounded-full p-[3px] bg-gradient-to-b from-emerald-500/30 to-transparent">
                  <div className="h-full w-full rounded-full bg-card shadow-md flex items-center justify-center">
                    <HugeiconsIcon icon={UserIcon} className="h-12 w-12 text-primary" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-white">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary">
                <div className="p-2 rounded-lg bg-primary/15">
                  <HugeiconsIcon icon={ZapIcon} className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-medium opacity-70">{t("profile.streakLabel")}</p>
                  <p className="text-xl font-bold">{t("profile.days", { count: streak })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-800">
                  <HugeiconsIcon icon={File01Icon} className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-medium opacity-70">{t("profile.totalLogsLabel")}</p>
                  <p className="text-xl font-bold">{totalLogs}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </DepthCard>

        {/* Update Name Card */}
        <DepthCard delay={0.1} hover={false}>
        <Card className="border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl text-zinc-900 dark:text-white font-semibold">{t("profile.accountTitle")}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("profile.accountDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="display-name"
                  className="text-sm font-medium text-zinc-900 dark:text-white"
                >
                  {t("profile.displayNameLabel")}
                </label>
                <Input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.displayNamePlaceholder")}
                  className="bg-zinc-100/80 dark:bg-white/5 border border-zinc-300 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-xl shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isLoading ? (
                    <>
                      <HugeiconsIcon icon={Loading01Icon} className="me-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      {t("profile.saving")}
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={SaveIcon} className="me-2 h-5 w-5" aria-hidden="true" />
                      {t("profile.saveChanges")}
                    </>
                  )}
                </Button>

                {showSuccess && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-center text-primary font-medium animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    &#10003; {t("profile.nameUpdated")}
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        </DepthCard>

        {/* Motion & Comfort Card */}
        <DepthCard delay={0.15} hover={false}>
        <Card className="border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-zinc-900 dark:text-white font-semibold">
              <HugeiconsIcon icon={FastWindIcon} className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("profile.motionTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("profile.motionDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  {t("profile.gentleMotion")}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {motionEnabled
                    ? t("profile.motionOn")
                    : t("profile.motionOff")}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={motionEnabled}
                aria-label={t("profile.motionToggleAria")}
                onClick={() => setMotionEnabled(!motionEnabled)}
                className={cn(
                  "relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:ring-offset-2 cursor-pointer",
                  motionEnabled
                    ? "bg-primary"
                    : "bg-muted ring-1 ring-border"
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute start-1 top-1 h-6 w-6 rounded-full bg-card shadow-md ring-1 ring-border transition-transform duration-300",
                    motionEnabled && "ltr:translate-x-6 rtl:-translate-x-6"
                  )}
                />
              </button>
            </div>
          </CardContent>
        </Card>
        </DepthCard>

        {/* Privacy Lock Card */}
        <DepthCard delay={0.2} hover={false}>
        <Card className="border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-zinc-900 dark:text-white font-semibold">
              <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("profile.privacyTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEnabled
                ? t("profile.privacyDescOn")
                : t("profile.privacyDescOff")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEnabled ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="privacy-pin"
                    className="text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    {t("profile.newPinLabel")}
                  </label>
                  <Input
                    id="privacy-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="••••"
                    className="bg-zinc-100/80 dark:bg-white/5 border border-zinc-300 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (newPin.length !== 4) return;
                    setPinBusy(true);
                    await setPin(newPin);
                    setNewPin("");
                    setPinBusy(false);
                  }}
                  disabled={newPin.length !== 4 || pinBusy}
                  className="bg-primary hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  {pinBusy ? (
                    <HugeiconsIcon icon={Loading01Icon} className="me-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <HugeiconsIcon icon={LockIcon} className="me-2 h-5 w-5" aria-hidden="true" />
                  )}
                  {t("profile.enableLock")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="change-pin"
                    className="text-sm font-medium text-zinc-900 dark:text-white"
                  >
                    {t("profile.changePinLabel")}
                  </label>
                  <Input
                    id="change-pin"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    pattern="\d{4}"
                    value={newPin}
                    onChange={(e) =>
                      setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder={t("profile.changePinPlaceholder")}
                    className="bg-zinc-100/80 dark:bg-white/5 border border-zinc-300 dark:border-white/10 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={async () => {
                      if (newPin.length !== 4) return;
                      setPinBusy(true);
                      await setPin(newPin);
                      setNewPin("");
                      setPinBusy(false);
                    }}
                    disabled={newPin.length !== 4 || pinBusy}
                    className="bg-primary hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <HugeiconsIcon icon={LockIcon} className="me-2 h-5 w-5" aria-hidden="true" />
                    {t("profile.update")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => disable()}
                    className="text-destructive hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Shield01Icon} className="me-2 h-5 w-5" aria-hidden="true" />
                    {t("profile.disableLock")}
                  </Button>
                  <Button variant="ghost" onClick={lock}>
                    {t("profile.lockNow")}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </DepthCard>

        {/* Privacy & Security Card */}
        <PrivacySecurityCard />

        {/* Plans & pricing */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setPricingOpen(true)}
            className="rounded-xl border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {t("profile.pricing")}
          </button>
        </div>
        <PricingModal
          open={pricingOpen}
          onClose={() => setPricingOpen(false)}
          checkoutUrl={process.env.NEXT_PUBLIC_CHECKOUT_URL}
        />

        {/* Social Sign-in Card */}
        <DepthCard delay={0.25} hover={false}>
        <Card className="border border-zinc-200/80 dark:border-white/5 bg-white/70 dark:bg-zinc-900/40 backdrop-blur-md hover:border-emerald-500/20 transition-all duration-300 rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2 text-zinc-900 dark:text-white font-semibold">
              <HugeiconsIcon icon={Logout01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
              {t("profile.signinTitle")}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {t("profile.signinDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  {t("profile.signedInAs", {
                    name: session.user.name || session.user.email || "",
                  })}
                </p>
                <Button variant="outline" onClick={() => signOut()}>
                  <HugeiconsIcon icon={Logout01Icon} className="me-2 h-5 w-5" aria-hidden="true" />
                  {t("profile.signOut")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => signIn("google")}
                  className="flex-1 bg-card text-foreground ring-1 ring-border hover:bg-muted hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  {t("profile.signInGoogle")}
                </Button>
                <Button
                  onClick={() => signIn("github")}
                  className="flex-1 bg-card text-foreground ring-1 ring-border hover:bg-muted hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  {t("profile.signInGithub")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        </DepthCard>
      </main>
    </div>
    </RouteTransition>
  );
}
