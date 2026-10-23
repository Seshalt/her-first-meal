export type Dictionary = Record<string, string>;
export type Translate = <T>(value: T) => T;
const translators = new WeakMap<Dictionary, Translate>();

export function contentTranslator(dictionary: Dictionary): Translate {
  const cached = translators.get(dictionary);
  if (cached) return cached;
  const patterns = Object.entries(dictionary).filter(([key]) => /\{v\d+\}/.test(key)).map(([key, translated]) => {
    const variables: string[] = [];
    const expression = key.split(/(\{v\d+\})/).map((part) => {
      if (/^\{v\d+\}$/.test(part)) { variables.push(part); return "(.*?)"; }
      return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }).join("");
    return { regex: new RegExp(`^${expression}$`, "s"), variables, translated };
  });
  const translate: Translate = <T,>(value: T): T => {
    if (typeof value !== "string") return value;
    const source = value.trim();
    const normalized = source.replace(/\s+/g, " ");
    const capitalized = source.charAt(0).toUpperCase() + source.slice(1);
    const key = [source, normalized, capitalized].find((candidate) => Object.hasOwn(dictionary, candidate));
    let translated = key ? dictionary[key] : undefined;
    if (!translated) {
      for (const pattern of patterns) {
        const match = source.match(pattern.regex);
        if (!match) continue;
        translated = pattern.translated.replace(/\{v\d+\}/g, (variable) => {
          const index = pattern.variables.indexOf(variable);
          return index < 0 ? variable : match[index + 1];
        });
        break;
      }
    }
    if (!translated && source.includes(" · ")) {
      const parts = source.split(" · ");
      const values = parts.map((part) => translate(part));
      if (values.some((part, index) => part !== parts[index])) translated = values.join(" · ");
    }
    return (translated ? value.slice(0, value.indexOf(source)) + translated + value.slice(value.indexOf(source) + source.length) : value) as T;
  };
  translators.set(dictionary, translate);
  return translate;
}

