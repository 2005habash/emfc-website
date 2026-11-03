import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

type RequestContext = { getStore(): { nonce: string } | undefined };

export const getRouter = () => {
  const queryClient = new QueryClient();
  // On the server, the nonce of this request's Content Security Policy (set in src/server.ts).
  const nonce = (globalThis as { __emfcRequest?: RequestContext }).__emfcRequest?.getStore()?.nonce;

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    ...(nonce ? { ssr: { nonce } } : {}),
  });

  return router;
};
