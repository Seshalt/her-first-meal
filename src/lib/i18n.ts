import { EN, type MsgKey } from "./i18n/en";

export { LocaleProvider, useI18n, useT, normalizeLocale } from "./i18n/provider";
export { LOCALES, isLocale, localeMeta, LOCALE_STORAGE, type LocaleId } from "./i18n/locales";
export type { MsgKey };

/** Static English lookup for server copy. Client UI should use useT(). */
export function t(key: MsgKey): string {
  return EN[key];
}

export const messages = EN;
