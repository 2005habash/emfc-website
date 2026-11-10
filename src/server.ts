import "./lib/error-capture";
import { AsyncLocalStorage } from "node:async_hooks";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { newNonce, withSecurityHeaders } from "./lib/server/security-headers";

// Each request gets a fresh nonce for its Content Security Policy. The router reads it from here
// (src/router.tsx) so TanStack's inline scripts, and the theme script, carry it.
const requestContext = new AsyncLocalStorage<{ nonce: string }>();
(globalThis as { __emfcRequest?: typeof requestContext }).__emfcRequest = requestContext;

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const nonce = newNonce();
    try {
      const handler = await getServerEntry();
      const response = await requestContext.run({ nonce }, () => handler.fetch(request, env, ctx));
      const checked = await normalizeCatastrophicSsrResponse(response);
      // Development keeps Vite's own inline scripts working; the policy applies to real builds.
      return import.meta.env.PROD ? withSecurityHeaders(checked, nonce) : checked;
    } catch (error) {
      console.error(error);
      const failed = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      // The error page gets the same security headers as every other page.
      return import.meta.env.PROD ? withSecurityHeaders(failed, nonce) : failed;
    }
  },
};
