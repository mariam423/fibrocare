"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useHealth } from "@/context/HealthContext";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { BreathingBubble } from "@/components/zen/BreathingBubble";
import { SoundscapeMixer } from "@/components/zen/SoundscapeMixer";

export default function ZenPage() {
  const router = useRouter();
  const { setTheme } = useHealth();
  const [isUltraDark, setIsUltraDark] = useState(false);

  const toggleUltraDark = () => {
    setIsUltraDark((prev) => !prev);
  };

  return (
    <div
      id="main-content"
      className={cn(
        "min-h-screen flex flex-col items-center justify-center transition-colors duration-1000 p-4",
        isUltraDark ? "bg-black text-white" : "bg-slate-900 text-slate-200"
      )}
    >
      {!isUltraDark && (
        <header className="absolute top-0 w-full p-6 flex justify-between items-center text-slate-400">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Focus on your breath</span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleUltraDark}
              aria-pressed={isUltraDark}
              className="rounded-full border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              <HugeiconsIcon
                icon={Moon02Icon}
                className="h-4 w-4 mr-2"
                aria-hidden="true"
              />{" "}
              Ultra Dark
            </Button>
          </div>
        </header>
      )}

      {isUltraDark && (
        <header className="absolute top-0 w-full p-6 flex justify-end text-slate-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleUltraDark}
            aria-pressed={isUltraDark}
            className="rounded-full hover:bg-slate-800"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="h-4 w-4 mr-2"
              aria-hidden="true"
            />
            Exit Ultra Dark
          </Button>
        </header>
      )}

      <div className="relative flex flex-col items-center justify-center space-y-12">
        <BreathingBubble ultraDark={isUltraDark} />

        {!isUltraDark && (
          <>
            <SoundscapeMixer />
            <Button
              variant="ghost"
              onClick={() => setTheme("Sensitive")}
              className="text-slate-500 hover:text-white"
            >
              Switch to Calming Mode
            </Button>
          </>
        )}

        {isUltraDark && (
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-400"
          >
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
