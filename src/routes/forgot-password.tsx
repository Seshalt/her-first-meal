import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { HumanCheck, useFormGuard } from "@/components/security/human-check";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { requestHousePasswordReset } from "@/lib/server/password-reset";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const guard = useFormGuard();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!guard.human) {
      setError("Please confirm you are a person.");
      return;
    }
    setBusy(true);
    try {
      await requestHousePasswordReset({
        data: {
          email,
          human: guard.human,
          honey: guard.honey,
          startedAt: guard.startedAt,
        },
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password reset is unavailable right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PublicNav />
      <main className="mx-auto min-h-[70vh] max-w-xl px-4 py-16 md:py-24">
        <div className="rounded-[30px] border border-border bg-card p-6 shadow-[var(--shadow-border)] md:p-8">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            {sent ? <Mail className="size-5" /> : <ShieldCheck className="size-5" />}
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-earth">Account security</p>
          <h1 className="mt-3 font-display text-4xl">Reset your password.</h1>

          {sent ? (
            <>
              <p className="mt-4 leading-7 text-muted-foreground">
                If an account exists for <strong className="text-foreground">{email}</strong>, a secure reset link is on the way. The link expires in one hour.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Check spam or promotions too. For privacy, this page does not confirm whether an account exists.
              </p>
              <Link to="/login" search={{}} className="mt-7 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
                Back to sign in
              </Link>
            </>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <HumanCheck
                checked={guard.human}
                onChecked={guard.setHuman}
                honey={guard.honey}
                onHoney={guard.setHoney}
              />
              {error ? <p role="alert" className="rounded-xl bg-clay px-4 py-3 text-sm text-paper">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy || !guard.human}>
                {busy ? "Sending secure link…" : "Send reset link"}
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                We use the same security mailbox as account verification. No password is ever sent by email.
              </p>
            </form>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
