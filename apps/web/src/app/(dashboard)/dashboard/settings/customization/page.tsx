"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { applyTheme, getTheme, THEME_STORAGE_KEY, themes, type ThemeId } from "@/app/_lib/theme";

export default function CustomizationPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>("lakoun");

  useEffect(() => {
    const theme = getTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
    setSelectedTheme(theme.id);
    applyTheme(theme.id);
  }, []);

  function selectTheme(themeId: ThemeId) {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }

  return (
    <section className="border bg-background/50 p-5">
      <PageTitle>Customization</PageTitle>
      <PageDescription>Choose a color palette for your Delivery dashboard.</PageDescription>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Theme">
        {themes.map(theme => {
          const isSelected = selectedTheme === theme.id;

          return (
            <button
              key={theme.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => selectTheme(theme.id)}
              className={`rounded-none border p-4 text-left transition-colors hover:border-primary focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{theme.name}</span>
                {isSelected && <Check className="size-4 text-primary" aria-label="Selected" />}
              </div>
              <div className="mt-4 flex gap-2" aria-label={`${theme.name} color preview`}>
                <span className="h-8 flex-1" style={{ backgroundColor: `hsl(${theme.primary})` }} />
                <span className="h-8 flex-1" style={{ backgroundColor: `hsl(${theme.secondary})` }} />
              </div>
              <div className="mt-4 flex gap-2">
                <span className="bg-primary px-3 py-1 text-sm text-primary-foreground">Primary</span>
                <span className="bg-secondary px-3 py-1 text-sm text-secondary-foreground">Secondary</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}


