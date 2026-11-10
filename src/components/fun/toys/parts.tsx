import { Share2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { toast } from "sonner";
import { Eyebrow } from "@/components/site/ui";
import { SITE_URL } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useHashTarget } from "../useHashTarget";
import { markPlayed } from "../career";

/**
 * The frame every desk toy shares: what it is and its levers on the left, the result on navy on the
 * right. Each toy is one file in this folder with its own arithmetic; see catalog.ts for the list.
 */
export function ToyShell({
  id,
  title,
  intro,
  levers,
  note,
  children,
}: {
  id: string;
  title: ReactNode;
  intro: ReactNode;
  levers: ReactNode;
  /** The assumptions, stated plainly. */
  note: ReactNode;
  children: ReactNode;
}) {
  useHashTarget(id);
  return (
    <section id={id} className="scroll-mt-36 bg-stone lg:scroll-mt-40">
      <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow>Try it yourself</Eyebrow>
          <h2 className="font-serif text-[48px]/[0.95] tracking-[-0.015em] md:text-[72px]/[0.95]">
            {title}
          </h2>
          <p className="max-w-[460px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">{intro}</p>
          <div className="mt-2 flex flex-col gap-6" onInputCapture={() => markPlayed(id)}>
            {levers}
          </div>
          <p className="text-[13px]/[1.6] text-mute">{note}</p>
        </div>
        <div
          className="flex flex-col gap-8 bg-night p-6 text-white md:p-9 lg:col-span-6 lg:col-start-7"
          aria-live="polite"
        >
          {children}
        </div>
      </div>
    </section>
  );
}

/** One lever: a labelled slider with its value. */
export function Lever({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** The value as shown, for example "10.0x EBITDA". */
  display: ReactNode;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="caps text-[10.5px] tracking-[0.18em]">
          {label}
        </label>
        <span className="font-mono text-[14px] tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-6 w-full cursor-pointer accent-bull"
      />
    </div>
  );
}

/** The result's two big numbers and its one-line verdict. */
export function Headline({
  stats,
  verdict,
}: {
  stats: { label: string; value: string }[];
  verdict: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 border-b border-white/15 pb-7">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col gap-2">
          <span className="caps text-[10px] tracking-[0.2em] text-haze">{s.label}</span>
          <span className="font-serif text-[50px]/none tabular-nums sm:text-[64px]/none md:text-[84px]/none">
            {s.value}
          </span>
        </div>
      ))}
      <p className="col-span-2 font-serif text-[22px]/[1.25] italic text-bull-light md:text-[26px]/[1.25]">
        {verdict}
      </p>
    </div>
  );
}

/** A short line under the result, for the point an interviewer would make. */
export function Aside({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[13.5px]/[1.65] text-mist", className)}>{children}</p>;
}

/**
 * Share a result: the phone's share sheet where there is one, otherwise the line and the link are
 * copied. `path` is where the link lands, for example "/departments#quiz".
 */
export function ShareResult({
  text,
  path,
  label = "Share your result",
}: {
  text: string;
  path: string;
  label?: string;
}) {
  const share = async () => {
    const url = `${SITE_URL}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      toast("Copied", { description: "Paste it wherever your friends are." });
    } catch {
      // The visitor closed the share sheet, or the browser refused the clipboard: nothing to do.
    }
  };
  return (
    <button type="button" onClick={share} className="btn btn-sm btn-outline-white">
      <Share2 className="h-3.5 w-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}
