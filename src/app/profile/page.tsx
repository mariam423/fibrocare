"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, User, Zap, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUser, updateUserName, getStreak, getAllHealthLogs } from "../actions";
import AppHeader from "@/components/layout/AppHeader";

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [streak, setStreak] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const [user, currentStreak, logs] = await Promise.all([
          getCurrentUser(),
          getStreak(),
          getAllHealthLogs(),
        ]);
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                  <User className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h2 className="mt-4 text-2xl font-bold">{name}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 text-primary">
                <div className="p-2 rounded-lg bg-primary/15">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium uppercase tracking-wider opacity-70">Streak</p>
                  <p className="text-xl font-bold">{streak} Days</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300">
                <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-800">
                  <FileText className="h-5 w-5" />
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
                  className="w-full py-6 text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all rounded-xl shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
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
      </main>
    </div>
  );
}
