import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarPlus, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { TypeDot } from "@/components/site/sections";
import { Em, Eyebrow } from "@/components/site/ui";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { EventPhoto } from "@/data/events";
import { loadEvents } from "@/lib/content";
import { getDepartment } from "@/lib/departments";
import { icsHref } from "@/lib/ics";
import { formatDay, IMAGES } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events_/$eventId")({
  loader: async ({ params }) => {
    const events = await loadEvents();
    const event = events.find((e) => e.id === params.eventId);
    if (!event) throw notFound();
    return { event, events };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.event;
    return {
      meta: [
        { title: `${e?.title ?? "Event"}, EMFC` },
        { name: "description", content: e?.description ?? "" },
        { property: "og:title", content: e?.title ?? "EMFC event" },
        { property: "og:description", content: e?.description ?? "" },
        ...(e?.photos?.[0] ? [{ property: "og:image", content: e.photos[0].src }] : []),
      ],
    };
  },
  component: EventPage,
});

/** Full-size photos with previous and next, closed with Escape. */
function Lightbox({
  photos,
  index,
  onIndex,
}: {
  photos: EventPhoto[];
  index: number | null;
  onIndex: (i: number | null) => void;
}) {
  const go = (delta: number) =>
    index !== null && onIndex((index + delta + photos.length) % photos.length);
  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const photo = index !== null ? photos[index] : undefined;
  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onIndex(null)}>
      <DialogContent className="max-h-[94vh] w-[min(94vw,1200px)] max-w-none gap-3 rounded-none border-0 bg-transparent p-0 shadow-none sm:rounded-none [&>button:last-child]:hidden">
        <DialogTitle className="sr-only">{photo?.alt ?? "Photo"}</DialogTitle>
        {photo && (
          <img src={photo.src} alt={photo.alt} className="max-h-[82vh] w-full object-contain" />
        )}
        <div className="flex items-center justify-between gap-4 text-white">
          <span className="text-sm/[1.5] text-white/80">
            {index !== null && `${index + 1} of ${photos.length}. `}
            {photo?.alt}
          </span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 hover:bg-white/15"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 hover:bg-white/15"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <DialogClose
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 hover:bg-white/15"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function EventPage() {
  const { event: e, events: EVENTS } = Route.useLoaderData();
  const [open, setOpen] = useState<number | null>(null);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = e.date >= today;
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const at = sorted.findIndex((x) => x.id === e.id);
  const older = sorted[at - 1];
  const newer = sorted[at + 1];
  const cover = e.photos?.[0]?.src ?? e.recap?.[0] ?? IMAGES.portOlimpic;
  const tags = [
    ...e.departments.map((slug) => {
      const d = getDepartment(slug);
      return d && { key: slug, label: d.name, to: "/departments/$department" as const, params: { department: slug } };
    }),
    ...(e.desks ?? []).map((path) => {
      const [dep, desk] = path.split("/");
      const k = getDepartment(dep)?.desks.find((x) => x.slug === desk);
      return k && { key: path, label: k.name, to: "/departments/$department/$desk" as const, params: { department: dep, desk } };
    }),
  ].filter(Boolean) as { key: string; label: string; to: string; params: Record<string, string> }[];

  return (
    <SiteLayout>
      <article>
        <header className="gutter grid items-start gap-10 py-14 lg:grid-cols-12 lg:gap-8 lg:py-20">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Link
              to="/events"
              className="caps inline-flex items-center gap-2 self-start text-[10.5px] tracking-[0.18em] text-mute hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              All events
            </Link>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <span className="caps inline-flex items-center gap-2 rounded-full border border-ink px-3 py-[7px] text-[10px] tracking-[0.18em]">
                <TypeDot type={e.type} />
                {e.type}
              </span>
              <span className="caps text-[10.5px] tracking-[0.18em] text-mute">
                {formatDay(e.date, { weekday: "long" })}
              </span>
              <span className="caps flex items-center gap-2 text-[10.5px] tracking-[0.18em] text-mute">
                <MapPin className="h-[13px] w-[13px]" strokeWidth={1.75} />
                {e.location}
              </span>
            </div>
            <h1 className="font-serif text-[32px]/[1.04] tracking-[-0.01em] md:text-[48px]/[1] xl:text-[56px]/[0.98]">{e.title}</h1>
            <p className="max-w-[640px] text-base/[1.7] text-mute md:text-[18px]/[1.7]">{e.description}</p>
            {e.people && e.people.length > 0 && (
              <ul className="flex flex-col gap-2 border-t border-line pt-5">
                {e.people.map((p) => (
                  <li key={p} className="text-[15px]/[1.55]">
                    {p}
                  </li>
                ))}
              </ul>
            )}
            {tags.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <li key={t.key}>
                    <Link
                      to={t.to}
                      params={t.params}
                      className="caps inline-flex rounded-full border border-line px-3.5 py-2 text-[10px] tracking-[0.14em] transition-colors hover:border-ink"
                    >
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {upcoming && (
              <a href={icsHref(e)} download={`${e.id}.ics`} className="btn btn-ink self-start">
                <CalendarPlus className="h-4 w-4" strokeWidth={1.75} />
                Add to calendar
              </a>
            )}
          </div>
          <div className="lg:col-span-5">
            {e.photos?.length ? (
              <button
                type="button"
                onClick={() => setOpen(0)}
                className="block w-full overflow-hidden"
                aria-label="Open the photos"
              >
                <img src={cover} alt={e.photos[0].alt} className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-[1.02]" />
              </button>
            ) : (
              <img
                src={cover}
                alt={e.recap?.length ? `The first slide of the EMFC recap of ${e.title}` : "Barcelona"}
                className="aspect-[4/5] w-full object-cover"
              />
            )}
          </div>
        </header>

        {e.photos && e.photos.length > 1 && (
          <section className="bg-stone">
            <div className="gutter flex flex-col gap-10 py-16 lg:py-20">
              <div className="flex flex-col gap-5">
                <Eyebrow>{e.photos.length} photos</Eyebrow>
                <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[56px]/none">
                  On the <Em>day</Em>
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4">
                {e.photos.map((ph, i) => (
                  <button
                    key={ph.src}
                    type="button"
                    onClick={() => setOpen(i)}
                    className={cn("group block overflow-hidden", i === 0 && "col-span-2 row-span-2")}
                    aria-label={`Open photo ${i + 1}: ${ph.alt}`}
                  >
                    <img
                      src={ph.src}
                      alt={ph.alt}
                      loading="lazy"
                      className="aspect-square h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {e.videos && e.videos.length > 0 && (
          <section className="gutter flex flex-col gap-10 py-16 lg:py-20">
            <div className="flex flex-col gap-5">
              <Eyebrow>{e.videos.length} clips</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[56px]/none">
                In <Em>motion</Em>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
              {e.videos.map((v, i) => (
                <video
                  key={v}
                  src={`${v}#t=0.1`}
                  poster={v.startsWith("/videos/") ? v.replace(/\.mp4$/, ".jpg") : undefined}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  aria-label={`Clip ${i + 1} from ${e.title}`}
                  className="aspect-[9/16] w-full bg-night object-cover"
                />
              ))}
            </div>
          </section>
        )}

        {e.recap && e.recap.length > 0 && (
          <section className={cn(e.videos?.length ? "" : "pt-16 lg:pt-20", "gutter flex flex-col gap-10 pb-16 lg:pb-20")}>
            <div className="flex flex-col gap-5">
              <Eyebrow>As published by EMFC</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[56px]/none">
                The <Em>recap</Em>
              </h2>
            </div>
            <div className="flex snap-x gap-3 overflow-x-auto pb-2">
              {e.recap.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`Slide ${i + 1} of the EMFC recap of ${e.title}`}
                  loading="lazy"
                  className="aspect-[4/5] w-[260px] shrink-0 snap-start object-cover md:w-[320px]"
                />
              ))}
            </div>
          </section>
        )}

        <nav aria-label="More events" className="gutter grid gap-3 border-t border-line py-14 sm:grid-cols-2">
          {[
            { x: older, label: "Earlier event", Icon: ArrowLeft },
            { x: newer, label: "Later event", Icon: ArrowRight },
          ].map(({ x, label, Icon }) =>
            x ? (
              <Link
                key={label}
                to="/events/$eventId"
                params={{ eventId: x.id }}
                className={cn(
                  "group flex items-center justify-between gap-6 border border-ink p-6 transition-colors hover:bg-ink hover:text-paper",
                  label === "Later event" && "sm:flex-row-reverse sm:text-right",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <span className="flex flex-col gap-1.5">
                  <span className="caps text-[10px] tracking-[0.18em] text-mute group-hover:text-paper/70">
                    {label}, {formatDay(x.date)}
                  </span>
                  <span className="font-serif text-[24px]/[1.1]">{x.title}</span>
                </span>
              </Link>
            ) : (
              <span key={label} className="max-sm:hidden" />
            ),
          )}
        </nav>
      </article>
      {e.photos && <Lightbox photos={e.photos} index={open} onIndex={setOpen} />}
    </SiteLayout>
  );
}
