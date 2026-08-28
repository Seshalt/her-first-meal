import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import {
  DEFAULT_LANDING_COPY,
  LANDING_IMAGE_SLOTS,
  mergeLanding,
  type LandingCopy,
  type LandingImageSlot,
} from "@/lib/landing";
import { DEFAULT_SITE_COPY, SITE_FIELD_GROUPS, type SiteCopy } from "@/lib/site";
import {
  COLOR_FIELDS,
  COLOR_PRESETS,
  COLOR_SWATCHES,
  DEFAULT_COLORS,
  LAYOUT_DEFAULTS,
  LAYOUT_OPTIONS,
  type StudioColors,
  type StudioLayout,
} from "@/lib/theme-studio";
import { adminSaveLandingCopy, adminSaveLandingImage, adminSaveSiteCopy, adminSaveStudio } from "@/lib/server/admin";
import { getLanding } from "@/lib/server/public";
import { bustPublicSiteCache } from "@/lib/use-public-site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/landing")({ component: WebsiteEditor });

const HOME_FIELDS: { key: keyof LandingCopy; label: string; multiline?: boolean }[] = [
  { key: "eyebrow", label: "Eyebrow (small line above the headline)" },
  { key: "headline", label: "Headline", multiline: true },
  { key: "headlineAccent", label: "Headline accent (italic second line)", multiline: true },
  { key: "subhead", label: "Hero supporting copy", multiline: true },
  { key: "cta", label: "Primary button" },
  { key: "secondaryCta", label: "Secondary link" },
  { key: "offerLine", label: "Offer line", multiline: true },
  { key: "manifesto", label: "Manifesto", multiline: true },
  { key: "mealsKicker", label: "Meals kicker" },
  { key: "mealsTitle", label: "Meals title" },
  { key: "mealsBody", label: "Meals body", multiline: true },
  { key: "bindingKicker", label: "Binding kicker" },
  { key: "bindingTitle", label: "Binding title" },
  { key: "bindingBody", label: "Binding body", multiline: true },
  { key: "nouriKicker", label: "Nouri kicker" },
  { key: "nouriTitle", label: "Nouri title" },
  { key: "nouriBody", label: "Nouri body", multiline: true },
  { key: "closeTitle", label: "Closing headline" },
  { key: "closeBody", label: "Closing body", multiline: true },
];

