import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
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
  WorkGrid,
} from "@/components/site/sections";
import { Em, Eyebrow, PersonCard } from "@/components/site/ui";
import { eventsFor } from "@/data/events";
import { reportsFor } from "@/data/reports";
import { getDepartment, type Department, type Desk } from "@/lib/departments";
import { associatesOf, leadershipOf } from "@/lib/team";

export const Route = createFileRoute("/departments/$department")({
  beforeLoad: ({ params }) => {
    const d = getDepartment(params.department);
    if (!d) throw notFound();
    if (d.slug !== params.department) {
      throw redirect({ to: "/departments/$department", params: { department: d.slug } });
    }
  },
  head: ({ params }) => {
    const d = getDepartment(params.department);
    return {
      meta: [
        { title: `${d?.name ?? "Departments"}, EMFC` },
        { name: "description", content: d?.function ?? "" },
        { property: "og:title", content: `EMFC ${d?.name ?? "Departments"}` },
        { property: "og:description", content: d?.short ?? "" },
      ],
    };
  },
  component: DepartmentPage,
});

/** A desk as a card linking to its page, with its lead when it has one. */
function DeskCard({ d, k }: { d: Department; k: Desk }) {
  return (
    <Link
      to="/departments/$department/$desk"
      params={{ department: d.slug, desk: k.slug }}
      className="group flex h-full flex-col gap-2.5 border border-ink bg-paper p-5 transition-colors hover:bg-ink hover:text-paper md:p-6"
    >
      <span className="flex items-start justify-between gap-4">
        <span className="font-serif text-[26px]/[1.05] font-medium md:text-[28px]/[1.05]">{k.name}</span>
        <ArrowRight className="mt-1.5 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.75} />
      </span>
      <span className="text-[14px]/[1.55] text-mute group-hover:text-paper/80">{k.line}</span>
      {k.lead && (
        <span className="caps mt-auto pt-1 text-[9.5px] tracking-[0.16em] text-bull group-hover:text-bull-light">
          Led by {k.lead}
        </span>
      )}
    </Link>
  );
}

function Desks({ d }: { d: Department }) {
  if (d.desks.length === 0) return null;
  const groups = d.groups
    ? d.groups.map((g) => ({ ...g, desks: g.desks.map((s) => d.desks.find((k) => k.slug === s)!) }))
    : [{ name: undefined, lead: undefined, desks: d.desks }];
  return (
    <div className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.name ?? "desks"} className="flex flex-col gap-3.5">
          <Eyebrow>
            {g.name ? (
              <>
                {g.name}, led by {g.lead}
              </>
            ) : (
              `${d.desks.length} desks: choose one`
            )}
          </Eyebrow>
          <div className="grid gap-3 sm:grid-cols-2">
            {g.desks.map((k) => (
              <DeskCard key={k.slug} d={d} k={k} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DepartmentPage() {
  const { department } = Route.useParams();
  const d = getDepartment(department)!;
  const leaders = leadershipOf(d.slug);
  const reports = reportsFor(d.slug);
  const events = eventsFor(d.slug);
  const deskNames = Object.fromEntries(d.desks.map((k) => [k.slug, k.name]));
  const associates = associatesOf(d.slug);
  // Associates by desk, then anyone in the department without a desk.
  const byDesk = [
    ...d.desks.map((k) => ({ name: k.name, members: associatesOf(d.slug, k.slug) })),
    { name: d.desks.length ? `${d.name}, all desks` : undefined, members: associates.filter((m) => !m.desk) },
  ].filter((g) => g.members.length > 0);

  return (
    <SiteLayout>
      <DepartmentsHero />
      <DepartmentSelector current={d.slug} />

      <div key={d.slug}>
        {/* Overview */}
        <section className="gutter grid items-start gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Eyebrow>Department</Eyebrow>
            <h2 className="font-serif text-[56px]/[0.95] tracking-[-0.015em] md:text-8xl/[0.95]">{d.name}</h2>
            <p className="max-w-[680px] text-base/[1.65] text-mute md:text-[19px]/[1.65]">{d.long}</p>
            <div className="mt-2">
              <Desks d={d} />
            </div>
            <div className="mt-2 flex flex-col gap-3 bg-stone p-6 md:px-8 md:py-7">
              <span className="caps text-[10px] tracking-[0.22em] text-mute md:text-[10.5px]">
                What Associates do
              </span>
              <p className="font-serif text-[22px]/[1.3] md:text-[26px]/[1.3]">{d.associate}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:col-span-4 lg:col-start-9">
            {leaders.map((p, i) => (
              <PersonCard key={p.slug} member={p} index={i} />
            ))}
          </div>
        </section>

        {/* What the department produces */}
        <section className="bg-stone">
          <div className="gutter flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
            <SectionHeading eyebrow="The work">
              What the {d.desks.length ? "desk" : "team"} <Em>produces</Em>
            </SectionHeading>
            <WorkGrid items={d.produces} />
          </div>
        </section>

        {/* Target firms */}
        {d.targetFirms.length > 0 && (
          <section className="gutter grid items-start gap-8 pt-16 lg:grid-cols-12 lg:pt-24">
            <SectionHeading eyebrow="Where the desk aims" className="lg:col-span-3">
              Target <Em>firms</Em>
            </SectionHeading>
            <div className="lg:col-span-9">
              <FirmsGrid firms={d.targetFirms} deskNames={d.slug === "private-markets" ? deskNames : undefined} />
            </div>
          </section>
        )}

        {/* Research */}
        {d.desks.length > 0 && (
          <section className="gutter grid items-start gap-8 pt-16 lg:grid-cols-12 lg:pt-24">
            <SectionHeading eyebrow="Published work" className="lg:col-span-3">
              <Em>Research</Em>
            </SectionHeading>
            <div className="lg:col-span-9">
              {reports.length > 0 ? (
                <ReportList reports={reports} />
              ) : (
                <ResearchComingSoon />
              )}
            </div>
          </section>
        )}

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

        {/* People */}
        <section className="gutter grid items-start gap-8 py-16 lg:grid-cols-12 lg:py-24">
          <div className="flex flex-col gap-5 lg:col-span-3">
            <SectionHeading eyebrow="The people">
              On the <Em>{d.desks.length ? "desk" : "team"}</Em>
            </SectionHeading>
            <Link
              to="/team"
              className="caps self-start text-[10.5px] tracking-[0.18em] underline underline-offset-[5px]"
            >
              Meet the whole team
            </Link>
          </div>
          <div className="flex flex-col gap-12 lg:col-span-9">
            {byDesk.map((g) => (
              <div key={g.name ?? "all"} className="flex flex-col gap-5">
                {g.name && <Eyebrow>{g.name}</Eyebrow>}
                <MemberGrid members={g.members} size="sm" />
              </div>
            ))}
          </div>
        </section>
      </div>

      <RecruitingBand />
    </SiteLayout>
  );
}
