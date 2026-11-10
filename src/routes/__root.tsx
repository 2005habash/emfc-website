import {
  Outlet,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
// The three font files nearly every page needs, preloaded below (the rest are in src/styles.css).
import geist from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import cormorant from "@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2?url";
import cormorantItalic from "@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-italic.woff2?url";
import { Toasts } from "@/components/site/Toasts";
import { Delisted } from "@/components/fun/Delisted";
import { takeReferrer, track } from "@/lib/analytics";
import { absoluteUrl, IMAGES } from "@/lib/site";

function NotFoundComponent() {
  return <Delisted />;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  // The 404 page is "Delisted."; when a page fails to load, trading is halted.
  return (
    <div className="flex min-h-screen items-center bg-night px-6 text-white">
      <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-haze md:text-[13px]">
          Trading halted
        </p>
        <h1 className="font-serif text-[64px]/[0.9] tracking-[-0.02em] md:text-[112px]/[0.9]">
          Circuit breaker<em className="font-normal not-italic text-bull-light">.</em>
        </h1>
        <p className="max-w-[480px] text-[17px]/[1.65] text-mist">
          Something went wrong on our side, so this page has stopped trading for a moment. A retry
          usually gets it going again.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            aria-label="Resume trading: try again"
            className="btn btn-white"
          >
            Resume trading
          </button>
          <a href="/" className="btn btn-outline-white">
            Back to the homepage
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: ({ matches }) => {
    // The page's one true address (www, no trailing slash, nothing after "?"), so search engines and
    // link previews treat every way of reaching it as the same page.
    const path = matches[matches.length - 1]?.pathname ?? "/";
    const url = absoluteUrl(path === "/" ? "/" : path.replace(/\/$/, ""));
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "EMFC, ESADE Master's Finance Club" },
        {
          name: "description",
          content:
            "EMFC is the finance club at ESADE Business School in Barcelona, turning ambition into careers.",
        },
        { property: "og:title", content: "EMFC, ESADE Master's Finance Club" },
        {
          property: "og:description",
          content:
            "The finance club at ESADE. A community built around careers, companies and the people you meet along the way.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "EMFC" },
        // Pages can set their own picture; the rest use this one. X reads the og: tags when there are no twitter: ones.
        { property: "og:image", content: absoluteUrl(IMAGES.share) },
        { property: "og:image:alt", content: "The EMFC bull and name over the club's group photo" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "canonical", href: url },
        // Made from the bull tile by tools/size-images.py.
        { rel: "icon", type: "image/png", sizes: "48x48", href: "/images/sized/logo/icon-48.png" },
        {
          rel: "icon",
          type: "image/png",
          sizes: "192x192",
          href: "/images/sized/logo/icon-192.png",
        },
        { rel: "apple-touch-icon", href: "/images/sized/logo/apple-touch-icon.png" },
        ...[geist, cormorant, cormorantItalic].map((href) => ({
          rel: "preload",
          as: "font",
          type: "font/woff2",
          href,
          crossOrigin: "anonymous" as const,
        })),
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

// Runs before the page paints: applies the saved light/dark choice, and marks the page as allowed to
// animate (unless the visitor asked for reduced motion), so entrances only hide content when they can play.
const THEME_SCRIPT =
  "try{if(localStorage.getItem('emfc-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}" +
  "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')}catch(e){}";

function RootShell({ children }: { children: ReactNode }) {
  const nonce = useRouter().options.ssr?.nonce;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Counts page views, report downloads and members' LinkedIn clicks for the admin page's Analytics tab. */
function useAnalytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    track({ kind: "page_view", path: pathname, referrer: takeReferrer() });
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a");
      if (!a) return;
      const path = window.location.pathname;
      const member = a.getAttribute("data-linkedin-of");
      if (member) return track({ kind: "linkedin_click", path, target: member });
      const href = a.getAttribute("href") ?? "";
      if (/\.pdf($|\?)/i.test(href)) {
        const file = decodeURIComponent(href.split("?")[0].split("/").pop() ?? href);
        track({ kind: "report_download", path, target: file });
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function RootComponent() {
  useAnalytics();
  useEffect(() => {
    // Links in the admin emails (new password, confirm your email) belong on the admin page. If the
    // database's list of allowed addresses sends one to another page, carry it on with the link intact.
    const hash = window.location.hash;
    if (window.location.pathname === "/club-office") return;
    if (/[#&](type=(recovery|signup|invite|magiclink|email_change)|error_code=)/.test(hash)) {
      window.location.replace(
        `/club-office${hash.includes("type=recovery") ? "?reset=1" : ""}${hash}`,
      );
    }
  }, []);
  return (
    <>
      <Outlet />
      <Toasts />
    </>
  );
}
