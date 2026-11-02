import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { DepartmentSelector, DepartmentsHero, RecruitingBand } from "@/components/site/sections";
import { Eyebrow, Numeral } from "@/components/site/ui";
import { departments, getDepartment } from "@/lib/departments";
import { ROMAN } from "@/lib/site";
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
          "Investment Banking, Private Markets, Asset Management, Fixed Income, Corporate Relations and Brand.",
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
