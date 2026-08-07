"use client";

import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type AppTheme = "Standard" | "Sensitive";

interface HealthContextType {
  currentPainLevel: number;
  isFlareUp: boolean;
  activeTheme: AppTheme;
  motionEnabled: boolean;
  isDark: boolean;
  setPainLevel: (level: number) => void;
  setTheme: (theme: AppTheme) => void;
  setMotionEnabled: (enabled: boolean) => void;
  toggleDark: () => void;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [currentPainLevel, setCurrentPainLevel] = useState(3);
  const [activeTheme, setActiveTheme] = useLocalStorage<AppTheme>("fibrocare:theme", "Standard");
  const [motionEnabled, setMotionEnabled] = useLocalStorage<boolean>("fibrocare:motion", true);
  const [isDark, setIsDark] = useLocalStorage<boolean>("fibrocare:dark", false);

  // Derived during render — no effect needed
  const isFlareUp = currentPainLevel >= 7;

  const setPainLevel = useCallback((level: number) => {
    setCurrentPainLevel(level);
  }, []);

  const setTheme = useCallback(
    (theme: AppTheme) => {
      setActiveTheme(theme);
    },
    [setActiveTheme]
  );

  const toggleDark = useCallback(() => {
    setIsDark((prev) => !prev);
  }, [setIsDark]);

  return (
    <HealthContext.Provider
      value={{
        currentPainLevel,
        isFlareUp,
        activeTheme,
        motionEnabled,
        isDark,
        setPainLevel,
        setTheme,
        setMotionEnabled,
        toggleDark,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (context === undefined) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
}
