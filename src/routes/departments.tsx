import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Linkedin } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, Numeral, PageHero, PersonCard } from "@/components/site/ui";
import { departments } from "@/lib/departments";
import { IMAGES, ROMAN, SOCIAL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/departments")({
  validateSearch: (search: Record<string, unknown>): { desk?: string } =>
    typeof search.desk === "string" ? { desk: search.desk } : {},
  head: () => ({
    meta: [
      { title: "Departments, EMFC" },
      {
        name: "description",
        content:
          "EMFC's four investment desks and two support teams: what each produces, who runs it and where it aims.",
      },
      { property: "og:title", content: "EMFC Departments" },
      {
        property: "og:description",
        content:
          "Investment Banking, Private Markets, Asset Management, Fixed Income, Corporate Relations and Marketing.",
      },
    ],
  }),
  component: DepartmentsPage,
});

function DepartmentsPage() {
  // The selected department lives in the URL (/departments?desk=fixed-income) so it can be linked to.
  const { desk } = Route.useSearch();
  const navigate = useNavigate();
  const found = departments.findIndex((d) => d.slug === desk);
  const index = found === -1 ? 0 : found;
  const d = departments[index];
  const leads = d.people.filter((p) => /^(head|chief)/i.test(p.role));

  const select = (slug: string) => {
    navigate({ to: "/departments", search: { desk: slug }, replace: true, resetScroll: false });
    // If the reader is already deep in a department, bring them back to the top of the new one.
    requestAnimationFrame(() => {
      const panel = document.getElementById("department-panel");
      const tabs = document.getElementById("department-tabs");
      if (!panel || !tabs) return;
      const top =
        panel.getBoundingClientRect().top + window.scrollY - tabs.getBoundingClientRect().bottom;
      if (window.scrollY > top) window.scrollTo({ top });
    });
  };

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.sagradaFamilia}
        alt="Sagrada Família rising above Barcelona's Eixample grid at sunset"
        eyebrow="Departments"
        title={
          <>
            Find your <Em light>desk</Em>
          </>
        }
      >
        Department Heads and VPs are in place. EMFC is recruiting Associates, the people who will
        run research, deal coverage and portfolio work alongside the events and community side of
        the club.
      </PageHero>

      {/* Department tabs */}
      <div
        id="department-tabs"
        className="sticky top-[72px] z-40 border-b border-line bg-stone lg:top-[88px]"
      >
        <div
          role="tablist"
          aria-label="Departments"
          className="gutter flex overflow-x-auto [scrollbar-width:none] lg:grid lg:grid-cols-6"
        >
          {departments.map((dep, i) => {
            const on = i === index;
            return (
              <button
                key={dep.slug}
                type="button"
                role="tab"
                id={`tab-${dep.slug}`}
                aria-selected={on}
                aria-controls="department-panel"
                onClick={() => select(dep.slug)}
                className={cn(
                  "flex h-16 shrink-0 items-center gap-3 border-b-2 pr-6 text-left transition-colors lg:h-[84px] lg:pr-2",
                  on ? "border-ink text-ink" : "border-transparent text-mute hover:text-ink",
                )}
              >
                <span className="font-serif text-xl italic text-brass">{ROMAN[i]}</span>
                <span className="font-serif text-xl/[1.05] font-medium whitespace-nowrap lg:text-[23px]/[1.05] lg:whitespace-normal">
                  {dep.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div id="department-panel" role="tabpanel" aria-labelledby={`tab-${d.slug}`} key={d.slug}>
        {/* Overview */}
        <section className="gutter grid items-start gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Eyebrow>{d.support ? "Support Team" : "Investment Team"}</Eyebrow>
            <h2 className="font-serif text-[56px]/[0.95] tracking-[-0.015em] md:text-8xl/[0.95]">
              {d.name}
            </h2>
            <p className="max-w-[680px] text-base/[1.65] text-mute md:text-[19px]/[1.65]">
              {d.long}
            </p>
            {d.verticals.length > 0 && (
              <ul className="caps flex flex-wrap gap-2 text-[10px] tracking-[0.16em] md:text-[10.5px]">
                {d.verticals.map((v) => (
                  <li key={v} className="rounded-full border border-ink px-3.5 py-2">
                    {v}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-col gap-3 bg-stone p-6 md:px-8 md:py-7">
              <span className="caps text-[10px] tracking-[0.22em] text-mute md:text-[10.5px]">
                What Associates do
              </span>
              <p className="font-serif text-[22px]/[1.3] md:text-[26px]/[1.3]">{d.associate}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5 lg:col-span-4 lg:col-start-9">
            {leads.map((p, i) => (
              <PersonCard key={p.name} person={p} index={i} />
            ))}
          </div>
        </section>

        {/* What the desk produces */}
        <section className="bg-stone">
          <div className="gutter flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
            <div className="flex flex-col gap-5">
              <Eyebrow>The work</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[64px]/none">
                What the {d.support ? "team" : "desk"} <Em>produces</Em>
              </h2>
            </div>
            <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
              {d.produces.map((it, i) => (
                <div key={it.title} className="flex flex-col gap-3 border-t border-ink pt-[22px]">
                  <Numeral className="text-[26px]/none">{ROMAN[i]}.</Numeral>
                  <h3 className="font-serif text-[26px]/[1.08] md:text-3xl/[1.08]">{it.title}</h3>
                  <p className="text-[15px]/[1.65] text-mute">{it.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Target firms */}
        {d.targetFirms && d.targetFirms.length > 0 && (
          <section className="gutter grid items-start gap-8 pt-16 lg:grid-cols-12 lg:pt-24">
            <div className="flex flex-col gap-5 lg:col-span-3">
              <Eyebrow>Where the desk aims</Eyebrow>
              <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[56px]/none">
                Target <Em>firms</Em>
              </h2>
            </div>
            <ul className="grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3 lg:col-span-9 lg:grid-cols-4">
              {d.targetFirms.map((f) => (
                <li
                  key={f}
                  className="flex h-[72px] items-center justify-center bg-paper px-3 text-center font-serif text-xl font-semibold md:h-[84px] md:text-[23px]"
                >
                  {f}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* People */}
        <section className="gutter grid items-start gap-8 py-16 lg:grid-cols-12 lg:py-24">
          <div className="flex flex-col gap-5 lg:col-span-3">
            <Eyebrow>The people</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[56px]/none">
              On the <Em>{d.support ? "team" : "desk"}</Em>
            </h2>
            <Link
              to="/team"
              className="caps self-start text-[10.5px] tracking-[0.18em] underline underline-offset-[5px]"
            >
              Meet the whole team
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-5 md:gap-5 lg:col-span-9">
            {d.people.map((p, j) => (
              <PersonCard key={p.name + p.role} person={p} index={j} />
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="bg-night text-white">
        <Reveal className="gutter flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-22">
          <div className="flex flex-col gap-[18px]">
            <Eyebrow tone="light">Applications closed</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[64px]/none">
              Recruiting reopens <Em light>next term.</Em>
            </h2>
            <p className="text-[15px]/[1.7] text-mist md:text-base/[1.7]">
              Associate applications are closed for now. Follow us on LinkedIn for the next intake.
            </p>
          </div>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noreferrer"
            className="btn btn-white shrink-0 self-start lg:self-auto"
          >
            <Linkedin className="h-4 w-4" strokeWidth={1.6} />
            Follow on LinkedIn
          </a>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