const TABS = [
  { id: "home", label: "Home" },
  ...SITE_FIELD_GROUPS.map((g) => ({ id: g.id, label: g.label })),
  { id: "photos", label: "Photographs" },
  { id: "colors", label: "Colors" },
  { id: "layout", label: "Layout" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function WebsiteEditor() {
  const [tab, setTab] = useState<TabId>("home");
  const [copy, setCopy] = useState<LandingCopy>(DEFAULT_LANDING_COPY);
  const [site, setSite] = useState<SiteCopy>(DEFAULT_SITE_COPY);
  const [images, setImages] = useState<Record<LandingImageSlot, string>>(mergeLanding(null).images);
  const [colors, setColors] = useState<StudioColors>(DEFAULT_COLORS);
  const [layout, setLayout] = useState<StudioLayout>(LAYOUT_DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getLanding().then((page) => {
      setCopy(page.content);
      setSite(page.site);
      setImages(page.content.images);
      setColors(page.studio.colors);
      setLayout(page.studio.layout);
    });
  }, []);

  async function saveHome(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSaveLandingCopy({ data: copy });
      bustPublicSiteCache();
      toast.success("Home copy saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save copy.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSite(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSaveSiteCopy({ data: site });
      bustPublicSiteCache();
      toast.success("Website copy saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save copy.");
    } finally {
      setSaving(false);
    }
  }

  async function saveStudio(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await adminSaveStudio({ data: { colors, layout } });
      bustPublicSiteCache();
      toast.success("Colors and layout saved. Open the public site to see them.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save look.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-display text-4xl">Website</h1>
      <p className="mt-2 max-w-2xl text-sm text-white/60">
        Change every word, photograph, color, glow, and layout visitors see.
      </p>
      <div className="mt-8 flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm",
              tab === item.id ? "bg-[#efe6d6] text-[#101918]" : "bg-white/8 text-[#efe6d6] hover:bg-white/12",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === "home" ? (
        <form className="mt-8 max-w-2xl space-y-4" onSubmit={(e) => void saveHome(e)}>
          {HOME_FIELDS.map((field) => (
            <Field
              key={field.key}
              label={field.label}
              multiline={field.multiline}
              value={copy[field.key]}
              onChange={(v) => setCopy({ ...copy, [field.key]: v })}
            />
          ))}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save home copy"}
          </Button>
        </form>
      ) : null}

      {SITE_FIELD_GROUPS.map((group) =>
        tab === group.id ? (
          <form key={group.id} className="mt-8 max-w-2xl space-y-4" onSubmit={(e) => void saveSite(e)}>
            {group.fields.map((field) => (
              <Field
                key={field.key}
                label={field.label}
                multiline={field.multiline}
                value={site[field.key]}
                onChange={(v) => setSite({ ...site, [field.key]: v })}
              />
            ))}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : `Save ${group.label.toLowerCase()}`}
            </Button>
          </form>
        ) : null,
      )}

      {tab === "photos" ? (
        <div className="mt-8">
          <p className="max-w-xl text-sm text-white/60">
            Upload a JPEG, PNG, or WebP. The first slot is your logo — it replaces the drop mark in the header. Leave the
            name blank in Navigation if the file already includes the words.
          </p>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {LANDING_IMAGE_SLOTS.map((slot) => (
              <ImageSlot
                key={slot.id}
                slot={slot.id}
                label={slot.label}
                src={images[slot.id]}
                onChange={(src) => setImages((prev) => ({ ...prev, [slot.id]: src }))}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "colors" ? (
        <form className="mt-8 space-y-8" onSubmit={(e) => void saveStudio(e)}>
          <div>
            <p className="text-sm text-white/60">Presets</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setColors({ ...DEFAULT_COLORS, ...preset.colors })}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm hover:bg-white/16"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-white/60">Huge palette — click to fill the selected field, or pick any hex</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {COLOR_SWATCHES.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  title={hex}
                  onClick={() => {
                    const first = COLOR_FIELDS[0].key;
                    setColors((prev) => ({ ...prev, [first]: hex }));
                  }}
                  className="size-7 rounded-md border border-white/15"
                  style={{ background: hex }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-white/40">
              Each row below has its own picker. Swatches above set page background as a quick start.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {COLOR_FIELDS.map((field) => (
              <ColorRow
                key={field.key}
                label={field.label}
                value={colors[field.key]}
                onChange={(value) => setColors((prev) => ({ ...prev, [field.key]: value }))}
              />
            ))}
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save colors"}
          </Button>
        </form>
      ) : null}

      {tab === "layout" ? (
        <form className="mt-8 max-w-2xl space-y-8" onSubmit={(e) => void saveStudio(e)}>
          {(Object.keys(LAYOUT_OPTIONS) as (keyof typeof LAYOUT_OPTIONS)[]).map((key) => (
            <fieldset key={key}>
              <legend className="text-sm capitalize text-white/70">{key}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {LAYOUT_OPTIONS[key].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setLayout((prev) => ({ ...prev, [key]: opt.id }))}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm",
                      layout[key] === opt.id ? "bg-[#efe6d6] text-[#101918]" : "bg-white/8 hover:bg-white/12",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save layout"}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-2xl bg-white/6 p-4">
      <span className="text-sm">{label}</span>
      <div className="mt-3 flex items-center gap-3">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#888888"}
          onChange={(e) => onChange(e.target.value)}
          className="size-11 cursor-pointer rounded-lg border-0 bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/8 font-mono text-sm text-[#efe6d6]"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {COLOR_SWATCHES.slice(0, 24).map((hex) => (
          <button
            key={`${label}-${hex}`}
            type="button"
            onClick={() => onChange(hex)}
            className="size-5 rounded-sm border border-white/10"
            style={{ background: hex }}
          />
        ))}
      </div>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <Label className="text-[#efe6d6]">{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
      )}
    </div>
  );
}

function ImageSlot({
  slot,
  label,
  src,
  onChange,
}: {
  slot: LandingImageSlot;
  label: string;
  src: string;
  onChange: (src: string) => void;
}) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function persist(payload: { imageData?: string; url?: string; reset?: boolean }, preview: string) {
    setBusy(true);
    try {
      await adminSaveLandingImage({ data: { slot, ...payload } });
      onChange(preview);
      toast.success(`${label} updated.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save that photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl bg-white/6 p-4">
      <p className="text-sm">{label}</p>
      {src ? (
        <img src={src} alt="" className="mt-3 h-40 w-full rounded-xl object-contain bg-white/8" />
      ) : (
        <div className="mt-3 grid h-40 place-items-center rounded-xl bg-white/8 text-xs text-white/50">
          Default mark (upload to replace)
        </div>
      )}
      <label className="mt-3 flex h-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-sm">
        {busy ? "Saving…" : "Upload your photo"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="sr-only"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            void readLandingPhoto(file, slot === "logo")
              .then((imageData) => persist({ imageData }, imageData))
              .catch((err) => toast.error(err instanceof Error ? err.message : "Could not read that photo."));
          }}
        />
      </label>
      <div className="mt-3 flex gap-2">
        <Input
          placeholder="https://… paste a photo link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="bg-white/8 text-[#efe6d6]"
        />
        <Button
          type="button"
          variant="outline"
          className="border-white/20 bg-transparent text-[#efe6d6]"
          disabled={busy || !url.trim()}
          onClick={() => void persist({ url: url.trim() }, url.trim())}
        >
          Use link
        </Button>
      </div>
      <button
        type="button"
        className="mt-3 text-xs text-white/50 hover:text-white"
        disabled={busy}
        onClick={() => {
          const fallback = LANDING_IMAGE_SLOTS.find((s) => s.id === slot)?.fallback ?? src;
          void persist({ reset: true }, fallback);
        }}
      >
        Reset to default
      </button>
    </li>
  );
}

async function readLandingPhoto(file: File, keepAlpha = false): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = keepAlpha ? 900 : 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  if (keepAlpha) {
    const data = canvas.toDataURL("image/png");
    if (data.length > 880_000) {
      throw new Error("That logo is still too large. Try a smaller PNG or paste a link.");
    }
    return data;
  }
  let quality = 0.82;
  let data = canvas.toDataURL("image/jpeg", quality);
  while (data.length > 700_000 && quality > 0.48) {
    quality -= 0.08;
    data = canvas.toDataURL("image/jpeg", quality);
  }
  if (data.length > 880_000) {
    throw new Error("That photo is still too large. Try a smaller image or paste a link.");
  }
  return data;
}
