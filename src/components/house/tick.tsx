import { cn } from "@/lib/utils";

export function TickRow({
  name,
  qty,
  checked,
  onChecked,
}: {
  name: string;
  qty: string;
  checked: boolean;
  onChecked: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={cn("tick-row", checked && "is-checked")}
      onClick={() => onChecked(!checked)}
      aria-pressed={checked}
    >
      <span className="tick-box" aria-hidden>
        <svg viewBox="0 0 24 24" className="tick-mark">
          <path d="M5 12.5 10 17.5 19 6.5" />
        </svg>
      </span>
      <span className="tick-name">{name}</span>
      <span className="tick-qty">{qty}</span>
    </button>
  );
}
