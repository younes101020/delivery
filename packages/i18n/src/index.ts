import "server-only";

const dictionaries = {
  en: () => import("./dictionaries/en.json", { with: { type: "json" } })
    .then(module => module.default),
  fr: () => import("./dictionaries/fr.json", { with: { type: "json" } })
    .then(module => module.default),
};

export type Locale = keyof typeof dictionaries;

export function hasLocale(locale: string): locale is Locale {
  return locale in dictionaries;
}

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
