import "server-only";

import type { Dictionary, Locale } from "./index.js";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("./dictionaries/en.json", { with: { type: "json" } })
    .then(module => module.default),
  fr: () => import("./dictionaries/fr.json", { with: { type: "json" } })
    .then(module => module.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
