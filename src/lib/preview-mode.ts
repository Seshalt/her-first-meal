const KEY = "hfm-walk";

export type WalkMode = "admin" | "member";

export function getWalkMode(): WalkMode {
  if (typeof window === "undefined") return "admin";
  return window.sessionStorage.getItem(KEY) === "member" ? "member" : "admin";
}

export function setWalkMode(mode: WalkMode) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, mode);
}

export function isMemberWalk(): boolean {
  return getWalkMode() === "member";
}
