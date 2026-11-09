// The playful layer's signals, so any part of the site can open the terminal, start a bull run or
// change the theme without knowing where those live. Each is a plain browser event.

const OPEN_TERMINAL = "emfc:terminal";
const BULL_RUN = "emfc:bullrun";
const THEME = "emfc:theme";

export const openTerminal = (command?: string) =>
  window.dispatchEvent(new CustomEvent(OPEN_TERMINAL, { detail: command }));
export const startBullRun = () => window.dispatchEvent(new CustomEvent(BULL_RUN));

export function onOpenTerminal(fn: (command?: string) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<string | undefined>).detail);
  window.addEventListener(OPEN_TERMINAL, handler);
  return () => window.removeEventListener(OPEN_TERMINAL, handler);
}

export function onBullRun(fn: () => void) {
  window.addEventListener(BULL_RUN, fn);
  return () => window.removeEventListener(BULL_RUN, fn);
}

export const isDark = () => document.documentElement.classList.contains("dark");

/** Light is a bull market, dark a bear market. Saves the choice like the menu's toggle always has. */
export function setTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("emfc-theme", dark ? "dark" : "light");
  } catch {
    // Private mode: the choice just won't be remembered.
  }
  window.dispatchEvent(new CustomEvent(THEME, { detail: dark }));
}

export function onTheme(fn: (dark: boolean) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<boolean>).detail);
  window.addEventListener(THEME, handler);
  return () => window.removeEventListener(THEME, handler);
}

/** Barcelona's clock, as "14:05". */
export const barcelonaTime = (at = new Date(), seconds = false) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
    hourCycle: "h23",
  }).format(at);

// Days Euronext is closed on a weekday (its published calendars for 2026 and 2027).
const EURONEXT_HOLIDAYS = new Set([
  "2026-01-01",
  "2026-04-03",
  "2026-04-06",
  "2026-05-01",
  "2026-12-25",
  "2026-12-26",
  "2027-01-01",
  "2027-03-26",
  "2027-03-29",
  "2027-05-01",
  "2027-12-25",
  "2027-12-26",
]);

/** Whether Euronext's cash markets are trading right now: weekdays 09:00 to 17:30, Barcelona time. */
export function euronextOpen(at = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(at)
      .map((p) => [p.type, p.value]),
  );
  if (parts.weekday === "Sat" || parts.weekday === "Sun") return false;
  if (EURONEXT_HOLIDAYS.has(`${parts.year}-${parts.month}-${parts.day}`)) return false;
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  return minutes >= 9 * 60 && minutes < 17 * 60 + 30;
}
