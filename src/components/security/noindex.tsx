import { useEffect } from "react";

/** Keep member and owner rooms out of search indexes. */
export function NoIndex() {
  useEffect(() => {
    const existing = document.querySelector('meta[name="robots"]');
    const tag = existing ?? document.createElement("meta");
    tag.setAttribute("name", "robots");
    tag.setAttribute("content", "noindex, nofollow, noarchive");
    if (!existing) document.head.appendChild(tag);
    return () => {
      tag.setAttribute("content", "index, follow");
    };
  }, []);
  return null;
}
