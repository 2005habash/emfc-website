import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

const FIRM_DOMAINS: Record<string, string> = {
  "Goldman Sachs": "goldmansachs.com",
  "Morgan Stanley": "morganstanley.com",
  "J.P. Morgan": "jpmorgan.com",
  "Bank of America": "bankofamerica.com",
  "Citi": "citi.com",
  "Evercore": "evercore.com",
  "Lazard": "lazard.com",
  "Rothschild & Co": "rothschildandco.com",
  "Houlihan Lokey": "hl.com",
  "Jefferies": "jefferies.com",
  "UBS": "ubs.com",
  "Crédit Agricole": "credit-agricole.com",
  "Blackstone": "blackstone.com",
  "KKR": "kkr.com",
  "CVC": "cvc.com",
  "Warburg Pincus": "warburgpincus.com",
  "Ardian": "ardian.com",
  "Index Ventures": "indexventures.com",
  "Atomico": "atomico.com",
  "Sequoia": "sequoiacap.com",
  "General Atlantic": "generalatlantic.com",
  "Schroders": "schroders.com",
  "BlackRock": "blackrock.com",
  "Fidelity": "fidelity.com",
  "Capital Group": "capitalgroup.com",
  "Citadel": "citadel.com",
  "Point72": "point72.com",
  "Brevan Howard": "brevanhoward.com",
  "Marshall Wace": "mwam.com",
  "PIMCO": "pimco.com",
  "Apollo": "apollo.com",
  "Ares": "aresmgmt.com",
  "Oaktree": "oaktreecapital.com",
  "HPS": "hpspartners.com",
  "Blackstone Credit": "blackstone.com",
  "BlueBay": "bluebay.com",
  "Muzinich": "muzinich.com",
};
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ApplicationForm } from "@/components/ApplicationForm";
import { ApplyCountdown } from "@/components/ApplyCountdown";
import { getDepartment, departments } from "@/lib/departments";

