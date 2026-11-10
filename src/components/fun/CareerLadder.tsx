import { cn } from "@/lib/utils";
import { RANKS, useCareer } from "./career";

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
