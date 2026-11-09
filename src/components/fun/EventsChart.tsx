import { Link } from "@tanstack/react-router";
import type { EventItem } from "@/data/events";
import { formatDay, todayInBarcelona } from "@/lib/site";
import { cn } from "@/lib/utils";

const W = 800;
const H = 280;
const PAD = { top: 24, right: 16, bottom: 8, left: 8 };
const DAY = 86_400_000;
const time = (iso: string) => new Date(`${iso}T12:00:00Z`).getTime();

/**
 * The club's track record as a stock chart on the Events page: every event held so far, counted up
 * over time. Each point is a real event and links to it.
 */
export function EventsChart({ events }: { events: EventItem[] }) {
  const today = todayInBarcelona();
  const held = [...events]
    .filter((e) => e.date <= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
  if (held.length < 2) return null;

  const start = time(held[0].date) - 12 * DAY;
  const end = time(today) + 6 * DAY;
  const x = (iso: string) =>
    PAD.left + ((time(iso) - start) / (end - start)) * (W - PAD.left - PAD.right);
  const y = (n: number) => H - PAD.bottom - (n / held.length) * (H - PAD.top - PAD.bottom);
  const points = held.map((e, i) => ({ e, px: x(e.date), py: y(i + 1) }));

  // A step line: flat until the next event, then up by one.
  let d = `M${PAD.left},${y(0)} L${points[0].px},${y(0)}`;
  points.forEach((p, i) => {
    d += ` L${p.px},${p.py}`;
    const next = points[i + 1];
    d += ` L${next ? next.px : x(today)},${p.py}`;
  });
  const area = `${d} L${x(today)},${H - PAD.bottom} L${PAD.left},${H - PAD.bottom} Z`;

  // Month labels along the bottom.
  const months: { label: string; px: number }[] = [];
  const m = new Date(start);
  m.setUTCDate(1);
  m.setUTCMonth(m.getUTCMonth() + 1);
  while (m.getTime() <= end) {
    months.push({
      label: m
        .toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
        .replace("Sept", "Sep"),
      px: PAD.left + ((m.getTime() - start) / (end - start)) * (W - PAD.left - PAD.right),
    });
    m.setUTCMonth(m.getUTCMonth() + 1);
  }

  return (
    <section aria-label="Events held so far" className="border-b border-line">
      <div className="gutter grid items-end gap-8 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
        <div className="flex flex-col gap-4 lg:col-span-3">
          <span className="font-mono text-[12px] uppercase tracking-[0.1em] text-mute">
            EMFC, events held
          </span>
          <span className="flex items-baseline gap-3">
            <span className="font-serif text-[88px]/[0.85] tracking-[-0.02em] md:text-[112px]/[0.85]">
              {held.length}
            </span>
            <span className="font-mono text-[13px] text-bull">
              ▲ since {formatDay(held[0].date, { day: undefined, month: "long" })}
            </span>
          </span>
          <p className="text-[14px]/[1.65] text-mute">
            Every event since the first one, counted up. Point at one to see it. Past performance is
            no guarantee of future events.
          </p>
        </div>

        <div className="lg:col-span-9">
          <div className="relative">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="block h-auto w-full overflow-visible"
              aria-hidden
            >
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <line
                  key={f}
                  x1={PAD.left}
                  x2={W - PAD.right}
                  y1={y(held.length * f)}
                  y2={y(held.length * f)}
                  className="stroke-line"
                  strokeDasharray="3 5"
                />
              ))}
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={H - PAD.bottom}
                y2={H - PAD.bottom}
                className="stroke-ink/40"
              />
              <path d={area} className="fill-bull/10" />
              <path
                d={d}
                fill="none"
                strokeWidth="2.5"
                strokeLinejoin="round"
                className="stroke-bull"
                style={{
                  strokeDasharray: 2400,
                  ["--line-length" as string]: 2400,
                  animation: "draw-line 2.2s ease-out both",
                }}
              />
            </svg>
            <ul>
              {points.map(({ e, px, py }, i) => {
                const left = (px / W) * 100;
                const align =
                  left < 18 ? "left-0" : left > 82 ? "right-0" : "left-1/2 -translate-x-1/2";
                return (
                  <li
                    key={e.id}
                    className="absolute"
                    style={{ left: `${left}%`, top: `${(py / H) * 100}%` }}
                  >
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: e.id }}
                      className="group absolute -left-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full outline-offset-2"
                    >
                      <span
                        className={cn(
                          "h-3 w-3 rounded-full border-2 border-paper bg-bull transition-transform group-hover:scale-150 group-focus-visible:scale-150",
                          i === points.length - 1 && "bg-ink",
                        )}
                      />
                      <span
                        className={cn(
                          "pointer-events-none absolute bottom-full mb-2 w-max max-w-[240px] bg-night px-3 py-2 text-left text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                          align,
                        )}
                      >
                        <span className="block font-mono text-[10.5px] uppercase tracking-[0.1em] text-bull-light">
                          {formatDay(e.date, { month: "short" })}
                        </span>
                        <span className="block font-serif text-[17px]/[1.2]">{e.title}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative mt-2 h-4 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
            {months.map((mo) => (
              <span
                key={mo.label + mo.px}
                className="absolute -translate-x-1/2"
                style={{ left: `${(mo.px / W) * 100}%` }}
              >
                {mo.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
