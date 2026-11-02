import { Loader2 } from "lucide-react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

/** Newsletter sign-up. Saves the address to the newsletter_signups table. */
export function NewsletterForm({
  label = "Newsletter · Sign up to receive news and updates",
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

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
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
  }

  return (
    <form onSubmit={signup} className={cn("flex flex-col gap-3", className)}>
      <label
        htmlFor={id}
        className={cn(
          "caps text-[10px] tracking-[0.22em] md:text-[10.5px]",
          dark ? "text-brass-light" : "text-mute",
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
            "h-[52px] min-w-0 flex-1 rounded-full border px-5 text-base outline-offset-2 focus-visible:outline-2",
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
    </form>
  );
}
