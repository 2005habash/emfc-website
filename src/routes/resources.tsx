import { createFileRoute, Link } from "@tanstack/react-router";
import { Flashcards } from "@/components/fun/Flashcards";
import { RealOrMadeUp } from "@/components/fun/RealOrMadeUp";
import { Superday } from "@/components/fun/Superday";
import { TECHNICALS } from "@/components/fun/technicals";
import { ArrowDown, ArrowRight, ArrowUpRight, FileText, Linkedin } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { FirmLogo } from "@/components/site/FirmLogo";
import { deskName, ReportList } from "@/components/site/sections";
import { Em, Eyebrow, PageHero } from "@/components/site/ui";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PARTNERS, type Partner } from "@/data/partners";
import { sortReports, type Report } from "@/data/reports";
import { loadReports } from "@/lib/content";
import { departments, getDepartment } from "@/lib/departments";
import { IMAGES, safeUrl } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Partners and resources, EMFC" },
      {
        name: "description",
        content:
          "EMFC's partners, Trakvia and Greenroom, the reports the club's desks publish, and the databases ESADE students can use for finance recruiting.",
      },
      { property: "og:title", content: "Partners and resources, EMFC" },
      {
        property: "og:description",
        content: "Trakvia, Greenroom and the research of the EMFC desks.",
      },
    ],
  }),
  loader: async () => sortReports(await loadReports()),
  component: ResourcesPage,
});

/** The research tools of the ESADE library, with the names and logos their makers use today. */
const esadeResources: { name: string; url: string; blurb: string }[] = [
  {
    name: "CareerOS",
    url: "https://careeros.com",
    blurb:
      "Recruiting-intelligence platform tracking company hiring activity, alumni pathways and application windows.",
  },
  {
    name: "GlobalData",
    url: "https://www.globaldata.com",
    blurb:
      "Industry, company and deal intelligence across sectors, and a core source for market sizing and competitive work.",
  },
  {
    name: "ProView",
    url: "https://www.thomsonreuters.com",
    blurb: "Thomson Reuters' e-book library covering finance, accounting, tax and legal reference titles.",
  },
  {
    name: "Aranzadi",
    url: "https://www.aranzadilaley.es",
    blurb:
      "Spanish legislation, case law and doctrine, now Aranzadi LA LEY (Karnov Group): useful for regulatory and legal research.",
  },
  {
    name: "Fast Company",
    url: "https://www.fastcompany.com",
    blurb: "Business magazine covering innovation, technology and leadership across startups and large corporates.",
  },
  {
    name: "Business Horizons",
    url: "https://www.sciencedirect.com",
    blurb: "Peer-reviewed management journal on Elsevier's ScienceDirect, focused on applied business research.",
  },
  {
    name: "The New York Times",
    url: "https://www.nytimes.com",
    blurb: "Full digital access to US and international news, business coverage and long-form journalism.",
  },
  {
    name: "MyNews",
    url: "https://mynews.es",
    blurb: "Spanish press archive aggregating national and regional newspapers for company and market monitoring.",
  },
  {
    name: "Financial Times",
    url: "https://www.ft.com",
    blurb: "Global business and markets daily: essential reading for finance recruiting and daily deal flow.",
  },
  {
    name: "Harvard Business Review",
    url: "https://hbr.org",
    blurb: "Case-driven management journal covering strategy, leadership and organisational research.",
  },
  {
    name: "Bloomberg",
    url: "https://www.bloomberg.com",
    blurb: "Markets, macro and company news from the Bloomberg newsroom, complementing terminal access.",
  },
  {
    name: "California Management Review",
    url: "https://cmr.berkeley.edu",
    blurb: "Berkeley Haas' peer-reviewed journal on strategy, innovation and management practice.",
  },
  {
    name: "Mendeley",
    url: "https://www.mendeley.com",
    blurb: "Reference manager and academic network for organising research, citations and collaborative reading.",
  },
  {
    name: "PitchBook",
    url: "https://pitchbook.com",
    blurb: "Private-markets database covering PE, VC, M&A and IPO activity with fund and deal-level detail.",
  },
  {
    name: "Workspace",
    url: "https://www.lseg.com",
    blurb: "LSEG Workspace (formerly Refinitiv Eikon): real-time markets, company fundamentals and deal data.",
  },
  {
    name: "Statista",
    url: "https://www.statista.com",
    blurb: "Aggregated statistics and market reports across industries, geographies and consumer trends.",
  },
  {
    name: "La Ley",
    url: "https://www.aranzadilaley.es",
    blurb:
      "Legislation, jurisprudence and practitioner commentary, now part of Aranzadi LA LEY with Aranzadi's databases.",
  },
  {
    name: "Sabi",
    url: "https://www.bvdinfo.com",
    blurb: "Moody's (formerly Bureau van Dijk) database of Spanish and Portuguese company financials, ownership and directors.",
  },
  {
    name: "MIT Sloan Management Review",
    url: "https://sloanreview.mit.edu",
    blurb: "MIT's management journal on strategy, digital transformation and leadership research.",
  },
  {
    name: "Dow Jones Factiva",
    url: "https://www.dowjones.com",
    blurb: "Global news and company archive powering due diligence, background research and market monitoring.",
  },
];

