// Toasts: the short messages at the foot of the screen ("Bull market", "Copied", "Order filled").
// The library that draws them is only fetched the first time one is shown, so the pages that never
// show one don't carry it. Public pages use `toast` from here; the admin page, which shows them all
// the time, calls wantToasts() and uses the library directly.

type Options = { id?: string | number; description?: string; duration?: number };
type Kind = "plain" | "success" | "error";
type Show = (kind: Kind, message: string, options?: Options) => void;

const EVENT = "emfc:toasts";
const waiting: [Kind, string, Options | undefined][] = [];
let show: Show | undefined;
let wanted = false;

function push(kind: Kind, message: string, options?: Options) {
  if (show) return show(kind, message, options);
  waiting.push([kind, message, options]);
  wantToasts();
}

export const toast = Object.assign(
  (message: string, options?: Options) => push("plain", message, options),
  {
    success: (message: string, options?: Options) => push("success", message, options),
    error: (message: string, options?: Options) => push("error", message, options),
  },
);

/** Asks for the toaster to be put on the page now, before any toast is shown. */
export function wantToasts() {
  wanted = true;
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

/** For src/components/site/Toasts.tsx, which mounts the toaster when it is first wanted. */
export const toasts = {
  EVENT,
  isWanted: () => wanted,
  /** Called once the toaster is on the page: shows what was asked for meanwhile, then everything after. */
  ready(fn: Show) {
    show = fn;
    for (const [kind, message, options] of waiting.splice(0)) fn(kind, message, options);
  },
};
