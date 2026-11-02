import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { ReportList } from "@/components/site/sections";
import { Em, Eyebrow, PageHero } from "@/components/site/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ALL_REPORTS } from "@/data/reports";
import { departments } from "@/lib/departments";
import { IMAGES, logoUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources, EMFC" },
      {
        name: "description",
        content:
          "Reports published by the EMFC desks, plus the partner platforms and databases available to members.",
      },
      { property: "og:title", content: "Resources, EMFC" },
      {
        property: "og:description",
        content: "Greenroom and other partners powering EMFC member recruiting.",
      },
    ],
  }),
  component: ResourcesPage,
});

/** The departments that publish, for the library filter. */
const publishing = departments.filter((d) => ALL_REPORTS.some((r) => r.department === d.slug));

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
      "Industry, company and deal intelligence across sectors, and a core source for market sizing and competitive work.",
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
      "Spanish legal database of legislation, case law and doctrine, useful for regulatory and legal-adjacent research.",
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
      "Global business and markets daily: essential reading for finance recruiting and daily deal flow.",
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
      "Markets, macro and company news from the Bloomberg newsroom, complementing terminal access.",
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
      "LSEG Workspace (formerly Refinitiv Eikon): real-time markets, company fundamentals and deal data.",
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
  const [filter, setFilter] = useState<string>("all");
  const shown = filter === "all" ? ALL_REPORTS : ALL_REPORTS.filter((r) => r.department === filter);

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.placaEspanya}
        alt="Plaça d'Espanya at dusk with the Venetian Towers and MNAC in the distance"
        eyebrow="Resources"
        position="50% 35%"
        title={
          <>
            Tools that get <br className="max-md:hidden" />
            members <Em light>hired</Em>
          </>
        }
      >
        The reports our desks publish, and the partner platforms and databases EMFC members use to
        prepare for finance recruiting in Europe.
      </PageHero>

      {/* Publications library */}
      <section id="library" className="gutter flex scroll-mt-24 flex-col gap-10 py-16 lg:py-24">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>Library</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              Published by <Em>the desks</Em>
            </h2>
          </div>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Every report from every department, newest first. Each also appears on its desk's page.
          </p>
        </Reveal>
        <div role="group" aria-label="Filter the library by department" className="flex flex-wrap gap-2">
          {[{ slug: "all", name: "All departments" }, ...publishing].map((d) => (
            <button
              key={d.slug}
              type="button"
              aria-pressed={filter === d.slug}
              onClick={() => setFilter(d.slug)}
              className={cn(
                "caps h-11 rounded-full border px-5 text-[10.5px] tracking-[0.16em] transition-colors md:text-[11px]",
                filter === d.slug ? "border-ink bg-ink text-paper" : "border-line text-ink hover:border-ink",
              )}
            >
              {d.name}
            </button>
          ))}
        </div>
        <ReportList reports={shown} showDepartment />
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
                candidates targeting Investment Banking, Private Equity and Asset Management, and a
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
        <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {esadeResources.map((r) => (
            <li key={r.name} className="flex">
              <Dialog>
                <DialogTrigger className="group flex min-h-[150px] flex-1 cursor-pointer flex-col items-center justify-center gap-4 bg-paper px-4 py-6 text-center transition-colors hover:bg-stone lg:min-h-[176px]">
                  <img
                    src={logoUrl(r.domain, 160)}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 rounded-lg object-contain transition duration-300 md:h-14 md:w-14"
                  />
                  <span className="font-serif text-[21px]/[1.1] font-semibold underline-offset-4 group-hover:underline md:text-[23px]/[1.1]">
                    {r.name}
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-[480px] gap-5 rounded-none border-line bg-paper p-8 text-ink sm:rounded-none">
                  <div className="flex items-center gap-4">
                    <img src={logoUrl(r.domain, 160)} alt="" className="h-14 w-14 rounded-lg object-contain" />
                    <DialogTitle className="font-serif text-[32px]/[1.05] font-medium">{r.name}</DialogTitle>
                  </div>
                  <DialogDescription className="text-[15px]/[1.65] text-mute">{r.blurb}</DialogDescription>
                  <a
                    href={`https://${r.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-ink self-start"
                  >
                    Visit website
                    <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </a>
                </DialogContent>
              </Dialog>
            </li>
          ))}
        </ul>
      </section>
    </SiteLayout>
  );
}
