import { createFileRoute, Link } from "@tanstack/react-router";
import { BullOrBear } from "@/components/fun/BullOrBear";
import { ArrowRight } from "lucide-react";
import { FundFull } from "@/components/fund/FundFull";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { ReportList } from "@/components/site/sections";
import { Em, Eyebrow } from "@/components/site/ui";
import { loadReports } from "@/lib/content";
import { FUND_PAGE_LIVE, IMAGES } from "@/lib/site";

export const Route = createFileRoute("/fund")({
  head: () => ({
    meta: [
      { title: "The EMFC Fund, EMFC" },
      {
        name: "description",
        content:
          "The EMFC Global Equity Fund: a student-run, active global equity paper portfolio from the Asset Management department. Coming soon.",
      },
      { property: "og:title", content: "The EMFC Fund" },
      {
        property: "og:description",
        content: "An active global equity paper portfolio, benchmarked against the MSCI World. Coming soon.",
      },
    ],
  }),
  loader: async () => (await loadReports()).filter((r) => r.series === "Fund documents"),
  component: () => (FUND_PAGE_LIVE ? <FundFull /> : <FundComingSoon />),
});

/** Shown until the portfolio is built (decided 20 October; the policy statement added 2 November). */
function FundComingSoon() {
  const documents = Route.useLoaderData();
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-[#000B3D] text-white">
        <img
          src={IMAGES.bullMark}
          alt=""
          className="absolute -right-10 bottom-0 h-[240px] w-auto animate-rise opacity-40 [animation-delay:320ms] md:right-10 md:h-[340px] md:opacity-100 lg:right-18 lg:h-[400px]"
        />
        <div className="gutter relative flex min-h-[460px] flex-col items-start justify-end gap-6 pb-14 pt-20 lg:min-h-[520px] lg:pb-16">
          <span className="caps inline-flex animate-rise items-center gap-2.5 rounded-full border border-bull-light px-4 py-2 text-[10px] tracking-[0.22em] text-bull-light md:text-[10.5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-bull-light" />
            In its quiet period
          </span>
          <h1 className="animate-rise font-serif text-[64px]/[0.9] tracking-[-0.015em] [animation-delay:150ms] md:text-[128px]/[0.9]">
            The EMFC <Em light>Fund</Em>
          </h1>
          <p className="max-w-[600px] animate-rise text-base/[1.7] text-[#E3E6EF] [animation-delay:320ms] md:text-lg/[1.7]">
            The Asset Management department is building the EMFC Global Equity Fund, an active global
            equity paper portfolio benchmarked against the MSCI World. Holdings and performance will be
            published here once the portfolio is live.
          </p>
        </div>
      </section>

      <section className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <Reveal className="flex flex-col gap-5 lg:col-span-4">
          <Eyebrow>Read the rules</Eyebrow>
          <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[60px]/none">
            Investment <Em>policy</Em>
          </h2>
          <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            The fund's objective, portfolio rules, investment process, governance and risk limits.
          </p>
        </Reveal>
        <Reveal className="flex flex-col gap-8 lg:col-span-7 lg:col-start-6">
          {documents.length > 0 && <ReportList reports={documents} />}
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/departments/$department/$desk"
              params={{ department: "asset-management", desk: "portfolio-management" }}
              className="btn btn-sm btn-ink"
            >
              The Portfolio Management desk
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
            <Link
              to="/departments/$department"
              params={{ department: "asset-management" }}
              className="btn btn-sm btn-outline-ink"
            >
              Asset Management
            </Link>
          </div>
        </Reveal>
      </section>
      <BullOrBear />
    </SiteLayout>
  );
}
