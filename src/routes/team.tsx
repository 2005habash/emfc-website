import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { MemberGrid } from "@/components/site/sections";
import { Em, Eyebrow, Numeral, PageHero } from "@/components/site/ui";
import { departments, type Department } from "@/lib/departments";
import { absoluteUrl, IMAGES, ROMAN } from "@/lib/site";
import { ADVISORY, associatesOf, leadershipOf, PRESIDENTS } from "@/lib/team";
import { STATS } from "@/data/stats";

export const Route = createFileRoute("/team")({
  head: () => ({
    meta: [
      { title: "Team, EMFC" },
      {
        name: "description",
        content:
          "The people of EMFC: Co-Presidents, six departments with their Heads, Vice-Presidents and Associates, and the Advisory Board.",
      },
      { property: "og:title", content: "The EMFC Team" },
      {
        property: "og:description",
        content: `${STATS.members} members across six departments of the ESADE Master's Finance Club.`,
      },
      { property: "og:image", content: absoluteUrl(IMAGES.teamGroup) },
    ],
  }),
  component: Team,
});

/**
 * Associates by desk, then anyone without a desk. Fixed Income, with six small desks, shows its two
 * groups instead; each person's title still names their desk.
 */
function associateGroups(d: Department) {
  const all = associatesOf(d.slug);
  if (d.groups) {
    return d.groups
      .map((g) => ({ label: g.name, members: all.filter((m) => m.group === g.name) }))
      .filter((g) => g.members.length > 0);
  }
  const groups = d.desks
    .map((k) => ({
      label: k.group ? `${k.group}: ${k.name}` : k.name,
      members: all.filter((m) => m.desk === k.slug),
    }))
    .filter((g) => g.members.length > 0);
  const rest = all.filter((m) => !m.desk);
  if (rest.length) groups.push({ label: d.desks.length ? d.name : "Associates", members: rest });
  return groups;
}

function Team() {
  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.teamGroup}
        alt="The EMFC members together outside the ESADE building"
        eyebrow="The Team"
        position="50% 40%"
        title={
          <>
            {STATS.members} <Em light>members</Em>
          </>
        }
      >
        EMFC is run by master's students across six departments, with a Chief Investment Officer
        overseeing the fund and an Advisory Board supporting the club.
      </PageHero>

      {/* Departments */}
      <section className="gutter flex flex-col pb-10 pt-20 lg:pb-14 lg:pt-26">
        <Reveal className="flex flex-col gap-6 pb-10 md:flex-row md:items-end md:justify-between md:pb-12">
          <div className="flex flex-col gap-5">
            <Eyebrow>Who's who</Eyebrow>
            <h2 className="font-serif text-5xl/none tracking-[-0.01em] md:text-[76px]/none">
              By <Em>department</Em>
            </h2>
          </div>
          <Link to="/departments" className="btn btn-sm btn-outline-ink self-start md:self-auto">
            Explore the desks
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        </Reveal>
        <Reveal className="grid gap-8 border-t border-ink py-10 lg:grid-cols-12 lg:py-12">
          <div className="flex flex-col gap-3.5 lg:col-span-3">
            <h3 className="font-serif text-4xl/none md:text-[40px]/none">Co-Presidents</h3>
            <p className="max-w-[60ch] text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">
              The founders of the club. With the Heads of the six departments, they form the{" "}
              <Link to="/board" className="underline underline-offset-4 hover:text-ink">
                Board
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-9">
            <MemberGrid members={PRESIDENTS} />
          </div>
        </Reveal>
        {departments.map((d, i) => (
          <Reveal
            key={d.slug}
            className="grid gap-8 border-t border-ink py-10 lg:grid-cols-12 lg:py-12"
          >
            <div className="flex flex-col gap-3.5 lg:col-span-3">
              <Numeral>{ROMAN[i]}</Numeral>
              <h3 className="font-serif text-4xl/none md:text-[40px]/none">
                <Link
                  to="/departments/$department"
                  params={{ department: d.slug }}
                  className="underline-offset-[6px] hover:underline"
                >
                  {d.name}
                </Link>
              </h3>
              <p className="max-w-[60ch] text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">{d.function}</p>
            </div>
            <div className="flex flex-col gap-10 lg:col-span-9">
              <MemberGrid members={leadershipOf(d.slug)} />
              {associateGroups(d).map((g) => (
                <div key={g.label} className="flex flex-col gap-4">
                  <Eyebrow>{g.label}</Eyebrow>
                  <MemberGrid members={g.members} size="sm" />
                </div>
              ))}
            </div>
          </Reveal>
        ))}
      </section>

      {/* Advisory Board, at the end of the page */}
      <section id="advisory-board" className="gutter scroll-mt-24 py-20 lg:py-26">
        <Reveal className="grid gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-3">
            <Eyebrow>Advisors</Eyebrow>
            <h2 className="font-serif text-5xl/[0.98] tracking-[-0.01em] md:text-[60px]/[0.98]">
              Advisory <Em>Board</Em>
            </h2>
            <p className="text-sm/[1.65] text-mute md:text-[14.5px]/[1.65]">
              They advise the club and support the people who run it.
            </p>
          </div>
          <div className="lg:col-span-9">
            <MemberGrid members={ADVISORY} />
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
