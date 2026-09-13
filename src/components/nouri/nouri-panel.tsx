import { Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { useT } from "@/lib/i18n/provider";

export function NouriFab() {
  const t = useT();
  return (
    <Link
      to="/app/nouri"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-border)] md:bottom-6"
    >
      <Mail className="size-4" />
      {t("room.write")}
    </Link>
  );
}
