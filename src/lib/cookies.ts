export type CookieChoices = {
  necessary: true;
  analytics: boolean;
  ads: boolean;
  preferences: boolean;
};

const STORAGE_KEY = "hfm-cookie-choices-v2";
const COOKIE_NAME = "hfm-cookie-choices";
const ONE_YEAR = 60 * 60 * 24 * 365;

export const DEFAULT_CHOICES: CookieChoices = {
  necessary: true,
  analytics: false,
  ads: false,
  preferences: true,
};

export const ALL_ALLOWED_CHOICES: CookieChoices = {
  necessary: true,
  analytics: true,
  ads: false,
  preferences: true,
};

function normalize(value: unknown): CookieChoices | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Partial<CookieChoices>;
  return {
    necessary: true,
    analytics: Boolean(row.analytics),
    ads: false,
    preferences: row.preferences !== false,
  };
}

function readBrowserCookie(): CookieChoices | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);
  if (!raw) return null;
  try {
    return normalize(JSON.parse(decodeURIComponent(raw)));
  } catch {
    return null;
  }
}

function writeBrowserCookie(choices: CookieChoices) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const encoded = encodeURIComponent(JSON.stringify(choices));
  document.cookie = `${COOKIE_NAME}=${encoded}; Path=/; Max-Age=${ONE_YEAR}; SameSite=Lax${secure}`;
}

export function readCookieChoices(): CookieChoices | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = normalize(JSON.parse(raw));
      if (parsed) return parsed;
    }
  } catch {
    /* private mode or corrupt storage */
  }
  return readBrowserCookie();
}

export function writeCookieChoices(choices: CookieChoices = DEFAULT_CHOICES) {
  const normalized = normalize(choices) ?? DEFAULT_CHOICES;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    /* private mode */
  }
  writeBrowserCookie(normalized);
  window.dispatchEvent(new CustomEvent("hfm-cookie-choices", { detail: normalized }));
}

export function clearCookieChoices() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event("hfm-cookie-choices"));
}
