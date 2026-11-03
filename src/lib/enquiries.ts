import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Sponsorship enquiries from the website. Each one is saved to the `sponsorship_enquiries` table
// (readable by admins only) and emailed to the addresses in SPONSORSHIP_RECIPIENTS, so nothing is
// lost if one of the two fails. Only the server saves them (the browser can't write to that table),
// at most 3 an hour from one visitor, and at most 40 emails a day in all, counting only enquiries that
// pass the bot checks: past that they are still saved, for the admins, but not emailed. Environment
// variables (in Vercel's project settings):
//   RESEND_API_KEY          key from resend.com
//   SPONSORSHIP_RECIPIENTS  comma-separated addresses, for example Vasco's, Diogo's and Nick's
//   SPONSORSHIP_FROM        sender, once emfc.es is verified in Resend: "EMFC website <website@emfc.es>"
//   TURNSTILE_SECRET_KEY    Cloudflare Turnstile, the bot check (with VITE_TURNSTILE_SITE_KEY); optional

export const FORMATS = ["Talent events", "Workshops", "Sponsored content", "Full-year partnership"] as const;

const Enquiry = z.object({
  name: z.string().trim().min(2).max(120),
  firm: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(200),
  format: z.enum(FORMATS),
  message: z.string().trim().min(10).max(4000),
  /** Honeypot: hidden from people, filled in by bots. */
  website: z.string().max(300).default(""),
  /** How long the form was open, in milliseconds. People take longer than a few seconds. */
  elapsed: z.number().int().nonnegative().max(86_400_000 * 7),
  /** Cloudflare Turnstile's token, when the bot check is set up. */
  turnstile: z.string().max(2048).optional(),
});

const PER_VISITOR_PER_HOUR = 3;
const EMAILS_PER_DAY = 40;

export type EnquiryInput = z.input<typeof Enquiry>;
type Valid = z.output<typeof Enquiry>;

async function email(d: Valid, suspected: boolean) {
  const key = process.env.RESEND_API_KEY;
  const to = (process.env.SPONSORSHIP_RECIPIENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const text = [
    `Name: ${d.name}`,
    `Firm: ${d.firm}`,
    `Email: ${d.email}`,
    `Interested in: ${d.format}`,
    "",
    d.message,
    "",
    "Sent from the sponsorship form on emfc.es. Reply to this email to answer the sender.",
  ].join("\n");

  if (!key || to.length === 0) {
    // Not configured yet. While developing, show the enquiry in the server log instead.
    if (import.meta.env.DEV) {
      console.info(`[sponsorship] Email not configured. Enquiry:\n${text}`);
      return true;
    }
    console.error("[sponsorship] RESEND_API_KEY or SPONSORSHIP_RECIPIENTS is missing");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.SPONSORSHIP_FROM ?? "EMFC website <onboarding@resend.dev>",
        to,
        reply_to: d.email,
        subject: `${suspected ? "[Possibly automated] " : ""}Sponsorship enquiry: ${d.firm}`,
        text,
      }),
    });
    if (!res.ok) console.error("[sponsorship] Resend refused the email", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[sponsorship] Resend could not be reached", (err as Error).message);
    return false;
  }
}

export type EnquiryResult = { ok: boolean; reason?: "limit" | "check" };

export const sendSponsorshipEnquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => Enquiry.parse(data))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const guard = await import("@/lib/server/guard");
    const { ip } = guard.requestInfo();
    if (!(await guard.humanCheck(data.turnstile, ip))) return { ok: false, reason: "check" };
    // Without the server secret there is no sender code, and so no hourly limit; the enquiry still goes on.
    const sender = await guard.fingerprint("enquiry", ip).catch((err: Error) => {
      console.error("[sponsorship]", err.message);
      return null;
    });
    if (sender && !(await guard.takeSlot("enquiry", sender, 60, PER_VISITOR_PER_HOUR))) return { ok: false, reason: "limit" };

    // Bots fill the hidden field or submit within moments of the page loading. Such an enquiry is still
    // saved, marked for the admins to check, but not emailed, so a quick real sender is never lost.
    const suspected = Boolean(data.website) || data.elapsed < 2500;
    // Only clean enquiries use up the day's emails, so bots caught above can't crowd out real senders.
    // Past the cap an enquiry is saved, unmarked, for the admins.
    const withinCap = !suspected && (await guard.takeSlot("enquiry-email", "all", 24 * 60, EMAILS_PER_DAY));
    if (!withinCap) console.warn(`[sponsorship] Enquiry from ${data.firm} saved for review, not emailed${suspected ? "" : " (daily cap reached)"}`);

    let saveError: string | undefined;
    try {
      const { error } = await guard.admin.from("sponsorship_enquiries" as never).insert({
        name: data.name,
        firm: data.firm,
        email: data.email,
        format: data.format,
        message: data.message,
        suspected_bot: suspected,
        sender,
      } as never);
      saveError = error?.message;
    } catch (err) {
      saveError = (err as Error).message;
    }
    if (saveError) console.error("[sponsorship] Could not save the enquiry", saveError);

    // Email every clean enquiry within the cap, and any enquiry that could not be saved, so none is lost.
    const sent = withinCap || saveError ? await email(data, suspected) : false;
    return { ok: sent || !saveError };
  });
