"use client";

import React from "react";
import { Wind, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecoveryCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  actionLabel: string;
  onAction: () => void;
  color: "purple" | "teal" | "orange";
}

const colorMap = {
  purple: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
  teal: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
  orange: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
};

export function RecoveryCard({ title, description, icon: Icon, actionLabel, onAction, color }: RecoveryCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-2xl border transition-all hover:ring-2 hover:ring-purple-400",
      colorMap[color]
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/50 dark:bg-slate-900/50">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs opacity-80 mb-3">{description}</p>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAction}
            className="h-7 px-3 text-xs font-medium hover:bg-white/20"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RecoveryPanel({ onZen, onSensitive }: { onZen: () => void, onSensitive: () => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      <RecoveryCard
        title="Sensory Rest"
        description="Dim the screen and disable animations for a moment."
        icon={Moon}
        actionLabel="Activate Sensitive Mode"
        onAction={onSensitive}
        color="purple"
      />
      <RecoveryCard
        title="Mindful Breath"
        description="A 3-minute guided breathing session to lower stress."
        icon={Wind}
        actionLabel="Open Zen Portal"
        onAction={onZen}
        color="teal"
      />
    </div>
  );
}
