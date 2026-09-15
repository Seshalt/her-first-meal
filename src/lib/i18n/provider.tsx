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

// These keys were briefly translated around the retired Nouri AI feature. Force the
// current human-support copy until every locale pack is refreshed so no language can
// surface retired product branding.
const AI_FREE_KEYS = new Set<MsgKey>([
  "nav.write",
  "footer.write",
  "today.write",
  "today.writeBody",
  "today.writeLink",
  "ask.kicker",
  "ask.title",
  "ask.body",
  "ask.send",
  "ask.thanks",
  "room.write",
  "privacy.aiTitle",
  "privacy.aiBody",
]);

// New global-language promise is deliberately complete across every selectable locale.
// Keeping it here prevents an English fallback in the exact place where we advertise
// multilingual support.
const SPECIAL_COPY: Partial<Record<LocaleId, Partial<Record<MsgKey, string>>>> = {
  es: {
    "footer.languages": "Las madres viven en todas partes. Te acercamos el hogar — elige entre 18 idiomas para que la experiencia se sienta familiar desde la primera pantalla.",
  },
  fr: {
    "footer.languages": "Les mères vivent partout. Nous faisons venir la maison jusqu’à vous — choisissez parmi 18 langues pour vous sentir chez vous dès le premier écran.",
  },
  de: {
    "footer.languages": "Mütter leben überall. Wir bringen ein Stück Zuhause zu dir — wähle aus 18 Sprachen, damit sich alles vom ersten Bildschirm an vertraut anfühlt.",
  },
  it: {
    "footer.languages": "Le madri vivono ovunque. Portiamo casa da te — scegli tra 18 lingue perché l’esperienza sia familiare fin dalla prima schermata.",
  },
  pt: {
    "footer.languages": "Mães estão em todos os lugares. Levamos a sensação de casa até você — escolha entre 18 idiomas para se sentir acolhida desde a primeira tela.",
  },
  ro: {
    "footer.languages": "Mamele sunt peste tot. Aducem sentimentul de acasă mai aproape de tine — alege dintre 18 limbi pentru ca experiența să fie familiară chiar de la primul ecran.",
  },
  pl: {
    "footer.languages": "Matki są wszędzie. Przybliżamy Ci poczucie domu — wybierz spośród 18 języków, aby od pierwszego ekranu wszystko było bardziej znajome.",
  },
  ru: {
    "footer.languages": "Мамы живут по всему миру. Мы привносим ощущение дома — выберите один из 18 языков, чтобы с первого экрана всё было знакомо и понятно.",
  },
  uk: {
    "footer.languages": "Мами живуть у всьому світі. Ми наближаємо відчуття дому — оберіть одну з 18 мов, щоб уже з першого екрана все було знайомим і зрозумілим.",
  },
  ar: {
    "footer.languages": "الأمهات في كل مكان. نقرّب إليكِ إحساس البيت — اختاري من بين 18 لغة لتشعري بالألفة منذ الشاشة الأولى.",
  },
  hi: {
    "footer.languages": "माएँ दुनिया भर में हैं। हम घर जैसा अपनापन आपके पास लाते हैं — 18 भाषाओं में से चुनें ताकि पहली स्क्रीन से ही अनुभव परिचित लगे।",
  },
  ko: {
    "footer.languages": "엄마들은 전 세계 어디에나 있습니다. 집처럼 편안한 경험을 가까이 가져옵니다 — 18개 언어 중에서 선택해 첫 화면부터 익숙하게 느껴보세요.",
  },
  zh: {
    "footer.languages": "妈妈们生活在世界各地。我们把家的熟悉感带到你身边——可从 18 种语言中选择，让你从第一屏开始就感到亲切自在。",
  },
  yue: {
    "footer.languages": "媽媽遍布世界各地。我哋將屋企嘅熟悉感帶到你身邊——可揀 18 種語言，等你由第一個畫面開始就覺得親切自在。",
  },
  fil: {
    "footer.languages": "Nasa iba’t ibang panig ng mundo ang mga ina. Dinadala namin ang pakiramdam ng tahanan sa iyo — pumili sa 18 wika para pamilyar agad ang karanasan mula sa unang screen.",
  },
  ht: {
    "footer.languages": "Manman yo toupatou nan mond lan. Nou pote yon sans lakay pi pre ou — chwazi pami 18 lang pou eksperyans lan santi l abitye depi premye ekran an.",
  },
  vi: {
    "footer.languages": "Các bà mẹ ở khắp mọi nơi trên thế giới. Chúng tôi mang cảm giác thân thuộc như ở nhà đến gần bạn — hãy chọn trong 18 ngôn ngữ để trải nghiệm quen thuộc ngay từ màn hình đầu tiên.",
  },
};

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
      t: (key, vars) => {
        const special = SPECIAL_COPY[locale]?.[key];
        const translated = special ?? (AI_FREE_KEYS.has(key) ? EN[key] : (pack[key] ?? EN[key] ?? key));
        return interpolate(translated, vars);
      },
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
