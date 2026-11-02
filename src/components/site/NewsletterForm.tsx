import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/**
 * Newsletter sign-up. Saves the address to the newsletter_signups table, only with the sender's
 * consent to be contacted (decided 2 November 2026). The privacy page explains how it is used.
 */
export function NewsletterForm({
  label = "Newsletter: news and upcoming events",
  dark = false,
  className,
}: {
  label?: string;
  dark?: boolean;
  className?: string;
}) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (!consent) {
      toast.error("Please tick the box to agree to be contacted.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("newsletter_signups" as never).insert({ email } as never);
    setBusy(false);
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      toast.error("Could not subscribe. Try again.");
      return;
    }
    toast.success("Subscribed. Thank you.");
    setEmail("");
    setConsent(false);
  }

  return (
    <form onSubmit={signup} className={cn("flex flex-col gap-3", className)}>
      <label
        htmlFor={id}
        className={cn(
          "caps text-[10px] tracking-[0.22em] md:text-[10.5px]",
          dark ? "text-bull-light" : "text-mute",
        )}
      >
        {label}
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className={cn(
            "h-[52px] min-w-0 rounded-full sm:flex-1 border px-5 text-base outline-offset-2 focus-visible:outline-2",
            dark
              ? "border-white/40 bg-white/5 text-white placeholder:text-[#A9B0C6] focus-visible:outline-white"
              : "border-mute bg-field text-ink placeholder:text-mute focus-visible:outline-ink",
          )}
        />
        <button
          disabled={busy}
          className={cn(
            "btn h-[52px] px-6 text-[11.5px] disabled:opacity-60",
            dark ? "btn-white" : "btn-ink",
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Subscribe"}
        </button>
      </div>
      <label
        htmlFor={`${id}-consent`}
        className={cn("flex items-start gap-2.5 text-[13px]/[1.5]", dark ? "text-[#C9CEDD]" : "text-mute")}
      >
        <input
          id={`${id}-consent`}
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className={cn("mt-[3px] h-4 w-4 shrink-0", dark ? "accent-bull-light" : "accent-bull")}
        />
        <span>
          I consent to being contacted about future events.{" "}
          <Link to="/privacy" className="underline underline-offset-2">
            How we use your email
          </Link>
        </span>
      </label>
    </form>
  );
}