export const Route = createFileRoute("/apply/$slug")({
  loader: ({ params }) => {
    const d = getDepartment(params.slug);
    if (!d) throw notFound();
    return { department: d };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.department.name}, EMFC` },
          { name: "description", content: `${loaderData.department.name}. ${loaderData.department.short}` },
        ]
      : [{ title: "Apply, EMFC" }],
  }),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-emis py-24 text-center">
        <h1 className="font-serif text-3xl text-navy">Department not found</h1>
        <Link to="/departments" className="mt-4 inline-block text-steel underline">Browse all departments</Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: () => (
    <SiteLayout>
      <div className="container-emis py-24 text-center">
        <h1 className="font-serif text-3xl text-navy">Something went wrong</h1>
        <Link to="/departments" className="mt-4 inline-block text-steel underline">Browse all departments</Link>
      </div>
    </SiteLayout>
  ),
  component: ApplyPage,
});

function ApplyPage() {
  const { department: d } = Route.useLoaderData();
  return (
    <SiteLayout>
      {/* Header banner */}
      <section className="bg-navy text-primary-foreground">
        <div className="container-wide py-14 md:py-20">
          <Link to="/departments" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-primary-foreground/70 hover:text-gold">
            <ArrowLeft className="h-3.5 w-3.5" /> All departments
          </Link>
          <p className="eyebrow mt-6 text-gold">{d.support ? "Support Team" : "Investment Team"}</p>
          <h1 className="display-caps mt-4 max-w-4xl text-3xl md:text-5xl text-primary-foreground">{d.name}</h1>
          <p className="mt-5 max-w-3xl text-primary-foreground/80">{d.function}</p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a
              href="#apply"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-foreground shadow hover:brightness-95"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
            <span className="text-sm text-primary-foreground/70">
              <span className="text-primary-foreground/50">Head ·</span>{" "}
              <span className="text-primary-foreground">{d.head}</span>
              {d.cio && <> · <span className="text-primary-foreground/50">CIO ·</span> <span className="text-primary-foreground">{d.cio}</span></>}
            </span>
          </div>
        </div>
      </section>

      {/* Deadline countdown */}
      <section className="bg-[var(--cream)] pt-8">
        <div className="container-wide">
          <ApplyCountdown />
        </div>
      </section>


      {/* Full department content */}
      <section className="bg-[var(--cream)]">
        <div className="container-wide grid gap-10 py-20 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            <div className="rounded-sm border border-border bg-card p-8">
              <p className="eyebrow">Overview</p>
              <p className="mt-3 text-[15px] leading-[1.85] text-foreground/80">{d.long}</p>
            </div>

            {d.verticals.length > 0 && (
              <div className="rounded-sm border border-border bg-card p-8">
                <p className="eyebrow">Sub-verticals</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.verticals.map((v: string) => (
                    <span key={v} className="rounded-full border border-border bg-[var(--cream)] px-3.5 py-1.5 text-xs text-foreground/80">{v}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-sm border border-border bg-card p-8">
              <p className="eyebrow">What this department produces</p>
              <div className="mt-6 space-y-5">
                {d.produces.map((p: { title: string; body: string }) => (
                  <div key={p.title} className="border-l-2 border-gold pl-5">
                    <h3 className="font-serif text-lg text-navy">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-[1.75] text-foreground/75">{p.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {d.targetFirms && d.targetFirms.length > 0 && (
              <div>
                <p className="eyebrow">Target firms</p>
                <div className="mt-6 grid grid-cols-3 gap-x-8 gap-y-10 sm:grid-cols-4 md:grid-cols-5">
                  {d.targetFirms!.map((f: string) => {
                    const domain = FIRM_DOMAINS[f];
                    const token = import.meta.env.VITE_LOVABLE_CONNECTOR_LOGO_DEV_API_KEY;
                    return (
                      <div key={f} title={f} className="group flex items-center justify-center">
                        {domain && token ? (
                          <img
                            src={`https://img.logo.dev/${domain}?token=${token}&format=png&size=280&retina=true`}
                            alt={`${f} company logo`}
                            loading="lazy"
                            className="h-[76px] w-full object-contain transition-transform duration-300 ease-out group-hover:scale-110"
                          />
                        ) : (
                          <span className="text-center text-xs font-medium text-navy">{f}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            <div className="rounded-sm border border-border bg-card p-8">
              <p className="eyebrow">Department structure</p>
              <div className="mt-5 space-y-3">
                {d.people.map((p: { name: string; role: string }) => (
                  <div key={p.name} className="flex items-baseline justify-between border-b border-border/60 pb-2.5 last:border-0">
                    <span className="font-medium text-navy">{p.name}</span>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-4">
            <div className="rounded-sm border border-border bg-card p-7">
              <p className="eyebrow">What an Associate does</p>
              <p className="mt-3 text-sm leading-[1.75] text-foreground/80">{d.associate}</p>
            </div>
            <div className="rounded-sm border border-border bg-card p-7">
              <p className="eyebrow">Selection process</p>
              <ol className="mt-4 space-y-2.5 text-sm text-foreground/80">
                <li>01 · CV submission via this form</li>
                <li>02 · Interview with the Department Head{d.cio ? " (and CIO for Asset Management)" : ""}</li>
                <li>03 · Fit & motivation assessment</li>
                <li>04 · Final selection</li>
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                Associate roles are filled by master's students. Many EMFC events are also open to the wider ESADE community.
              </p>
            </div>
            <a
              href="#apply"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy px-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground hover:bg-ink"
            >
              Apply Now <ArrowRight className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="bg-background scroll-mt-24">
        <div className="container-wide py-20">
          <div className="mx-auto max-w-3xl">
            <p className="eyebrow text-center">Application</p>
            <h2 className="display-caps mt-4 text-center text-3xl md:text-4xl">Apply to {d.name}</h2>
            <p className="mt-4 text-center text-foreground/70">Associate roles are filled by master's students at ESADE. Submit your application below.</p>
            <div className="mt-10">
              <ApplicationForm d={d} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background">
        <div className="container-wide py-14">
          <p className="eyebrow">Other departments</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {departments.filter((x) => x.slug !== d.slug).map((x) => (
              <Link
                key={x.slug}
                to="/apply/$slug"
                params={{ slug: x.slug }}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-navy hover:border-navy"
              >
                {x.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
