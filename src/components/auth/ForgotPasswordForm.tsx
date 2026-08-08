"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Loading01Icon,
  MailSend01Icon,
  ExternalLinkIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/app/actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState<string | undefined>(undefined);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    startTransition(async () => {
      const result = await requestPasswordReset(email);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSubmitted(true);
      setResetLink(result.resetLink);
    });
  };

  if (submitted) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <div className="flex items-start gap-3 rounded-2xl bg-primary/10 px-4 py-4 text-primary">
          <HugeiconsIcon
            icon={MailSend01Icon}
            className="mt-0.5 h-6 w-6 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Check your inbox</p>
            <p className="text-base text-muted-foreground">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a
              link to reset your password. It expires in 60 minutes.
            </p>
          </div>
        </div>

        {resetLink && (
          <div className="space-y-2 rounded-2xl border border-dashed border-border bg-card px-4 py-4">
            <p className="text-sm font-medium text-foreground">
              Development link (no email service configured):
            </p>
            <a
              href={resetLink}
              className="flex items-center gap-1.5 break-all text-base font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              <HugeiconsIcon
                icon={ExternalLinkIcon}
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {resetLink}
            </a>
          </div>
        )}

        <p className="text-center text-base text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

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
          aria-describedby={error ? "forgot-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="h-12 w-full rounded-xl px-4 text-base md:text-base"
        />
      </div>

      {error && (
        <p
          id="forgot-error"
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
              className="mr-2 h-5 w-5 animate-spin"
              aria-hidden="true"
            />
            Sending...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <p className="text-center text-base text-muted-foreground">
        Remembered it?{" "}
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
