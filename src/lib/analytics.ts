import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { todayInBarcelona } from "@/lib/site";

// Anonymous site analytics, shown on the admin page's Analytics tab. Each event is saved to the
// analytics_events table without names, IP addresses or cookies: the country and device come from
// the request, and "visitor" is a daily code made with a key only the server knows, so a person counts
// once a day and can't be followed across days or traced back to an address. Only the server writes
// the table; one visitor can record at most 150 events in 10 minutes. Bots and link previews are not
// counted.

const Event = z.object({
  kind: z.enum(["page_view", "profile_open", "linkedin_click", "report_download"]),
  path: z.string().max(300),
  target: z.string().max(300).optional(),
  referrer: z.string().max(200).optional(),
});
export type AnalyticsEvent = z.input<typeof Event>;

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|lighthouse|headless|monitor|curl|python|wget/i;

export const recordEvent = createServerFn({ method: "POST" })
  .validator((data: unknown) => Event.parse(data))
  .handler(async ({ data }) => {
    const guard = await import("@/lib/server/guard");
    const { ip, userAgent, country } = guard.requestInfo();
    if (!userAgent || BOT.test(userAgent)) return { ok: false };
    const visitor = await guard.fingerprint("visitor", todayInBarcelona(), ip, userAgent);
    if (!(await guard.takeSlot("analytics", visitor, 10, 150))) return { ok: false };
    const device = /iPad|Tablet/i.test(userAgent) ? "tablet" : /Mobi|Android|iPhone/i.test(userAgent) ? "mobile" : "desktop";
    const { error } = await guard.admin.from("analytics_events" as never).insert({
      kind: data.kind,
      path: data.path,
      target: data.target ?? null,
      referrer: data.referrer ?? null,
      country,
      device,
      visitor,
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
