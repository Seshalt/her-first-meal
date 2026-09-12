import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { listPantry, removePantry, stockPantryStaples, upsertPantry } from "@/lib/server/meals";
import { altFor } from "@/lib/landing";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/pantry")({ component: Pantry });

function Pantry() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listPantry>>>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("item");
  const [busy, setBusy] = useState(false);

  function reload() {
    void listPantry().then(setItems);
  }
  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <RoomHero
        kicker="The cupboard"
        title="Virtual pantry"
        body="Jars you already keep. Grocery lists skip what is on this shelf. Estimated quantities, never confirmed inventory."
        src="/images/family-table.jpg"
        alt={altFor("/images/family-table.jpg")}
        tone="clay"
      />
      <RoomBody>
        <form
          className="jar-add-form"
          onSubmit={(e) => {
            e.preventDefault();
            void upsertPantry({ data: { name, quantity: Number(quantity) || 1, unit } }).then(() => {
              setName("");
              reload();
            });
          }}
        >
          <div>
            <Label htmlFor="pname">Ingredient</Label>
            <Input id="pname" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="pqty">Qty</Label>
            <Input id="pqty" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="punit">Unit</Label>
            <Input id="punit" value={unit} onChange={(e) => setUnit(e.target.value)} />
          </div>
          <Button type="submit" className="self-end">
            Set on the shelf
          </Button>
        </form>

        {items.length === 0 ? (
          <div className="mt-12">
            <p className="font-display text-3xl leading-snug">The shelf is bare.</p>
            <p className="mt-4 max-w-lg text-lg text-ink-soft">
              Stock the usual jars — oil, salt, oats, rice, beans — so the grocery list does not buy what you already have.
            </p>
            <Button
              type="button"
              className="mt-6"
              variant="clay"
              disabled={busy}
              onClick={() => {
                setBusy(true);
                void stockPantryStaples()
                  .then((r) => {
                    toast.success(r.added ? `${r.added} jars on the shelf.` : "Those jars were already here.");
                    reload();
                  })
                  .finally(() => setBusy(false));
              }}
            >
              {busy ? "Setting jars…" : "Stock the usual jars"}
            </Button>
          </div>
        ) : (
          <ul className="jar-shelf mt-12">
            {items.map((item) => {
              const fill = Math.min(92, Math.max(18, Number(item.quantity) * 14));
              return (
                <li key={item.id} className={cn("jar", item.low && "is-low")}>
                  <div className="jar-body" aria-hidden>
                    <span className="jar-fill" style={{ height: `${fill}%` }} />
                    <span className="jar-lid" />
                  </div>
                  <p className="jar-name">{item.name}</p>
                  <p className="jar-meta">
                    {item.quantity} {item.unit}
                    {item.estimated ? " · estimated" : ""}
                    {item.low ? " · running low" : ""}
                  </p>
                  <button
                    type="button"
                    className="jar-remove"
                    onClick={() => void removePantry({ data: { id: item.id } }).then(reload)}
                  >
                    Take off the shelf
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </RoomBody>
    </div>
  );
}
