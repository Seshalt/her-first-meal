export const LOCALES = [
  { id: "en", name: "English", native: "English", dir: "ltr" as const },
  { id: "es", name: "Spanish", native: "Español", dir: "ltr" as const },
  { id: "fr", name: "French", native: "Français", dir: "ltr" as const },
  { id: "de", name: "German", native: "Deutsch", dir: "ltr" as const },
  { id: "it", name: "Italian", native: "Italiano", dir: "ltr" as const },
  { id: "pt", name: "Portuguese", native: "Português", dir: "ltr" as const },
  { id: "ro", name: "Romanian", native: "Română", dir: "ltr" as const },
  { id: "pl", name: "Polish", native: "Polski", dir: "ltr" as const },
  { id: "ru", name: "Russian", native: "Русский", dir: "ltr" as const },
  { id: "uk", name: "Ukrainian", native: "Українська", dir: "ltr" as const },
  { id: "ar", name: "Arabic", native: "العربية", dir: "rtl" as const },
  { id: "hi", name: "Hindi", native: "हिन्दी", dir: "ltr" as const },
  { id: "ko", name: "Korean", native: "한국어", dir: "ltr" as const },
  { id: "zh", name: "Mandarin", native: "普通话", dir: "ltr" as const },
  { id: "yue", name: "Cantonese", native: "廣東話", dir: "ltr" as const },
  { id: "fil", name: "Filipino", native: "Filipino", dir: "ltr" as const },
  { id: "ht", name: "Haitian Creole", native: "Kreyòl Ayisyen", dir: "ltr" as const },
  { id: "vi", name: "Vietnamese", native: "Tiếng Việt", dir: "ltr" as const },
] as const;

export type LocaleId = (typeof LOCALES)[number]["id"];

export const LOCALE_STORAGE = "hfm.locale";
export const DEFAULT_LOCALE: LocaleId = "en";

export function isLocale(value: string | null | undefined): value is LocaleId {
  return LOCALES.some((l) => l.id === value);
}

export function localeMeta(id: LocaleId) {
  return LOCALES.find((l) => l.id === id) ?? LOCALES[0];
}

export function readStoredLocale(): LocaleId {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE);
    if (isLocale(stored)) return stored;
    const nav = navigator.language.toLowerCase();
    const exact = LOCALES.find((l) => nav === l.id || nav.startsWith(`${l.id}-`));
    if (exact) return exact.id;
    if (nav.startsWith("zh-hk") || nav.startsWith("zh-mo") || nav.includes("yue")) return "yue";
    if (nav.startsWith("zh")) return "zh";
    if (nav.startsWith("pt")) return "pt";
    if (nav.startsWith("fil") || nav.startsWith("tl")) return "fil";
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}
