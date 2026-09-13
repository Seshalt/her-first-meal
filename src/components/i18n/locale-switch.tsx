import { LOCALES, type LocaleId } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function LocaleSwitch({
  className,
  tone = "ink",
}: {
  className?: string;
  tone?: "ink" | "paper" | "gold";
}) {
  const { locale, setLocale, t } = useI18n();
  return (
    <label className={cn("inline-flex items-center gap-2 text-xs", className)}>
      <span className="sr-only">{t("language")}</span>
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value as LocaleId)}
        className={cn(
          "h-10 max-w-[11.5rem] cursor-pointer rounded-full border bg-transparent px-3 text-xs tracking-wide",
          tone === "paper" && "border-white/35 text-paper",
          tone === "gold" && "border-gold/40 text-foreground",
          tone === "ink" && "border-border text-foreground",
        )}
      >
        {LOCALES.map((l) => (
          <option key={l.id} value={l.id} className="text-ink">
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
