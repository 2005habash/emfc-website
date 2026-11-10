import { createFileRoute } from "@tanstack/react-router";
import { loadEvents } from "@/lib/content";
import { departments } from "@/lib/departments";
import { SITE_URL } from "@/lib/site";

// emfc.es/sitemap.xml: every public page, for search engines (public/robots.txt points here). The
// departments, desks and events are read from where the pages read them, so a new one is listed
// without a change here. The admin page is left out. A new top-level page needs adding to PAGES.
const PAGES = [
  "/",
  "/departments",
  "/events",
  "/resources",
  "/fund",
  "/team",
  "/sponsorship",
  "/arcade",
  "/glossary",
  "/privacy",
];

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const events = await loadEvents();
        const paths = [
          ...PAGES,
          ...departments.flatMap((d) => [
            `/departments/${d.slug}`,
            ...d.desks.map((k) => `/departments/${d.slug}/${k.slug}`),
          ]),
          ...events.map((e) => `/events/${encodeURIComponent(e.id)}`),
        ];
        const urls = paths.map((p) => `  <url><loc>${escape(SITE_URL + p)}</loc></url>`).join("\n");
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
          {
            headers: {
              "content-type": "application/xml; charset=utf-8",
              "cache-control": "public, max-age=3600",
            },
          },
        );
      },
    },
  },
});
