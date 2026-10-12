export const THEME_STORAGE_KEY = "delivery-theme";

export const themes = [
  { id: "lakoun", name: "Lakoun", primary: "24.6 95% 53.1%", secondary: "60 4.8% 95.9%" },
  { id: "ocean", name: "Ocean", primary: "210 85% 45%", secondary: "195 55% 90%" },
  { id: "forest", name: "Forest", primary: "145 55% 34%", secondary: "105 30% 88%" },
  { id: "violet", name: "Violet", primary: "263 70% 55%", secondary: "270 45% 92%" },
  { id: "rose", name: "Rose", primary: "340 75% 50%", secondary: "350 65% 92%" },
] as const;

export type ThemeId = typeof themes[number]["id"];
export type ThemeSelection = ThemeId | `custom:${string}`;

interface ThemeColors {
  id: ThemeSelection;
  name: string;
  primary: string;
  secondary: string;
}

function hexToHsl(hex: string) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  let saturation = 0;
  const lightness = (max + min) / 2;

  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1));

    if (max === red)
      hue = ((green - blue) / delta) % 6;
    else if (max === green)
      hue = (blue - red) / delta + 2;
    else
      hue = (red - green) / delta + 4;

    hue *= 60;
    if (hue < 0)
      hue += 360;
  }

  return { hue, saturation: saturation * 100, lightness: lightness * 100 };
}

function getCustomTheme(selection: string): ThemeColors | undefined {
  const match = /^custom:(#[\da-f]{6})$/i.exec(selection);
  if (!match)
    return undefined;

  const { hue, saturation, lightness } = hexToHsl(match[1]);
  const primary = `${hue.toFixed(1)} ${saturation.toFixed(1)}% ${lightness.toFixed(1)}%`;

  return {
    id: selection as ThemeSelection,
    name: "Custom",
    primary,
    secondary: `${hue.toFixed(1)} ${Math.min(saturation * 0.45, 45).toFixed(1)}% 92%`,
  };
}

export function getTheme(selection: string | null | undefined): ThemeColors {
  const preset = themes.find(theme => theme.id === selection);
  if (preset)
    return preset;

  if (selection) {
    const customTheme = getCustomTheme(selection);
    if (customTheme)
      return customTheme;
  }

  return themes[0];
}

export function isValidThemeSelection(selection: string | null | undefined) {
  return themes.some(theme => theme.id === selection) || Boolean(selection && getCustomTheme(selection));
}

export function applyTheme(selection: string | null | undefined) {
  const theme = getTheme(selection);
  const root = document.documentElement;
  const customTheme = getCustomTheme(selection ?? "");
  let secondary = theme.secondary;

  if (customTheme && root.classList.contains("dark")) {
    const color = hexToHsl(customTheme.id.slice("custom:".length));
    secondary = `${color.hue.toFixed(1)} ${Math.min(color.saturation * 0.45, 35).toFixed(1)}% 18%`;
  }

  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--secondary", secondary);
}
