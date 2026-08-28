const KEY = "hfm-atelier-ready";

export function markAtelierReady() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function atelierReadyLocal() {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
