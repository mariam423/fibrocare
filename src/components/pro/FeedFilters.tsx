"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

interface FeedFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  const { t } = useLanguage();

  const filters = [
    { id: "all", label: t("doctor.filter.all") },
    { id: "article", label: t("doctor.kind.article") },
    { id: "research", label: t("doctor.kind.research") },
    { id: "status", label: t("doctor.kind.status") },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      {filters.map((f) => (
        <Button
          key={f.id}
          variant={activeFilter === f.id ? "default" : "outline"}
          onClick={() => onFilterChange(f.id)}
          className={cn(
            "rounded-full px-4 py-1 text-xs font-medium transition-all",
            activeFilter === f.id
              ? "bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/50"
              : "border-emerald-500/20 text-muted-foreground hover:border-emerald-500/40 hover:bg-emerald-500/5"
          )}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
