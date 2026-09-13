import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { savePlace } from "@/lib/server/profile";
import { cn } from "@/lib/utils";

export type PlaceSaved = {
  city: string;
  location: string;
  zipCode: string;
  locationPermission: string;
};

export function PlaceAsk({
  label,
  permission,
  onSaved,
}: {
  label?: string | null;
  permission?: string | null;
  onSaved?: (place: PlaceSaved) => void;
}) {
  const [busy, setBusy] = useState(false);
  const known = Boolean(label && label !== "not shared");

  async function share() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("This browser will not share a location. A city or ZIP is enough.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void savePlace({
          data: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            permission: "granted",
          },
        })
          .then((place) => {
            toast.success(place.location ? `Cooking from ${place.location}.` : "Location saved.");
            onSaved?.(place);
          })
          .catch((err) => toast.error(err instanceof Error ? err.message : "Could not save the place."))
          .finally(() => setBusy(false));
      },
      () => {
        void savePlace({ data: { permission: "denied" } }).catch(() => undefined);
        setBusy(false);
        toast.error("Location stayed private. A city, ZIP, or U.S. state still builds the list.");
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 10 * 60 * 1000 },
    );
  }

  return (
    <div className={cn("place-card", known && "is-known")}>
      <span className="place-pin" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Where she shops</p>
        <p className="mt-2 font-display text-2xl leading-tight">
          {known ? label : "Share a place so lists come from your market."}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The kitchen uses this for grocery lists and seasonal produce — never for ads, never sold. A typed city, ZIP, or state is enough if you would rather not share the pin.
        </p>
      </div>
      <Button type="button" variant={known ? "outline" : "gold"} disabled={busy} onClick={() => void share()}>
        {busy ? "Finding the market…" : known ? "Update location" : "Use my location"}
      </Button>
    </div>
  );
}
