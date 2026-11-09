import { useEffect, useState } from "react";
import { STATS, TARGET_AREAS, TARGET_CITIES } from "@/data/stats";
import type { EventItem } from "@/data/events";
import { REPORTS } from "@/data/reports";
import { loadReports } from "@/lib/content";
import { todayInBarcelona } from "@/lib/site";
import { cn } from "@/lib/utils";
import { barcelonaTime, euronextOpen, openTerminal } from "./signals";

type Quote = { symbol: string; value: string; move?: "up" | "down" };

/**
 * A ticker tape of the club, under the homepage's first screen. The figures are the real ones from
 * src/data/stats.ts and the events and reports; counts that only grow carry an up arrow. Three quotes
 * are jokes, and read as jokes. It stops on hover and stands still for reduced motion.
 */
export function Ticker({ events }: { events: EventItem[] }) {
  const today = todayInBarcelona();
  const held = events.filter((e) => e.date <= today).length;
  // Reports as the library counts them (the database's), once the page runs in the browser.
  const [reports, setReports] = useState(REPORTS.filter((r) => r.status === "published").length);
  useEffect(() => {
    loadReports()
      .then((all) => setReports(all.filter((r) => r.status === "published").length))
      .catch(() => {});
  }, []);
  const pe = TARGET_AREAS.find((a) => a.name === "Private Equity")?.pct;
  const london = TARGET_CITIES.find((c) => c.name === "London")?.pct;

  const quotes: Quote[] = [
    { symbol: "MEMBERS", value: String(STATS.members) },
    { symbol: "NATIONALITIES", value: String(STATS.nationalities) },
    { symbol: "EVENTS HELD", value: String(held), move: "up" },
    { symbol: "REPORTS", value: String(reports), move: "up" },
    { symbol: "COFFEE", value: "+12.5%", move: "up" },
    { symbol: "INTERNSHIPS", value: `${STATS.internships}+` },
    { symbol: "FIRMS ON CVS", value: String(STATS.firms) },
    { symbol: "EXPERIENCE", value: `${STATS.experiencePct}%` },
    { symbol: "SLEEP", value: "-8.0%", move: "down" },
    { symbol: "DESKS", value: String(STATS.desks) },
    { symbol: "LANGUAGES", value: String(STATS.languages) },
    { symbol: "UNIVERSITIES", value: String(STATS.universities) },
    ...(pe ? [{ symbol: "AIMING FOR PE", value: `${pe}%` }] : []),
    ...(london ? [{ symbol: "AIMING FOR LONDON", value: `${london}%` }] : []),
    { symbol: "CTRL+Z", value: "+400%", move: "up" },
  ];

  return (
    <section
      aria-label="EMFC in figures"
      className="relative flex h-12 items-stretch bg-deep font-mono text-[12px] uppercase tracking-[0.08em] text-mist md:h-[52px] md:text-[12.5px]"
    >
      <MarketClock />
      <div className="group relative flex-1 overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_3%,#000_97%,transparent)]">
        <div className="flex h-full w-max animate-marquee items-center [animation-duration:70s] group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
              className="flex shrink-0 items-center"
            >
              {quotes.map((q) => (
                <li
                  key={q.symbol}
                  className="flex items-center gap-2.5 whitespace-nowrap px-6 md:px-7"
                >
                  <span className="text-haze">{q.symbol}</span>
                  <span className="font-medium text-white">{q.value}</span>
                  {q.move && (
                    <>
                      <span
                        aria-hidden
                        className={cn(
                          "text-[10px]",
                          q.move === "up" ? "text-bull-light" : "text-haze",
                        )}
                      >
                        {q.move === "up" ? "▲" : "▼"}
                      </span>
                      <span className="sr-only">{q.move}</span>
                    </>
                  )}
                  <span aria-hidden className="ml-4 h-1 w-1 bg-white/20 md:ml-5" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Barcelona's time and whether Euronext is trading, filled in once the page runs in the browser. */
function MarketClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(id);
  }, []);
  const open = now ? euronextOpen(now) : false;
  return (
    <button
      type="button"
      onClick={() => openTerminal("DES")}
      title="Open the EMFC Terminal"
      className="relative z-10 flex shrink-0 items-center gap-2.5 border-r border-white/10 bg-night px-4 text-left hover:bg-[rgb(255_255_255/0.06)] md:px-6"
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", now && open ? "bg-bull-light" : "bg-haze/60")}
      />
      <span className="font-medium text-white">EMFC</span>
      <span className="hidden text-haze sm:inline">
        {now ? `BCN ${barcelonaTime(now)}, Euronext ${open ? "open" : "closed"}` : "BCN"}
      </span>
    </button>
  );
}
