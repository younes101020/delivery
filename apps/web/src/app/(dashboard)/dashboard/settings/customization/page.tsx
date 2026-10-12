"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/app/_components/ui/badge";
import { PageDescription } from "@/app/_components/ui/page-description";
import { PageTitle } from "@/app/_components/ui/page-title";
import { applyTheme, getTheme, THEME_STORAGE_KEY, themes, type ThemeId, type ThemeSelection } from "@/app/_lib/theme";

const DEFAULT_CUSTOM_COLOR = "#f97316";

export default function CustomizationPage() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeSelection>("lakoun");
  const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);

  useEffect(() => {
    const savedSelection = window.localStorage.getItem(THEME_STORAGE_KEY);
    const theme = getTheme(savedSelection);
    setSelectedTheme(theme.id);
    applyTheme(theme.id);

    if (theme.id.startsWith("custom:"))
      setCustomColor(theme.id.slice("custom:".length));
  }, []);

  function selectTheme(themeId: ThemeId) {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  }

  function selectCustomColor(color: string) {
    const selection = `custom:${color}` as const;
    setCustomColor(color);
    setSelectedTheme(selection);
    applyTheme(selection);
    window.localStorage.setItem(THEME_STORAGE_KEY, selection);
  }

  const customTheme = getTheme(`custom:${customColor}`);
  const isCustomSelected = selectedTheme.startsWith("custom:");
  const currentTheme = getTheme(selectedTheme);

  return (
    <section className="border bg-background/50 p-5">
      <PageTitle>Customization</PageTitle>
      <PageDescription>Choose a color palette for your Delivery dashboard.</PageDescription>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="text-sm font-semibold">Current theme: {currentTheme.name}</h2>
        <div className="flex gap-2">
          <Badge>Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
        </div>
      </div>

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
            </button>
          );
        })}

        <div className={`rounded-none border p-4 transition-colors ${isCustomSelected ? "border-primary" : "border-border"}`}>
          <div className="flex items-center justify-between">
            <span className="font-semibold">Custom</span>
            {isCustomSelected && <Check className="size-4 text-primary" aria-label="Selected" />}
          </div>
          <div className="mt-4 flex gap-2" aria-label="Custom color preview">
            <span className="h-8 flex-1" style={{ backgroundColor: `hsl(${customTheme.primary})` }} />
            <span className="h-8 flex-1" style={{ backgroundColor: `hsl(${customTheme.secondary})` }} />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <label htmlFor="custom-primary-color" className="text-sm">Primary color</label>
            <input
              id="custom-primary-color"
              type="color"
              value={customColor}
              onChange={event => selectCustomColor(event.target.value)}
              className="h-9 w-14 cursor-pointer border border-input bg-transparent p-1"
              aria-label="Choose your primary color"
            />
            <span className="text-sm text-muted-foreground uppercase">{customColor}</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Secondary color is generated automatically.</p>
        </div>
      </div>
    </section>
  );
}
