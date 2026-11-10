import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, FileText, Linkedin } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { FirmLogo } from "@/components/site/FirmLogo";
import { Em, Eyebrow, Numeral, PageHero, PersonCard } from "@/components/site/ui";
import { EVENT_TYPE_COLORS, type EventItem, type EventType } from "@/data/events";
import type { Report } from "@/data/reports";
import { STATS } from "@/data/stats";
import {
  departments,
  DESK_COUNT,
  getDepartment,
  type Firm,
  type WorkItem,
} from "@/lib/departments";
import { formatDay, IMAGES, InWords, inWords, ROMAN, SOCIAL, safeUrl } from "@/lib/site";
import type { Member } from "@/lib/team";
import { cn } from "@/lib/utils";

/** The hero shared by the department and desk pages. */
export function DepartmentsHero({ titleAs = "h1" }: { titleAs?: "h1" | "p" }) {
  return (
    <PageHero
      titleAs={titleAs}
      image={IMAGES.sagradaFamilia}
      alt="Sagrada Família rising above Barcelona's Eixample grid at sunset"
      eyebrow="Departments"
      title={
        <>
          Find your <Em light>desk</Em>
        </>
      }
    >
      {InWords(departments.length)} departments and {inWords(DESK_COUNT)} desks, run by{" "}
      {STATS.members} members. Choose a department to see what it produces, where it aims and who is
      on it.
    </PageHero>
  );
}

