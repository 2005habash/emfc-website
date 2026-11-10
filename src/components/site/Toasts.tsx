import { lazy, Suspense, useEffect, useState } from "react";
import { toasts } from "@/lib/toast";

const Toaster = lazy(() => import("./ToastsToaster"));

/**
 * Mounted once, in the root layout. Waits until a toast is first wanted (src/lib/toast.ts), then
 * fetches the toast library and puts the toaster on the page.
 */
export function Toasts() {
  const [wanted, setWanted] = useState(false);
  useEffect(() => {
    if (toasts.isWanted()) return setWanted(true);
    const on = () => setWanted(true);
    window.addEventListener(toasts.EVENT, on, { once: true });
    return () => window.removeEventListener(toasts.EVENT, on);
  }, []);
  return wanted ? (
    <Suspense fallback={null}>
      <Toaster />
    </Suspense>
  ) : null;
}
