import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Sponsorship enquiries from the website. Each one is saved to the `sponsorship_enquiries` table
// (readable by admins only) and emailed to the addresses in SPONSORSHIP_RECIPIENTS, so nothing is
// lost if one of the two fails. Environment variables (set them in Lovable's project settings):
//   RESEND_API_KEY          key from resend.com
//   SPONSORSHIP_RECIPIENTS  comma-separated addresses, for example Vasco's, Diogo's and Nick's
//   SPONSORSHIP_FROM        sender, once emfc.es is verified in Resend: "EMFC website <website@emfc.es>"

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
  elapsed: z.number().int().nonnegative(),
});

export type EnquiryInput = z.input<typeof Enquiry>;
type Valid = z.output<typeof Enquiry>;

async function email(d: Valid) {
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
      subject: `Sponsorship enquiry: ${d.firm}`,
      text,
    }),
  });
  if (!res.ok) console.error("[sponsorship] Resend refused the email", res.status, await res.text());
  return res.ok;
}

export const sendSponsorshipEnquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Enquiry.parse(data))
  .handler(async ({ data }) => {
    // Bots fill the hidden field or submit instantly: answer as if it worked, and drop it.
    if (data.website || data.elapsed < 2500) return { ok: true };

    const { error } = await supabase.from("sponsorship_enquiries" as never).insert({
      name: data.name,
      firm: data.firm,
      email: data.email,
      format: data.format,
      message: data.message,
    } as never);
    if (error) console.error("[sponsorship] Could not save the enquiry", error.message);

    const sent = await email(data);
    return { ok: sent || !error };
  });
