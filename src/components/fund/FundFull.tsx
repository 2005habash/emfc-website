import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, Numeral, PersonCard } from "@/components/site/ui";
import { getDepartment } from "@/lib/departments";
import { IMAGES, ROMAN } from "@/lib/site";
import { leadershipOf } from "@/lib/team";
import { sized } from "@/lib/images";

const FUND_LINE =
  "0,250 50,238 100,244 150,214 200,222 250,190 300,200 350,166 400,176 450,140 500,150 550,112 600,98 650,76 700,52";
const BENCH_LINE =
  "0,250 50,244 100,240 150,230 200,226 250,212 300,206 350,194 400,190 450,172 500,168 550,150 600,142 650,128 700,118";

/** The full fund page: portfolio, process and dashboard. Shown once FUND_PAGE_LIVE is true. */
export function FundFull() {
  const am = getDepartment("asset-management");
  // The first four items describe the investment process; the fifth is training.
  const steps = am ? am.produces.slice(0, 4) : [];
  const leads = [...leadershipOf("asset-management")].reverse();

  return (
    <SiteLayout>
      {/* Header */}
      <section className="relative overflow-hidden bg-[#000B3D] text-white">
        <img
          {...sized(IMAGES.bullMark, "440px")}
          alt=""
          className="absolute -right-10 bottom-0 h-[240px] w-auto animate-rise opacity-40 [animation-delay:320ms] md:right-10 md:h-[340px] md:opacity-100 lg:right-18 lg:h-[400px]"
        />
        <div className="gutter relative flex min-h-[420px] flex-col items-start justify-end gap-6 pb-14 pt-20 lg:min-h-[480px] lg:pb-16">
          <span className="caps inline-flex animate-rise items-center gap-2.5 rounded-full border border-bull-light px-4 py-2 text-[10px] tracking-[0.22em] text-bull-light md:text-[10.5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-bull-light" />
            Coming soon
          </span>
          <h1 className="animate-rise font-serif text-[64px]/[0.9] tracking-[-0.015em] [animation-delay:150ms] md:text-[128px]/[0.9]">
            The EMFC <Em light>Fund</Em>
          </h1>
          <p className="max-w-[600px] animate-rise text-base/[1.7] text-[#E3E6EF] [animation-delay:320ms] md:text-lg/[1.7]">
            We are building a student-led paper trading portfolio. Members will get hands-on
            experience across sourcing, due diligence and portfolio management. More details coming
            soon.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="gutter flex flex-col gap-12 py-16 lg:gap-14 lg:py-24">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>The process</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              From idea to <Em>position</Em>
            </h2>
          </div>
          {am && (
            <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
              {am.long}
            </p>
          )}
        </Reveal>
        <Reveal className="relative grid gap-9 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div
            aria-hidden
            className="absolute left-0 right-0 top-1.5 hidden h-px bg-line lg:block"
          />
          <div
            aria-hidden
            className="grow-x absolute left-0 right-0 top-1.5 hidden h-px origin-left bg-bull lg:block"
            style={{ "--grow-time": "1.4s", "--grow-delay": "0.3s" } as CSSProperties}
          />
          {steps.map((s, i) => (
            <div key={s.title} className="relative flex flex-col gap-3.5">
              <span className="h-[13px] w-[13px] rounded-full bg-bull" />
              <Numeral className="mt-2 text-[26px]/none">{ROMAN[i]}.</Numeral>
              <h3 className="font-serif text-[28px]/[1.06] md:text-[32px]/[1.06]">{s.title}</h3>
              <p className="text-[15px]/[1.65] text-mute">{s.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Dashboard preview */}
      <section className="bg-stone">
        <div className="gutter flex flex-col gap-10 py-16 lg:gap-12 lg:py-24">
          <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-5">
              <Eyebrow>Portfolio dashboard, preview</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
                Holdings, thesis, <Em>performance</Em>
              </h2>
            </div>
            <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
              Once the paper portfolio is live, this page will show what the fund holds, why, and
              how it is doing against its benchmark. The figures below are empty on purpose.
            </p>
          </Reveal>
          <Reveal className="grid gap-6 lg:grid-cols-[7fr_5fr]">
            <div className="flex flex-col border border-line bg-panel">
              <div className="flex flex-col gap-3 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-7">
                <span className="font-serif text-2xl font-medium md:text-[26px]">
                  Performance vs benchmark
                </span>
                <div className="caps flex gap-5 text-[10px] tracking-[0.18em] text-mute">
                  <span className="flex items-center gap-2">
                    <span className="h-0.5 w-[18px] bg-bull" />
                    EMFC Fund
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-[18px] border-t-2 border-dashed border-mute" />
                    Benchmark
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2.5 px-6 pb-3 pt-7 md:px-7">
                <div className="relative">
                  <svg
                    aria-hidden
                    width="100%"
                    height="300"
                    viewBox="0 0 700 300"
                    preserveAspectRatio="none"
                    className="h-[200px] md:h-[300px]"
                  >
                    {[75, 150, 225].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="700"
                        y1={y}
                        y2={y}
                        stroke="var(--c-line)"
                        strokeDasharray="2 6"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    <polyline
                      points={BENCH_LINE}
                      fill="none"
                      stroke="var(--c-mute)"
                      strokeWidth="1.5"
                      strokeDasharray="5 5"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  {/* The fund's line on its own layer, uncovered from the left as it scrolls into view. */}
                  <svg
                    aria-hidden
                    width="100%"
                    height="300"
                    viewBox="0 0 700 300"
                    preserveAspectRatio="none"
                    className="wipe-in absolute inset-0 h-[200px] md:h-[300px]"
                  >
                    <polyline
                      points={FUND_LINE}
                      fill="none"
                      stroke="var(--c-bull)"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
                <span className="caps text-[10px] tracking-[0.2em] text-mute">
                  Illustrative shape, not performance data
                </span>
              </div>
              <dl className="mt-auto grid grid-cols-3 border-t border-line">
                {["Return since inception", "Positions", "Benchmark"].map((label, i) => (
                  <div
                    key={label}
                    className={`flex flex-col gap-1.5 px-4 py-5 md:px-7 ${i > 0 ? "border-l border-line" : ""}`}
                  >
                    <dt className="caps text-[10px] tracking-[0.18em] text-mute md:text-[10px]">
                      {label}
                    </dt>
                    <dd className="font-serif text-[34px]/none text-mute">–</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="flex flex-col border border-line bg-panel">
              <div className="flex items-center justify-between border-b border-line px-6 py-5 md:px-7">
                <span className="font-serif text-2xl font-medium md:text-[26px]">Holdings</span>
                <span className="caps text-[10px] tracking-[0.18em] text-mute">Not yet live</span>
              </div>
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="caps text-left text-[10px] tracking-[0.18em] text-mute">
                    <th
                      scope="col"
                      className="border-b border-line py-3.5 pl-6 font-medium md:pl-7"
                    >
                      Ticker
                    </th>
                    <th scope="col" className="border-b border-line px-3 py-3.5 font-medium">
                      Company
                    </th>
                    <th scope="col" className="border-b border-line px-3 py-3.5 font-medium">
                      Desk
                    </th>
                    <th
                      scope="col"
                      className="border-b border-line py-3.5 pr-6 text-right font-medium md:pr-7"
                    >
                      Weight
                    </th>
                  </tr>
                </thead>
                <tbody className="text-mute">
                  {[
                    "Equity Research",
                    "Equity Research",
                    "Macro & Strategy",
                    "ETFs & Multi-Asset",
                    "Equity Research",
                  ].map((desk, i) => (
                    <tr key={i}>
                      <td className="border-b border-line py-[15px] pl-6 font-serif text-[19px] font-semibold md:pl-7">
                        –
                      </td>
                      <td className="border-b border-line px-3 py-[15px]">–</td>
                      <td className="border-b border-line px-3 py-[15px]">{desk}</td>
                      <td className="border-b border-line py-[15px] pr-6 text-right md:pr-7">–</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-auto flex flex-col gap-2 px-6 pb-6 pt-5 md:px-7">
                <span className="caps text-[10px] tracking-[0.18em] text-mute">
                  Thesis, selected position
                </span>
                <p className="font-serif text-[21px]/[1.3] italic text-mute">
                  Each position will carry the one-paragraph thesis approved by the Investment
                  Committee.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Run by */}
      {am && (
        <section className="gutter grid items-start gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <Reveal className="flex flex-col gap-6 lg:col-span-6">
            <Eyebrow>Who runs it</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              Run by the Asset <Em>Management</Em> desk
            </h2>
            <p className="max-w-[560px] text-[15px]/[1.7] text-mute md:text-[17px]/[1.7]">
              {am.function}
            </p>
            <ul className="caps flex flex-wrap gap-2 text-[10px] tracking-[0.16em] md:text-[10.5px]">
              {am.desks.map((k) => (
                <li key={k.slug} className="rounded-full border border-ink px-3.5 py-2">
                  {k.name}
                </li>
              ))}
            </ul>
            <Link
              to="/departments/$department"
              params={{ department: am.slug }}
              className="btn btn-sm btn-outline-ink mt-2 self-start"
            >
              Explore the desk
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
            </Link>
          </Reveal>
          <Reveal className="grid grid-cols-2 gap-4 md:gap-6 lg:col-span-5 lg:col-start-8">
            {leads.map((p, i) => (
              <PersonCard key={p.slug} member={p} index={i} size="lg" />
            ))}
          </Reveal>
        </section>
      )}
    </SiteLayout>
  );
}
