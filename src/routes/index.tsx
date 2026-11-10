import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Linkedin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { FirmLogo } from "@/components/site/FirmLogo";
import { CountUp, Em, Eyebrow, Numeral, PhotoCaption, Portrait } from "@/components/site/ui";
import { loadEvents } from "@/lib/content";
import { STATS } from "@/data/stats";
import { departments } from "@/lib/departments";
import { CO_PRESIDENT_QUOTE, FUND_PAGE_LIVE, IMAGES, MEMBER_FIRMS, NEXT_INTAKE_OPENS, ROMAN, SOCIAL, todayInBarcelona } from "@/lib/site";
import { leadershipOf, PEOPLE_STRIP, PRESIDENTS, type Member } from "@/lib/team";
import { cn } from "@/lib/utils";

/** What search engines and link previews show for emfc.es: the club's figures, which change with STATS. */
const DESCRIPTION = `The finance club at ESADE Business School in Barcelona: ${STATS.members} master's students from ${STATS.nationalities} nationalities, ${STATS.experiencePct}% with professional experience, in ${STATS.departments} departments and ${STATS.desks} desks, built around careers, companies and community.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EMFC, ESADE Master's Finance Club" },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: "EMFC, ESADE Master's Finance Club" },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  loader: () => loadEvents(),
  component: Home,
});

const pillars = [
  {
    title: "Run by Masters",
    body: "The first dedicated finance club at ESADE led by the master's cohort, with events open to the wider community.",
  },
  {
    title: "Six Departments",
    body: "Coverage across IB, Private Markets, Asset Management, Fixed Income, Corporate Relations and Marketing.",
  },
  {
    title: "Industry Access",
    body: "Speaker events, company visits and recruiting prep with partner firms.",
  },
  {
    title: "International",
    body: `${STATS.internationalPct}% of members come from outside Spain, from ${STATS.nationalities} nationalities, with a global recruiting horizon.`,
  },
];

const benefits = [
  {
    title: "Exclusive networking sessions",
    body: "Networking events to connect members with industry professionals and like-minded peers across the ESADE community.",
  },
  {
    title: "Top-tier recruitment opportunities",
    body: "Recruitment events and info sessions with leading financial firms, plus CV reviews, technical training and mock interviews for every desk.",
  },
  {
    title: "Real research and deal work",
    body: "Each department publishes deal case studies, market views and credit research, building a track record of rigorous analysis.",
    library: true,
  },
];

function Home() {
  return (
    <SiteLayout overlayNav>
      <Hero />
      <FirmsBand />
      <Intro />
      <People />
      <Departments />
      <Membership />
      <Panorama />
      {FUND_PAGE_LIVE && <FundTeaser />}
      <Join />
    </SiteLayout>
  );
}

function Hero() {
  // Vasco's eight figures (5 November 2026), in his order.
  const facts = [
    { value: <CountUp to={STATS.members} />, label: "Members" },
    { value: <CountUp to={STATS.nationalities} />, label: "Nationalities" },
    { value: <CountUp to={STATS.internationalPct} suffix="%" />, label: "International" },
    { value: <CountUp to={STATS.experiencePct} suffix="%" />, label: "With professional experience" },
    { value: <CountUp to={STATS.internships} suffix="+" />, label: "Internships completed" },
    { value: <CountUp to={STATS.firms} />, label: "Firms where members have worked" },
    { value: <CountUp to={STATS.universities} />, label: `Universities, in ${STATS.universityCountries} countries` },
    { value: <>{STATS.departments} and {STATS.desks}</>, label: "Departments and desks" },
  ];
  return (
    <section className="relative overflow-hidden bg-[#000B3D] text-white">
      <img
        src={IMAGES.placaEspanya}
        alt="Plaça d'Espanya in Barcelona at dusk"
        width={1600}
        height={900}
        className="absolute inset-0 h-full w-full animate-kenburns object-cover object-[62%_50%] md:object-[50%_45%]"
      />
      <div aria-hidden className="absolute inset-0 bg-[rgb(3_10_46/0.5)]" />
      <PhotoCaption className="absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] lg:block">
        Plaça d'Espanya, Barcelona
      </PhotoCaption>

      <div className="gutter relative flex min-h-[780px] flex-col justify-end gap-6 pt-32 md:min-h-[860px] md:gap-7">
        <Eyebrow tone="hero" className="animate-rise">
          Established 2026, ESADE Business School, Barcelona
        </Eyebrow>
        <h1 className="font-serif text-[64px]/[0.92] tracking-[-0.015em] md:text-[112px]/[0.9] xl:text-[152px]/[0.9]">
          <span className="block animate-rise [animation-delay:150ms]">ESADE Master's</span>
          <span className="block animate-rise [animation-delay:320ms]">
            <Em light>Finance</Em> Club
          </span>
        </h1>
        <div className="flex animate-rise flex-col gap-6 [animation-delay:500ms] lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <p className="max-w-[500px] text-base/[1.65] text-[#E3E6EF] md:text-lg/[1.65]">
            The first Master's Finance Club at ESADE Business School. Built around careers,
            companies and community.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/departments" className="btn btn-white">
              Explore departments
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>
            <Link to="/team" className="btn btn-outline-white">
              Meet the team
            </Link>
          </div>
        </div>
        <dl className="mt-2 grid animate-rise grid-cols-2 border-t border-white/30 [animation-delay:680ms] md:mt-4 md:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex flex-col gap-2 py-5 md:pb-7 md:pt-6",
                // Two to a row on phones, four on wider screens, with a line between rows and columns.
                i % 2 === 1 && "border-l border-white/30 pl-5",
                i < facts.length - 2 && "border-b border-white/30",
                i >= 4 && "md:border-b-0",
                i % 4 === 0 ? "md:border-l-0 md:pl-0" : "md:border-l md:border-white/30 md:pl-8",
              )}
            >
              <dd className="font-serif text-[38px]/none font-medium md:text-5xl/none">
                {f.value}
              </dd>
              <dt className="caps text-[10px] tracking-[0.2em] text-[#D5D9E6] md:text-[10.5px]">
                {f.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/** "Where our members have worked": one slow moving band of the firms' logos, on white in both themes. */
function FirmsBand() {
  return (
    <section aria-label="Where our members have worked" className="border-b border-line bg-plate">
      <div className="flex flex-col gap-4 py-7 lg:flex-row lg:items-center lg:gap-0 lg:py-9">
        <div className="caps gutter shrink-0 text-[10px]/[1.6] tracking-[0.2em] text-plate-ink/70 lg:mx-0 lg:w-auto lg:max-w-none lg:border-r lg:border-plate-ink/15 lg:pr-10 lg:text-[10.5px]/[1.6]">
          Where our members <br className="hidden lg:block" />
          have worked
        </div>
        <div className="group relative flex-1 overflow-hidden motion-reduce:overflow-x-auto [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
          <div className="flex w-max animate-marquee [animation-duration:90s]">
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                aria-hidden={copy === 1}
                className="flex shrink-0 items-center gap-16 pr-16 whitespace-nowrap [--logo-h:40px] md:gap-20 md:pr-20 md:[--logo-h:48px]"
              >
                {MEMBER_FIRMS.map((name) => (
                  <li key={name} className="flex h-16 items-center md:h-20">
                    <FirmLogo name={name} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro() {
  return (
    <section className="gutter flex flex-col gap-16 py-20 lg:gap-24 lg:py-28">
      <Reveal className="grid gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Eyebrow>Welcome to EMFC</Eyebrow>
          <p className="font-serif text-[32px]/[1.1] font-medium tracking-[-0.01em] md:text-[60px]/[1.08]">
            A finance club built around <Em>careers</Em>, <Em>companies</Em> and the people you meet
            along the way.
          </p>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-4 lg:col-start-9 lg:pt-11">
          <p className="text-[15px]/[1.75] text-mute md:text-[17px]/[1.75]">
            Direct access to industry professionals, company visits and peer networking, alongside
            real research, deal work and portfolio experience. Many of our sessions are open to the
            wider ESADE community.
          </p>
          <Link to="/team" className="btn btn-sm btn-outline-ink self-start">
            Our story
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </Reveal>
      <Reveal className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((p, i) => (
          <div key={p.title} className="flex flex-col gap-3 border-t border-ink pt-6">
            <Numeral>{ROMAN[i]}.</Numeral>
            <h3 className="font-serif text-[28px]/[1.05] md:text-[32px]/[1.05]">{p.title}</h3>
            <p className="text-sm/[1.65] text-mute md:text-[15px]/[1.65]">{p.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

function Panorama() {
  return (
    <section
      aria-label="Barcelona"
      className="relative flex h-[320px] flex-col items-center justify-center gap-4 overflow-hidden bg-[#000B3D] px-5 text-center text-white md:h-[420px]"
    >
      <img
        src={IMAGES.sagradaFamilia}
        alt="Aerial view of the Sagrada Família and the Eixample grid at golden hour"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden className="absolute inset-0 bg-[rgb(3_10_46/0.4)]" />
      <Reveal>
        <p className="relative font-serif text-[44px]/none italic md:text-[80px]/none">
          {STATS.nationalities} nationalities.
        </p>
        <p className="caps relative mt-4 text-[10px] tracking-[0.26em] text-[#E3E6EF] md:text-[11px]">
          Built around a global recruiting horizon
        </p>
      </Reveal>
      <PhotoCaption className="absolute bottom-4 left-5 md:bottom-6 md:left-14">
        Sagrada Família and L'Eixample, Barcelona
      </PhotoCaption>
    </section>
  );
}

function Departments() {
  const reduce = useReducedMotion();
  const grow = (axis: "scaleX" | "scaleY", delay: number) => ({
    initial: reduce ? false : { [axis]: 0 },
    whileInView: { [axis]: 1 },
    viewport: { once: true },
    transition: { duration: 0.45, delay, ease: "easeOut" as const },
  });
  return (
    <section id="departments" className="bg-stone">
      <div className="gutter flex flex-col items-center py-20 lg:py-26">
        <Reveal className="flex flex-col items-center gap-5 text-center">
          <Eyebrow center>Structure</Eyebrow>
          <h2 className="font-serif text-5xl/none tracking-[-0.01em] md:text-[76px]/none">
            Our Departments
          </h2>
          <p className="text-[15px]/[1.7] text-mute md:text-[17px]/[1.7]">
            Six departments and fifteen desks, led by two Co-Presidents.
          </p>
          <Link
            to="/departments"
            hash="quiz"
            className="caps inline-flex items-center gap-2 text-[10.5px] tracking-[0.18em] underline underline-offset-[5px]"
          >
            Not sure where you fit? Find your desk
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-2 bg-[#000B3D] px-6 py-5 text-center text-white md:mt-14 md:px-12">
          <span className="caps text-[10px] tracking-[0.24em] text-bull-light md:text-[10.5px]">
            Co-Presidents
          </span>
          <span className="font-serif text-[22px]/[1.25] font-medium md:text-[28px]/[1.2]">
            {PRESIDENTS.map((p) => p.name).join(" and ")}
          </span>
        </Reveal>

        <div aria-hidden className="relative hidden h-12 w-full lg:block">
          <motion.div className="absolute left-1/2 top-0 h-6 w-px origin-top bg-bull" {...grow("scaleY", 0.2)} />
          <motion.div
            className="absolute left-[calc(100%/6)] right-[calc(100%/6)] top-6 h-px bg-bull"
            {...grow("scaleX", 0.6)}
          />
        </div>

        <Reveal className="mt-10 grid w-full gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-3 lg:gap-6">
          {departments.map((d, i) => {
            const leads = leadershipOf(d.slug).filter((m) => m.position === "head" || m.position === "cio");
            return (
              <Link
                key={d.slug}
                to="/departments/$department"
                params={{ department: d.slug }}
                className="group flex flex-col gap-3 border border-line bg-panel p-6 transition duration-300 hover:-translate-y-1 hover:border-ink md:px-8 md:py-7"
              >
                <div className="flex items-center justify-between">
                  <Numeral>{ROMAN[i]}</Numeral>
                  <ArrowUpRight
                    className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mt-1 font-serif text-[32px]/none md:text-[38px]/none">{d.name}</h3>
                <div className="caps text-[10px]/[1.7] tracking-[0.18em] text-mute md:text-[10.5px]/[1.7]">
                  {leads.map((m) => `${m.position === "cio" ? "CIO" : "Head"}: ${m.name}`).join(", ")}
                </div>
                <div className="caps mt-1 border-t border-line pt-3.5 text-[10px]/[1.7] tracking-[0.16em] md:text-[10.5px]/[1.7]">
                  {d.desks.length ? d.desks.map((k) => k.name).join(", ") : d.function}
                </div>
              </Link>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

function Membership() {
  return (
    <section
      id="membership"
      className="gutter grid items-start gap-10 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28"
    >
      <Reveal className="flex flex-col gap-7 lg:col-span-5">
        <Eyebrow>Membership</Eyebrow>
        <h2 className="font-serif text-[52px]/[0.98] tracking-[-0.01em] md:text-[76px]/[0.98]">
          Membership <br className="max-lg:hidden" />
          <Em>Benefits</Em>
        </h2>
        <figure className="mt-2 flex flex-col gap-3">
          <div className="h-[220px] overflow-hidden bg-stone md:h-[420px] lg:h-[520px]">
            <img
              src={IMAGES.portOlimpic}
              alt="Barcelona's beachfront and Port Olímpic towers from the air"
              loading="lazy"
              className="h-full w-full object-cover object-[72%_50%]"
            />
          </div>
          <figcaption className="caps text-[10px] tracking-[0.22em] text-mute">
            Port Olímpic, Barcelona
          </figcaption>
        </figure>
      </Reveal>
      <Reveal className="flex flex-col border-b border-line lg:col-span-6 lg:col-start-7 lg:pt-2">
        {benefits.map((b, i) => (
          <div
            key={b.title}
            className="grid grid-cols-[40px_minmax(0,1fr)] gap-4 border-t border-line py-6 md:grid-cols-[64px_minmax(0,1fr)] md:gap-6"
          >
            <Numeral className="leading-[1.1]">{ROMAN[i]}.</Numeral>
            <div className="flex flex-col gap-2.5">
              <h3 className="font-serif text-[26px]/[1.1] md:text-[32px]/[1.1]">{b.title}</h3>
              <p className="text-[15px]/[1.65] text-mute md:text-base/[1.65]">{b.body}</p>
              {b.library && (
                <Link
                  to="/resources"
                  hash="research"
                  className="caps mt-1 self-start text-[10.5px] tracking-[0.18em] underline underline-offset-[5px]"
                >
                  Browse the research library
                </Link>
              )}
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

function StripTile({ m, i }: { m: Member; i: number }) {
  return (
    <Link
      to="/team"
      aria-label={`${m.displayName ?? m.name}, ${m.title}`}
      className="group relative block h-[150px] w-[125px] shrink-0 overflow-hidden md:h-[220px] md:w-[183px]"
    >
      <Portrait member={m} alternate={i % 2 === 1} className="h-full" />
      <span className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col gap-0.5 bg-[#000B3D] px-3 pt-2.5 pb-3 text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
        <span className="font-serif text-base/[1.1] md:text-lg/[1.1]">{m.displayName ?? m.name}</span>
        <span className="caps text-[10px] tracking-[0.16em] text-[#D5D9E6] md:text-[10px]">{m.title}</span>
      </span>
    </Link>
  );
}

/** A row of portraits moving slowly sideways; it pauses on hover and stays still for reduced motion. */
function MovingRow({ people, reverse = false }: { people: Member[]; reverse?: boolean }) {
  return (
    <div className="group/row overflow-hidden motion-reduce:overflow-x-auto">
      <div
        className="flex w-max animate-marquee group-hover/row:[animation-play-state:paused]"
        style={{ animationDuration: `${people.length * 4.5}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0">
            {people.map((m, i) => (
              <StripTile key={m.slug} m={m} i={i + copy} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function People() {
  const half = Math.ceil(PEOPLE_STRIP.length / 2);
  return (
    <section id="people" className="bg-night text-white">
      <Reveal className="gutter grid items-start gap-10 pt-20 lg:grid-cols-12 lg:gap-8 lg:pt-26">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow tone="light">{STATS.members} members</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.98] tracking-[-0.01em] md:text-[76px]/[0.98]">
            The people <br className="max-md:hidden" />
            behind <Em light>EMFC.</Em>
          </h2>
          <p className="max-w-[420px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            Master's students from {STATS.nationalities} nationalities, {STATS.experiencePct}% of them
            with professional experience across banking, markets and private capital.
          </p>
          <Link to="/team" className="btn btn-sm btn-outline-white self-start">
            Meet the team
            <ArrowRight className="h-[15px] w-[15px]" strokeWidth={1.75} />
          </Link>
        </div>
        <figure className="flex flex-col gap-7 border border-white/20 p-6 md:px-11 md:py-10 lg:col-span-6 lg:col-start-7">
          <div className="caps text-[10px] tracking-[0.24em] text-bull-light md:text-[10.5px]">
            From the Co-Presidents
          </div>
          <blockquote className="font-serif text-2xl/[1.25] italic md:text-[30px]/[1.24]">
            “{CO_PRESIDENT_QUOTE}”
          </blockquote>
          <figcaption className="flex items-center gap-4 border-t border-white/20 pt-6">
            <div className="flex shrink-0">
              {PRESIDENTS.map((p, i) => (
                <Portrait
                  key={p.slug}
                  member={p}
                  className={cn("h-14 w-14 rounded-full border-2 border-night", i > 0 && "-ml-3.5")}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg/[1.15] md:text-[21px]/[1.15]">
                {PRESIDENTS.map((p) => p.name).join(" and ")}
              </span>
              <span className="caps text-[10px] tracking-[0.2em] text-mist md:text-[10px]">
                Co-Presidents and Founders
              </span>
            </div>
          </figcaption>
        </figure>
      </Reveal>

      <div className="mt-14 flex flex-col md:mt-18" aria-label="Members of EMFC">
        <MovingRow people={PEOPLE_STRIP.slice(0, half)} />
        <MovingRow people={PEOPLE_STRIP.slice(half)} reverse />
      </div>
    </section>
  );
}

function FundTeaser() {
  const stages = ["Sourcing", "Due diligence", "Portfolio management"];
  return (
    <section id="fund" className="border-t border-white/15 bg-night text-white md:border-t-0">
      <div className="gutter flex flex-col items-center py-18 text-center lg:py-26">
        <Reveal className="flex flex-col items-center">
          <span className="caps inline-flex items-center gap-2.5 rounded-full border border-bull-light px-4 py-2 text-[10px] tracking-[0.22em] text-bull-light md:text-[10.5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-bull-light" />
            Coming soon
          </span>
          <h2 className="mt-7 font-serif text-[64px]/[0.95] tracking-[-0.015em] md:text-[112px]/[0.95]">
            The EMFC <Em light>Fund</Em>
          </h2>
          <p className="mt-7 max-w-[640px] text-base/[1.7] text-mist md:text-lg/[1.7]">
            We are building a student-led paper trading portfolio. Members will get hands-on
            experience across sourcing, due diligence and portfolio management. More details coming
            soon.
          </p>
        </Reveal>
        <Reveal className="relative mt-12 grid w-full max-w-[960px] gap-7 text-left md:mt-16 md:grid-cols-3 md:gap-0 md:text-center">
          <div
            aria-hidden
            className="absolute bottom-2 left-1.5 top-2 w-px bg-[#3A4686] md:bottom-auto md:left-[16.66%] md:right-[16.66%] md:top-1.5 md:h-px md:w-auto"
          />
          {stages.map((s, i) => (
            <div
              key={s}
              className="relative flex items-start gap-5 md:flex-col md:items-center md:gap-3.5"
            >
              <span className="mt-0.5 h-[13px] w-[13px] shrink-0 rounded-full border border-bull-light bg-night md:mt-0" />
              <span className="flex flex-col gap-1 md:gap-3.5">
                <span className="caps text-[10px] tracking-[0.22em] text-haze md:text-[10.5px]">
                  Stage {ROMAN[i]}
                </span>
                <span className="font-serif text-[28px]/[1.1] md:text-[32px]/[1.1]">{s}</span>
              </span>
            </div>
          ))}
        </Reveal>
        <Link to="/fund" className="btn btn-white mt-12 md:mt-14">
          See how the fund will run
          <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
        </Link>
      </div>
    </section>
  );
}

function useCountdown(target: string | null) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    if (Number.isNaN(end)) return;
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return left;
}

function Join() {
  const left = useCountdown(NEXT_INTAKE_OPENS);
  const counting = left !== null && left > 0;
  const sec = Math.floor((left ?? 0) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [
    { value: String(Math.floor(sec / 86400)), label: "Days" },
    { value: pad(Math.floor((sec % 86400) / 3600)), label: "Hours" },
    { value: pad(Math.floor((sec % 3600) / 60)), label: "Minutes" },
    { value: pad(sec % 60), label: "Seconds" },
  ];
  const opens = NEXT_INTAKE_OPENS
    ? new Date(NEXT_INTAKE_OPENS).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const EVENTS = Route.useLoaderData();
  const today = todayInBarcelona();
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const next = sorted.find((e) => e.date >= today);
  const event = next ?? sorted[sorted.length - 1];
  const eventDate = event ? new Date(event.date + "T12:00:00") : null;

  return (
    <section id="join" className="grid lg:grid-cols-2">
      <div className="relative min-h-[240px] overflow-hidden bg-[#000B3D] lg:min-h-[760px]">
        <img
          src={IMAGES.parkGuell}
          alt="Park Güell mosaic bench overlooking Barcelona at sunrise"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[50%_60%] lg:object-center"
        />
        <PhotoCaption className="absolute bottom-4 left-5 text-white md:bottom-6 md:left-14">
          Park Güell, Barcelona
        </PhotoCaption>
      </div>
      <div className="flex flex-col gap-6 bg-stone px-5 py-14 md:px-10 lg:px-18 lg:py-26">
        {counting ? (
          <>
            <Eyebrow>Next intake: Associate applications</Eyebrow>
            <h2 className="font-serif text-[52px]/[0.98] tracking-[-0.01em] md:text-[76px]/[0.98]">
              Applications <Em>open in</Em>
            </h2>
            <div
              role="timer"
              aria-label="Time until applications open"
              className="grid grid-cols-4 border-y border-ink"
            >
              {parts.map((p, i) => (
                <div
                  key={p.label}
                  className={cn(
                    "flex flex-col gap-1.5 py-5",
                    i > 0 && "border-l border-line pl-4 md:pl-6",
                  )}
                >
                  <span className="font-serif text-[40px]/none font-medium md:text-[64px]/none">
                    {p.value}
                  </span>
                  <span className="caps text-[10px] tracking-[0.22em] text-mute md:text-[10px]">
                    {p.label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[15px]/[1.7] text-mute md:text-[17px]/[1.7]">
              Applications open on {opens}. Follow us on LinkedIn so you don't miss the window.
            </p>
          </>
        ) : (
          <>
            <Eyebrow>Applications closed</Eyebrow>
            <h2 className="font-serif text-[52px]/[0.98] tracking-[-0.01em] md:text-[76px]/[0.98]">
              Recruiting reopens <Em>next term.</Em>
            </h2>
            <p className="text-[15px]/[1.7] text-mute md:text-[17px]/[1.7]">
              Associate applications are closed for now. Follow us on LinkedIn for the next intake.
            </p>
          </>
        )}
        <a
          href={SOCIAL.linkedin}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ink mt-2 sm:self-start"
        >
          <Linkedin className="h-4 w-4" strokeWidth={1.6} />
          Follow on LinkedIn
        </a>

        {event && eventDate && (
          <div className="mt-6 flex flex-wrap items-center gap-5 border-y border-line py-6 md:gap-7 md:py-7">
            <div className="flex shrink-0 flex-col items-center gap-1 border-r border-line pr-5 md:pr-7">
              <span className="font-serif text-[44px]/[0.9] font-medium md:text-[52px]/[0.9]">
                {eventDate.getDate()}
              </span>
              <span className="caps text-[10px] tracking-[0.2em] text-mute md:text-[10px]">
                {eventDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).replace(/\bSept\b/, "Sep")}
              </span>
            </div>
            <div className="flex min-w-[55%] flex-1 flex-col gap-1.5">
              <span className="caps text-[10px] tracking-[0.22em] text-mute md:text-[10px]">
                {next ? "Next event" : "Latest event"}, {event.type}, {event.location}
              </span>
              <Link
                to="/events/$eventId"
                params={{ eventId: event.id }}
                className="font-serif text-[24px]/[1.1] font-medium underline-offset-4 hover:underline md:text-[32px]/[1.05]"
              >
                {event.title}
              </Link>
            </div>
            <Link
              to="/events"
              className="btn btn-outline-ink h-11 shrink-0 max-sm:w-full px-[18px] text-[10.5px]"
            >
              All events
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </div>
        )}

        <NewsletterForm className="mt-2" />
      </div>
    </section>
  );
}
