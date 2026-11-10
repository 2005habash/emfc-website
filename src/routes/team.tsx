import { createFileRoute, Link } from "@tanstack/react-router";
import { CoffeeRoulette } from "@/components/fun/CoffeeRoulette";
import { PhotoFrame } from "@/components/fun/PhotoFrame";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { MemberGrid } from "@/components/site/sections";
import { Em, Eyebrow, Numeral, PageHero, PersonCard } from "@/components/site/ui";
import { departments, type Department } from "@/lib/departments";
import { absoluteUrl, CO_PRESIDENT_QUOTE, IMAGES, ROMAN } from "@/lib/site";
import { ADVISORY, associatesOf, leadershipOf, PRESIDENTS } from "@/lib/team";
import { STATS } from "@/data/stats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team, EMFC" },
      {
        name: "description",
        content:
          "The people of EMFC: Co-Presidents, six departments with their Heads, Vice-Presidents and Associates, and the Advisory Board.",
      },
      { property: "og:title", content: "The EMFC Team" },
      {
        property: "og:description",
        content: `${STATS.members} members across six departments of the ESADE Master's Finance Club.`,
      },
      { property: "og:image", content: absoluteUrl(IMAGES.teamGroup) },
    ],
  }),
  component: Team,
});

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

/**
 * Associates by desk, then anyone without a desk. Fixed Income, with six small desks, shows its two
 * groups instead; each person's title still names their desk.
 */
function associateGroups(d: Department) {
  const all = associatesOf(d.slug);
  if (d.groups) {
    return d.groups
      .map((g) => ({ label: g.name, members: all.filter((m) => m.group === g.name) }))
      .filter((g) => g.members.length > 0);
  }
  const groups = d.desks
    .map((k) => ({
      label: k.group ? `${k.group}: ${k.name}` : k.name,
      members: all.filter((m) => m.desk === k.slug),
    }))
    .filter((g) => g.members.length > 0);
  const rest = all.filter((m) => !m.desk);
  if (rest.length) groups.push({ label: d.desks.length ? d.name : "Associates", members: rest });
  return groups;
}

function Team() {
  const reduce = useReducedMotion();
  const done = story.filter((s) => s.done).length;

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.teamGroup}
        alt="The EMFC members together outside the ESADE building"
        eyebrow="The Team"
        position="50% 40%"
        title={
          <>
            {STATS.members} <Em light>members</Em>
          </>
        }
      >
        EMFC is run by master's students across six departments, with a Chief Investment Officer
        overseeing the fund and an Advisory Board supporting the club.
      </PageHero>

      {/* Co-Presidents */}
      <section className="bg-paper">
        <div className="gutter grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-26">
          <Reveal className="flex flex-col gap-7 lg:col-span-6">
            <Eyebrow>From the Co-Presidents</Eyebrow>
            <blockquote className="font-serif text-[30px]/[1.16] italic md:text-[46px]/[1.14]">
              “{CO_PRESIDENT_QUOTE.replace(" The work and the people, in equal measure.", "")}{" "}
              <span className="text-bull">The work and the people, in equal measure.</span>”
            </blockquote>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4 md:gap-6 lg:col-span-5 lg:col-start-8">
            {PRESIDENTS.map((p, i) => (
              <PersonCard key={p.slug} member={p} index={i} size="lg" />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Departments */}
      <section className="gutter flex flex-col pb-10 pt-20 lg:pb-14 lg:pt-26">
        <Reveal className="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
          <div className="flex flex-col gap-5">
            <Eyebrow>Six departments</Eyebrow>
            <h2 className="font-serif text-5xl/none tracking-[-0.01em] md:text-[76px]/none">The departments</h2>
          </div>
          <Link to="/departments" className="btn btn-sm btn-outline-ink self-start md:self-auto">
            Explore the desks
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </Reveal>
        {departments.map((d, i) => (
          <Reveal
            key={d.slug}
            className="grid gap-8 border-t border-ink py-10 lg:grid-cols-12 lg:py-12"
          >
            <div className="flex flex-col gap-3.5 lg:col-span-3">
              <Numeral>{ROMAN[i]}</Numeral>
              <h3 className="font-serif text-4xl/none md:text-[40px]/none">
                <Link
                  to="/departments/$department"
                  params={{ department: d.slug }}
                  className="underline-offset-[6px] hover:underline"
                >
                  {d.name}
                </Link>
              </h3>
              <p className="max-w-[60ch] text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">{d.function}</p>
            </div>
            <div className="flex flex-col gap-10 lg:col-span-9">
              <MemberGrid members={leadershipOf(d.slug)} />
              {associateGroups(d).map((g) => (
                <div key={g.label} className="flex flex-col gap-4">
                  <Eyebrow>{g.label}</Eyebrow>
                  <MemberGrid members={g.members} size="sm" />
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </section>

      {/* Our story */}
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

      {/* Advisory Board, at the end of the page */}
      <section className="gutter py-20 lg:py-26">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-3">
            <Eyebrow>Advisors</Eyebrow>
            <h2 className="font-serif text-5xl/[0.98] tracking-[-0.01em] md:text-[60px]/[0.98]">
              Advisory <Em>Board</Em>
            </h2>
            <p className="text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">
              They advise the club and support the people who run it.
            </p>
          </div>
          <div className="lg:col-span-9">
            <MemberGrid members={ADVISORY} />
          </div>
        </Reveal>
      </section>
      <CoffeeRoulette />
      <PhotoFrame />
    </SiteLayout>
  );
}
