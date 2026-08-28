import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RoomBody, RoomHero } from "@/components/layout/room-hero";
import { listPantry, removePantry, upsertPantry } from "@/lib/server/meals";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/app/pantry")({ component: Pantry });

function Pantry() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listPantry>>>([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("item");

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
        body="Estimated quantities, never confirmed inventory. Edit anything. Data stays on your signed-in account."
        src="/images/family-table.jpg"
        alt="A family sharing a meal at the kitchen table"
        tone="clay"
      />
      <RoomBody>
        <form
          className="grid gap-4 md:grid-cols-[1fr_90px_90px_auto]"
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
            Add
          </Button>
        </form>
        <ul className="mt-12 divide-y divide-border">
          {items.length === 0 ? (
            <li className="py-10 font-display text-2xl text-ink-soft">
              Your pantry is empty. Add staples you already keep.
            </li>
          ) : (
            items.map((item) => (
              <li key={item.id} className="flex min-h-16 items-center justify-between gap-4 py-5">
                <span>
                  <span className="font-display text-2xl">{item.name}</span>
                  <span className="ml-3 text-sm text-muted-foreground">
                    {item.quantity} {item.unit}
                    {item.estimated ? " · estimated" : ""}
                    {item.low ? " · running low" : ""}
                  </span>
                </span>
                <button type="button" className="text-sm text-muted-foreground" onClick={() => void removePantry({ data: { id: item.id } }).then(reload)}>
                  Remove
                </button>
              </li>
            ))
          )}
        </ul>
      </RoomBody>
    </div>
  );
}
