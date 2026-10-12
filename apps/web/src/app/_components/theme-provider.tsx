"use client";

import { useEffect } from "react";

import { applyTheme, isValidThemeSelection, THEME_STORAGE_KEY } from "@/app/_lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function applyStoredTheme() {
      const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
      const selection = isValidThemeSelection(savedTheme) ? savedTheme : null;
      applyTheme(selection);

      if (savedTheme && !selection)
        window.localStorage.removeItem(THEME_STORAGE_KEY);
    }

    applyStoredTheme();

    const observer = new MutationObserver(applyStoredTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return children;
}
