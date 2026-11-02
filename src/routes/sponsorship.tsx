import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Check, Linkedin, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, Numeral, PageHero } from "@/components/site/ui";
import { STATS, TARGET_AREAS, TARGET_CITIES } from "@/data/stats";
import { FORMATS, sendSponsorshipEnquiry } from "@/lib/enquiries";
import { IMAGES, ROMAN, SOCIAL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sponsorship")({
  head: () => ({
    meta: [
      { title: "Sponsorship, EMFC" },
      {
        name: "description",
        content:
          "Partner with EMFC to reach 66 ESADE master's students through workshops, events and brand visibility.",
      },
      { property: "og:title", content: "Sponsor EMFC" },
      {
        property: "og:description",
        content:
          "Talent pipeline, workshop access and brand visibility with the ESADE Master's Finance Club.",
      },
    ],
  }),
  component: SponsorshipPage,
});

const facts = [
  { value: String(STATS.members), label: `Members across ${STATS.programmes} ESADE master's programmes` },
  { value: String(STATS.nationalities), label: "Nationalities" },
  { value: `${STATS.internationalPct}%`, label: "From outside Spain" },
  { value: `${STATS.experiencePct}%`, label: "With professional experience" },
  { value: `${STATS.internships}+`, label: "Internships completed" },
  { value: `${STATS.graduating2027Pct}%`, label: "Graduate in 2027" },
];

const benefits = [
  {
    title: "Talent Pipeline",
    body: "Direct access to 66 ESADE master's students targeting Private Equity, Investment Banking, Asset Management, Venture Capital and Fixed Income, most of them recruiting for 2027.",
  },
  {
    title: "Brand Visibility",
    body: "Consistent presence across our website, event materials, LinkedIn and on-campus touchpoints throughout the academic year.",
  },
  {
    title: "Workshop Access",
    body: "Deliver technical workshops, case studies or firm presentations to a room of prepared, motivated candidates already tracking your desks.",
  },
];

const fieldClass =
  "h-[52px] rounded border border-mute bg-field px-4 text-base text-ink outline-offset-2 placeholder:text-mute focus-visible:outline-2 focus-visible:outline-ink";
const labelClass = "caps text-[10px] tracking-[0.2em] text-mute md:text-[10.5px]";

