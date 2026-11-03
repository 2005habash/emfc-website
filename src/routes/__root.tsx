import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { takeReferrer, track } from "@/lib/analytics";
import { absoluteUrl, IMAGES } from "@/lib/site";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-serif text-4xl text-navy">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-navy px-5 text-sm font-medium text-primary-foreground"
        >
          Back to EMFC
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl text-navy">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong on our end.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="inline-flex h-10 items-center rounded-md bg-navy px-5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex h-10 items-center rounded-md border border-border px-5 text-sm">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
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
        content: "The finance club at ESADE. A community built around careers, companies and the people you meet along the way.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "EMFC" },
      // Pages can set their own picture; the rest use this one. X reads the og: tags when there are no twitter: ones.
      { property: "og:image", content: absoluteUrl(IMAGES.share) },
      { property: "og:image:alt", content: "The EMFC bull and name over the club's group photo" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/images/logo/bull-tile.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap",
      },
    ],
  }),
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
        <script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
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
  const { queryClient } = Route.useRouteContext();
  useAnalytics();
  useEffect(() => {
    // Links in the admin emails (new password, confirm your email) belong on the admin page. If the
    // database's list of allowed addresses sends one to another page, carry it on with the link intact.
    const hash = window.location.hash;
    if (window.location.pathname === "/club-office") return;
    if (/[#&](type=(recovery|signup|invite|magiclink|email_change)|error_code=)/.test(hash)) {
      window.location.replace(`/club-office${hash.includes("type=recovery") ? "?reset=1" : ""}${hash}`);
    }
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
    </QueryClientProvider>
  );
}
