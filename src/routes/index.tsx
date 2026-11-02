import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight, Linkedin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { CountUp, Em, Eyebrow, Numeral, PhotoCaption, Portrait } from "@/components/site/ui";
import { departments } from "@/lib/departments";
import {
  CO_PRESIDENT_QUOTES,
  EVENTS,
  IMAGES,
  MEMBER_FIRMS,
  NEXT_INTAKE_OPENS,
  ROMAN,
  SOCIAL,
} from "@/lib/site";
import { linkedinOf, MOSAIC } from "@/lib/team";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EMFC, ESADE Master's Finance Club" },
      {
        name: "description",
        content:
          "The finance club at ESADE Business School in Barcelona. Built around careers, companies and community. Launching September 2026.",
      },
      { property: "og:title", content: "EMFC, ESADE Master's Finance Club" },
      { property: "og:description", content: "The finance club at ESADE." },
      { property: "og:image", content: IMAGES.placaEspanya },
      { property: "twitter:image", content: IMAGES.placaEspanya },
    ],
  }),
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
    body: "Over 90% international cohort, built around a global recruiting horizon.",
  },
];

const benefits = [
  {
    title: "Exclusive networking sessions",
    body: "Networking events to connect members with industry professionals and like-minded peers across the ESADE community.",
  },
  {
    title: "Top-tier recruitment opportunities",
    body: "Recruitment events, CV drop-ins and info sessions from the leading financial firms across banking, markets and private capital.",
  },
  {
    title: "Real research and deal work",
    body: "Each department publishes deal teardowns, equity research, and credit reports, fostering a track record of rigorous analysis and professional growth.",
    library: true,
  },
  {
    title: "Application workshops",
    body: "Technical training sessions, CV reviews and panel events for Investment Banking, Private Equity, VC & Growth, Fintech, Real Assets, Fixed Income and Asset Management.",
  },
  {
    title: "Study trips",
    body: "Trips to leading financial hubs with desk time on the buy-side and sell-side, organised with partner firms.",
  },
];

const tickerItems = [
  { name: "Investment Banking", mark: "▲", detail: "M&A · Debt" },
  {
    name: "Private Markets",
    mark: "▲",
    detail: "Private Equity · VC & Growth · Fintech · Real Assets",
  },
  {
    name: "Asset Management",
    mark: "▲",
    detail: "Macro & Strategy · Equity Research · Portfolio Management · ETFs",
  },
  {
    name: "Fixed Income",
    mark: "▲",
    detail: "Investment Grade · High Yield · Distressed · Emerging Markets · Financials",
  },
  { name: "The EMFC Fund", mark: "●", detail: "Coming soon" },
];

function Home() {
  return (
    <SiteLayout overlayNav>
      <Hero />
      <Ticker />
      <FirmsStrip />
      <Intro />
      <Panorama />
      <Departments />
      <Membership />
      <People />
      <FundTeaser />
      <Join />
    </SiteLayout>
  );
}