function SponsorshipPage() {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    email: "",
    format: FORMATS[0] as (typeof FORMATS)[number],
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const openedAt = useRef(Date.now());
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await sendSponsorshipEnquiry({ data: { ...form, elapsed: Date.now() - openedAt.current } });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <SiteLayout>
      <PageHero
        image={IMAGES.portOlimpic}
        alt="Barceloneta beach and the Barcelona skyline from above"
        eyebrow="Sponsorship"
        position="50% 40%"
        title={
          <>
            Partner with <Em light>EMFC</Em>
          </>
        }
      >
        The ESADE Master's Finance Club is a member-driven community of master's students preparing
        for careers across banking, private capital and markets. Sponsors join us for the people, the
        reach, and a direct line into the next intake of ESADE finance talent.
      </PageHero>

      {/* Audience facts */}
      <section aria-label="The EMFC audience" className="border-b border-line">
        <dl className="gutter grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex flex-col gap-2.5 py-7 lg:py-9 lg:pb-10",
                i % 2 === 1 && "border-l border-line pl-5 md:border-l-0 md:pl-0",
                i % 3 !== 0 && "md:border-l md:border-line md:pl-6",
                i < 4 && "border-b border-line md:border-b-0",
                i < 3 && "md:border-b md:border-line lg:border-b-0",
                i > 0 && "lg:border-l lg:border-line lg:pl-6",
                i === 3 && "lg:pl-6",
              )}
            >
              <dd className="font-serif text-[40px]/none font-medium md:text-[52px]/none">
                {f.value}
              </dd>
              <dt className="caps text-[10px] tracking-[0.2em] text-mute md:text-[10.5px]">
                {f.label}
              </dt>
            </div>
          ))}
        </dl>
      </section>

      {/* What partners get */}
      <section className="gutter flex flex-col gap-10 py-16 lg:gap-14 lg:py-24">
        <Reveal className="flex flex-col gap-5">
          <Eyebrow>Why sponsor?</Eyebrow>
          <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
            What partners <Em>get</Em>
          </h2>
        </Reveal>
        <Reveal className="grid gap-8 md:grid-cols-3">
          {benefits.map((b, i) => (
            <div key={b.title} className="flex flex-col gap-3.5 border-t border-ink pt-6">
              <Numeral>{ROMAN[i]}.</Numeral>
              <h3 className="font-serif text-[32px]/[1.05] md:text-[40px]/[1.05]">{b.title}</h3>
              <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">{b.body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      {/* What members aim for */}
      <section className="gutter grid items-start gap-10 pb-16 lg:grid-cols-12 lg:gap-8 lg:pb-24">
        <Reveal className="flex flex-col gap-5 lg:col-span-4">
          <Eyebrow>From the member form</Eyebrow>
          <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[64px]/none">
            Where members <Em>aim</Em>
          </h2>
          <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            The areas and cities members target, each picking up to three. Totals only.
          </p>
        </Reveal>
        <Reveal className="grid gap-10 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
          {[
            { title: "Target areas", rows: TARGET_AREAS },
            { title: "Target cities", rows: TARGET_CITIES },
          ].map((t) => (
            <div key={t.title} className="flex flex-col gap-4">
              <h3 className="caps border-b border-ink pb-3 text-[10.5px] tracking-[0.2em]">{t.title}</h3>
              <ul className="flex flex-col gap-3.5">
                {t.rows.map((r) => (
                  <li key={r.name} className="flex flex-col gap-1.5">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="font-serif text-[21px]/[1.1]">{r.name}</span>
                      <span className="caps text-[10.5px] tracking-[0.14em] text-mute">{r.pct}%</span>
                    </span>
                    <span aria-hidden className="h-[3px] w-full bg-line">
                      <span className="block h-full bg-bull" style={{ width: `${r.pct}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </section>

      {/* Ways to partner */}
      <section className="bg-stone">
        <div className="gutter grid items-start gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <Reveal className="flex flex-col gap-5 lg:col-span-4">
            <Eyebrow>Formats</Eyebrow>
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[72px]/none">
              Ways to <Em>partner</Em>
            </h2>
            <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">
              Tell us about your firm and what you'd like to run with EMFC.
            </p>
          </Reveal>
          <Reveal className="flex flex-col border-b border-ink lg:col-span-7 lg:col-start-6">
            {FORMATS.map((f, i) => (
              <a
                key={f}
                href="#contact"
                onClick={() => setForm((s) => ({ ...s, format: f }))}
                className={cn(
                  "grid grid-cols-[40px_minmax(0,1fr)_24px] items-center gap-4 border-t py-6 transition-[padding] duration-300 hover:pl-4 md:grid-cols-[56px_minmax(0,1fr)_24px] md:py-7",
                  i === 0 ? "border-ink" : "border-line",
                )}
              >
                <Numeral className="text-[26px]/none">{ROMAN[i]}.</Numeral>
                <span className="flex flex-col gap-1.5">
                  <span className="font-serif text-[28px]/[1.05] font-medium md:text-4xl/[1.05]">
                    {f}
                  </span>
                  <span className="text-sm text-mute md:text-[14.5px]">Details on request</span>
                </span>
                <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
              </a>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-20 bg-night text-white">
        <div className="gutter grid items-start gap-12 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
          <Reveal className="flex flex-col gap-6 lg:col-span-5">
            <Eyebrow tone="light">Get in touch</Eyebrow>
            <h2 className="font-serif text-[52px]/[0.96] tracking-[-0.01em] md:text-[84px]/[0.96]">
              Let's talk <Em light>sponsorship</Em>
            </h2>
            <p className="text-[15px]/[1.75] text-mist md:text-base/[1.75]">
              Tell us about your firm and what you'd like to run with EMFC: talent events, workshops,
              sponsored content or a full-year partnership. Your message goes straight to the
              Co-Presidents and the Head of Corporate Relations, and we'll come back within a few
              working days.
            </p>
            <div className="mt-2 flex flex-col gap-3 border-t border-white/20 pt-6">
              <span className="caps text-[10px] tracking-[0.22em] text-haze md:text-[10.5px]">
                Or find us on LinkedIn
              </span>
              <a href={SOCIAL.linkedin} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-white self-start">
                <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
                EMFC on LinkedIn
              </a>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            {status === "sent" ? (
              <div role="status" className="flex flex-col gap-5 bg-paper p-8 text-ink md:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
                  <Check className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="font-serif text-[34px]/[1.1] md:text-[40px]/[1.1]">Thank you, {form.name.split(" ")[0]}.</p>
                <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">
                  Your enquiry has reached the team. We'll reply to {form.email} within a few working days.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="grid gap-5 bg-paper p-6 text-ink sm:grid-cols-2 md:p-10">
                <div className="flex flex-col gap-2">
                  <label htmlFor="sp-name" className={labelClass}>
                    Your name
                  </label>
                  <input
                    id="sp-name"
                    required
                    minLength={2}
                    maxLength={120}
                    autoComplete="name"
                    value={form.name}
                    onChange={set("name")}
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="sp-firm" className={labelClass}>
                    Firm
                  </label>
                  <input
                    id="sp-firm"
                    required
                    minLength={2}
                    maxLength={160}
                    autoComplete="organization"
                    value={form.firm}
                    onChange={set("firm")}
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="sp-email" className={labelClass}>
                    Work email
                  </label>
                  <input
                    id="sp-email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    placeholder="name@firm.com"
                    value={form.email}
                    onChange={set("email")}
                    className={fieldClass}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="sp-format" className={labelClass}>
                    Interested in
                  </label>
                  <select
                    id="sp-format"
                    value={form.format}
                    onChange={set("format")}
                    className={cn(fieldClass, "px-3")}
                  >
                    {FORMATS.map((f) => (
                      <option key={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label htmlFor="sp-msg" className={labelClass}>
                    What would you like to run with EMFC?
                  </label>
                  <textarea
                    id="sp-msg"
                    rows={5}
                    required
                    minLength={10}
                    maxLength={4000}
                    value={form.message}
                    onChange={set("message")}
                    className={cn(fieldClass, "h-auto resize-y py-3.5 leading-normal")}
                  />
                </div>
                {/* Left empty by people; bots fill it in. */}
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label htmlFor="sp-website">Website</label>
                  <input
                    id="sp-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={set("website")}
                  />
                </div>
                <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                  {status === "error" ? (
                    <span role="alert" className="text-[13.5px]/[1.5] text-[#B4435A]">
                      Your enquiry could not be sent. Please try again in a moment, or message us on LinkedIn.
                    </span>
                  ) : (
                    <span className="text-[13.5px]/[1.5] text-mute">
                      We only use your details to answer this enquiry.
                    </span>
                  )}
                  <button type="submit" disabled={status === "sending"} className="btn btn-ink shrink-0 disabled:opacity-70">
                    {status === "sending" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.75} />
                        Sending
                      </>
                    ) : (
                      <>
                        Send enquiry
                        <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
