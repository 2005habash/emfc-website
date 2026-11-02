import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import {
  DepartmentSelector,
  DepartmentsHero,
  EventRows,
  FirmsGrid,
  MemberGrid,
  RecruitingBand,
  ReportList,
  ResearchComingSoon,
  SectionHeading,
} from "@/components/site/sections";
import { Em, Eyebrow, PersonCard } from "@/components/site/ui";
import { eventsFor } from "@/data/events";
import { reportsFor } from "@/data/reports";
import { getDepartment, getDesk } from "@/lib/departments";
import { ROMAN } from "@/lib/site";
import { deskTeam, leadershipOf, memberByName } from "@/lib/team";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/departments/$department_/$desk")({
  beforeLoad: ({ params }) => {
    if (!getDesk(params.department, params.desk)) throw notFound();
  },
  head: ({ params }) => {
    const d = getDepartment(params.department);
    const k = getDesk(params.department, params.desk);
    return {
      meta: [
        { title: `${k?.name ?? "Desk"}, ${d?.name ?? "Departments"}, EMFC` },
        { name: "description", content: k?.line ?? "" },
        { property: "og:title", content: `EMFC ${d?.name ?? ""}: ${k?.name ?? ""}` },
        { property: "og:description", content: k?.line ?? "" },
      ],
    };
  },
  component: DeskPage,
});

function DeskPage() {
  const params = Route.useParams();
  const d = getDepartment(params.department)!;
  const k = getDesk(params.department, params.desk)!;
  const head = leadershipOf(d.slug)[0];
  const lead = k.lead ? memberByName(k.lead) : undefined;
  const team = deskTeam(d.slug, k.slug).filter((m) => m.name !== k.lead);
  const reports = reportsFor(d.slug, k.slug);
  const events = eventsFor(d.slug, k.slug);
  const at = d.desks.findIndex((x) => x.slug === k.slug);
  const prev = d.desks[(at - 1 + d.desks.length) % d.desks.length];
  const next = d.desks[(at + 1) % d.desks.length];

  return (
    <SiteLayout>
      <DepartmentsHero />
      <DepartmentSelector current={d.slug} />

      <div key={`${d.slug}/${k.slug}`}>
        {/* Desks of this department */}
        <nav aria-label={`${d.name} desks`} className="border-b border-line">
          <div className="gutter flex flex-wrap items-center gap-2 py-5">
            <Link
              to="/departments/$department"
              params={{ department: d.slug }}
              className="caps mr-2 inline-flex items-center gap-2 text-[10.5px] tracking-[0.18em] text-mute hover:text-ink"
            >
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
              {d.name}
            </Link>
            {d.desks.map((x) => (
              <Link
                key={x.slug}
                to="/departments/$department/$desk"
                params={{ department: d.slug, desk: x.slug }}
                aria-current={x.slug === k.slug ? "page" : undefined}
                className={cn(
                  "caps rounded-full border px-3.5 py-2 text-[10px] tracking-[0.14em] transition-colors",
                  x.slug === k.slug
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-ink hover:border-ink",
                )}
              >
                {x.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Overview */}
        <section className="gutter grid items-start gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Eyebrow>
              {k.group ? `${d.name}, ${k.group}` : d.name} desk
            </Eyebrow>
            <h2 className="font-serif text-[56px]/[0.95] tracking-[-0.015em] md:text-8xl/[0.95]">{k.name}</h2>
            <p className="max-w-[680px] text-base/[1.65] text-mute md:text-[19px]/[1.65]">{k.description}</p>
            {k.does.length > 0 && (
              <div className="mt-2 flex flex-col gap-4">
                <Eyebrow>What the desk does</Eyebrow>
                <ol className="flex flex-col border-t border-ink">
                  {k.does.map((item, i) => (
                    <li key={item} className="flex gap-5 border-b border-line py-4">
                      <span className="w-8 shrink-0 font-serif text-xl italic text-bull">{ROMAN[i]}.</span>
                      <span className="text-[15px]/[1.65] md:text-base/[1.65]">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {k.planned && k.planned.length > 0 && (
              <div className="mt-2 flex flex-col gap-3 bg-stone p-6 md:px-8 md:py-7">
                <span className="caps text-[10px] tracking-[0.22em] text-mute md:text-[10.5px]">Planned</span>
                <ul className="flex flex-col gap-2.5">
                  {k.planned.map((p) => (
                    <li key={p} className="font-serif text-[20px]/[1.35] md:text-[22px]/[1.35]">
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5 lg:col-span-4 lg:col-start-9">
            {head && <PersonCard member={head} index={0} />}
            {lead && lead.name !== head?.name && <PersonCard member={lead} index={1} />}
          </div>
        </section>

        {/* Target firms */}
        <section className="gutter grid items-start gap-8 lg:grid-cols-12">
          <SectionHeading eyebrow="Where the desk aims" className="lg:col-span-3">
            Target <Em>firms</Em>
          </SectionHeading>
          <div className="lg:col-span-9">
            <FirmsGrid firms={k.targetFirms} />
          </div>
        </section>

        {/* Research */}
        <section className="gutter grid items-start gap-8 pt-16 lg:grid-cols-12 lg:pt-24">
          <SectionHeading eyebrow="Published work" className="lg:col-span-3">
            <Em>Research</Em>
          </SectionHeading>
          <div className="lg:col-span-9">
            {reports.length > 0 ? <ReportList reports={reports} /> : <ResearchComingSoon desk />}
          </div>
        </section>

        {/* Events */}
        {events.length > 0 && (
          <section className="gutter grid items-start gap-8 pt-16 lg:grid-cols-12 lg:pt-24">
            <SectionHeading eyebrow="Sessions" className="lg:col-span-3">
              Events
            </SectionHeading>
            <div className="lg:col-span-9">
              <EventRows events={events} />
            </div>
          </section>
        )}

        {/* Team */}
        {team.length > 0 && (
          <section className="gutter grid items-start gap-8 pt-16 lg:grid-cols-12 lg:pt-24">
            <SectionHeading eyebrow="The people" className="lg:col-span-3">
              On the <Em>desk</Em>
            </SectionHeading>
            <div className="lg:col-span-9">
              <MemberGrid members={team} size="sm" />
            </div>
          </section>
        )}

        {/* Next and previous desk */}
        {d.desks.length > 1 && (
          <nav aria-label="More desks" className="gutter grid gap-3 py-16 sm:grid-cols-2 lg:py-24">
            {[
              { x: prev, label: "Previous desk", Icon: ArrowLeft },
              { x: next, label: "Next desk", Icon: ArrowRight },
            ].map(({ x, label, Icon }) => (
              <Link
                key={label}
                to="/departments/$department/$desk"
                params={{ department: d.slug, desk: x.slug }}
                className={cn(
                  "group flex items-center justify-between gap-6 border border-ink p-6 transition-colors hover:bg-ink hover:text-paper",
                  label === "Next desk" && "sm:flex-row-reverse sm:text-right",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                <span className="flex flex-col gap-1.5">
                  <span className="caps text-[10px] tracking-[0.18em] text-mute group-hover:text-paper/70">
                    {label}
                  </span>
                  <span className="font-serif text-[28px]/[1.05]">{x.name}</span>
                </span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      <RecruitingBand />
    </SiteLayout>
  );
}
