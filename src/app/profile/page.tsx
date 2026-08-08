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
} from "@hugeicons/core-free-icons";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePrivacy } from "@/components/auth/PrivacyLock";
import { getCurrentUser, updateUserName, getStreak, getAllHealthLogs } from "../actions";
import AppHeader from "@/components/layout/AppHeader";

export default function ProfilePage() {
  const { data: session } = useSession();
  const { isEnabled, lock, disable, setPin } = usePrivacy();
  const [name, setName] = useState("");
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
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong while saving your profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <AppHeader backHref="/" />

      <main id="main-content" className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-2xl">
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            User Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account details and track your progress.
          </p>
        </section>

        {/* Profile Overview Card */}
        <Card className="border-none shadow-sm bg-card ring-1 ring-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary/40 to-secondary/60" />
          <CardContent className="pt-0 relative">
            <div className="flex flex-col items-center -mt-12 pb-6 text-center">
              <div className="h-24 w-24 rounded-full bg-card p-1 shadow-md ring-4 ring-border">
                <div className="h-full w-full rounded-full bg-primary/15 flex items-center justify-center">
                  <HugeiconsIcon icon={UserIcon} className="h-12 w-12 text-primary" aria-hidden="true" />
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary">
                <div className="p-2 rounded-lg bg-primary/15">
                  <HugeiconsIcon icon={ZapIcon} className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-70">Streak</p>
                  <p className="text-xl font-bold">{streak} Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-800">
                  <HugeiconsIcon icon={File01Icon} className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-70">Total Logs</p>
                  <p className="text-xl font-bold">{totalLogs}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Update Name Card */}
        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-xl">Account Settings</CardTitle>
            <CardDescription className="text-muted-foreground">
              Customize how your name appears in the app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="display-name"
                  className="text-sm font-medium text-foreground"
                >
                  Display Name
                </label>
                <Input
                  id="display-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="bg-muted border-border"
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-14 text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-xl shadow-md"
                >
                  {isLoading ? (
                    <>
                      <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={SaveIcon} className="mr-2 h-5 w-5" aria-hidden="true" />
                      Save Changes
                    </>
                  )}
                </Button>

                {showSuccess && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="text-center text-primary font-medium animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    &#10003; Name updated successfully!
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Privacy Lock Card */}
        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
              Privacy Lock
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isEnabled
                ? "A 4-digit PIN protects your logs. The app locks automatically when you leave the tab."
                : "Protect your sensitive health data with a 4-digit PIN."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isEnabled ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="privacy-pin"
                    className="text-sm font-medium text-foreground"
                  >
                    New 4-digit PIN
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
                    className="bg-muted border-border"
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
                  className="bg-primary hover:bg-primary/90"
                >
                  {pinBusy ? (
                    <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                  ) : (
                    <HugeiconsIcon icon={LockIcon} className="mr-2 h-5 w-5" aria-hidden="true" />
                  )}
                  Enable Lock
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1 space-y-2">
                  <label
                    htmlFor="change-pin"
                    className="text-sm font-medium text-foreground"
                  >
                    Change PIN
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
                    placeholder="New 4-digit PIN"
                    className="bg-muted border-border"
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
                    className="bg-primary hover:bg-primary/90"
                  >
                    <HugeiconsIcon icon={LockIcon} className="mr-2 h-5 w-5" aria-hidden="true" />
                    Update
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => disable()}
                    className="text-destructive hover:text-destructive"
                  >
                    <HugeiconsIcon icon={Shield01Icon} className="mr-2 h-5 w-5" aria-hidden="true" />
                    Disable Lock
                  </Button>
                  <Button variant="ghost" onClick={lock}>
                    Lock Now
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Social Sign-in Card */}
        <Card className="border-none shadow-sm bg-card ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <HugeiconsIcon icon={Logout01Icon} className="h-5 w-5 text-primary" aria-hidden="true" />
              Account Sign-in
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in with a social provider to access FibroCare across devices.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session?.user ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Signed in as{" "}
                  <span className="font-semibold text-foreground">
                    {session.user.name || session.user.email}
                  </span>
                </p>
                <Button variant="outline" onClick={() => signOut()}>
                  <HugeiconsIcon icon={Logout01Icon} className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => signIn("google")}
                  className="flex-1 bg-card text-foreground ring-1 ring-border hover:bg-muted"
                >
                  Sign in with Google
                </Button>
                <Button
                  onClick={() => signIn("github")}
                  className="flex-1 bg-card text-foreground ring-1 ring-border hover:bg-muted"
                >
                  Sign in with GitHub
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
