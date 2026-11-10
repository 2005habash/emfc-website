import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Em, Eyebrow } from "@/components/site/ui";
import { cn } from "@/lib/utils";
import { RANKS, useCareer } from "./career";
import { ACTIVITIES, type Activity } from "./playground";

/** An activity as a card linking to where it lives, ticked once played. */
export function ActivityCard({
  a,
  played,
  dark = false,
}: {
  a: Activity;
  played: boolean;
  dark?: boolean;
}) {
  return (
    <Link
      to={a.to as never}
      params={a.params as never}
      hash={a.hash}
      className={cn(
        "group flex flex-col gap-3 border p-5 transition duration-300 hover:-translate-y-1 md:p-6",
        dark ? "border-white/20 hover:border-bull-light" : "border-line bg-panel hover:border-ink",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span
          className={cn("caps text-[10px] tracking-[0.18em]", dark ? "text-haze" : "text-mute")}
        >
          {a.where}
        </span>
        {played ? (
          <span
            className={cn(
              "caps inline-flex items-center gap-1 text-[10px] tracking-[0.18em]",
              dark ? "text-bull-light" : "text-bull",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={2} />
            Played
          </span>
        ) : (
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        )}
      </span>
      <span className="font-serif text-[26px]/[1.1] md:text-[30px]/[1.1]">{a.title}</span>
      <span className={cn("text-[14px]/[1.55]", dark ? "text-mist" : "text-mute")}>{a.hook}</span>
    </Link>
  );
}

/** The visitor's rank on the career ladder, and how far to the next one. */
export function CareerLadder({ dark = false }: { dark?: boolean }) {
  const { count, total, rank, next } = useCareer();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <span className={cn("caps text-[10px] tracking-[0.2em]", dark ? "text-haze" : "text-mute")}>
          Your career at EMFC
        </span>
        <span
          className={cn("font-mono text-[12px] tabular-nums", dark ? "text-haze" : "text-mute")}
        >
          {count} of {total} played
        </span>
      </div>
      <p className="font-serif text-[30px]/[1.1] md:text-[36px]/[1.1]">
        {rank.title}
        {next && (
          <span
            className={cn("text-[18px] italic md:text-[20px]", dark ? "text-mist" : "text-mute")}
          >
            {" "}
            {next.at - count} more to {next.title}
          </span>
        )}
      </p>
      <ol className="flex gap-1" aria-label="The ladder">
        {RANKS.map((r) => (
          <li
            key={r.title}
            title={r.title}
            className={cn(
              "h-1.5 flex-1 transition-colors duration-500",
              count >= r.at
                ? dark
                  ? "bg-bull-light"
                  : "bg-bull"
                : dark
                  ? "bg-white/15"
                  : "bg-line",
            )}
          >
            <span className="sr-only">
              {r.title}
              {count >= r.at ? ", reached" : ""}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The homepage's coffee break: a few things to play, the visitor's rank, and a way to all of them. */
export function CoffeeBreak() {
  const { played } = useCareer();
  const featured = ["quiz", "superday", "bull-or-bear", "roulette"]
    .map((id) => ACTIVITIES.find((a) => a.id === id))
    .filter((a): a is Activity => Boolean(a));
  return (
    <section className="bg-night text-white">
      <div className="gutter flex flex-col gap-10 py-20 lg:gap-12 lg:py-26">
        <div className="grid items-end gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-7">
            <Eyebrow tone="light">For your coffee break</Eyebrow>
            <h2 className="font-serif text-[52px]/[0.95] tracking-[-0.015em] md:text-[84px]/[0.95]">
              Off the <Em light>clock</Em>
            </h2>
            <p className="max-w-[520px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
              Games and toys built around what the desks do: find your desk, survive a Superday,
              call famous market days, run a paper LBO. Every one you play moves you up the ladder.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <CareerLadder dark />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((a) => (
            <ActivityCard key={a.id} a={a} played={played.includes(a.id)} dark />
          ))}
        </div>
        <Link to="/play" className="btn btn-sm btn-outline-white self-start">
          All {ACTIVITIES.length}, in one place
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}
