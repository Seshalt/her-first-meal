import { useText as useContentText } from "@/lib/i18n/use-text";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

const OPTIONS: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
  { id: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const localizeContent = useContentText();
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={cn("flex rounded-full bg-secondary p-1", className)}
      role="radiogroup"
      aria-label={localizeContent("Color theme")}
    >
      {localizeContent(OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const on = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={localizeContent(opt.label)}
            onClick={() => setTheme(opt.id)}
            className={cn(
              "grid size-8 place-items-center rounded-full transition-colors",
              on ? "bg-card text-foreground shadow-[var(--shadow-border)]" : "text-muted-foreground",
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      }))}
    </div>
  );
}
