import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pill, RoomBody, RoomHero } from "@/components/layout/room-hero";
import { BINDING_FAQS, BINDING_STEPS } from "@/lib/content/catalog";
import { addBindingJournal, listBindingUploads } from "@/lib/server/binding";
import { compareBindingPhotos } from "@/lib/server/nouri";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

export const Route = createFileRoute("/app/binding")({ component: BindingStudio });

const ANGLES = ["front", "left", "right", "back"] as const;

function BindingStudio() {
  const [tab, setTab] = useState<"studio" | "compare" | "journal">("studio");
  const [data, setData] = useState<Awaited<ReturnType<typeof listBindingUploads>> | null>(null);
  const [angle, setAngle] = useState<(typeof ANGLES)[number]>("front");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [entry, setEntry] = useState("");

  useEffect(() => {
    void listBindingUploads().then(setData);
  }, []);

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 350_000) {
      toast.error("Please use a smaller photo (under 350 KB) for this preview.");
      return;
    }
    const imageData = await fileToData(file);
    setBusy(true);
    try {
      const res = await compareBindingPhotos({ data: { angle, notes, imageData } });
      setFeedback(res.feedback);
      void listBindingUploads().then(setData);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <RoomHero
        kicker="Flagship practice"
        title="Belly Binding Studio"
        body="Educational wrapping support. Not medical clearance. Ask your provider before you begin, especially after surgery."
        src="/images/binding-hands.jpg"
        alt="Hands wrapping a cotton belly bind"
        tone="blush"
      />
      <div className="sticky top-16 z-20 border-b border-border bg-background/95 px-5 py-4 backdrop-blur md:top-[4.75rem] md:px-10">
        <div className="mx-auto flex max-w-5xl gap-2">
          {(["studio", "compare", "journal"] as const).map((t) => (
            <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
              {t}
            </Pill>
          ))}
        </div>
      </div>

      {tab === "studio" ? (
        <div>
          {BINDING_STEPS.map((s, i) => (
            <article key={s.title} className="grid min-h-[70vh] lg:grid-cols-2 lg:min-h-[78vh]">
              <div className={i % 2 === 1 ? "relative min-h-[48vh] lg:order-2 lg:min-h-[78vh]" : "relative min-h-[48vh] lg:min-h-[78vh]"}>
                <img src={s.image} alt="" className="media absolute inset-0 h-full w-full object-cover" />
              </div>
              <div className="flex flex-col justify-center bg-wash-blush px-5 py-16 md:px-16">
                <p className="text-xs uppercase tracking-[0.32em] text-blush">0{i + 1}</p>
                <h2 className="mt-5 font-display text-[clamp(2.2rem,4.5vw,4rem)]">{s.title}</h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft md:text-xl">{s.body}</p>
              </div>
            </article>
          ))}
          <section className="relative min-h-[70vh] overflow-hidden text-paper">
            <img src="/images/binding-still.jpg" alt="A folded belly wrap with eucalyptus" className="media absolute inset-0 h-full w-full object-cover" />
            <div className="pointer-events-none absolute inset-0 bg-ink/55" />
            <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-end px-5 py-20 md:px-10">
              <p className="text-xs uppercase tracking-[0.32em] text-aqua">Live review</p>
              <h2 className="mt-5 font-display text-4xl md:text-6xl">Book a wrapping review.</h2>
              <p className="mt-6 max-w-lg text-lg text-paper/85">
                When you are ready, request a time. The owner adds the Zoom link when the hour is set.
              </p>
              <Button asChild className="mt-8 w-fit" variant="gold">
                <Link to="/app/appointments">Request a live review</Link>
              </Button>
            </div>
          </section>
          <RoomBody>
            <p className="text-xs uppercase tracking-[0.32em] text-earth">Questions</p>
            <dl className="mt-10 divide-y divide-border">
              {BINDING_FAQS.map((f) => (
                <div key={f.q} className="py-8">
                  <dt className="font-display text-3xl">{f.q}</dt>
                  <dd className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </RoomBody>
        </div>
      ) : null}

      {tab === "compare" ? (
        <RoomBody>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-earth">Instructional reference</p>
              <h2 className="mt-4 font-display text-4xl">Hold the wrap like this.</h2>
              <img src="/images/binding-hands.jpg" alt="Reference wrap" className="media mt-8 h-72 w-full object-cover" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-earth">Your upload</p>
              <h2 className="mt-4 font-display text-4xl">A private comparison.</h2>
              <div className="mt-6 flex flex-wrap gap-2">
                {ANGLES.map((a) => (
                  <Pill key={a} active={angle === a} onClick={() => setAngle(a)}>
                    {a}
                  </Pill>
                ))}
              </div>
              <Textarea className="mt-5" placeholder="Notes for Nouri" value={notes} onChange={(e) => setNotes(e.target.value)} />
              <label className="mt-4 flex h-12 cursor-pointer items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                {busy ? "Reading the wrap…" : "Upload photo"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => void onFile(e.target.files?.[0])} />
              </label>
              {feedback ? <p className="mt-6 text-lg leading-relaxed">{feedback}</p> : null}
            </div>
          </div>
          <h3 className="mt-16 font-display text-4xl">Progress</h3>
          <ul className="mt-8 divide-y divide-border">
            {(data?.uploads ?? []).length === 0 ? (
              <li className="py-8 text-ink-soft">No wraps saved yet.</li>
            ) : (
              (data?.uploads ?? []).map((u) => (
                <li key={u.id} className="py-8">
                  <p className="text-xs uppercase tracking-[0.28em] text-earth">
                    {u.angle} · {new Date(u.created_at).toLocaleDateString()}
                  </p>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed">{u.ai_feedback}</p>
                </li>
              ))
            )}
          </ul>
        </RoomBody>
      ) : null}

      {tab === "journal" ? (
        <RoomBody>
          <p className="text-xs uppercase tracking-[0.28em] text-earth">Private journal</p>
          <h2 className="mt-4 font-display text-4xl md:text-5xl">How did the wrap feel today?</h2>
          <form
            className="mt-10 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void addBindingJournal({ data: { entry } }).then(() => {
                setEntry("");
                void listBindingUploads().then(setData);
              });
            }}
          >
            <Textarea value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Write without an audience." />
            <Button type="submit">Save entry</Button>
          </form>
          <ul className="mt-12 divide-y divide-border">
            {(data?.journal ?? []).map((j) => (
              <li key={j.id} className="py-8">
                <p className="text-xs uppercase tracking-[0.28em] text-earth">{new Date(j.created_at).toLocaleString()}</p>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed">{j.entry}</p>
              </li>
            ))}
          </ul>
        </RoomBody>
      ) : null}
    </div>
  );
}

function fileToData(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read the photo"));
    reader.readAsDataURL(file);
  });
}
