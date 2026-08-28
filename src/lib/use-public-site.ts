import { useEffect, useState } from "react";
import { mergeLanding } from "@/lib/landing";
import { mergeSite } from "@/lib/site";
import { getLanding } from "@/lib/server/public";
import { mergeStudio } from "@/lib/theme-studio";

const fallback = {
  content: mergeLanding(null),
  site: mergeSite(null),
  studio: mergeStudio(null),
  businessName: "Her First Meal",
  tagline: "We remember the mother.",
  monthlyPriceCents: 4900,
  yearlyPriceCents: 49000,
};

type PublicSite = Awaited<ReturnType<typeof getLanding>>;

let cache: PublicSite | null = null;

export function bustPublicSiteCache() {
  cache = null;
}

export function usePublicSite(): PublicSite {
  const [page, setPage] = useState<PublicSite>(cache ?? fallback);
  useEffect(() => {
    void getLanding()
      .then((d) => {
        cache = d;
        setPage(d);
      })
      .catch(() => undefined);
  }, []);
  return page;
}
