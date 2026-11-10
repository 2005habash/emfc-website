import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, Numeral, PageHero, PersonCard } from "@/components/site/ui";
import { departments } from "@/lib/departments";
import { CO_PRESIDENT_QUOTE, IMAGES, ROMAN } from "@/lib/site";
import { ADVISORY, membersOf, PRESIDENTS } from "@/lib/team";
import { STATS } from "@/data/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/board")({
  head: () => ({
    meta: [
      { title: "Board, EMFC" },
      {
        name: "description",
        content:
          "The EMFC Board: the two Co-Presidents, who founded the club, and the Heads of its six departments.",
      },
      { property: "og:title", content: "The EMFC Board" },
      {
        property: "og:description",
        content: "Who runs the ESADE Master's Finance Club, and how it is organised.",
      },
    ],
  }),
  component: BoardPage,
});

/** Each department with its Head, in the order of the departments. */
const HEADS = departments.map((d) => ({
  department: d,
  head: membersOf(d.slug).find((m) => m.position === "head"),
}));

const story = [
  {
    date: "20 May 2026",
    title: "First kick-off",
    body: "The ESADE Master's Investment Society later took over the ESADE Finance Club to form EMFC. At the Finance Club's first event, GreenRoom gives a demo.",
    done: true,
  },
  {
    date: "13 July 2026",
    title: "Applications close",
    body: "The founding cohort of Associates is chosen for September 2026.",
    done: true,
  },
  {
    date: "September 2026",
    title: "EMFC launches",
    body: "The first Master's Finance Club at ESADE Business School.",
    done: true,
  },
  {
    date: "14 September 2026",
    title: "Kick-off Dinner",
    body: "The founding cohort's first gathering, in Barcelona.",
    done: true,
  },
  {
    date: "19 October 2026",
    title: "First open event",
    body: "Alumni roundtables with ESADE Careers, for all master's students.",
    done: true,
  },
  {
    date: "Next term",
    title: "Recruiting reopens",
    body: "The next intake of Associates.",
    done: false,
  },
  {
    date: "Coming soon",
    title: "The EMFC Fund",
    body: "A student-led paper portfolio.",
    done: false,
  },
];

const WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];
const BOARD_SIZE = PRESIDENTS.length + HEADS.filter((h) => h.head).length;

const names = (people: { name: string; displayName?: string }[]) => {
  const list = people.map((p) => p.displayName ?? p.name);
  return list.length > 1 ? `${list.slice(0, -1).join(", ")} and ${list.at(-1)}` : (list[0] ?? "");
};

function BoardPage() {
  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.parkGuell}
        alt="Park Güell above Barcelona"
        eyebrow="The Board"
        position="50% 45%"
        title={
          <>
            The <Em light>Board</Em>
          </>
        }
      >
        EMFC is run by its Board: the two Co-Presidents, who founded the club, and the Heads of its
        six departments.
      </PageHero>

      <CoPresidents />
      <Structure />
      <Story />

      <section className="gutter py-16 lg:py-20">
        <Link
          to="/team"
          className="group flex flex-col gap-3 border-t border-ink pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="font-serif text-[26px]/[1.15] md:text-[32px]/[1.15]">
            The Board is {WORDS[BOARD_SIZE] ?? BOARD_SIZE} people. The club is{" "}
            <Em>{STATS.members}.</Em>
          </span>
          <span className="caps inline-flex items-center gap-2 text-[10.5px] tracking-[0.18em]">
            Meet the team
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </span>
        </Link>
      </section>
    </SiteLayout>
  );
}

