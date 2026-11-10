import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type RequestContext = { getStore(): { nonce: string } | undefined };

export const getRouter = () => {
  // On the server, the nonce of this request's Content Security Policy (set in src/server.ts).
  const nonce = (globalThis as { __emfcRequest?: RequestContext }).__emfcRequest?.getStore()?.nonce;

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    // Hovering or touching a link fetches that page's code and data, so the click feels instant.
    defaultPreload: "intent",
    ...(nonce ? { ssr: { nonce } } : {}),
  });

  return router;
};