/** How many of the newest reports the page shows before "All reports". */
const LATEST = 3;

function ResourcesPage() {
  const reports = Route.useLoaderData();
  const published = reports.filter((r) => r.status === "published");

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.placaEspanya}
        alt="Plaça d'Espanya at dusk with the Venetian Towers and MNAC in the distance"
        eyebrow="Partners and resources"
        position="50% 35%"
        title={
          <>
            Tools that get <br className="max-md:hidden" />
            members <Em light>hired</Em>
          </>
        }
      >
        The companies we partner with, the research our desks publish, and the databases ESADE
        students can use to prepare for finance recruiting in Europe.
      </PageHero>

      <PageIndex
        items={[
          { href: "#partners", count: PARTNERS.length, label: "Partners", note: PARTNERS.map((p) => p.name).join(" and ") },
          { href: "#research", count: published.length, label: "Reports", note: "Published by the desks" },
          { href: "#technicals", count: TECHNICALS.length, label: "Technicals", note: "Interview questions to practise" },
          { href: "#databases", count: esadeResources.length, label: "Databases", note: "Through the ESADE library" },
        ]}
      />

      {/* Partners */}
      <section id="partners" className="scroll-mt-24">
        <div className="gutter flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-5">
              <Eyebrow>Our partners</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
                Companies we <Em>work with</Em>
              </h2>
            </div>
            <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
              Partners give EMFC members the tools to find roles and prepare for interviews. Every member
              can use them.
            </p>
          </Reveal>
          <div className="flex flex-col gap-8 lg:gap-10">
            {PARTNERS.map((p, i) => (
              <PartnerBlock key={p.name} partner={p} flip={i % 2 === 1} />
            ))}
          </div>
          <Link
            to="/sponsorship"
            className="group flex flex-col gap-3 border-t border-ink pt-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-serif text-[26px]/[1.15] md:text-[32px]/[1.15]">
              A firm that wants to work with EMFC? <Em>Partner with us.</Em>
            </span>
            <span className="caps inline-flex items-center gap-2 text-[10.5px] tracking-[0.18em]">
              Sponsorship
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
            </span>
          </Link>
        </div>
      </section>

      {/* Research, the newest few first */}
      <section id="research" className="scroll-mt-24 bg-stone">
        <div className="gutter flex flex-col gap-10 py-16 lg:gap-12 lg:py-24">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-5">
              <Eyebrow>Research</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
                Published by <Em>the desks</Em>
              </h2>
            </div>
            <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
              The newest reports from every department. Each also appears on its desk's page.
            </p>
          </Reveal>
          <ul className="grid gap-8 md:grid-cols-3 md:gap-6">
            {published.slice(0, LATEST).map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </ul>
          <Library reports={reports} />
        </div>
      </section>

      <Superday />

      <Flashcards />

      <RealOrMadeUp />

      {/* ESADE databases */}
      <section id="databases" className="gutter flex scroll-mt-24 flex-col gap-10 py-16 lg:gap-14 lg:py-24">
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
        <ul className="grid grid-cols-2 gap-px border border-line bg-line [--logo-h:40px] sm:grid-cols-3 md:[--logo-h:48px] lg:grid-cols-5">
          {esadeResources.map((r) => (
            <li key={r.name} className="flex">
              <Dialog>
                <DialogTrigger className="group flex min-h-[170px] flex-1 cursor-pointer flex-col items-center justify-center gap-5 bg-plate px-4 py-6 text-center outline-none transition-shadow hover:shadow-[inset_0_0_0_1px_var(--c-ink)] focus-visible:shadow-[inset_0_0_0_2px_var(--c-bull)] lg:min-h-[200px]">
                  <span className="flex min-h-[calc(var(--logo-h)*1.6)] items-center">
                    <FirmLogo name={r.name} />
                  </span>
                  <span className="caps text-[10px] tracking-[0.16em] text-plate-ink/70 underline-offset-4 group-hover:underline">
                    {r.name}
                  </span>
                </DialogTrigger>
                <DialogContent className="max-w-[480px] gap-5 rounded-none border-line bg-paper p-8 text-ink sm:rounded-none">
                  <span className="flex min-h-[88px] items-center justify-center bg-plate px-6 py-5 [--logo-h:40px]">
                    <FirmLogo name={r.name} />
                  </span>
                  <DialogTitle className="font-serif text-[32px]/[1.05] font-medium">{r.name}</DialogTitle>
                  <DialogDescription className="text-[15px]/[1.65] text-mute">{r.blurb}</DialogDescription>
                  <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-sm btn-ink self-start">
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

/** What the page holds, under the hero: partners first, so they are seen before the reports. */
function PageIndex({ items }: { items: { href: string; count: number; label: string; note: string }[] }) {
  return (
    <nav aria-label="On this page" className="border-b border-line">
      {/* Two to a row on tablets, all in one row on wide screens, with lines between them. */}
      <ul className={cn("gutter grid sm:grid-cols-2", items.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
        {items.map((it, i) => (
          <li
            key={it.href}
            className={cn(
              "border-line",
              i > 0 && "border-t lg:border-t-0 lg:border-l",
              i < 2 && "sm:border-t-0",
              i % 2 === 1 && "sm:border-l",
            )}
          >
            <a
              href={it.href}
              className={cn("group flex items-center gap-5 py-6 sm:py-8", i % 2 === 1 && "sm:pl-8", i > 0 && "lg:pl-8")}
            >
              <span className="font-serif text-[52px]/none font-medium tabular-nums md:text-[64px]/none">
                {String(it.count).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1.5">
                <span className="caps inline-flex items-center gap-2 text-[11px] tracking-[0.2em]">
                  {it.label}
                  <ArrowDown className="h-3.5 w-3.5 transition-transform group-hover:translate-y-0.5" strokeWidth={1.75} />
                </span>
                <span className="text-[14px]/[1.4] text-mute">{it.note}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** A partner: its name large in its own colour beside what it does for members. Alternate blocks swap sides. */
function PartnerBlock({ partner: p, flip }: { partner: Partner; flip: boolean }) {
  const colour = { "--brand": p.colour, "--brand-dark": p.colourDark } as CSSProperties;
  return (
    <Reveal className={cn("grid border border-line bg-panel lg:grid-cols-[5fr_7fr]", flip && "lg:grid-cols-[7fr_5fr]")}>
      <div
        style={colour}
        className={cn(
          "flex min-w-0 flex-col justify-center gap-4 border-b border-line p-6 sm:p-8 md:p-12 lg:border-b-0",
          flip ? "lg:order-2 lg:border-l" : "lg:border-r",
        )}
      >
        <span className="font-serif text-[44px]/[0.95] font-semibold tracking-[-0.01em] text-[var(--brand)] sm:text-6xl/[0.95] md:text-[84px]/[0.95] dark:text-[var(--brand-dark)]">
          {p.name}
        </span>
        <span className="caps text-[10px] tracking-[0.24em] text-[var(--brand)] md:text-[11px] dark:text-[var(--brand-dark)]">
          {p.role}
        </span>
        <p className="mt-3 font-serif text-[22px]/[1.25] italic md:text-[26px]/[1.25]">“{p.tagline}”</p>
      </div>
      <div className="flex min-w-0 flex-col gap-5 p-6 sm:p-8 md:p-12">
        <h3 className="font-serif text-4xl/none md:text-[44px]/none">{p.heading}</h3>
        {p.body.map((para) => (
          <p key={para.slice(0, 24)} className="text-[15px]/[1.75] text-mute md:text-[15.5px]/[1.75]">
            {para}
          </p>
        ))}
        <div className="mt-2 grid gap-6 sm:grid-cols-3">
          {p.features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2 border-t border-ink pt-4">
              <h4 className="font-serif text-[22px]/[1.1] font-semibold">{f.title}</h4>
              <p className="text-[13.5px]/[1.6] text-mute">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <a href={p.link} target="_blank" rel="noreferrer" className="btn btn-ink h-[52px] px-[26px] text-[11.5px] sm:self-start">
            {p.cta}
            <ArrowUpRight className="h-[15px] w-[15px]" strokeWidth={1.75} />
          </a>
          {p.code && (
            <span className="caps text-[10px] tracking-[0.18em] text-mute">
              EMFC code <span className="text-ink">{p.code}</span>
            </span>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/** One of the newest reports, in brief. */
function ReportCard({ report: r }: { report: Report }) {
  const where = [getDepartment(r.department)?.name, deskName(r.department, r.desk)].filter(Boolean).join(", ");
  const meta = [r.series, r.issue].filter(Boolean).join(", ");
  return (
    <li className="flex flex-col gap-3 border-t border-ink pt-5">
      <span className="caps text-[10px] tracking-[0.18em] text-bull">{where}</span>
      <span className="font-serif text-[24px]/[1.12] md:text-[26px]/[1.12]">{r.title}</span>
      <span className="text-[14px]/[1.5] text-mute">{meta}</span>
      <span className="mt-auto flex flex-wrap gap-2.5 pt-2">
        {r.file && (
          <a href={safeUrl(r.file)} target="_blank" rel="noreferrer" className="btn btn-sm btn-ink">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
            Read PDF
          </a>
        )}
        {r.link && (
          <a href={safeUrl(r.link)} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-ink">
            <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
            On LinkedIn
          </a>
        )}
      </span>
    </li>
  );
}

/** Every report, behind one button, with a filter by department. */
function Library({ reports }: { reports: Report[] }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const publishing = departments.filter((d) => reports.some((r) => r.department === d.slug));
  const shown = filter === "all" ? reports : reports.filter((r) => r.department === filter);
  return (
    <div className="flex flex-col gap-8">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="library"
        onClick={() => setOpen((o) => !o)}
        className="btn btn-sm btn-outline-ink self-start"
      >
        {open ? "Hide the library" : `All reports (${reports.length})`}
        <ArrowDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} strokeWidth={1.75} />
      </button>
      <div id="library" hidden={!open} className="flex flex-col gap-8">
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
      </div>
    </div>
  );
}
