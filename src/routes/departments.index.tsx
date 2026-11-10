import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { DepartmentSelector, DepartmentsHero, RecruitingBand } from "@/components/site/sections";
import { Em, Eyebrow, Numeral } from "@/components/site/ui";
import { departments, getDepartment } from "@/lib/departments";
import { ROMAN } from "@/lib/site";
import { cn } from "@/lib/utils";
import { leadershipOf, membersOf } from "@/lib/team";

export const Route = createFileRoute("/departments/")({
  // Links from before November 2026 used /departments?desk=<department>.
  validateSearch: (search: Record<string, unknown>): { desk?: string } =>
    typeof search.desk === "string" ? { desk: search.desk } : {},
  beforeLoad: ({ search }) => {
    const d = search.desk ? getDepartment(search.desk) : undefined;
    if (d) throw redirect({ to: "/departments/$department", params: { department: d.slug } });
  },
  head: () => ({
    meta: [
      { title: "Departments, EMFC" },
      {
        name: "description",
        content:
          "EMFC's six departments and their desks: what each produces, who runs it and where it aims.",
      },
      { property: "og:title", content: "EMFC Departments" },
      {
        property: "og:description",
        content:
          "Investment Banking, Private Markets, Asset Management, Fixed Income, Corporate Relations and Marketing.",
      },
    ],
  }),
  component: DepartmentsOverview,
});

function DepartmentsOverview() {
  return (
    <SiteLayout>
      <DepartmentsHero />
      <DepartmentSelector />
      <Structure />

      <section className="gutter grid gap-x-8 gap-y-14 py-16 md:grid-cols-2 lg:grid-cols-3 lg:py-24">
        {departments.map((d, i) => {
          const head = leadershipOf(d.slug)[0];
          return (
            <Reveal key={d.slug} className="flex flex-col gap-5 border-t border-ink pt-6">
              <div className="flex items-baseline justify-between gap-4">
                <Numeral>{ROMAN[i]}.</Numeral>
                <span className="caps text-[10px] tracking-[0.18em] text-mute">
                  {membersOf(d.slug).length} members
                </span>
              </div>
              <Link
                to="/departments/$department"
                params={{ department: d.slug }}
                className="group flex flex-col gap-3"
              >
                <h2 className="font-serif text-[40px]/none tracking-[-0.01em] underline-offset-[6px] group-hover:underline md:text-[48px]/none">
                  {d.name}
                </h2>
                <p className="text-[15px]/[1.65] text-mute">{d.short}</p>
              </Link>
              {head && (
                <span className="caps text-[10px] tracking-[0.16em] text-mute">
                  Head: <span className="text-ink">{head.name}</span>
                </span>
              )}
              {d.desks.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <Eyebrow>{d.desks.length} desks</Eyebrow>
                  <ul className="flex flex-wrap gap-2">
                    {d.desks.map((k) => (
                      <li key={k.slug}>
                        <Link
                          to="/departments/$department/$desk"
                          params={{ department: d.slug, desk: k.slug }}
                          className="caps inline-flex items-center gap-1.5 rounded-full border border-ink px-3.5 py-2 text-[10px] tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
                        >
                          {k.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Link
                to="/departments/$department"
                params={{ department: d.slug }}
                className="btn btn-sm btn-outline-ink mt-auto self-start"
              >
                Explore {d.name}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            </Reveal>
          );
        })}
      </section>

      <RecruitingBand />
    </SiteLayout>
  );
}

/**
 * How the club is organised, as a chart without faces or names (Vasco, 10 November 2026): the
 * Co-Presidents, a line down to the six departments, each led by its Head, and each department's
 * desks. On wide screens the lines join up; on smaller ones the departments sit in a grid.
 */
function Structure() {
  return (
    <section id="structure" className="scroll-mt-24 border-b border-line bg-stone">
      <div className="gutter flex flex-col gap-12 py-16 lg:gap-14 lg:py-24">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="flex flex-col gap-5">
            <Eyebrow>The structure</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              How EMFC is <Em>organised</Em>
            </h2>
          </div>
          <p className="max-w-[440px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Two Co-Presidents lead the club. Each department has a Head, who answers to them; inside
            the departments, Vice-Presidents lead the desks, each with its own Associates.
          </p>
        </Reveal>

        <Reveal className="flex flex-col">
          <div className="mx-auto flex w-full max-w-[380px] flex-col items-center gap-1.5 bg-night px-6 py-5 text-center text-white">
            <span className="font-serif text-[26px]/[1.1] md:text-[30px]/[1.1]">Co-Presidents</span>
            <span className="caps text-[10px] tracking-[0.22em] text-bull-light">and Founders</span>
          </div>
          <span aria-hidden className="mx-auto hidden h-10 w-px bg-ink xl:block" />
          <ol className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:mt-0 xl:grid-cols-6">
            {departments.map((d, i) => (
              <li
                key={d.slug}
                className={cn(
                  "relative flex flex-col gap-4",
                  // The lines: a rule along the top of the row from the first department's centre to the
                  // last one's, and a short line down to each department.
                  "xl:pt-10 xl:before:absolute xl:before:-left-2.5 xl:before:-right-2.5 xl:before:top-0 xl:before:h-px xl:before:bg-ink xl:first:before:left-1/2 xl:last:before:right-1/2",
                  "xl:after:absolute xl:after:left-1/2 xl:after:top-0 xl:after:h-10 xl:after:w-px xl:after:bg-ink",
                )}
              >
                <Link
                  to="/departments/$department"
                  params={{ department: d.slug }}
                  className="group flex min-h-[132px] flex-col gap-2 border border-ink bg-paper px-4 py-4 transition-colors hover:bg-ink hover:text-paper"
                >
                  <Numeral className="text-[20px]">{ROMAN[i]}.</Numeral>
                  <span className="font-serif text-[23px]/[1.08]">{d.name}</span>
                  <span className="caps mt-auto text-[9.5px] tracking-[0.16em] text-mute group-hover:text-paper/70">
                    Led by its Head
                  </span>
                </Link>
                {d.desks.length > 0 ? (
                  <ul className="flex flex-col gap-1.5 border-l border-ink/30 pl-3.5">
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
                  <p className="border-l border-ink/30 pl-3.5 text-[13px]/[1.55] text-mute">
                    {d.function}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