function Hero() {
  const facts = [
    { value: <CountUp to={6} pad={2} />, label: "Departments" },
    { value: <CountUp to={90} suffix="%+" />, label: "International cohort" },
    { value: <CountUp to={MEMBER_FIRMS.length} />, label: "Firms in our network" },
    { value: <CountUp to={2026} from={2000} />, label: "Founded in Barcelona" },
  ];
  return (
    <section className="relative overflow-hidden bg-[#030C3B] text-white">
      <img
        src={IMAGES.placaEspanya}
        alt="Plaça d'Espanya in Barcelona at dusk"
        width={1600}
        height={900}
        className="absolute inset-0 h-full w-full animate-kenburns object-cover object-[62%_50%] md:object-[50%_45%]"
      />
      <div aria-hidden className="absolute inset-0 bg-[rgb(3_10_46/0.5)]" />
      <PhotoCaption className="absolute right-5 top-1/2 hidden -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] lg:block">
        Plaça d'Espanya · Barcelona
      </PhotoCaption>

      <div className="gutter relative flex min-h-[780px] flex-col justify-end gap-6 pt-32 md:min-h-[860px] md:gap-7">
        <Eyebrow tone="hero" className="animate-rise">
          Est. 2026 · ESADE Business School · Barcelona
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
                "flex flex-col gap-2 py-5 md:pb-8 md:pt-6",
                i % 2 === 1 && "border-l border-white/30 pl-5",
                i < 2 && "border-b border-white/30 md:border-b-0",
                i > 0 && "md:border-l md:border-white/30 md:pl-8",
              )}
            >
              <dd className="font-serif text-[38px]/none font-medium md:text-5xl/none">
                {f.value}
              </dd>
              <dt className="caps text-[9.5px] tracking-[0.2em] text-[#D5D9E6] md:text-[10.5px]">
                {f.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Ticker() {
  return (
    <div
      aria-label="Departments and verticals"
      className="overflow-hidden border-t border-white/15 bg-[#030C3B]"
    >
      <div className="flex w-max animate-marquee">
        {[0, 1].map((group) => (
          <div
            key={group}
            aria-hidden={group === 1}
            className="caps flex gap-14 py-3.5 pr-14 text-[10px] tracking-[0.22em] whitespace-nowrap text-haze md:text-[10.5px]"
          >
            {tickerItems.map((it) => (
              <span key={it.name}>
                <span className="text-white">{it.name}</span>{" "}
                <span className="text-brass-light">{it.mark}</span> {it.detail}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function FirmsStrip() {
  return (
    <section aria-label="Where our members come from" className="border-b border-line">
      <div className="gutter flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:gap-10 lg:py-10">
        <div className="caps shrink-0 text-[10px]/[1.6] tracking-[0.2em] text-mute lg:w-[170px] lg:text-[10.5px]/[1.6]">
          Where our members <br className="hidden lg:block" />
          come from
        </div>
        <span className="hidden h-11 w-px shrink-0 bg-line lg:block" />
        <div className="grid flex-1 grid-cols-3 gap-y-2.5 font-serif text-[19px] font-semibold sm:grid-cols-4 lg:flex lg:justify-between lg:text-[18px] xl:text-[21px]">
          {MEMBER_FIRMS.map((f) => (
            <span key={f} className="whitespace-nowrap">
              {f}
            </span>
          ))}
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
          <p className="font-serif text-[38px]/[1.08] font-medium tracking-[-0.01em] md:text-[60px]/[1.08]">
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
      className="relative flex h-[320px] flex-col items-center justify-center gap-4 overflow-hidden bg-[#030C3B] px-5 text-center text-white md:h-[420px]"
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
          Over 90% international.
        </p>
        <p className="caps relative mt-4 text-[9.5px] tracking-[0.26em] text-[#E3E6EF] md:text-[11px]">
          Built around a global recruiting horizon
        </p>
      </Reveal>
      <PhotoCaption className="absolute bottom-4 left-5 md:bottom-6 md:left-14">
        Sagrada Família & L'Eixample · Barcelona
      </PhotoCaption>
    </section>
  );
}

function Departments() {
  const reduce = useReducedMotion();
  const investment = departments.filter((d) => !d.support);
  const support = departments.filter((d) => d.support);
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
            How EMFC is structured across the Investment and Support teams.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-col gap-2 bg-[#030C3B] px-6 py-5 text-center text-white md:mt-14 md:px-12">
          <span className="caps text-[10px] tracking-[0.24em] text-brass-light md:text-[10.5px]">
            Co-Presidents
          </span>
          <span className="font-serif text-[22px]/[1.25] font-medium md:text-[28px]/[1.2]">
            Diogo Oliveira <span className="max-md:hidden">·</span>
            <br className="md:hidden" /> Vasco Barahona de Lemos
          </span>
        </Reveal>

        <div aria-hidden className="relative hidden h-14 w-full lg:block">
          <motion.div
            className="absolute left-1/2 top-0 h-6 w-px origin-top bg-brass"
            {...grow("scaleY", 0.2)}
          />
          <motion.div
            className="absolute right-[calc(12.5%-3px)] left-[calc(37.5%-9px)] top-6 h-px bg-brass"
            {...grow("scaleX", 0.6)}
          />
          <motion.div
            className="absolute left-[calc(37.5%-9px)] top-6 h-8 w-px origin-top bg-brass"
            {...grow("scaleY", 1.1)}
          />
          <motion.div
            className="absolute right-[calc(12.5%-3px)] top-6 h-8 w-px origin-top bg-brass"
            {...grow("scaleY", 1.1)}
          />
        </div>

        <Reveal className="mt-10 grid w-full items-start gap-10 lg:mt-0 lg:grid-cols-[3fr_1fr] lg:gap-6">
          <div className="flex flex-col gap-6">
            <div className="caps border-b border-ink pb-3.5 text-center text-[10px] tracking-[0.24em] md:text-[11px]">
              Investment Team · {investment.length} Desks
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
              {investment.map((d, i) => (
                <Link
                  key={d.slug}
                  to="/departments"
                  search={{ desk: d.slug }}
                  className="flex flex-col gap-3 border border-line bg-panel p-6 transition duration-300 hover:-translate-y-1 hover:border-ink md:px-8 md:py-7"
                >
                  <div className="flex items-center justify-between">
                    <Numeral>{ROMAN[i]}</Numeral>
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-1 font-serif text-[32px]/none md:text-[38px]/none">{d.name}</h3>
                  <div className="caps text-[10px] tracking-[0.18em] text-mute md:text-[10.5px]">
                    Head — {d.head}
                    {d.cio && ` · CIO — ${d.cio}`}
                  </div>
                  <div className="caps mt-1 border-t border-line pt-3.5 text-[10px]/[1.7] tracking-[0.16em] md:text-[10.5px]/[1.7]">
                    {d.verticals.join(" · ")}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="caps border-b border-ink pb-3.5 text-center text-[10px] tracking-[0.24em] md:text-[11px]">
              Support Team
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-6">
              {support.map((d, i) => (
                <Link
                  key={d.slug}
                  to="/departments"
                  search={{ desk: d.slug }}
                  className="flex flex-col gap-3 border border-line bg-panel p-6 transition duration-300 hover:-translate-y-1 hover:border-ink md:p-7"
                >
                  <Numeral>{ROMAN[investment.length + i]}</Numeral>
                  <h3 className="mt-1 font-serif text-[28px]/[1.05] md:text-[32px]/[1.05]">
                    {d.name}
                  </h3>
                  <div className="caps text-[10px] tracking-[0.18em] text-mute md:text-[10.5px]">
                    Head — {d.head}
                  </div>
                </Link>
              ))}
            </div>
          </div>
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
            Port Olímpic · Barcelona
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
                  hash="library"
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

function MosaicCaption({ name, role }: { name: string; role: string }) {
  return (
    <span className="absolute inset-x-0 bottom-0 flex translate-y-full flex-col gap-0.5 bg-[#030C3B] px-3 pt-2.5 pb-3 text-white transition-transform duration-300 group-hover:translate-y-0 group-focus-visible:translate-y-0">
      <span className="font-serif text-lg/[1.1]">{name}</span>
      <span className="caps text-[8.5px] tracking-[0.16em] text-[#D5D9E6]">{role}</span>
    </span>
  );
}

function People() {
  const [quote, setQuote] = useState(0);
  const total = CO_PRESIDENT_QUOTES.length;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section id="people" className="bg-night text-white">
      <Reveal className="gutter grid items-start gap-10 pt-20 lg:grid-cols-12 lg:gap-8 lg:pt-26">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Eyebrow tone="light">The founding cohort</Eyebrow>
          <h2 className="font-serif text-[52px]/[0.98] tracking-[-0.01em] md:text-[76px]/[0.98]">
            The people <br className="max-md:hidden" />
            behind <Em light>EMFC.</Em>
          </h2>
          <p className="max-w-[420px] text-[15px]/[1.7] text-mist md:text-base/[1.7]">
            Led by master's students with prior experience across banking, markets and private
            capital.
          </p>
          <Link to="/team" className="btn btn-sm btn-outline-white self-start">
            Meet the team
            <ArrowRight className="h-[15px] w-[15px]" strokeWidth={1.75} />
          </Link>
        </div>
        <figure className="flex flex-col gap-7 border border-white/20 p-6 md:px-11 md:py-10 lg:col-span-6 lg:col-start-7">
          <div className="caps text-[10px] tracking-[0.24em] text-brass-light md:text-[10.5px]">
            From the Co-Presidents
          </div>
          <blockquote
            aria-live="polite"
            className="font-serif text-2xl/[1.25] italic md:min-h-[236px] md:text-[30px]/[1.24]"
          >
            “{CO_PRESIDENT_QUOTES[quote]}”
          </blockquote>
          <figcaption className="flex flex-col gap-5 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex shrink-0">
                <Portrait
                  name="Diogo Oliveira"
                  alt=""
                  className="h-14 w-14 rounded-full border-2 border-night"
                />
                <Portrait
                  name="Vasco Barahona de Lemos"
                  alt=""
                  className="-ml-3.5 h-14 w-14 rounded-full border-2 border-night"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-serif text-lg/[1.15] md:text-[21px]/[1.15]">
                  Diogo Oliveira & Vasco Barahona de Lemos
                </span>
                <span className="caps text-[9.5px] tracking-[0.2em] text-mist md:text-[10px]">
                  Co-Presidents & Founders
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <span className="caps text-[10.5px] tracking-[0.2em] text-mist">
                {pad(quote + 1)} / {pad(total)}
              </span>
              <button
                type="button"
                aria-label="Previous quote"
                onClick={() => setQuote((q) => (q + total - 1) % total)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 hover:bg-white/10"
              >
                <ArrowLeft className="h-[15px] w-[15px]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                aria-label="Next quote"
                onClick={() => setQuote((q) => (q + 1) % total)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/60 hover:bg-white/10"
              >
                <ArrowRight className="h-[15px] w-[15px]" strokeWidth={1.75} />
              </button>
            </div>
          </figcaption>
        </figure>
      </Reveal>

      {/* Desktop: full-width mosaic, names appear on hover. */}
      <Reveal className="mt-18 hidden grid-cols-9 md:grid">
        {MOSAIC.map((p, i) => {
          const href = linkedinOf(p);
          // Nine columns: an odd count, so alternating by index gives a checkerboard.
          const alternate = i % 2 === 1;
          const inner = (
            <>
              <Portrait name={p.name} alt="" alternate={alternate} className="h-full" />
              <MosaicCaption name={p.name} role={p.role} />
            </>
          );
          const cls = "group relative block h-[170px] overflow-hidden lg:h-[220px]";
          return href ? (
            <a
              key={p.name}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${p.name}, ${p.role}`}
              className={cls}
            >
              {inner}
            </a>
          ) : (
            <Link key={p.name} to="/team" aria-label={`${p.name}, ${p.role}`} className={cls}>
              {inner}
            </Link>
          );
        })}
      </Reveal>

      {/* Mobile: swipeable strip with names always visible. */}
      <div className="mt-10 overflow-x-auto px-5 pb-10 [scrollbar-width:none] md:hidden">
        <div className="grid w-[1234px] grid-cols-9 gap-x-2 gap-y-5">
          {MOSAIC.map((p, i) => (
            <a key={p.name} href={linkedinOf(p) ?? "/team"} className="group flex flex-col gap-2">
              <Portrait name={p.name} alternate={i % 2 === 1} className="h-[156px]" />
              <span className="flex flex-col gap-0.5">
                <span className="font-serif text-base/[1.1]">{p.name}</span>
                <span className="caps text-[8px] tracking-[0.14em] text-mist">{p.role}</span>
              </span>
            </a>
          ))}
        </div>
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
          <span className="caps inline-flex items-center gap-2.5 rounded-full border border-brass-light px-4 py-2 text-[10px] tracking-[0.22em] text-brass-light md:text-[10.5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-brass-light" />
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
              <span className="mt-0.5 h-[13px] w-[13px] shrink-0 rounded-full border border-brass-light bg-night md:mt-0" />
              <span className="flex flex-col gap-1 md:gap-3.5">
                <span className="caps text-[9.5px] tracking-[0.22em] text-haze md:text-[10.5px]">
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

  const today = new Date().toISOString().slice(0, 10);
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  const next = sorted.find((e) => e.date >= today);
  const event = next ?? sorted[sorted.length - 1];
  const eventDate = event ? new Date(event.date + "T12:00:00") : null;

  return (
    <section id="join" className="grid lg:grid-cols-2">
      <div className="relative min-h-[240px] overflow-hidden bg-[#030C3B] lg:min-h-[760px]">
        <img
          src={IMAGES.parkGuell}
          alt="Park Güell mosaic bench overlooking Barcelona at sunrise"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-[50%_60%] lg:object-center"
        />
        <PhotoCaption className="absolute bottom-4 left-5 text-white md:bottom-6 md:left-14">
          Park Güell · Barcelona
        </PhotoCaption>
      </div>
      <div className="flex flex-col gap-6 bg-stone px-5 py-14 md:px-10 lg:px-18 lg:py-26">
        {counting ? (
          <>
            <Eyebrow>Next intake · Associate applications</Eyebrow>
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
                  <span className="caps text-[9px] tracking-[0.22em] text-mute md:text-[10px]">
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
              <span className="caps text-[9px] tracking-[0.2em] text-mute md:text-[10px]">
                {eventDate.toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="caps text-[9px] tracking-[0.22em] text-mute md:text-[10px]">
                {next ? "Next event" : "Latest event"} · {event.type} · {event.location}
              </span>
              <span className="font-serif text-[28px]/[1.05] font-medium md:text-[32px]/[1.05]">
                {event.title}
              </span>
            </div>
            <Link
              to="/events"
              className="btn btn-outline-ink h-11 shrink-0 px-[18px] text-[10.5px]"
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
