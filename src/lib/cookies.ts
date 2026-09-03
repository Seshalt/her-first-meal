export type CookieChoices = {
  necessary: true;
  analytics: boolean;
  ads: boolean;
  preferences: boolean;
};

const KEY = "hfm-cookie-choices";

export const DEFAULT_CHOICES: CookieChoices = {
  necessary: true,
  analytics: false,
  ads: false,
  preferences: false,
};

export function readCookieChoices(): CookieChoices | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieChoices>;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      ads: Boolean(parsed.ads),
      preferences: Boolean(parsed.preferences),
    };
  } catch {
    return null;
  }
}

export function writeCookieChoices(choices: CookieChoices) {
  window.localStorage.setItem(KEY, JSON.stringify({ ...choices, necessary: true }));
  window.dispatchEvent(new Event("hfm-cookies"));
}

export function openCookieChoices() {
  window.dispatchEvent(new Event("hfm-cookies-open"));
}
