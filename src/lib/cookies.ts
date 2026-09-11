export type CookieChoices = {
  necessary: true;
  analytics: boolean;
  ads: boolean;
  preferences: boolean;
};

const STORAGE_KEY = "hfm-cookie-ok";
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
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=1; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

export function readCookieChoices(): CookieChoices | null {
  if (typeof window === "undefined") return null;
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") return DEFAULT_CHOICES;
  } catch {
    /* ignore */
  }
  if (readBrowserCookie()) return DEFAULT_CHOICES;
  return null;
}

export function writeCookieChoices(_choices: CookieChoices = DEFAULT_CHOICES) {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode */
  }
  writeBrowserCookie();
}
