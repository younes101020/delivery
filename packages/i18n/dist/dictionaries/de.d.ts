import type { Dictionary } from "../index.js";
type DictionaryOverlay = {
    [K in keyof Dictionary]?: Partial<Dictionary[K]>;
};
declare const dictionary: DictionaryOverlay;
export default dictionary;
//# sourceMappingURL=de.d.ts.map