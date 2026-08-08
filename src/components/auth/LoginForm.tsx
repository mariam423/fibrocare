"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/PasswordField";

interface LoginFormProps {
  callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    startTransition(async () => {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError("Incorrect email or password. Please try again.");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-base font-medium text-foreground"
        >
          Email address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby={error ? "login-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="h-12 w-full rounded-xl px-4 text-base md:text-base"
        />
      </div>

      <PasswordField
        id="password"
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        describedBy={error ? "login-error" : undefined}
        invalid={!!error}
      />

      {error && (
        <p
          id="login-error"
          role="alert"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-base font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Forgot your password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="h-12 w-full rounded-xl text-base font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-center text-base text-muted-foreground">
        New to FibroCare?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