/** The two Co-Presidents and their sentence about the club. */
function CoPresidents() {
  const [first, last] = CO_PRESIDENT_QUOTE.split(" The work and the people");
  return (
    <section className="bg-paper">
      <div className="gutter grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-26">
        <Reveal className="flex flex-col gap-7 lg:col-span-6">
          <Eyebrow>From the Co-Presidents</Eyebrow>
          <blockquote className="font-serif text-[30px]/[1.16] italic md:text-[46px]/[1.14]">
            “{first} <span className="text-bull">The work and the people{last}</span>”
          </blockquote>
        </Reveal>
        <Reveal className="grid grid-cols-2 gap-4 md:gap-6 lg:col-span-5 lg:col-start-8">
          {PRESIDENTS.map((p, i) => (
            <PersonCard key={p.slug} member={p} index={i} size="lg" />
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * How the club is organised, drawn as an org chart: the Co-Presidents, a line down to the six Heads,
 * and each department's desks under its Head. On wide screens the lines join up; on smaller ones the
 * departments sit in a grid under the Co-Presidents.
 */
function Structure() {
  return (
    <section className="border-y border-line bg-stone">
      <div className="gutter flex flex-col gap-12 py-20 lg:gap-16 lg:py-26">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>The structure</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              How EMFC is <Em>organised</Em>
            </h2>
          </div>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Each department has a Head, who answers to the Co-Presidents. Inside the departments,
            Vice-Presidents lead the desks, each with its own Associates.
          </p>
        </Reveal>

        <Reveal className="flex flex-col">
          <div className="mx-auto flex w-full max-w-[460px] flex-col items-center gap-2 border border-ink bg-paper px-6 py-5 text-center">
            <span className="caps text-[10px] tracking-[0.24em] text-bull">Co-Presidents</span>
            <span className="font-serif text-[24px]/[1.15] md:text-[28px]/[1.15]">
              {names(PRESIDENTS)}
            </span>
          </div>
          <span aria-hidden className="mx-auto hidden h-10 w-px bg-ink xl:block" />
          <ol className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:mt-0 xl:grid-cols-6">
            {HEADS.map(({ department: d, head }, i) => (
              <li
                key={d.slug}
                className={cn(
                  "relative flex flex-col gap-4",
                  // The connector: a rule along the top of the row, from the first Head's centre to the
                  // last one's, and a short line down to each Head.
                  "xl:pt-10 xl:before:absolute xl:before:-left-2.5 xl:before:-right-2.5 xl:before:top-0 xl:before:h-px xl:before:bg-ink xl:first:before:left-1/2 xl:last:before:right-1/2",
                  "xl:after:absolute xl:after:left-1/2 xl:after:top-0 xl:after:h-10 xl:after:w-px xl:after:bg-ink",
                )}
              >
                <div className="flex items-baseline gap-3 border-t border-ink pt-4 xl:min-h-[53px] xl:border-t-0 xl:pt-0">
                  <Numeral className="text-[22px]">{ROMAN[i]}</Numeral>
                  <Link
                    to="/departments/$department"
                    params={{ department: d.slug }}
                    className="font-serif text-[24px]/[1.1] underline-offset-[5px] hover:underline"
                  >
                    {d.name}
                  </Link>
                </div>
                {head && (
                  <div className="max-w-[220px] xl:max-w-none">
                    <PersonCard member={head} index={i} size="sm" />
                  </div>
                )}
                {d.desks.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 border-l border-line pl-3.5">
                    {d.desks.map((k) => (
                      <li key={k.slug}>
                        <Link
                          to="/departments/$department/$desk"
                          params={{ department: d.slug, desk: k.slug }}
                          className="caps text-[10px]/[1.6] tracking-[0.14em] text-mute underline-offset-4 hover:text-ink hover:underline"
                        >
                          {k.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="border-l border-line pl-3.5 text-[13px]/[1.55] text-mute">
                    {d.function}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-baseline md:justify-between md:gap-10">
          <span className="caps text-[10px] tracking-[0.24em] text-mute">Advising the Board</span>
          <p className="text-[15px]/[1.6] md:text-right">
            {names(ADVISORY)}, the club's{" "}
            <Link
              to="/team"
              hash="advisory-board"
              className="underline underline-offset-4 hover:text-bull"
            >
              Advisory Board
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/** The club's short history, from the first kick-off to what comes next. */
function Story() {
  const reduce = useReducedMotion();
  const done = story.filter((s) => s.done).length;
  return (
    <section className="bg-night text-white">
      <div className="gutter flex flex-col gap-12 py-20 lg:gap-16 lg:py-26">
        <Reveal className="flex flex-col gap-5">
          <Eyebrow tone="light">Our story</Eyebrow>
          <h2 className="font-serif text-5xl/none tracking-[-0.01em] md:text-[76px]/none">
            Established <Em light>2026.</Em>
          </h2>
        </Reveal>
        <Reveal className="relative grid gap-9 md:grid-cols-4 md:gap-6 xl:grid-cols-7">
          <div
            aria-hidden
            className="absolute bottom-2 left-1.5 top-2 w-px bg-[#2A3576] md:hidden xl:bottom-auto xl:left-0 xl:right-0 xl:top-1.5 xl:block xl:h-px xl:w-auto"
          />
          <motion.div
            aria-hidden
            className="absolute left-0 top-1.5 hidden h-px origin-left bg-bull-light xl:block"
            style={{ width: `${(done / story.length) * 100}%` }}
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
          />
          {story.map((s) => (
            <div key={s.title} className="relative flex gap-5 md:flex-col md:gap-3.5">
              <span
                className={cn(
                  "mt-0.5 h-[13px] w-[13px] shrink-0 rounded-full md:mt-0",
                  s.done ? "bg-bull-light" : "border border-bull-light bg-night",
                )}
              />
              <div className="flex flex-col gap-2 md:gap-3.5">
                <span
                  className={cn(
                    "caps text-[10px] tracking-[0.22em] md:text-[10.5px]",
                    s.done ? "text-bull-light" : "text-haze",
                  )}
                >
                  {s.date}
                </span>
                <span className="font-serif text-[26px]/[1.1] md:text-[26px]/[1.1]">{s.title}</span>
                <span className="text-sm/[1.6] text-mist">{s.body}</span>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
