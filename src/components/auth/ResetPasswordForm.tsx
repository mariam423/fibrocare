"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/auth/PasswordField";
import { resetPassword } from "@/app/actions";

interface ResetPasswordFormProps {
  token?: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!token) {
    return (
      <div className="space-y-6" role="alert">
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          This reset link is invalid or has expired. Please request a new one.
        </p>
        <p className="text-center text-base text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(token, password);

      if (!result.success) {
        setError(result.error);
        return;
      }

      setIsDone(true);
    });
  };

  if (isDone) {
    return (
      <div className="space-y-6" role="status" aria-live="polite">
        <div className="flex items-start gap-3 rounded-2xl bg-primary/10 px-4 py-4 text-primary">
          <KeyRound className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold text-foreground">
              Your password has been updated
            </p>
            <p className="text-base text-muted-foreground">
              You can now sign in with your new password.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex h-12 w-full shrink-0 items-center justify-center rounded-xl border border-transparent bg-primary text-base font-semibold text-primary-foreground transition-all outline-none select-none hover:bg-primary/80 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <PasswordField
        id="password"
        label="New password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        describedBy="reset-password-hint"
      />
      <p
        id="reset-password-hint"
        className="text-sm leading-relaxed text-muted-foreground"
      >
        Use at least 8 characters. A mix of letters and numbers is a good idea.
      </p>

      <PasswordField
        id="confirm-password"
        label="Confirm new password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        describedBy={error ? "reset-error" : undefined}
        invalid={!!error}
      />

      {error && (
        <p
          id="reset-error"
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
            <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
            Updating...
          </>
        ) : (
          "Update password"
        )}
      </Button>

      <p className="text-center text-base text-muted-foreground">
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
