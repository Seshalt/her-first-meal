import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { atelierReadyLocal, markAtelierReady } from "@/lib/atelier-ready";
import { getMyRole } from "@/lib/server/admin";
import { hasAdministrator } from "@/lib/server/public";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { usePublicSite } from "@/lib/use-public-site";

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): { next?: "/admin" } =>
    s.next === "/admin" ? { next: "/admin" } : {},
  component: Login,
});

function Login() {
  const { next } = Route.useSearch();
  const ownerDoor = next === "/admin";
  const { user, isPending } = useCurrentUserState();
  const { site, content } = usePublicSite();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [home, setHome] = useState<"/" | "/app" | "/admin" | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const guard = useFormGuard();

  useEffect(() => {
    if (atelierReadyLocal()) {
      setShowCreate(false);
      return;
    }
    void hasAdministrator()
      .then((r) => setShowCreate(!r.hasAdmin))
      .catch(() => setShowCreate(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    void getMyRole()
      .then((r) => {
        if (r.role === "admin") markAtelierReady();
        const dest = r.role === "admin" || ownerDoor ? "/admin" : "/app";
        setHome(dest);
      })
      .catch(() => setHome(ownerDoor ? "/admin" : "/app"));
  }, [user, ownerDoor]);

  if (!isPending && user && home) return <Navigate to={home} />;

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (guard.honey.trim()) return;
    if (!guard.human) {
      toast.error("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        callbackURL: ownerDoor ? "/login?next=/admin" : "/login",
      });
      if (error) throw new Error(error.message);
      const r = await getMyRole();
      if (r.role === "admin") markAtelierReady();
      void navigate({ to: r.role === "admin" || ownerDoor ? "/admin" : "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in could not complete.");
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
            src={content.images.login}
            alt=""
            className="media absolute inset-0 h-full w-full object-cover"
          />
          <div className="hero-veil pointer-events-none absolute inset-0" />
          <div className="relative flex min-h-dvh flex-col justify-end px-12 pb-16 pt-32">
            <p className="text-xs uppercase tracking-[0.32em] text-aqua">{site.loginKicker}</p>
            <p className="mt-6 max-w-md font-display text-5xl leading-[1.05]">
              {site.loginPhotoLine}
            </p>
          </div>
        </div>
        <div className="flex min-h-dvh flex-col justify-center bg-wash-linen px-5 py-28 md:px-16">
          <p className="text-xs uppercase tracking-[0.32em] text-clay">
            {ownerDoor ? "Owner atelier" : site.loginEyebrow}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.8rem,6vw,4.8rem)] leading-[0.95]">
            {ownerDoor ? "Owner sign in." : site.loginTitle}
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
            {ownerDoor
              ? "Use the owner email and password. The same door as members — your role opens the atelier."
              : site.loginBody}
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
                  onClick={() => void signIn(p.providerId, { callbackURL: "/login" })}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">Sign-in is disabled.</p>
          )}
          <form onSubmit={onEmail} className="mt-8 max-w-md space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <HumanCheck
              checked={guard.human}
              onChecked={guard.setHuman}
              honey={guard.honey}
              onHoney={guard.setHoney}
            />
            <Button type="submit" className="w-full" size="lg" disabled={busy || !guard.human}>
              {busy ? "Entering…" : ownerDoor ? "Enter the atelier" : "Enter the house"}
            </Button>
          </form>
          <p className="mt-8 max-w-md text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/pricing" className="text-primary">
              Start your journey today
            </Link>
          </p>
          {showCreate ? (
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              First time opening the house?{" "}
              <Link to="/admin/setup" className="text-primary">
                Create the owner account
              </Link>
            </p>
          ) : (
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Owner? Sign in with that email — you will land in the atelier.
            </p>
          )}
        </div>
      </section>
      <PublicFooter />
    </div>
  );
}
