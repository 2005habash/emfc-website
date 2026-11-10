import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

/**
 * Brings a section into view when the address names it (for example a quiz result's link to
 * /departments/private-markets/private-equity#paper-lbo). Coming from another page, the router's
 * scroll restoration leaves the new page at the top, so the section scrolls itself into view once
 * the page has settled. Reads the router's location, which is current before the address bar is.
 */
export function useHashTarget(id: string) {
  const hash = useRouterState({ select: (s) => s.location.hash });
  useEffect(() => {
    if (hash !== id) return;
    const timer = setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" }),
      150,
    );
    return () => clearTimeout(timer);
  }, [hash, id]);
}
