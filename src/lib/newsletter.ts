import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Newsletter sign-ups from the footer and the homepage. Only the server saves them (the browser
// can't write to newsletter_signups), with the sender's consent, at most 30 an hour from one internet
// address: everyone on the campus Wi-Fi can share one, so a sign-up drive at an event still fits.
// Signing up twice with the same address is fine: it is kept once.

const PER_ADDRESS_PER_HOUR = 30;

const Signup = z.object({
  email: z.string().trim().toLowerCase().email().min(5).max(254),
  consent: z.literal(true),
});

export type SignupResult = { ok: boolean; reason?: "limit" };

export const subscribe = createServerFn({ method: "POST" })
  .validator((data: unknown) => Signup.parse(data))
  .handler(async ({ data }): Promise<SignupResult> => {
    const guard = await import("@/lib/server/guard");
    const sender = await guard.fingerprint("newsletter", guard.requestInfo().ip);
    if (!(await guard.takeSlot("newsletter", sender, 60, PER_ADDRESS_PER_HOUR))) return { ok: false, reason: "limit" };
    const { error } = await guard.admin.from("newsletter_signups" as never).insert({ email: data.email, sender } as never);
    if (error && error.code !== "23505") {
      console.error("[newsletter] Could not save the sign-up", error.message);
      return { ok: false };
    }
    return { ok: true };
  });
