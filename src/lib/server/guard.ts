import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Protection for the website's public submissions (sponsorship enquiries, newsletter sign-ups,
// analytics). Only the server writes them, with the secret key; the browser can't write to those
// tables. Server-only (the server/ folder can't reach the browser): load it inside a server
// function's handler with `await import("@/lib/server/guard")`.
// A check that can't run because of the site's own setup (the database or Cloudflare unreachable,
// a key missing or wrong) lets the request through and logs an error: turning a real sponsor away
// for the site's fault would be worse than a few extra rows.

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

/** The key for fingerprints, imported once per server instance rather than for every request. */
let hmacKey: Promise<CryptoKey> | undefined;

/**
 * A short code for counting and rate limits, made from the given parts with a key only the server
 * knows (so it can't be traced back to an address by trying them all).
 */
export async function fingerprint(...parts: string[]) {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.ANALYTICS_SALT;
  if (!secret) throw new Error("No server secret for fingerprints (SUPABASE_SECRET_KEY)");
  hmacKey ??= crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", await hmacKey, new TextEncoder().encode(parts.join("|")));
  return [...new Uint8Array(mac)]
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Takes one of the `max` requests a sender (`key`) may make per `minutes` for one kind of request
 * (`bucket`), or returns false once they are used up. The database counts and records in one step
 * (public.take_slot), so requests sent all at once can't slip past the count together.
 */
export async function takeSlot(bucket: string, key: string, minutes: number, max: number) {
  try {
    const { data, error } = await supabaseAdmin.rpc("take_slot" as never, { _bucket: bucket, _key: key, _minutes: minutes, _max: max } as never);
    if (error) throw new Error(error.message);
    return data !== false;
  } catch (err) {
    console.error(`[limits] Could not check the ${bucket} limit, so the request goes through:`, (err as Error).message);
    return true;
  }
}

/** Turnstile's answers that mean the site's own setup is at fault, not the visitor's token. */
const OUR_SIDE = ["missing-input-secret", "invalid-input-secret", "bad-request", "internal-error"];

/**
 * Cloudflare Turnstile, the bot check on the sponsorship form: false when the visitor's token is
 * missing, wrong or already used. Passes when Turnstile isn't set up yet (no TURNSTILE_SECRET_KEY),
 * so the form keeps working until it is, and when the check itself can't run.
 */
export async function humanCheck(token: string | undefined, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token, ...(ip ? { remoteip: ip } : {}) });
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const result = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
    if (result.success === true) return true;
    const ours = (result["error-codes"] ?? []).filter((code) => OUR_SIDE.includes(code));
    if (!ours.length) return false;
    throw new Error(ours.join(", "));
  } catch (err) {
    console.error("[turnstile] The bot check could not run, so the enquiry goes through:", (err as Error).message);
    return true;
  }
}
