import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, Numeral, PageHero, PersonCard } from "@/components/site/ui";
import { departments } from "@/lib/departments";
import { CO_PRESIDENT_QUOTES, IMAGES, ROMAN } from "@/lib/site";
import { ADVISORY, PRESIDENTS } from "@/lib/team";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team, EMFC" },
      {
        name: "description",
        content:
          "The founding team of EMFC. Co-Presidents, Department Heads, CIO, VPs and Advisory Board.",
      },
      { property: "og:title", content: "EMFC Founding Team" },
      {
        property: "og:description",
        content:
          "Co-Presidents, Heads, CIO, VPs and Advisory Board leading EMFC into its September 2026 launch.",
      },
    ],
  }),
  component: Team,
});

const story = [
  {
    date: "13 July 2026",
    title: "Founding-cohort applications close",
    body: "Associate seats for September 2026.",
    done: true,
  },
  {
    date: "September 2026",
    title: "EMFC launches at ESADE",
    body: "The first Master's Finance Club at ESADE Business School.",
    done: true,
  },
  {
    date: "14 September 2026",
    title: "Kickoff Dinner, Barcelona",
    body: "The founding cohort's first gathering.",
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
    body: "A student-led paper trading portfolio.",
    done: false,
  },
];

function Team() {
  const reduce = useReducedMotion();
  const investment = departments.filter((d) => !d.support);
  const support = departments.filter((d) => d.support);

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.parkGuell}
        alt="Park Güell mosaic terrace overlooking Barcelona at sunrise"
        eyebrow="The Team"
        position="50% 42%"
        title={
          <>
            The founding <Em light>team</Em>
          </>
        }
      >
        EMFC is led by master's students with prior experience across banking, markets and private
        capital, with a Chief Investment Officer overseeing the buy-side desk and an Advisory Board
        supporting the build.
      </PageHero>

      {/* Co-Presidents */}
      <section className="bg-stone">
        <div className="gutter grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-26">
          <Reveal className="flex flex-col gap-7 lg:col-span-6">
            <Eyebrow>From the Co-Presidents</Eyebrow>
            <blockquote className="font-serif text-[30px]/[1.16] italic md:text-[46px]/[1.14]">
              “EMFC was built for master's students who arrive at ESADE already close to recruiting
              and want a real community around it.{" "}
              <span className="text-brass">The work and the people, in equal measure.</span>”
            </blockquote>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4 md:gap-6 lg:col-span-5 lg:col-start-8">
            {PRESIDENTS.map((p, i) => (
              <PersonCard key={p.name} person={p} index={i} large />
            ))}
          </Reveal>
        </div>
      </section>

      {/* Investment Team */}
      <section className="gutter flex flex-col pb-10 pt-20 lg:pb-14 lg:pt-26">
        <Reveal className="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
          <div className="flex flex-col gap-5">
            <Eyebrow>Four desks</Eyebrow>
            <h2 className="font-serif text-5xl/none tracking-[-0.01em] md:text-[76px]/none">
              Investment Team
            </h2>
          </div>
          <Link to="/departments" className="btn btn-sm btn-outline-ink self-start md:self-auto">
            Explore the desks
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </Reveal>
        {investment.map((d, i) => (
          <Reveal
            key={d.slug}
            className="grid gap-8 border-t border-ink py-10 lg:grid-cols-12 lg:py-12"
          >
            <div className="flex flex-col gap-3.5 lg:col-span-3">
              <Numeral>{ROMAN[i]}</Numeral>
              <h3 className="font-serif text-4xl/none md:text-[40px]/none">{d.name}</h3>
              <p className="text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">{d.function}</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-5 lg:col-span-9">
              {d.people.map((p, j) => (
                <PersonCard key={p.name + p.role} person={p} index={j} />
              ))}
            </div>
          </Reveal>
        ))}
      </section>

      {/* Support Team */}
      <section className="bg-stone">
        <div className="gutter grid items-start gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-26">
          <Reveal className="flex flex-col gap-6 lg:col-span-6">
            <Eyebrow>Support Team</Eyebrow>
            <blockquote className="font-serif text-2xl/[1.22] italic md:text-[34px]/[1.2]">
              “{CO_PRESIDENT_QUOTES[1]}”
            </blockquote>
            <span className="caps text-[10px] tracking-[0.2em] text-mute md:text-[10.5px]">
              The Co-Presidents
            </span>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4 md:gap-6 lg:col-span-5 lg:col-start-8">
            {support.map((d, i) => (
              <div key={d.slug} className="flex flex-col gap-4">
                {d.people.map((p) => (
                  <PersonCard key={p.name} person={p} index={i} large />
                ))}
                <p className="border-t border-line pt-3 text-sm/[1.6] text-mute">{d.function}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Advisory Board */}
      <section className="gutter py-20 lg:py-26">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-3">
            <Eyebrow>Founders</Eyebrow>
            <h2 className="font-serif text-5xl/[0.98] tracking-[-0.01em] md:text-[60px]/[0.98]">
              Advisory <Em>Board</Em>
            </h2>
            <p className="text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">
              Founders who now advise the club and support the build.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-5 lg:col-span-9">
            {ADVISORY.map((p, j) => (
              <PersonCard key={p.name} person={p} index={j} />
            ))}
          </div>
        </Reveal>
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
          <Reveal className="relative grid gap-9 md:grid-cols-5 md:gap-6">
            <div
              aria-hidden
              className="absolute bottom-2 left-1.5 top-2 w-px bg-[#2A3576] md:bottom-auto md:left-0 md:right-0 md:top-1.5 md:h-px md:w-auto"
            />
            <motion.div
              aria-hidden
              className="absolute left-0 top-1.5 hidden h-px w-3/5 origin-left bg-brass-light md:block"
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
                    s.done ? "bg-brass-light" : "border border-brass-light bg-night",
                  )}
                />
                <div className="flex flex-col gap-2 md:gap-3.5">
                  <span
                    className={cn(
                      "caps text-[10px] tracking-[0.22em] md:text-[10.5px]",
                      s.done ? "text-brass-light" : "text-haze",
                    )}
                  >
                    {s.date}
                  </span>
                  <span className="font-serif text-[26px]/[1.1] md:text-[28px]/[1.1]">
                    {s.title}
                  </span>
                  <span className="text-sm/[1.6] text-mist">{s.body}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
