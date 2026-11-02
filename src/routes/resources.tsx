import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, PageHero } from "@/components/site/ui";
import { IMAGES } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Research, EMFC" },
      {
        name: "description",
        content:
          "Research from the EMFC desks, plus curated resources and partner platforms for members targeting careers in finance.",
      },
      { property: "og:title", content: "Resources & Research, EMFC" },
      {
        property: "og:description",
        content: "Greenroom and other partners powering EMFC member recruiting.",
      },
    ],
  }),
  component: ResourcesPage,
});

type Desk = "Investment Banking" | "Private Markets" | "Asset Management" | "Fixed Income";

/**
 * Research series published by each desk. To list a published issue, add
 * `latest: { title, date, href }` to its series.
 */
const series: {
  desk: Desk;
  cadence: string;
  title: string;
  body: string;
  latest?: { title: string; date: string; href: string };
}[] = [
  {
    desk: "Investment Banking",
    cadence: "Monthly",
    title: "Monthly Deal Analysis",
    body: "A live M&A or Debt deal each month: rationale, valuation, structure, financing and key risks.",
  },
  {
    desk: "Private Markets",
    cadence: "Fortnightly",
    title: "Deal Teardowns",
    body: "Live deal coverage across PE, VC & Growth, Fintech and Real Assets, with full investment memos.",
  },
  {
    desk: "Asset Management",
    cadence: "Macro & Strategy",
    title: "Market & Macro Research",
    body: "Central banks, economic data, geopolitics and asset allocation views.",
  },
  {
    desk: "Asset Management",
    cadence: "Equity Research",
    title: "Investment Theses",
    body: "Equity research, valuation and risk assessment work, leading to publishable single-name and thematic pieces.",
  },
  {
    desk: "Asset Management",
    cadence: "Portfolio",
    title: "Portfolio Reviews",
    body: "Performance attribution, rebalancing and post-mortems across the live book.",
  },
  {
    desk: "Fixed Income",
    cadence: "Monthly",
    title: "Monthly Credit Research",
    body: "Spread moves and rating actions in each associate's assigned market.",
  },
  {
    desk: "Fixed Income",
    cadence: "Case study",
    title: "Issuer Rating Case Studies",
    body: "Full credit reviews using an S&P-style scorecard, walking through business, financial and structural risk.",
  },
];

const filters: ("All desks" | Desk)[] = [
  "All desks",
  "Investment Banking",
  "Private Markets",
  "Asset Management",
  "Fixed Income",
];

const greenroomFeatures = [
  {
    title: "AI Interviewer",
    body: "Real follow-up questions that expose memorised answers and force you to think on your feet.",
  },
  {
    title: "Bank-specific prep",
    body: "30+ banks mapped by desk and recent deals. Every question drawn from real interviews, not recycled guides.",
  },
  {
    title: "Built for Europe",
    body: "Designed for London, Milan, Madrid, Paris and Frankfurt recruiting, with HireVue practice included.",
  },
];

