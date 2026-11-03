import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Protection for the website's public submissions (sponsorship enquiries, newsletter sign-ups,
// analytics). Only the server writes them, with the secret key; the browser can't write to those
// tables. Server-only (the server/ folder can't reach the browser): load it inside a server
// function's handler with `await import("@/lib/server/guard")`.

export { supabaseAdmin as admin };

/** The visitor's address, browser and country, from the request. Never stored as they are. */
export function requestInfo() {
  const h = getRequest().headers;
  return {
    ip: (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "",
    userAgent: h.get("user-agent") ?? "",
    country: h.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null,
  };
}

/**
 * A short code for counting and rate limits, made from the given parts with a key only the server
 * knows (so it can't be traced back to an address by trying them all).
 */
export async function fingerprint(...parts: string[]) {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.ANALYTICS_SALT;
  if (!secret) throw new Error("No server secret for fingerprints (SUPABASE_SECRET_KEY)");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(parts.join("|")));
  return [...new Uint8Array(mac)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** How many rows a table got in the last `minutes`, optionally only those where `column` is `value`. */
export async function recentCount(table: string, minutes: number, column?: string, value?: string) {
  let q = supabaseAdmin
    .from(table as never)
    .select("*", { count: "exact", head: true })
    .gte("created_at" as never, new Date(Date.now() - minutes * 60_000).toISOString() as never);
  if (column) q = q.eq(column as never, value as never);
  const { count, error } = await q;
  if (error) throw new Error(`Could not count ${table}: ${error.message}`);
  return count ?? 0;
}

/**
 * Cloudflare Turnstile, the bot check on the sponsorship form. Passes when Turnstile isn't set up
 * yet (no TURNSTILE_SECRET_KEY), so the form keeps working until it is.
 */
export async function humanCheck(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const result = (await res.json().catch(() => ({}))) as { success?: boolean };
  return result.success === true;
}
