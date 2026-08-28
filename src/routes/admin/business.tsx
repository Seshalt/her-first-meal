import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adminAddDiscount, adminDashboard, adminListDiscounts, adminSaveSettings } from "@/lib/server/admin";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/admin/business")({ component: Business });

function Business() {
  const [monthly, setMonthly] = useState("49");
  const [yearly, setYearly] = useState("490");
  const [zoom, setZoom] = useState("");
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [discounts, setDiscounts] = useState<Awaited<ReturnType<typeof adminListDiscounts>>>([]);
  useEffect(() => {
    void adminDashboard().then((d) => {
      if (!d.settings) return;
      setMonthly(String(d.settings.monthlyPriceCents / 100));
      setYearly(String(d.settings.yearlyPriceCents / 100));
      setZoom(d.settings.zoomDefaultLink ?? "");
    });
    void adminListDiscounts().then(setDiscounts);
  }, []);
  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-4xl">Business</h1>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          void adminSaveSettings({
            data: {
              monthlyPriceCents: Math.round(Number(monthly) * 100),
              yearlyPriceCents: Math.round(Number(yearly) * 100),
              zoomDefaultLink: zoom,
            },
          }).then(() => toast.success("Pricing saved."));
        }}
      >
        <Label className="text-[#efe6d6]">Monthly price (USD)</Label>
        <Input value={monthly} onChange={(e) => setMonthly(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
        <Label className="text-[#efe6d6]">Yearly price (USD)</Label>
        <Input value={yearly} onChange={(e) => setYearly(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
        <Label className="text-[#efe6d6]">Default Zoom</Label>
        <Input value={zoom} onChange={(e) => setZoom(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
        <Button type="submit">Save</Button>
      </form>
      <section>
        <h2 className="font-display text-2xl">Discount codes</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void adminAddDiscount({ data: { code, percent: Number(percent) || 10 } }).then(() => {
              setCode("");
              void adminListDiscounts().then(setDiscounts);
            });
          }}
        >
          <Input placeholder="CODE" value={code} onChange={(e) => setCode(e.target.value)} className="bg-white/8 text-[#efe6d6]" />
          <Input placeholder="%" value={percent} onChange={(e) => setPercent(e.target.value)} className="w-20 bg-white/8 text-[#efe6d6]" />
          <Button type="submit">Add</Button>
        </form>
        <ul className="mt-3 space-y-2 text-sm">
          {discounts.map((d) => (
            <li key={d.id}>
              {d.code} · {d.percent}% {d.gift ? "· gift" : ""} {d.active ? "" : "· inactive"}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
