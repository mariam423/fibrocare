"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading01Icon,
  UserIcon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { registerUser } from "@/app/actions";

type SignupRole = "PATIENT" | "DOCTOR";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("PATIENT");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await registerUser({
        name,
        email,
        password,
        signupRole,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        setError("Your account was created. Please sign in.");
        router.push("/login");
        return;
      }

      router.push(signupRole === "DOCTOR" ? "/pro/doctor" : "/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Role Selection */}
      <div className="space-y-2" role="group" aria-label="I am a">
        <span className="block text-base font-medium text-foreground">
          I am a
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setSignupRole("PATIENT")}
            className={`group flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all duration-200 ${
              signupRole === "PATIENT"
                ? "border-primary bg-primary/10 text-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
            }`}
            aria-pressed={signupRole === "PATIENT"}
          >
            <HugeiconsIcon
              icon={UserIcon}
              className={`h-6 w-6 transition-colors ${
                signupRole === "PATIENT"
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary/60"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold leading-tight">
              مريض
            </span>
            <span className="text-xs text-muted-foreground">Patient</span>
          </button>

          <button
            type="button"
            onClick={() => setSignupRole("DOCTOR")}
            className={`group flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all duration-200 ${
              signupRole === "DOCTOR"
                ? "border-primary bg-primary/10 text-foreground shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
            }`}
            aria-pressed={signupRole === "DOCTOR"}
          >
            <HugeiconsIcon
              icon={Stethoscope02Icon}
              className={`h-6 w-6 transition-colors ${
                signupRole === "DOCTOR"
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-primary/60"
              }`}
              aria-hidden="true"
            />
            <span className="text-sm font-semibold leading-tight">
              طبيب
            </span>
            <span className="text-xs text-muted-foreground">Doctor</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-base font-medium text-foreground"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          aria-describedby={error ? "signup-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-emerald-500 focus-visible:ring-3 focus-visible:ring-emerald-500/25 md:text-base"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-base font-medium text-foreground"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby={error ? "signup-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="h-12 w-full rounded-xl border border-border bg-card px-4 text-base text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-emerald-500 focus-visible:ring-3 focus-visible:ring-emerald-500/25 md:text-base"
        />
      </div>

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        describedBy="password-hint"
      />
      <p
        id="password-hint"
        className="text-sm leading-relaxed text-muted-foreground"
      >
        Use at least 8 characters. A mix of letters and numbers is a good idea.
      </p>

      <PasswordField
        id="confirm-password"
        label="Confirm password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        describedBy={error ? "signup-error" : undefined}
        invalid={!!error}
      />

      {error && (
        <p
          id="signup-error"
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl text-base font-semibold"
      >
        {isPending ? (
          <>
            <HugeiconsIcon
              icon={Loading01Icon}
              className="ms-2 h-5 w-5 animate-spin"
              aria-hidden="true"
            />
            Creating your account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-base text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