/** The row of all six departments under the page hero. The current one is highlighted. */
export function DepartmentSelector({ current }: { current?: string }) {
  const list = useRef<HTMLUListElement>(null);
  // On narrow screens the row scrolls sideways: start it at the current department.
  useEffect(() => {
    const ul = list.current;
    const on = ul?.querySelector<HTMLElement>('[aria-current="page"]');
    if (ul && on && ul.scrollWidth > ul.clientWidth) ul.scrollLeft = on.offsetLeft - 20;
  }, [current]);
  return (
    <nav
      aria-label="Departments"
      className="sticky top-[72px] z-40 border-b border-line bg-stone lg:top-[88px]"
    >
      <ul
        ref={list}
        className="gutter flex overflow-x-auto [scrollbar-width:none] max-lg:[mask-image:linear-gradient(90deg,#000_82%,transparent)] lg:grid lg:grid-cols-6"
      >
        {departments.map((d, i) => {
          const on = d.slug === current;
          return (
            <li key={d.slug} className="shrink-0">
              <Link
                to="/departments/$department"
                params={{ department: d.slug }}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "group flex h-16 items-center gap-3 border-b-2 pr-6 transition-colors lg:h-[84px] lg:pr-2",
                  on
                    ? "border-ink text-ink"
                    : "border-transparent text-mute hover:border-line hover:text-ink",
                )}
              >
                <span className="font-serif text-xl italic text-bull">{ROMAN[i]}</span>
                <span className="font-serif text-xl/[1.05] font-medium whitespace-nowrap lg:text-[23px]/[1.05] lg:whitespace-normal">
                  {d.name}
                </span>
                <ArrowRight
                  aria-hidden
                  className={cn(
                    "hidden h-3.5 w-3.5 shrink-0 transition-opacity lg:block",
                    on ? "opacity-0" : "opacity-0 group-hover:opacity-100",
                  )}
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Section heading: small label, then a serif title. */
export function SectionHeading({
  eyebrow,
  children,
  className,
}: {
  eyebrow: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[56px]/none">
        {children}
      </h2>
    </div>
  );
}

/** "What the desk produces": numbered work items, with how often when the department said so. */
export function WorkGrid({ items }: { items: WorkItem[] }) {
  return (
    <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <div key={it.title} className="flex flex-col gap-3 border-t border-ink pt-[22px]">
          <div className="flex items-baseline justify-between gap-4">
            <Numeral className="text-[26px]/none">{ROMAN[i]}.</Numeral>
            {it.frequency && (
              <span className="caps text-right text-[10px] tracking-[0.16em] text-bull">
                {it.frequency}
              </span>
            )}
          </div>
          <h3 className="font-serif text-[26px]/[1.08] md:text-3xl/[1.08]">{it.title}</h3>
          <p className="text-[15px]/[1.65] text-mute">{it.body}</p>
        </div>
      ))}
    </div>
  );
}

/** The grid of 12 target firms. On a department page each firm can carry its desks. */
/** Target firms as their logos (or names, while a logo is still to come), on white tiles. */
export function FirmsGrid({ firms }: { firms: Firm[] }) {
  return (
    <ul className="grid grid-cols-2 gap-px border border-line bg-line [--logo-h:42px] sm:grid-cols-3 md:[--logo-h:54px] lg:grid-cols-4">
      {firms.map((f) => (
        <li
          key={f.name}
          className="flex min-h-[112px] items-center justify-center bg-plate px-5 py-7 md:min-h-[150px]"
        >
          <FirmLogo name={f.name} />
        </li>
      ))}
    </ul>
  );
}

export const deskName = (department: string, desk?: string) =>
  desk ? getDepartment(department)?.desks.find((k) => k.slug === desk)?.name : undefined;

/** Reports as a list: title, series and issue, desk, and a PDF link or "coming". */
export function ReportList({
  reports,
  showDepartment = false,
}: {
  reports: Report[];
  showDepartment?: boolean;
}) {
  return (
    <ul className="flex flex-col border-t border-ink">
      {reports.map((r) => {
        const dept = getDepartment(r.department);
        const desk = deskName(r.department, r.desk);
        const where = [showDepartment ? dept?.name : undefined, desk].filter(Boolean).join(", ");
        const meta = [
          r.series,
          r.issue,
          r.pages ? `${r.pages} ${r.pages === 1 ? "page" : "pages"}` : undefined,
        ]
          .filter(Boolean)
          .join(", ");
        return (
          <li
            key={r.id}
            className="grid gap-3 border-b border-line py-6 md:grid-cols-[1fr_auto] md:items-center md:gap-8"
          >
            <div className="flex flex-col gap-2">
              <span className="caps text-[10px] tracking-[0.18em] text-bull">
                {where || dept?.name}
              </span>
              <span className="font-serif text-[26px]/[1.1] md:text-[30px]/[1.1]">{r.title}</span>
              <span className="text-[14px]/[1.5] text-mute">{meta}</span>
              {r.authors && r.authors.length > 0 && (
                <span className="text-[13.5px]/[1.5] text-mute">By {r.authors.join(", ")}</span>
              )}
            </div>
            {r.status === "published" && r.file ? (
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={safeUrl(r.file)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-ink"
                >
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Read PDF
                </a>
                {r.link && (
                  <a
                    href={safeUrl(r.link)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-ink"
                  >
                    <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
                    On LinkedIn
                  </a>
                )}
              </div>
            ) : (
              <span className="caps self-start rounded-full border border-line px-4 py-2.5 text-[10px] tracking-[0.18em] text-mute md:self-center">
                In preparation
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Shown where a department or desk has no published report yet (20 October decision). */
export function ResearchComingSoon({ desk = false }: { desk?: boolean }) {
  return (
    <div className="flex flex-col gap-2 border-t border-ink bg-stone p-7 md:p-9">
      <p className="font-serif text-[28px]/[1.15] italic md:text-[32px]/[1.15]">
        Research coming soon.
      </p>
      <p className="text-[15px]/[1.65] text-mute">
        The first reports from this {desk ? "desk" : "department"} will appear here, and in the
        library on the Resources page.
      </p>
    </div>
  );
}

/** The coloured dot for an event type. */
export function TypeDot({ type }: { type: EventType }) {
  return (
    <span
      className="h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ background: EVENT_TYPE_COLORS[type] }}
    />
  );
}

/** A compact list of events, each linking to its page. */
export function EventRows({ events }: { events: EventItem[] }) {
  return (
    <ul className="flex flex-col border-t border-ink">
      {events.map((e) => (
        <li key={e.id} className="border-b border-line">
          <Link
            to="/events/$eventId"
            params={{ eventId: e.id }}
            className="group grid gap-2 py-5 md:grid-cols-[180px_1fr_auto] md:items-center md:gap-8"
          >
            <span className="caps text-[10.5px] tracking-[0.18em] text-mute">
              {formatDay(e.date)}
            </span>
            <span className="font-serif text-[24px]/[1.15] underline-offset-4 group-hover:underline md:text-[26px]/[1.15]">
              {e.title}
            </span>
            <span className="caps flex items-center gap-2 text-[10px] tracking-[0.18em] text-bull">
              {e.photos?.length ? "Photos" : "Details"}
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Members in a grid of person cards. */
export function MemberGrid({
  members,
  size = "md",
  className,
}: {
  members: Member[];
  size?: "lg" | "md" | "sm";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-x-4 gap-y-8 md:gap-x-5",
        size === "sm"
          ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5",
        className,
      )}
    >
      {members.map((m, i) => (
        <PersonCard key={m.slug} member={m} index={i} size={size} />
      ))}
    </div>
  );
}

/** The closing band on department and desk pages. */
export function RecruitingBand() {
  return (
    <section className="bg-night text-white">
      <Reveal className="gutter flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-22">
        <div className="flex flex-col gap-[18px]">
          <Eyebrow tone="light">Applications closed</Eyebrow>
          <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[64px]/none">
            Recruiting reopens <Em light>next term.</Em>
          </h2>
          <p className="text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            Associate applications are closed for now. Follow us on LinkedIn for the next intake.
          </p>
        </div>
        <a
          href={SOCIAL.linkedin}
          target="_blank"
          rel="noreferrer"
          className="btn btn-white shrink-0 self-start lg:self-auto"
        >
          <Linkedin className="h-4 w-4" strokeWidth={1.6} />
          Follow on LinkedIn
        </a>
      </Reveal>
    </section>
  );
}
