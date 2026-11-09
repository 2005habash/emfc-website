import { createFileRoute, Link } from "@tanstack/react-router";
import { EventsChart } from "@/components/fun/EventsChart";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarPlus, Images, Linkedin, MapPin } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Em, Eyebrow, PageHero } from "@/components/site/ui";
import { EVENT_TYPE_COLORS, type EventItem, type EventType } from "@/data/events";
import { loadEvents } from "@/lib/content";
import { IMAGES, SOCIAL, todayInBarcelona, safeUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { icsHref } from "@/lib/ics";
import { TypeDot } from "@/components/site/sections";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events, EMFC" },
      {
        name: "description",
        content: "EMFC events bringing members together with industry, peers and ideas.",
      },
      { property: "og:title", content: "EMFC Events" },
      {
        property: "og:description",
        content:
          "Speaker sessions, workshops, networking events and socials from the ESADE Master's Finance Club.",
      },
    ],
  }),
  loader: () => loadEvents(),
  component: EventsPage,
});

const dateOf = (e: EventItem) => new Date(e.date + "T12:00:00");
// Three-letter months everywhere: British English writes "Sept".
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-GB", o).replace(/\bSept\b/, "Sep");

function EventsPage() {
  const [view, setView] = useState<"overview" | "calendar">("overview");
  const events = Route.useLoaderData();

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.sagradaFamilia}
        alt="Barcelona's Eixample district from the air at golden hour"
        eyebrow="Events"
        position="85% 50%"
        title={
          <>
            Where finance <br className="max-md:hidden" />
            meets <Em light>ambition</Em>
          </>
        }
      >
        Our events bring members together with industry, peers and ideas. Many sessions are open to
        the wider ESADE community.
      </PageHero>

      <EventsChart events={events} />

      <div className="gutter flex flex-col gap-6 pt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div
          role="group"
          aria-label="Events view"
          className="inline-flex gap-1 self-start rounded-full border border-line p-1"
        >
          {(["overview", "calendar"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={cn(
                "caps h-11 rounded-full px-6 text-[11px] tracking-[0.18em] transition-colors",
                view === v ? "bg-ink text-paper" : "text-ink hover:bg-stone",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        <ul className="caps flex flex-wrap gap-x-[18px] gap-y-2 text-[10px] tracking-[0.18em] text-mute">
          {(Object.keys(EVENT_TYPE_COLORS) as EventType[]).map((t) => (
            <li key={t} className="flex items-center gap-2">
              <TypeDot type={t} />
              {t}
            </li>
          ))}
        </ul>
      </div>

      {view === "overview" ? <Overview /> : <CalendarView />}
    </SiteLayout>
  );
}

function SectionHead({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-baseline justify-between border-b border-ink pb-4">
      <h2 className="font-serif text-4xl/none md:text-[44px]/none">{title}</h2>
      <span className="caps text-[10.5px] tracking-[0.2em] text-mute">
        {count} {count === 1 ? "event" : "events"}
      </span>
    </div>
  );
}

function EventFeature({ e, past = false }: { e: EventItem; past?: boolean }) {
  const d = dateOf(e);
  return (
    <article className="grid gap-6 border-b border-line py-8 last:border-b-0 lg:grid-cols-12 lg:gap-8">
      <div className="flex items-center gap-6 lg:col-span-4">
        <div className="flex shrink-0 flex-col items-center gap-1.5 border-r border-line pr-6">
          <span className="font-serif text-[64px]/[0.88] font-medium md:text-[76px]/[0.88]">
            {d.getDate()}
          </span>
          <span className="caps text-[10px] tracking-[0.2em] text-mute">
            {fmt(d, { month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="caps inline-flex items-center gap-2 self-start rounded-full border border-ink px-3 py-[7px] text-[10px] tracking-[0.18em]">
            <TypeDot type={e.type} />
            {e.type}
          </span>
          <span className="caps flex items-center gap-2 text-[10.5px] tracking-[0.18em] text-mute">
            <MapPin className="h-[13px] w-[13px]" strokeWidth={1.75} />
            {e.location}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-4 lg:col-span-8">
        <h3 className="font-serif text-[32px]/[1.04] tracking-[-0.01em] md:text-[44px]/[1] xl:text-[52px]/[0.98]">
          <Link
            to="/events/$eventId"
            params={{ eventId: e.id }}
            className="underline-offset-[6px] hover:underline"
          >
            {e.title}
          </Link>
        </h3>
        <p className="max-w-[640px] text-[15px]/[1.7] text-mute md:text-[17px]/[1.7]">
          {e.description}
        </p>
        {e.photos && e.photos.length > 0 && (
          <Link
            to="/events/$eventId"
            params={{ eventId: e.id }}
            className="group mt-1 flex max-w-[640px] gap-2 overflow-hidden"
            aria-label={`See the photos from ${e.title}`}
          >
            {e.photos.slice(0, 4).map((ph, i) => (
              <img
                key={ph.src}
                src={ph.src}
                alt=""
                loading="lazy"
                className={cn(
                  "h-24 w-full min-w-0 flex-1 object-cover transition duration-500 group-hover:brightness-90 md:h-32",
                  i > 1 && "max-sm:hidden",
                )}
              />
            ))}
          </Link>
        )}
        <div className="mt-1 flex flex-wrap gap-2.5">
          <Link
            to="/events/$eventId"
            params={{ eventId: e.id }}
            className="btn btn-outline-ink h-[46px] px-5 text-[11px]"
          >
            {e.photos?.length ? (
              <Images className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
            {e.photos?.length ? `Photos and details` : "Details"}
          </Link>
          {!past && (
            <a
              href={icsHref(e)}
              download={`${e.id}.ics`}
              className="btn btn-ink h-[46px] px-5 text-[11px]"
            >
              <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Add to calendar
            </a>
          )}
          {!past && e.link && (
            <a
              href={safeUrl(e.link)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-ink h-[46px] px-5 text-[11px]"
            >
              Register
            </a>
          )}
          {e.post && (
            <a
              href={safeUrl(e.post)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline-ink h-[46px] px-5 text-[11px]"
            >
              <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
              See the post
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Overview() {
  const EVENTS = Route.useLoaderData();
  const today = todayInBarcelona();
  const upcoming = EVENTS.filter((e) => e.date >= today).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const past = EVENTS.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="gutter flex flex-col gap-16 pb-20 pt-12 lg:gap-[72px] lg:pb-24 lg:pt-14">
      <div className="flex flex-col">
        <SectionHead title="Upcoming events" count={upcoming.length} />
        {upcoming.length === 0 ? (
          <div className="mt-6 flex flex-col justify-between gap-7 bg-stone p-7 md:p-9 lg:max-w-[560px]">
            <p className="font-serif text-[28px]/[1.15] italic md:text-[34px]/[1.15]">
              No upcoming events scheduled.
            </p>
            <div className="flex flex-col gap-4">
              <p className="text-[15px]/[1.65] text-mute">
                Follow us on LinkedIn to hear about the next one first.
              </p>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ink h-[50px] px-6 text-[11.5px] sm:self-start"
              >
                <Linkedin className="h-[15px] w-[15px]" strokeWidth={1.6} />
                Follow on LinkedIn
              </a>
            </div>
          </div>
        ) : (
          upcoming.map((e) => <EventFeature key={e.id} e={e} />)
        )}
      </div>

      {past.length > 0 && (
        <div className="flex flex-col">
          <SectionHead title="Past events" count={past.length} />
          {past.map((e) => (
            <EventFeature key={e.id} e={e} past />
          ))}
        </div>
      )}
    </section>
  );
}

function CalendarView() {
  const EVENTS = Route.useLoaderData();
  // Open on the month of the next event, or the most recent one.
  const today = todayInBarcelona();
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const anchor = sorted.find((e) => e.date >= today) ?? sorted[sorted.length - 1];
  const start = anchor ? dateOf(anchor) : new Date();
  const [cursor, setCursor] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [selected, setSelected] = useState<EventItem | null>(anchor ?? null);

  const lead = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7; // Monday first
  const days = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(lead).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const monthEvents = EVENTS.filter((e) => {
    const d = dateOf(e);
    return d.getFullYear() === cursor.y && d.getMonth() === cursor.m;
  });
  const move = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <section className="gutter grid items-start gap-8 pb-20 pt-12 lg:grid-cols-[8fr_4fr] lg:pb-24 lg:pt-14">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-ink pb-4">
          <h2 aria-live="polite" className="font-serif text-4xl/none md:text-[44px]/none">
            {fmt(new Date(cursor.y, cursor.m, 1), { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous month"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink hover:bg-ink hover:text-paper"
            >
              <ArrowLeft className="h-[15px] w-[15px]" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next month"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink hover:bg-ink hover:text-paper"
            >
              <ArrowRight className="h-[15px] w-[15px]" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="caps grid grid-cols-7 text-[10px] tracking-[0.2em] text-mute md:text-[10px]">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d} className="px-1.5 md:px-3">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px border border-line bg-line">
          {cells.map((day, i) => {
            const ev = day ? monthEvents.filter((e) => dateOf(e).getDate() === day) : [];
            if (!day) return <div key={i} className="h-[64px] bg-stone md:h-[104px]" />;
            if (ev.length === 0) {
              return (
                <div key={i} className="h-[64px] bg-paper p-1.5 md:h-[104px] md:px-3 md:py-2.5">
                  <span className="font-serif text-lg/none md:text-[22px]/none">{day}</span>
                </div>
              );
            }
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(ev[0])}
                aria-label={`${ev[0].title}, ${fmt(dateOf(ev[0]), { day: "numeric", month: "long" })}`}
                className="flex h-[64px] flex-col justify-between bg-[#000B3D] p-1.5 text-left text-white md:h-[104px] md:px-3 md:py-2.5"
              >
                <span className="font-serif text-lg/none md:text-[22px]/none">{day}</span>
                <span className="hidden text-xs/[1.3] font-medium md:block">{ev[0].title}</span>
                <span className="md:hidden">
                  <TypeDot type={ev[0].type} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <aside className="flex flex-col gap-[18px] bg-stone p-7 md:p-8">
        <Eyebrow>On the calendar</Eyebrow>
        {selected ? (
          <>
            <div className="flex items-center gap-5 border-b border-line pb-5">
              <div className="flex shrink-0 flex-col items-center gap-1">
                <span className="font-serif text-[52px]/[0.9] font-medium">
                  {dateOf(selected).getDate()}
                </span>
                <span className="caps text-[10px] tracking-[0.18em] text-mute">
                  {fmt(dateOf(selected), { month: "short", year: "numeric" })}
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-serif text-3xl/[1.05] font-medium">{selected.title}</span>
                <span className="caps flex items-center gap-2 text-[10px] tracking-[0.18em] text-mute">
                  <TypeDot type={selected.type} />
                  {selected.type}, {selected.location}
                </span>
              </div>
            </div>
            <p className="text-[14.5px]/[1.65] text-mute">{selected.description}</p>
            <span className="caps text-[10px] tracking-[0.18em] text-mute">
              {fmt(dateOf(selected), {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <Link
              to="/events/$eventId"
              params={{ eventId: selected.id }}
              className="btn btn-sm btn-ink self-start"
            >
              Event details
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </>
        ) : (
          <p className="font-serif text-2xl/[1.2] italic">No upcoming events scheduled.</p>
        )}
      </aside>
    </section>
  );
}
