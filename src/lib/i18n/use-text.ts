import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useI18n } from "./provider";
import type { LocaleId } from "./locales";

import { contentTranslator, type Dictionary, type Translate } from "./content-translate";
const EMPTY: Dictionary = Object.freeze({});
const dictionaries = new Map<LocaleId, Dictionary>();
const pending = new Set<LocaleId>();
const listeners = new Set<() => void>();
const loaders = import.meta.glob<Dictionary>("./content/*.json", { import: "default" });

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

async function load(locale: LocaleId) {
  if (locale === "en" || pending.has(locale) || dictionaries.has(locale)) return;
  const loader = loaders[`./content/${locale}.json`];
  if (!loader) return;
  pending.add(locale);
  try {
    dictionaries.set(locale, await loader());
    listeners.forEach((notify) => notify());
  } catch {
    // Keep the readable source copy if a static asset could not be loaded.
  } finally {
    pending.delete(locale);
  }
}


/** Static, local translations for editorial copy and owner-editable default text. */
export function useText(): Translate {
  const { locale } = useI18n();
  const dictionary = useSyncExternalStore(subscribe, () => dictionaries.get(locale) ?? EMPTY, () => EMPTY);
  const current = useRef(contentTranslator(dictionary));
  current.current = contentTranslator(dictionary);
  useEffect(() => { void load(locale); }, [locale]);
  return useCallback(<T,>(value: T): T => current.current(value), []);
}
