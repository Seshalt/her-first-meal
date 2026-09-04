import { DEFAULT_SITE_COPY, type SiteCopy } from "@/lib/site";

export type BindingStep = {
  id: string;
  title: string;
  body: string;
  image: string;
};

const FALLBACK_IMAGES = [
  "/images/binding-still.jpg",
  "/images/binding-hands.jpg",
  "/images/binding-hands.jpg",
  "/images/postpartum-rest.jpg",
];

export function defaultBindingSteps(site: SiteCopy = DEFAULT_SITE_COPY): BindingStep[] {
  return [
    { id: "step-1", title: site.bindStep1Title, body: site.bindStep1Body, image: FALLBACK_IMAGES[0] },
    { id: "step-2", title: site.bindStep2Title, body: site.bindStep2Body, image: FALLBACK_IMAGES[1] },
    { id: "step-3", title: site.bindStep3Title, body: site.bindStep3Body, image: FALLBACK_IMAGES[2] },
    { id: "step-4", title: site.bindStep4Title, body: site.bindStep4Body, image: FALLBACK_IMAGES[3] },
  ];
}

export function mergeBindingSteps(
  raw: unknown,
  site: SiteCopy,
  images?: Partial<Record<"bindStep1" | "bindStep2" | "bindStep3" | "bindStep4", string>>,
): BindingStep[] {
  const fallback = defaultBindingSteps(site).map((step, i) => {
    const slot = `bindStep${i + 1}` as "bindStep1" | "bindStep2" | "bindStep3" | "bindStep4";
    const photo = images?.[slot];
    return photo ? { ...step, image: photo } : step;
  });
  if (!Array.isArray(raw) || raw.length === 0) return fallback;
  const next: BindingStep[] = [];
  for (const item of raw.slice(0, 16)) {
    if (!item || typeof item !== "object") continue;
    const row = item as Partial<BindingStep>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const body = typeof row.body === "string" ? row.body.trim() : "";
    if (!title && !body) continue;
    next.push({
      id: typeof row.id === "string" && row.id.trim() ? row.id.trim() : `step-${next.length + 1}`,
      title: title || `Step ${next.length + 1}`,
      body,
      image: typeof row.image === "string" && row.image.trim() ? row.image.trim() : FALLBACK_IMAGES[next.length % FALLBACK_IMAGES.length],
    });
  }
  return next.length ? next : fallback;
}
