import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Two-factor sign-in for editors and admins, with an authenticator app (Google Authenticator,
// Microsoft Authenticator, 1Password, Apple Passwords...). The database only honours editor and admin
// powers in a session that has passed this step (aal2). Someone who loses their phone asks an admin to
// reset it on the Access tab.

const card = "flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-8";
const codeInput = "h-12 w-full rounded-md border border-input bg-background px-3 text-center font-mono text-2xl tracking-[0.4em]";
const primary =
  "inline-flex h-11 w-full items-center justify-center rounded-md bg-navy text-sm font-medium text-primary-foreground disabled:opacity-60";
const secondary = "self-start text-left text-sm text-navy underline-offset-4 hover:underline";

const sixDigits = (v: string) => v.replace(/\D/g, "").slice(0, 6);

function SignOut() {
  return (
    <button type="button" className={secondary} onClick={() => supabase.auth.signOut()}>
      Sign out
    </button>
  );
}

/** First time: add an authenticator app by scanning a QR code, then confirm with a code. */
export function SetUpTwoFactor({ email, onDone }: { email: string; onDone: () => void }) {
  const [factor, setFactor] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      // Clear any half-finished set-up from before, so the QR code is always fresh.
      const { data } = await supabase.auth.mfa.listFactors();
      for (const f of data?.all ?? []) if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data: made, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "EMFC admin page" });
      if (!live) return;
      if (error || !made) toast.error(error?.message ?? "Could not start the set-up. Reload the page.");
      else setFactor({ id: made.id, qr: made.totp.qr_code, secret: made.totp.secret });
    })();
    return () => {
      live = false;
    };
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factor) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
    setBusy(false);
    if (error) {
      toast.error("That code didn't work. Check the time on your phone and try the newest code.");
      setCode("");
      return;
    }
    toast.success("Two-factor sign-in is on");
    onDone();
  }

  return (
    <div className="container-emis flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={verify} className={card}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-2xl text-navy">Set up two-factor sign-in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The admin page protects people's data, so every editor and admin signs in with a code from their phone as
            well as their password. It takes a minute, once.
          </p>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          <li>Install an authenticator app, for example Google Authenticator, Microsoft Authenticator or 1Password.</li>
          <li>In the app, add an account and scan this code.</li>
          <li>Type the 6-digit code the app shows.</li>
        </ol>
        <div className="grid place-items-center rounded-lg border border-border bg-white p-4">
          {factor ? (
            <img src={factor.qr} alt={`QR code to add ${email} to an authenticator app`} className="h-48 w-48" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          )}
        </div>
        {factor && (
          <button type="button" className={secondary} onClick={() => setShowKey((v) => !v)}>
            {showKey ? "Hide the key" : "Can't scan it? Type a key instead"}
          </button>
        )}
        {factor && showKey && <code className="break-all rounded bg-secondary p-2 text-center text-sm">{factor.secret}</code>}
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          aria-label="The 6-digit code from your app"
          value={code}
          onChange={(e) => setCode(sixDigits(e.target.value))}
          className={codeInput}
        />
        <button className={primary} disabled={busy || !factor || code.length !== 6}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Turn on two-factor sign-in"}
        </button>
        <SignOut />
      </form>
    </div>
  );
}

/** Each sign-in after that: the code from the app. */
export function TwoFactorCode({ onDone }: { onDone: () => void }) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.mfa.listFactors().then(({ data }) => setFactorId(data?.totp[0]?.id ?? null));
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
    setBusy(false);
    if (error) {
      toast.error("That code didn't work. Try the newest one in your app.");
      setCode("");
      return;
    }
    onDone();
  }

  return (
    <div className="container-emis flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={verify} className={card}>
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-2xl text-navy">Enter your code</h1>
          <p className="mt-2 text-sm text-muted-foreground">Open your authenticator app and type the 6-digit code for EMFC.</p>
        </div>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123456"
          aria-label="The 6-digit code from your app"
          autoFocus
          value={code}
          onChange={(e) => setCode(sixDigits(e.target.value))}
          className={codeInput}
        />
        <button className={primary} disabled={busy || !factorId || code.length !== 6}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
        </button>
        <p className="text-xs text-muted-foreground">Lost your phone? Ask an admin to reset your two-factor sign-in on the Access tab.</p>
        <SignOut />
      </form>
    </div>
  );
}
