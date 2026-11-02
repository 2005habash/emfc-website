import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Anonymous site analytics, shown on the admin page's Analytics tab. Each event is saved to the
// analytics_events table without names, IP addresses or cookies: the country and device come from
// the request, and "visitor" is a daily code hashed from the address and browser, so a person counts
// once a day and can't be followed across days. Bots and link previews are not counted.

const Event = z.object({
  kind: z.enum(["page_view", "profile_open", "linkedin_click", "report_download"]),
  path: z.string().max(300),
  target: z.string().max(300).optional(),
  referrer: z.string().max(200).optional(),
});
export type AnalyticsEvent = z.input<typeof Event>;

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless|monitor|curl|python|wget/i;

async function visitorCode(ip: string, userAgent: string) {
  const day = new Date().toISOString().slice(0, 10);
  const text = `${process.env.ANALYTICS_SALT ?? "emfc-analytics"}|${day}|${ip}|${userAgent}`;
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(hash)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const recordEvent = createServerFn({ method: "POST" })
  .validator((data: unknown) => Event.parse(data))
  .handler(async ({ data }) => {
    const headers = getRequest().headers;
    const userAgent = headers.get("user-agent") ?? "";
    if (!userAgent || BOT.test(userAgent)) return { ok: false };
    const ip = (headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || headers.get("x-real-ip") || "";
    const country = headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;
    const device = /iPad|Tablet/i.test(userAgent) ? "tablet" : /Mobi|Android|iPhone/i.test(userAgent) ? "mobile" : "desktop";
    const { error } = await supabase.from("analytics_events" as never).insert({
      kind: data.kind,
      path: data.path,
      target: data.target ?? null,
      referrer: data.referrer ?? null,
      country,
      device,
      visitor: await visitorCode(ip, userAgent),
    } as never);
    if (error) console.error("[analytics] Could not save the event", error.message);
    return { ok: !error };
  });

/** Records an event from the browser and never gets in the way: failures are ignored, and nothing is
 * counted on a developer's computer or on the admin page. */
export function track(event: AnalyticsEvent) {
  if (typeof window === "undefined") return;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) return;
  if (event.path.startsWith("/club-office")) return;
  recordEvent({ data: event }).catch(() => {});
}

let firstView = true;
/** Where the visitor came from, sent with their first page view only: another site's host name. */
export function takeReferrer() {
  if (!firstView) return undefined;
  firstView = false;
  try {
    const host = new URL(document.referrer).hostname.replace(/^www\./, "");
    return host && host !== window.location.hostname.replace(/^www\./, "") ? host : undefined;
  } catch {
    return undefined;
  }
}
