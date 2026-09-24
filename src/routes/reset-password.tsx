import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import { PublicFooter, PublicNav } from "@/components/layout/public-chrome";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { authClient } from "@/lib/auth/client";
import { readableAuthError } from "@/lib/auth/errors";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
    error: typeof search.error === "string" ? search.error : "",
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const { token, error: callbackError } = Route.useSearch();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!token) {
      setError("This reset link is missing or expired. Request a new one.");
      return;
    }
    if (password.length < 10) {
      setError("Use at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (resetError) throw resetError;
      setDone(true);
    } catch (err) {
      setError(readableAuthError(err, "That reset link is invalid or expired. Request a new one."));
    } finally {
      setBusy(false);
    }
  }

  const invalid = Boolean(callbackError) || !token;

  return (
    <div>
      <PublicNav />
      <main className="mx-auto min-h-[70vh] max-w-xl px-4 py-16 md:py-24">
        <div className="rounded-[30px] border border-border bg-card p-6 shadow-[var(--shadow-border)] md:p-8">
          <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            {done ? <CheckCircle2 className="size-5" /> : <KeyRound className="size-5" />}
          </div>
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-earth">Account security</p>
          <h1 className="mt-3 font-display text-4xl">{done ? "Password updated." : "Choose a new password."}</h1>

          {done ? (
            <>
              <p className="mt-4 leading-7 text-muted-foreground">
                Your new password is saved. Sign in again to continue into your Her First Meal account.
              </p>
              <Button type="button" className="mt-7" onClick={() => void navigate({ to: "/login", search: {} })}>
                Continue to sign in
              </Button>
            </>
          ) : invalid ? (
            <>
              <p role="alert" className="mt-4 leading-7 text-muted-foreground">
                This reset link is invalid or expired. Request a new secure link.
              </p>
              <Link to="/forgot-password" className="mt-7 inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground">
                Request another link
              </Link>
            </>
          ) : (
            <form onSubmit={submit} className="mt-7 space-y-4">
              <div>
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Type it again</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={10}
                  maxLength={128}
                  required
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </div>
              {error ? <p role="alert" className="rounded-xl bg-clay px-4 py-3 text-sm text-paper">{error}</p> : null}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? "Updating password…" : "Save new password"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
