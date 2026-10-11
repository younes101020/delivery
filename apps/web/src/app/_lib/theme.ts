export const THEME_STORAGE_KEY = "delivery-theme";

export const themes = [
  { id: "lakoun", name: "Lakoun", primary: "24.6 95% 53.1%", secondary: "60 4.8% 95.9%" },
  { id: "ocean", name: "Ocean", primary: "210 85% 45%", secondary: "195 55% 90%" },
  { id: "forest", name: "Forest", primary: "145 55% 34%", secondary: "105 30% 88%" },
  { id: "violet", name: "Violet", primary: "263 70% 55%", secondary: "270 45% 92%" },
  { id: "rose", name: "Rose", primary: "340 75% 50%", secondary: "350 65% 92%" },
] as const;

export type ThemeId = typeof themes[number]["id"];

export function getTheme(themeId: string | null | undefined) {
  return themes.find(theme => theme.id === themeId) ?? themes[0];
}

export function applyTheme(themeId: string | null | undefined) {
  const theme = getTheme(themeId);
  const root = document.documentElement;

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", theme.secondary);
}
