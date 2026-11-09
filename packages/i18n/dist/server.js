import "server-only";
import de from "./dictionaries/de.js";
import en from "./dictionaries/en.json" with { type: "json" };
import es from "./dictionaries/es.js";
function mergeDictionary(overlay) {
    return Object.fromEntries(Object.entries(en).map(([key, value]) => [key, { ...value, ...overlay[key] }]));
}
const dictionaries = {
    en: () => import("./dictionaries/en.json", { with: { type: "json" } })
        .then(module => module.default),
    fr: () => import("./dictionaries/fr.json", { with: { type: "json" } })
        .then(module => module.default),
    es: async () => mergeDictionary(es),
    de: async () => mergeDictionary(de),
};
export async function getDictionary(locale) {
    return dictionaries[locale]();
}
//# sourceMappingURL=server.js.map