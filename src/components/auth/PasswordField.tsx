"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: "current-password" | "new-password";
  describedBy?: string;
  invalid?: boolean;
}

/**
 * Accessible password input with a large show/hide toggle.
 *
 * The toggle announces its state with `aria-pressed` and `aria-label`, and
 * the input links to any helper/error text via `aria-describedby`.
 */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  describedBy,
  invalid = false,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-base font-medium text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-12 w-full rounded-xl px-4 pr-12 text-base md:text-base"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          className="absolute right-1 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {visible ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  );
}
