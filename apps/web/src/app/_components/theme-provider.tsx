"use client";

import { useEffect } from "react";

import { applyTheme, THEME_STORAGE_KEY, themes } from "@/app/_lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(savedTheme);

    if (savedTheme && !themes.some(theme => theme.id === savedTheme))
      window.localStorage.removeItem(THEME_STORAGE_KEY);
  }, []);

  return children;
}

