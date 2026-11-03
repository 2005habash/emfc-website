import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { BASE_SECURITY_HEADERS } from "./src/lib/server/security-headers.ts";

// Builds the site for Vercel. Nitro packages the server: on Vercel it builds Vercel's output by
// itself; elsewhere a plain Node server. Set NITRO_PRESET to choose (tools/export-static.sh uses
// node-server).
export default defineConfig(({ command }) => ({
  server: { host: "::", port: 8080 },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  plugins: [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tanstackStart({
      // src/server.ts wraps TanStack Start's server entry with the error page.
      server: { entry: "server" },
      // Files under a server/ folder, and "server-only" imports, never reach the browser.
      importProtection: { behavior: "error", client: { files: ["**/server/**"], specifiers: ["server-only"] } },
    }),
    command === "build" &&
      nitro({
        preset: process.env.NITRO_PRESET,
        // Every response, static files included, gets the same headers as the pages. Pages also get a
        // Content Security Policy with a per-request nonce (src/lib/server/security-headers.ts).
        routeRules: { "/**": { headers: BASE_SECURITY_HEADERS } },
      }),
    viteReact(),
  ],
}));
