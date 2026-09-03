import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { claimMembership, getCheckoutByToken } from "@/lib/server/checkout";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/join")({
  validateSearch: (s: Record<string, unknown>) => ({
    token: typeof s.token === "string" ? s.token : "",
  }),
  component: Join,
});

function Join() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const { site, content } = usePublicSite();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const guard = useFormGuard();

  useEffect(() => {
    if (!token) return;
    void getCheckoutByToken({ data: { token } }).then((row) => {
      if (row?.email) setEmail(row.email);
    });
  }, [token]);

  useEffect(() => {
    if (isPending || !user) return;
    void claimMembership({ data: { token: token || undefined } }).then(() => {
      void navigate({ to: "/app/onboarding" });
    });
  }, [isPending, user, token, navigate]);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      toast.error("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: token ? `/join?token=${encodeURIComponent(token)}` : "/app/onboarding",
      });
      if (error) throw new Error(error.message);
      toast.success("Account created.");
      await claimMembership({ data: { token: token || undefined } });
      void navigate({ to: "/app/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PublicNav overlay />
      <section className="grid min-h-dvh lg:grid-cols-2">
        <div className="relative hidden min-h-dvh overflow-hidden text-paper lg:block">
          <img
            src={content.images.join}
            alt=""
            className="media absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-veil pointer-events-none absolute inset-0" />
          <div className="relative flex min-h-dvh flex-col justify-end px-12 pb-16 pt-32">
            <p className="text-xs uppercase tracking-[0.32em] text-gold">{site.joinKicker}</p>
            <p className="mt-6 max-w-md font-display text-5xl leading-[1.05]">
              {site.joinPhotoLine}
            </p>
          </div>
        </div>
        <div className="flex min-h-dvh flex-col justify-center bg-wash-clay px-5 py-28 md:px-16">
          <p className="text-xs uppercase tracking-[0.32em] text-clay">{site.joinEyebrow}</p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">{site.joinTitle}</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            {site.joinBody}
          </p>
          <div className="editorial-rule mt-8" />
          {authEnabled ? (
            <div className="mt-10 space-y-3">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full max-w-md"
                  onClick={() =>
                    void signIn(p.providerId, {
                      callbackURL: token ? `/join?token=${encodeURIComponent(token)}` : "/app/onboarding",
                    })
                  }
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : null}
          <form onSubmit={onEmail} className="mt-8 max-w-md space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <HumanCheck
              checked={guard.human}
              onChecked={guard.setHuman}
              honey={guard.honey}
              onHoney={guard.setHoney}
            />
            <Button type="submit" className="w-full" size="lg" disabled={busy || !guard.human}>
              {busy ? "Creating…" : "Enter the house"}
            </Button>
          </form>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
