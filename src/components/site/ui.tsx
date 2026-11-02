import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Person } from "@/lib/departments";
import { linkedinOf, photoOf } from "@/lib/team";
import { IMAGES } from "@/lib/site";

type Tone = "ink" | "light" | "hero";

/** Small spaced-caps label with a brass rule, used above headings. */
export function Eyebrow({
  children,
  tone = "ink",
  center = false,
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  center?: boolean;
  className?: string;
}) {
  const rule = cn("h-px w-7 shrink-0 md:w-10", tone === "ink" ? "bg-brass" : "bg-brass-light");
  return (
    <div
      className={cn(
        "caps flex items-center gap-3.5 text-[10px] tracking-[0.24em] md:text-[11px]",
        tone === "ink" && "text-mute",
        tone === "light" && "text-brass-light",
        tone === "hero" && "text-[#E3E6EF]",
        center && "justify-center",
        className,
      )}
    >
      <span className={rule} />
      {children}
      {center && <span className={rule} />}
    </div>
  );
}

/** Italic accent word inside a serif heading. */
export function Em({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <em className={cn("font-normal italic", light ? "text-brass-light" : "text-brass")}>
      {children}
    </em>
  );
}

/** Roman numeral marker. */
export function Numeral({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-serif text-[28px]/none italic text-brass", className)}>
      {children}
    </span>
  );
}

/** Photo header used at the top of every inner page. */
export function PageHero({
  image,
  alt,
  eyebrow,
  title,
  children,
  position = "50% 50%",
}: {
  image: string;
  alt: string;
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
  position?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-[#030C3B] text-white">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full animate-kenburns object-cover"
        style={{ objectPosition: position }}
      />
      <div aria-hidden className="absolute inset-0 bg-[rgb(3_10_46/0.62)]" />
      <div className="gutter relative flex min-h-[340px] flex-col justify-end gap-8 pb-12 pt-20 md:min-h-[400px] lg:flex-row lg:items-end lg:justify-between lg:gap-16 lg:pb-14">
        <div className="flex flex-col gap-5">
          <Eyebrow tone="hero" className="animate-rise">
            {eyebrow}
          </Eyebrow>
          <h1 className="animate-rise font-serif text-6xl/[0.92] tracking-[-0.015em] [animation-delay:150ms] md:text-8xl/[0.92] lg:text-[112px]/[0.92]">
            {title}
          </h1>
        </div>
        <p className="max-w-[480px] animate-rise text-base/[1.7] text-[#E3E6EF] [animation-delay:320ms]">
          {children}
        </p>
      </div>
    </section>
  );
}

/**
 * Team portrait. The photos have white or grey backgrounds, so they are blended
 * onto one warm tile colour and shown in black and white until hovered.
 */
export function Portrait({
  name,
  alt,
  alternate = false,
  className,
}: {
  name: string;
  alt?: string;
  alternate?: boolean;
  className?: string;
}) {
  const src = photoOf(name);
  return (
    <span className={cn("block overflow-hidden", alternate ? "bg-tile-alt" : "bg-tile", className)}>
      {src && (
        <img
          src={src}
          alt={alt ?? `Portrait of ${name}`}
          loading="lazy"
          className="h-full w-full origin-top scale-[1.18] object-cover object-top mix-blend-multiply grayscale contrast-[1.05] transition duration-500 group-hover:grayscale-0"
        />
      )}
    </span>
  );
}

const isOpenRole = (p: Person) => /open/i.test(p.name) && /recruiting/i.test(p.name);

export function PersonCard({
  person,
  index = 0,
  large = false,
}: {
  person: Person;
  index?: number;
  large?: boolean;
}) {
  if (isOpenRole(person)) {
    return (
      <div className="flex flex-col gap-3.5">
        <span className="block aspect-[5/6] overflow-hidden bg-[#000A3C]">
          <img
            src={IMAGES.bullTile}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </span>
        <span className="flex flex-col gap-1.5">
          <span className="font-serif text-2xl/[1.1] font-medium">Role open</span>
          <span className="caps text-[10px] tracking-[0.16em] text-warn">{person.role}</span>
        </span>
      </div>
    );
  }
  const href = linkedinOf(person);
  const body = (
    <>
      <Portrait name={person.name} alternate={index % 2 === 1} className="aspect-[5/6]" />
      <span className="flex flex-col gap-1.5">
        <span
          className={cn(
            "font-serif font-medium decoration-1 underline-offset-4 group-hover:underline",
            large ? "text-3xl/[1.05]" : "text-2xl/[1.1]",
          )}
        >
          {person.name}
        </span>
        <span className="caps text-[10px] tracking-[0.16em] text-mute">{person.role}</span>
      </span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="group flex flex-col gap-3.5">
      {body}
    </a>
  ) : (
    <div className="group flex flex-col gap-3.5">{body}</div>
  );
}

/** Counts up to a number once the page has loaded. Renders the final value on the server. */
export function CountUp({
  to,
  from = 0,
  pad = 0,
  suffix = "",
  duration = 1600,
}: {
  to: number;
  from?: number;
  pad?: number;
  suffix?: string;
  duration?: number;
}) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    setValue(from);
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, from, duration, reduce]);
  return (
    <>
      {String(value).padStart(pad, "0")}
      {suffix}
    </>
  );
}

/** Small caption naming the place in a photo. */
export function PhotoCaption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn("caps text-[9px] tracking-[0.24em] text-[#D5D9E6] md:text-[10px]", className)}
    >
      {children}
    </div>
  );
}
