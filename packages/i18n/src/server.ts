import "server-only";

import type { Dictionary, Locale } from "./index.js";

import de from "./dictionaries/de.js";
import es from "./dictionaries/es.js";
import en from "./dictionaries/en.json" with { type: "json" };

function mergeDictionary(overlay: { [K in keyof Dictionary]?: Partial<Dictionary[K]> }): Dictionary {
  return Object.fromEntries(Object.entries(en).map(([key, value]) => [key, { ...value, ...overlay[key as keyof Dictionary] }])) as unknown as Dictionary;
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json", { with: { type: "json" } })
    .then(module => module.default),
  fr: () => import("./dictionaries/fr.json", { with: { type: "json" } })
    .then(module => module.default),
  es: async () => mergeDictionary(es),
  de: async () => mergeDictionary(de),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
