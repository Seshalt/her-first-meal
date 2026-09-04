export type CookieChoices = {
  necessary: true;
  analytics: boolean;
  ads: boolean;
  preferences: boolean;
};

const STORAGE_KEY = "hfm-cookie-choices";
const COOKIE_NAME = "hfm-cookie-ok";

export const DEFAULT_CHOICES: CookieChoices = {
  necessary: true,
  analytics: false,
  ads: false,
  preferences: true,
};

function readBrowserCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((part) => part.trim().startsWith(`${COOKIE_NAME}=`));
}

function writeBrowserCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=1; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function readCookieChoices(): CookieChoices | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<CookieChoices>;
      return {
        necessary: true,
        analytics: Boolean(parsed.analytics),
        ads: Boolean(parsed.ads),
        preferences: parsed.preferences !== false,
      };
    }
  } catch {
    /* ignore */
  }
  if (readBrowserCookie()) return DEFAULT_CHOICES;
  return null;
}

export function writeCookieChoices(choices: CookieChoices = DEFAULT_CHOICES) {
  const next = { ...choices, necessary: true as const, preferences: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  writeBrowserCookie();
  window.dispatchEvent(new Event("hfm-cookies"));
}