const esadeResources: { name: string; domain: string; blurb: string }[] = [
  {
    name: "CareerOS",
    domain: "careeros.com",
    blurb:
      "Recruiting-intelligence platform tracking company hiring activity, alumni pathways and application windows.",
  },
  {
    name: "GlobalData",
    domain: "globaldata.com",
    blurb:
      "Industry, company and deal intelligence across sectors — a core source for market sizing and competitive work.",
  },
  {
    name: "ProView",
    domain: "thomsonreuters.com",
    blurb:
      "Thomson Reuters' e-book library covering finance, accounting, tax and legal reference titles.",
  },
  {
    name: "Aranzadi",
    domain: "aranzadi.es",
    blurb:
      "Spanish legal database of legislation, case law and doctrine — useful for regulatory and legal-adjacent research.",
  },
  {
    name: "Fast Company",
    domain: "fastcompany.com",
    blurb:
      "Business magazine covering innovation, technology and leadership across startups and large corporates.",
  },
  {
    name: "Business Horizons",
    domain: "sciencedirect.com",
    blurb:
      "Peer-reviewed management journal on Elsevier's ScienceDirect, focused on applied business research.",
  },
  {
    name: "The New York Times",
    domain: "nytimes.com",
    blurb:
      "Full digital access to US and international news, business coverage and long-form journalism.",
  },
  {
    name: "MyNews",
    domain: "mynews.es",
    blurb:
      "Spanish press archive aggregating national and regional newspapers for company and market monitoring.",
  },
  {
    name: "Financial Times",
    domain: "ft.com",
    blurb:
      "Global business and markets daily — essential reading for finance recruiting and daily deal flow.",
  },
  {
    name: "Harvard Business Review",
    domain: "hbr.org",
    blurb:
      "Case-driven management journal covering strategy, leadership and organisational research.",
  },
  {
    name: "Bloomberg",
    domain: "bloomberg.com",
    blurb:
      "Markets, macro and company news from the Bloomberg newsroom — complements terminal access.",
  },
  {
    name: "California Management Review",
    domain: "cmr.berkeley.edu",
    blurb: "Berkeley Haas' peer-reviewed journal on strategy, innovation and management practice.",
  },
  {
    name: "Mendeley",
    domain: "mendeley.com",
    blurb:
      "Reference manager and academic network for organising research, citations and collaborative reading.",
  },
  {
    name: "PitchBook",
    domain: "pitchbook.com",
    blurb:
      "Private-markets database covering PE, VC, M&A and IPO activity with fund and deal-level detail.",
  },
  {
    name: "Workspace",
    domain: "refinitiv.com",
    blurb:
      "LSEG Workspace (formerly Refinitiv Eikon) — real-time markets, company fundamentals and deal data.",
  },
  {
    name: "Statista",
    domain: "statista.com",
    blurb:
      "Aggregated statistics and market reports across industries, geographies and consumer trends.",
  },
  {
    name: "La Ley",
    domain: "wolterskluwer.com",
    blurb:
      "Wolters Kluwer's Spanish legal database with legislation, jurisprudence and practitioner commentary.",
  },
  {
    name: "Sabi",
    domain: "bvdinfo.com",
    blurb:
      "Bureau van Dijk database of Spanish and Portuguese company financials, ownership and directors.",
  },
  {
    name: "MIT Sloan Management Review",
    domain: "sloanreview.mit.edu",
    blurb: "MIT's management journal on strategy, digital transformation and leadership research.",
  },
  {
    name: "Dow Jones Factiva",
    domain: "dowjones.com",
    blurb:
      "Global news and company archive powering due diligence, background research and market monitoring.",
  },
];

function ResourcesPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All desks");
  const shown = filter === "All desks" ? series : series.filter((s) => s.desk === filter);

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.placaEspanya}
        alt="Plaça d'Espanya at dusk with the Venetian Towers and MNAC in the distance"
        eyebrow="Resources & Research"
        position="50% 35%"
        title={
          <>
            Tools that get <br className="max-md:hidden" />
            members <Em light>hired</Em>
          </>
        }
      >
        EMFC members get access to partner platforms and curated resources built for finance
        recruiting in Europe.
      </PageHero>

      {/* Research library */}
      <section id="library" className="gutter flex scroll-mt-24 flex-col gap-10 py-16 lg:py-24">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>Research library</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              Research from <Em>the desks</Em>
            </h2>
          </div>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Each department publishes deal teardowns, equity research, and credit reports, fostering
            a track record of rigorous analysis and professional growth.
          </p>
        </Reveal>
        <div role="group" aria-label="Filter research by desk" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "caps h-11 rounded-full border px-5 text-[10.5px] tracking-[0.16em] transition-colors md:text-[11px]",
                filter === f
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-ink hover:border-ink",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {shown.map((s) => {
            const body = (
              <>
                <div className="flex flex-col gap-3.5">
                  <div className="caps flex justify-between gap-3 text-[9.5px] tracking-[0.18em] text-mute md:text-[10px]">
                    <span>{s.desk}</span>
                    <span>{s.cadence}</span>
                  </div>
                  <h3 className="mt-1.5 font-serif text-[28px]/[1.06] md:text-3xl/[1.06]">
                    {s.title}
                  </h3>
                  <p className="text-sm/[1.6] text-mute">{s.body}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
                  <div className="flex flex-col gap-1">
                    <span className="caps text-[9.5px] tracking-[0.18em] text-mute">
                      Latest issue
                    </span>
                    <span className="font-serif text-lg/[1.15]">
                      {s.latest ? `${s.latest.title} · ${s.latest.date}` : "Coming soon"}
                    </span>
                  </div>
                  {s.latest && (
                    <ArrowUpRight className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} />
                  )}
                </div>
              </>
            );
            const cls =
              "flex min-h-[300px] flex-col justify-between gap-6 border border-line bg-panel p-6 md:min-h-[330px]";
            return s.latest ? (
              <a
                key={s.title}
                href={s.latest.href}
                className={cn(cls, "transition duration-300 hover:-translate-y-1 hover:border-ink")}
              >
                {body}
              </a>
            ) : (
              <article key={s.title} className={cls}>
                {body}
              </article>
            );
          })}
        </div>
      </section>

      {/* Featured partner */}
      <section className="bg-stone">
        <div className="gutter flex flex-col gap-8 py-16 lg:gap-10 lg:py-24">
          <Eyebrow>Featured partner</Eyebrow>
          <Reveal className="grid border border-line bg-panel lg:grid-cols-[5fr_7fr]">
            <div className="flex min-w-0 flex-col justify-center gap-4 border-b border-line p-6 sm:p-8 md:p-12 lg:border-b-0 lg:border-r">
              <span className="font-serif text-[44px]/[0.95] font-semibold sm:text-6xl/[0.95] tracking-[-0.01em] text-[#2A5C3A] md:text-[84px]/[0.95] dark:text-[#7FC596]">
                Greenroom
              </span>
              <span className="caps text-[10px] tracking-[0.24em] text-[#2A5C3A] md:text-[11px] dark:text-[#7FC596]">
                Mock interview partner
              </span>
              <p className="mt-3 font-serif text-[22px]/[1.25] italic md:text-[26px]/[1.25]">
                “Your mock interview partner for finance.”
              </p>
            </div>
            <div className="flex min-w-0 flex-col gap-5 p-6 sm:p-8 md:p-12">
              <h3 className="font-serif text-4xl/none md:text-[44px]/none">Greenroom Prep</h3>
              <p className="text-[15px]/[1.75] text-mute md:text-[15.5px]/[1.75]">
                Greenroom is an AI-powered mock interview platform built specifically for finance
                candidates targeting Investment Banking, Private Equity and Asset Management — a
                natural partner for EMFC.
              </p>
              <p className="text-[15px]/[1.75] text-mute md:text-[15.5px]/[1.75]">
                Members use Greenroom to prep for interviews at Goldman Sachs, JPMorgan, Morgan
                Stanley, Blackstone, KKR, Lazard, Rothschild, Evercore, Moelis and other top firms.
              </p>
              <div className="mt-2 grid gap-6 sm:grid-cols-3">
                {greenroomFeatures.map((f) => (
                  <div key={f.title} className="flex flex-col gap-2 border-t border-ink pt-4">
                    <h4 className="font-serif text-[22px]/[1.1] font-semibold">{f.title}</h4>
                    <p className="text-[13.5px]/[1.6] text-mute">{f.body}</p>
                  </div>
                ))}
              </div>
              <a
                href="https://greenroomprep.live/"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ink mt-3 h-[52px] px-[26px] text-[11.5px] sm:self-start"
              >
                Visit Greenroom
                <ArrowUpRight className="h-[15px] w-[15px]" strokeWidth={1.75} />
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ESADE resources */}
      <section className="gutter flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>ESADE resources</Eyebrow>
            <h2 className="max-w-[760px] font-serif text-[38px]/[1.04] tracking-[-0.01em] md:text-[60px]/[1.02]">
              Databases & publications available to <Em>ESADE students</Em>
            </h2>
          </div>
          <p className="max-w-[400px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            A curated set of the databases, journals and research platforms accessible through the
            ESADE library.
          </p>
        </Reveal>
        <ul className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {esadeResources.map((r) => (
            <li key={r.name} className="flex">
              <a
                href={`https://${r.domain}`}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[150px] flex-1 flex-col gap-2.5 bg-paper px-[22px] pt-[22px] pb-6 transition-colors hover:bg-stone lg:min-h-[168px]"
              >
                <span className="font-serif text-[23px]/[1.1] font-semibold">{r.name}</span>
                <span className="text-[13px]/[1.55] text-mute">{r.blurb}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </SiteLayout>
  );
}
