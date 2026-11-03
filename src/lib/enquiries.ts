import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Sponsorship enquiries from the website. Each one is saved to the `sponsorship_enquiries` table
// (readable by admins only) and emailed to the addresses in SPONSORSHIP_RECIPIENTS, so nothing is
// lost if one of the two fails. Only the server saves them (the browser can't write to that table),
// at most 3 an hour from one visitor, and at most 40 emails a day in all: past that they are still
// saved, for the admins, but not emailed. Environment variables (in Vercel's project settings):
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
}

export type EnquiryResult = { ok: boolean; reason?: "limit" | "check" };

export const sendSponsorshipEnquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => Enquiry.parse(data))
  .handler(async ({ data }): Promise<EnquiryResult> => {
    const guard = await import("@/lib/server/guard");
    const visitor = guard.requestInfo();
    if (!(await guard.humanCheck(data.turnstile, visitor.ip))) return { ok: false, reason: "check" };
    const sender = await guard.fingerprint("enquiry", visitor.ip);
    if ((await guard.recentCount("sponsorship_enquiries", 60, "sender", sender)) >= PER_VISITOR_PER_HOUR) {
      return { ok: false, reason: "limit" };
    }

    // Bots fill the hidden field or submit within moments of the page loading. Such an enquiry is still
    // saved, marked for the admins to check, but not emailed, so a quick real sender is never lost.
    // The same goes for everything past the day's email cap.
    const overCap = (await guard.recentCount("sponsorship_enquiries", 24 * 60)) >= EMAILS_PER_DAY;
    const suspected = Boolean(data.website) || data.elapsed < 2500 || overCap;
    if (suspected) console.warn(`[sponsorship] Enquiry from ${data.firm} saved for review, not emailed${overCap ? " (daily cap reached)" : ""}`);

    const { error } = await guard.admin.from("sponsorship_enquiries" as never).insert({
      name: data.name,
      firm: data.firm,
      email: data.email,
      format: data.format,
      message: data.message,
      suspected_bot: suspected,
      sender,
    } as never);
    if (error) console.error("[sponsorship] Could not save the enquiry", error.message);

    // Email every clean enquiry, and any enquiry that could not be saved, so none is lost.
    const sent = !suspected || error ? await email(data, suspected) : false;
    return { ok: sent || !error };
  });
