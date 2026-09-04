import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const KEY = "hfm-launch-todo";

const ITEMS: { id: string; label: string; href?: string }[] = [
  { id: "stripe", label: "Add STRIPE_SECRET_KEY in Vercel and run one test charge" },
  { id: "hearth", label: "Sign in at /hearth and confirm /admin opens" },
  { id: "contact", label: "Put a real email and business name on Contact" },
  { id: "lawyer", label: "Have a lawyer skim /terms and /privacy" },
  { id: "domain", label: "Point your own domain at Vercel" },
  { id: "mail", label: "Add RESEND_API_KEY so codes and notes can send" },
  { id: "console", label: "Open Google Search Console and add the site", href: "https://search.google.com/search-console/welcome?utm_source=about-page" },
  { id: "sitemap", label: "Build and submit the sitemap in Search Console", href: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap" },
  { id: "analytics", label: "Set up Google Analytics and add the ID later", href: "https://developers.google.com/analytics" },
  { id: "gbp", label: "Create or claim a Google Business Profile", href: "https://business.google.com/us/business-profile/" },
  { id: "member", label: "Walk a member from /login into the rooms" },
];

export const Route = createFileRoute("/admin/launch")({ component: LaunchTodo });

function LaunchTodo() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle(id: string) {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }

  const finished = ITEMS.filter((i) => done[i.id]).length;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-white/50">Before going live</p>
      <h1 className="mt-2 font-display text-4xl">Launch list</h1>
      <p className="mt-3 text-sm text-white/60">
        {finished} of {ITEMS.length} done. Ticks stay in this browser.
      </p>
      <ul className="mt-8 space-y-3">
        {ITEMS.map((item) => (
          <li key={item.id} className="flex items-start gap-3 rounded-2xl bg-white/6 px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(done[item.id])}
              onChange={() => toggle(item.id)}
              className="mt-1 size-4 accent-[#c4a574]"
            />
            <div>
              <p className={done[item.id] ? "text-white/40 line-through" : ""}>{item.label}</p>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-[#c4a574] underline">
                  Open guide
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-white/40">
        This house already has a sitemap at /sitemap.xml. Submit that URL in Search Console after the domain is live.
      </p>
    </div>
  );
}
