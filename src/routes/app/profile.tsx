import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Pill, RoomBody, RoomHero } from "@/components/layout/room-hero";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { DIETS, STAGE_LABEL, STORES, type Stage } from "@/lib/content/catalog";
import { deleteAccount, getMyHome, saveProfile } from "@/lib/server/profile";
import { listNotifications, markNotificationsRead } from "@/lib/server/profile";

export const Route = createFileRoute("/app/profile")({ component: Profile });

function Profile() {
  const [home, setHome] = useState<Awaited<ReturnType<typeof getMyHome>> | null>(null);
  const [notes, setNotes] = useState<Awaited<ReturnType<typeof listNotifications>>>([]);

  useEffect(() => {
    void getMyHome().then(setHome);
    void listNotifications().then(setNotes);
  }, []);

  if (!home) return <p className="px-5 pt-32 font-display text-3xl text-muted-foreground">Opening your profile…</p>;
  const p = home.profile;

  async function save() {
    if (!home) return;
    await saveProfile({
      data: {
        displayName: p.displayName ?? "",
        location: p.location ?? "",
        stage: p.stage,
        dueDate: p.dueDate,
        babyBirthday: p.babyBirthday,
        householdSize: p.householdSize,
        weeklyBudget: p.weeklyBudget ?? "",
        zipCode: p.zipCode ?? "",
        city: p.city ?? "",
        diets: home.diet.diets,
        allergies: home.diet.allergies,
        avoids: home.diet.avoids ?? "",
        dislikes: home.diet.dislikes ?? "",
        loves: home.diet.loves ?? "",
        cuisines: home.diet.cuisines,
        stores: home.grocery.stores,
      },
    });
    toast.success("Saved.");
  }

  return (
    <div>
      <RoomHero
        kicker="Settings"
        title="Your house, your terms"
        body={p.email ?? "The details Nouri and the table already know."}
        src="/images/postpartum-rest.jpg"
        alt="Morning rest by a window"
        tone="gold"
      />
      <RoomBody className="max-w-2xl space-y-12">
        <section className="space-y-4">
          <Label>Name</Label>
          <Input
            value={p.displayName ?? ""}
            onChange={(e) => setHome({ ...home, profile: { ...p, displayName: e.target.value } })}
          />
          <Label>Location</Label>
          <Input value={p.location ?? ""} onChange={(e) => setHome({ ...home, profile: { ...p, location: e.target.value } })} />
          <Label>ZIP</Label>
          <Input value={p.zipCode ?? ""} onChange={(e) => setHome({ ...home, profile: { ...p, zipCode: e.target.value } })} />
          <p className="text-xs uppercase tracking-[0.28em] text-earth">Season</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STAGE_LABEL) as Stage[]).map((s) => (
              <Pill key={s} active={p.stage === s} onClick={() => setHome({ ...home, profile: { ...p, stage: s } })}>
                {STAGE_LABEL[s]}
              </Pill>
            ))}
          </div>
        </section>
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-earth">Dietary preferences</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {DIETS.map((d) => (
              <Pill
                key={d.id}
                active={home.diet.diets.includes(d.id)}
                onClick={() => {
                  const diets = home.diet.diets.includes(d.id)
                    ? home.diet.diets.filter((x) => x !== d.id)
                    : [...home.diet.diets, d.id];
                  setHome({ ...home, diet: { ...home.diet, diets } });
                }}
              >
                {d.label}
              </Pill>
            ))}
          </div>
        </section>
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-earth">Grocery stores</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {STORES.map((s) => (
              <Pill
                key={s}
                active={home.grocery.stores.includes(s)}
                onClick={() => {
                  const stores = home.grocery.stores.includes(s)
                    ? home.grocery.stores.filter((x) => x !== s)
                    : [...home.grocery.stores, s];
                  setHome({ ...home, grocery: { ...home.grocery, stores } });
                }}
              >
                {s}
              </Pill>
            ))}
          </div>
        </section>
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-earth">Appearance</p>
          <p className="mt-3 text-base leading-relaxed text-ink-soft">
            Light, dark, or match your device. This lives here in settings — not on the public homepage.
          </p>
          <ThemeToggle className="mt-4" />
        </section>
        <Button onClick={() => void save()} size="lg">
          Save changes
        </Button>
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-4xl">Notifications</h2>
            <button
              type="button"
              className="text-sm text-primary"
              onClick={() => void markNotificationsRead().then(() => listNotifications().then(setNotes))}
            >
              Mark read
            </button>
          </div>
          <div className="editorial-rule mt-6" />
          <ul>
            {notes.length === 0 ? (
              <li className="py-8 text-ink-soft">No notices yet.</li>
            ) : (
              notes.map((n) => (
                <li key={n.id} className="border-b border-border py-6">
                  <p className="font-display text-2xl">{n.title}</p>
                  <p className="mt-2 text-ink-soft">{n.body}</p>
                </li>
              ))
            )}
          </ul>
        </section>
        <p className="text-sm">
          <Link to="/privacy" className="text-primary">
            Privacy
          </Link>
        </p>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm("Delete your account and personal records?")) {
              void deleteAccount().then(() => {
                toast.success("Account removed.");
                window.location.href = "/";
              });
            }
          }}
        >
          Delete account
        </Button>
      </RoomBody>
    </div>
  );
}
