import { useReducedMotion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { initialsOf, type Member } from "@/lib/team";

type Tone = "ink" | "light" | "hero";

/** Small spaced-caps label with a short blue rule, used above headings. */
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
  const rule = cn("h-px w-7 shrink-0 md:w-10", tone === "ink" ? "bg-bull" : "bg-bull-light");
  return (
    <div
      className={cn(
        "caps flex items-center gap-3.5 text-[10px] tracking-[0.24em] md:text-[11px]",
        tone === "ink" && "text-mute",
        tone === "light" && "text-bull-light",
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
    <em className={cn("font-normal italic", light ? "text-bull-light" : "text-bull")}>
      {children}
    </em>
  );
}

/** Roman numeral marker. */
export function Numeral({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("font-serif text-[28px]/none italic text-bull", className)}>
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
    <section className="relative overflow-hidden bg-[#000B3D] text-white">
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
 * Team portrait. The photos are cut out onto white, so they are blended onto one warm tile colour
 * and shown in black and white until hovered. Members without a photo yet get their initials.
 */
export function Portrait({
  member,
  alt,
  alternate = false,
  className,
}: {
  member: Pick<Member, "name" | "photo">;
  alt?: string;
  alternate?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative block overflow-hidden",
        alternate ? "bg-tile-alt" : "bg-tile",
        className,
      )}
    >
      {member.photo ? (
        <img
          src={member.photo}
          alt={alt ?? `Portrait of ${member.name}`}
          loading="lazy"
          className="h-full w-full object-cover object-top mix-blend-multiply grayscale contrast-[1.05] transition duration-500 group-hover:grayscale-0"
        />
      ) : (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center font-serif text-[clamp(26px,4vw,52px)] italic text-[#555C72]"
        >
          {initialsOf(member.name)}
        </span>
      )}
    </span>
  );
}

const sizes = {
  lg: { name: "text-3xl/[1.05]", title: "text-[10px]", gap: "gap-3.5" },
  md: { name: "text-2xl/[1.1]", title: "text-[10px]", gap: "gap-3.5" },
  sm: { name: "text-lg/[1.15] md:text-xl/[1.15]", title: "text-[9px] md:text-[9.5px]", gap: "gap-2.5" },
};

/**
 * A member's portrait, name and title. Clicking opens their profile: programme, firms and LinkedIn
 * (only what members agreed to show).
 */
export function PersonCard({
  member,
  index = 0,
  size = "md",
}: {
  member: Member;
  index?: number;
  size?: keyof typeof sizes;
}) {
  const s = sizes[size];
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "group flex cursor-pointer flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-bull focus-visible:ring-offset-4 focus-visible:ring-offset-paper",
          s.gap,
        )}
        aria-label={`${member.name}, ${member.title}. Open profile`}
      >
        <Portrait member={member} alternate={index % 2 === 1} className="aspect-[5/6] w-full" />
        <span className="flex flex-col gap-1.5">
          <span
            className={cn(
              "font-serif font-medium decoration-1 underline-offset-4 group-hover:underline",
              s.name,
            )}
          >
            {member.name}
          </span>
          <span className={cn("caps tracking-[0.16em] text-mute", s.title)}>{member.title}</span>
        </span>
      </DialogTrigger>
      <ProfileDialog member={member} />
    </Dialog>
  );
}

function ProfileDialog({ member }: { member: Member }) {
  return (
    <DialogContent className="max-w-[640px] gap-0 rounded-none border-line bg-paper p-0 text-ink sm:rounded-none">
      <div className="grid sm:grid-cols-[220px_1fr]">
        <Portrait member={member} className="aspect-square w-full sm:aspect-auto sm:h-full" />
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex flex-col gap-2">
            <DialogTitle className="font-serif text-[34px]/[1.05] font-medium">{member.name}</DialogTitle>
            <DialogDescription className="caps text-[10.5px] tracking-[0.18em] text-mute">
              {member.title}
            </DialogDescription>
          </div>
          <dl className="flex flex-col gap-3.5 border-t border-line pt-5 text-[15px]/[1.5]">
            {member.programme && (
              <div className="flex flex-col gap-1">
                <dt className="caps text-[10px] tracking-[0.18em] text-mute">Programme</dt>
                <dd>{member.programme}</dd>
              </div>
            )}
            {member.firms.length > 0 && (
              <div className="flex flex-col gap-1">
                <dt className="caps text-[10px] tracking-[0.18em] text-mute">Experience</dt>
                <dd>{member.firms.join(", ")}</dd>
              </div>
            )}
          </dl>
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-ink mt-auto self-start"
            >
              <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </DialogContent>
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
