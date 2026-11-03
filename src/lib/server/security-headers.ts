// Security headers for every page the server renders. The Content Security Policy only lets the
// browser run scripts from this site, Cloudflare's bot check and inline scripts carrying this
// request's nonce (TanStack's own and the theme script get it through the router), and only talk to
// this site and the club's Supabase project. Static files get BASE_SECURITY_HEADERS through the
// Nitro route rules in vite.config.ts.

const TURNSTILE = "https://challenges.cloudflare.com";

export function contentSecurityPolicy(nonce: string) {
  // Read here rather than when the file loads: vite.config.ts imports this file, and the build
  // settings have no import.meta.env.
  const supabase = new URL(import.meta.env.VITE_SUPABASE_URL ?? "https://rqgjcdttfccemcyxulub.supabase.co").origin;
  const supabaseSocket = supabase.replace(/^https:/, "wss:");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' ${TURNSTILE}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: https://img.logo.dev ${supabase}`,
    `media-src 'self' blob: ${supabase}`,
    `connect-src 'self' ${supabase} ${supabaseSocket}`,
    `frame-src ${TURNSTILE}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** The headers every response gets, pages and static files alike. */
export const BASE_SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
};

export function newNonce() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** Copies the response with the security headers added (some responses have read-only headers). */
export function withSecurityHeaders(response: Response, nonce: string) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(BASE_SECURITY_HEADERS)) headers.set(k, v);
  if ((headers.get("content-type") ?? "").includes("text/html")) {
    headers.set("Content-Security-Policy", contentSecurityPolicy(nonce));
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
