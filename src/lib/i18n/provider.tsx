import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { EN, type MsgKey } from "./en";
import { interpolate, MESSAGES } from "./messages";
import { DEFAULT_LOCALE, isLocale, localeMeta, LOCALE_STORAGE, readStoredLocale, type LocaleId } from "./locales";

type I18nValue = {
  locale: LocaleId;
  dir: "ltr" | "rtl";
  setLocale: (next: LocaleId) => void;
  t: (key: MsgKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleId>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: LocaleId) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LOCALE_STORAGE, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const meta = localeMeta(locale);
    document.documentElement.lang = locale === "yue" ? "zh-HK" : locale;
    document.documentElement.dir = meta.dir;
  }, [locale]);

  const value = useMemo<I18nValue>(() => {
    const pack = MESSAGES[locale] ?? EN;
    return {
      locale,
      dir: localeMeta(locale).dir,
      setLocale,
      t: (key, vars) => interpolate(pack[key] ?? EN[key] ?? key, vars),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      dir: "ltr" as const,
      setLocale: (_next: LocaleId) => undefined,
      t: (key: MsgKey, vars?: Record<string, string | number>) => interpolate(EN[key] ?? key, vars),
    };
  }
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function normalizeLocale(value?: string | null): LocaleId {
  if (isLocale(value ?? "")) return value as LocaleId;
  return DEFAULT_LOCALE;
}
