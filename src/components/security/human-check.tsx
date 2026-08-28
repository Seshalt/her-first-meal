import { useEffect, useState } from "react";

/** Hidden field bots fill; people never see it. */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Company website
        <input
          type="text"
          name="company_website"
          tabIndex={-1}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

export function HumanCheck({
  checked,
  onChecked,
  honey,
  onHoney,
}: {
  checked: boolean;
  onChecked: (next: boolean) => void;
  honey: string;
  onHoney: (next: string) => void;
}) {
  return (
    <div className="relative">
      <Honeypot value={honey} onChange={onHoney} />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-card/60 px-4 py-3 text-sm text-foreground shadow-[var(--shadow-border)]">
        <input
          type="checkbox"
          className="mt-0.5 size-4 shrink-0 accent-current"
          checked={checked}
          onChange={(e) => onChecked(e.target.checked)}
          required
        />
        <span>
          I am a person. Keep automated visitors out of this house.
        </span>
      </label>
    </div>
  );
}

export function useFormGuard() {
  const [human, setHuman] = useState(false);
  const [honey, setHoney] = useState("");
  const [startedAt] = useState(() => Date.now());
  useEffect(() => {
    /* stamp is captured on mount so instant bot posts fail the timing check */
  }, []);
  return { human, setHuman, honey, setHoney, startedAt };
}
