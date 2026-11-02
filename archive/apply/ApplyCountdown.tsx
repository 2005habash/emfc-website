import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Midnight at end of Sunday July 13, 2026 in Barcelona (Europe/Madrid, UTC+2 in July)
const DEADLINE = new Date("2026-07-14T00:00:00+02:00").getTime();

function diff(now: number) {
  const ms = Math.max(0, DEADLINE - now);
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: ms === 0,
  };
}

function useCountdown() {
  // Start at zeros for SSR/first paint to avoid hydration mismatch.
  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, done: false });
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    setT(diff(Date.now()));
    const id = setInterval(() => setT(diff(Date.now())), 1000);
    return () => clearInterval(id);
  }, []);
  return { ...t, mounted };
}

/** Large hero-style countdown block. Used on home + apply pages. */
export function ApplyCountdown() {
  const t = useCountdown();
  const units = [
    { v: t.days, l: "Days" },
    { v: t.hours, l: "Hours" },
    { v: t.minutes, l: "Minutes" },
    { v: t.seconds, l: "Seconds" },
  ];
  return (
    <div className="relative overflow-hidden rounded-sm border-2 border-gold bg-navy px-6 py-8 text-primary-foreground shadow-2xl md:px-10 md:py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 0%, color-mix(in oklab, var(--gold) 30%, transparent), transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 text-gold">
            <Clock className="h-4 w-4" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em]">
              Applications close
            </p>
          </div>
          <h3 className="mt-2 font-serif text-2xl text-primary-foreground md:text-3xl">
            Sunday 13 July · Midnight (CEST)
          </h3>
          <p className="mt-1 text-xs text-primary-foreground/70">
            Founding cohort · Associate seats for September 2026
          </p>
        </div>
        <div
          className="flex items-center gap-3 sm:gap-5"
          aria-live="polite"
          suppressHydrationWarning
        >
          {units.map((u) => (
            <div
              key={u.l}
              className="min-w-[64px] rounded-sm border border-sky-300 bg-white px-3 py-2 text-center shadow-sm sm:min-w-[76px] sm:px-4 sm:py-3"
            >
              <div className="font-serif text-3xl tabular-nums text-navy sm:text-4xl">
                {String(u.v).padStart(2, "0")}
              </div>
              <div className="mt-0.5 text-[9px] uppercase tracking-[0.24em] text-navy/70">
                {u.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Slim sticky bar mounted globally in SiteLayout so every page shows the timer. */
export function ApplyCountdownBar() {
  const t = useCountdown();
  if (t.done) return null;
  return (
    <div className="sticky top-0 z-40 border-b border-gold/40 bg-navy text-primary-foreground">
      <div className="container-wide flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-4 py-2 text-center">
        <div className="flex items-center gap-2 text-gold">
          <Clock className="h-3.5 w-3.5" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em]">
            Applications close Sun 13 Jul, midnight
          </span>
        </div>
        <div
          className="flex items-center gap-2 font-mono text-[13px] tabular-nums"
          suppressHydrationWarning
        >
          <TimeChip v={t.days} l="d" />
          <TimeChip v={t.hours} l="h" />
          <TimeChip v={t.minutes} l="m" />
          <TimeChip v={t.seconds} l="s" />
        </div>
        <Link
          to="/departments"
          className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold underline-offset-4 hover:underline"
        >
          Apply now →
        </Link>
      </div>
    </div>
  );
}

function TimeChip({ v, l }: { v: number; l: string }) {
  return (
    <span className="rounded-sm border border-sky-300 bg-white px-1.5 py-0.5">
      <span className="text-navy">{String(v).padStart(2, "0")}</span>
      <span className="text-navy/60">{l}</span>
    </span>
  );
}
