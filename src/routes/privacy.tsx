import { createFileRoute } from "@tanstack/react-router";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { PageCanvas } from "@/components/layout/page-canvas";

export const Route = createFileRoute("/privacy")({
  loader: () => ({ title: "Privacy" }),
  component: Privacy,
});

function Privacy() {
  return (
    <div>
      <PublicNav />
      <PageCanvas>
        <article className="mx-auto max-w-2xl px-4 py-16">
          <p className="text-xs uppercase tracking-[0.22em] text-clay">Last updated September 4, 2026</p>
          <h1 className="mt-3 font-display text-5xl">Privacy</h1>
          <div className="glass-panel mt-8 space-y-8 p-6 text-sm leading-relaxed text-muted-foreground md:p-8">
            <section>
              <h2 className="font-display text-2xl text-ink">What we collect</h2>
              <p className="mt-2">
                Account email and password hash, name, optional pregnancy stage, due date or baby’s birthday,
                household notes, pantry and grocery preferences, appointments, Nouri conversations, belly-binding
                photographs you choose to upload, and records of membership and purchases.
              </p>
              <p className="mt-2">
                Location is optional. A ZIP code, city, or a store list you type is enough. We do not sell location
                data. We do not sell your health notes.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">How we use it</h2>
              <p className="mt-2">
                To keep you signed in, run membership, suggest meals and groceries, operate the binding studio and
                movement rooms, answer through Nouri, book optional sessions, take payment, and — if you allow
                cookies — count visits or measure ads.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Artificial intelligence</h2>
              <p className="mt-2">
                Nouri and some studio notes are generated with AI. The text you type and the photos you upload for
                those features may be sent to our servers and to the model provider we use so a reply can be written.
                Do not put another person’s medical file or a child’s full name into those rooms. AI output is not
                stored as a medical record. It is not shared with other members.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Who else sees it</h2>
              <p className="mt-2">
                The owner and administrators of this house can see what you share inside the studio so they can care
                for you. Owner notes are internal.
              </p>
              <p className="mt-2">
                Processors that help run the house may receive what they need to do their job: hosting and database,
                email delivery, Stripe for cards, and — only if you consent — analytics or advertising measurement.
                Stripe processes payment details. We do not keep your full card number.
              </p>
              <p className="mt-2">
                Those companies may store data on servers outside your country. If you use the house, you understand
                that transfer.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Cookies</h2>
              <p className="mt-2">
                Necessary cookies keep you signed in and keep the house working. When you tap Got it on the cookie
                notice, we store that choice on your device (a cookie and local storage) so the bar does not return
                every time you open a page.
              </p>
              <p className="mt-2">
                We also remember that you have already seen the notice by keeping a one-way hash of your network
                address (IP). We do not keep the raw address for this purpose. Shared networks can mean someone else
                on the same connection will not see the bar again. The full explanation of cookies lives on the Terms
                page. There are no switches in the banner.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">How long we keep it</h2>
              <p className="mt-2">
                While your account is open, and for a limited time after if the law requires us to keep billing or
                security records. You may delete your account from Settings. That removes personal records we control,
                except what the law says we must keep.
              </p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Children</h2>
              <p className="mt-2">This house is not directed at anyone under 18. We do not knowingly collect a child’s account.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-ink">Your requests</h2>
              <p className="mt-2">
                You may ask to see, correct, or delete personal information we hold, subject to the law. Use the
                Contact page. If your region gives extra rights (for example access, deletion, or a complaint to a
                regulator), we will honor what the law requires.
              </p>
            </section>
          </div>
        </article>
      </PageCanvas>
      <PublicFooter />
    </div>
  );
}
