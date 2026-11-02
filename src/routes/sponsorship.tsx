import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Em, Eyebrow, Numeral, PageHero } from "@/components/site/ui";
import { IMAGES, ROMAN, SPONSORSHIP_EMAIL } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/sponsorship")({
  head: () => ({
    meta: [
      { title: "Sponsorship, EMFC" },
      {
        name: "description",
        content:
          "Partner with EMFC to reach a curated pipeline of ESADE MSc Finance talent through workshops, events and brand visibility.",
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
  { value: "MSc", label: "Finance students at ESADE" },
  { value: "90%+", label: "International cohort" },
  { value: "04", label: "Investment desks: IB, PM, AM, FI" },
  { value: "2026", label: "Founding year · Barcelona" },
];

const benefits = [
  {
    title: "Talent Pipeline",
    body: "Direct access to a hand-picked cohort of ESADE MSc Finance students targeting Investment Banking, Private Equity, Asset Management and Fixed Income.",
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

const formats = ["Talent events", "Workshops", "Sponsored content", "Full-year partnership"];

const fieldClass =
  "h-[52px] rounded border border-mute bg-field px-4 text-base text-ink outline-offset-2 placeholder:text-mute focus-visible:outline-2 focus-visible:outline-ink";
const labelClass = "caps text-[10px] tracking-[0.2em] text-mute md:text-[10.5px]";

function SponsorshipPage() {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    email: "",
    format: formats[0],
    message: "",
  });
  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // There is no enquiry backend yet, so the form opens a pre-filled email in the sender's mail app.
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `EMFC Sponsorship Enquiry${form.firm ? `: ${form.firm}` : ""}`;
    const body = [
      `Name: ${form.name}`,
      `Firm: ${form.firm}`,
      `Email: ${form.email}`,
      `Interested in: ${form.format}`,
      "",
      form.message,
    ].join("\n");
    window.location.href = `mailto:${SPONSORSHIP_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
        The ESADE Master's Finance Club is a member-driven community of MSc Finance students
        preparing for careers across banking, private capital and markets. Sponsors join us for the
        people, the reach, and a direct line into the next intake of ESADE finance talent.
      </PageHero>

      {/* Audience facts */}
      <section aria-label="The EMFC audience" className="border-b border-line">
        <dl className="gutter grid grid-cols-2 lg:grid-cols-4">
          {facts.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "flex flex-col gap-2.5 py-7 lg:py-9 lg:pb-10",
                i % 2 === 1 && "border-l border-line pl-5",
                i < 2 && "border-b border-line lg:border-b-0",
                i > 0 && "lg:border-l lg:border-line lg:pl-8",
              )}
            >
              <dd className="font-serif text-[40px]/none font-medium md:text-[52px]/none">
                {f.value}
              </dd>
              <dt className="caps text-[9.5px] tracking-[0.2em] text-mute md:text-[10.5px]">
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
            {formats.map((f, i) => (
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
              Tell us about your firm and what you'd like to run with EMFC — talent events,
              workshops, sponsored content or a full-year partnership. We'll come back within a few
              working days.
            </p>
            <div className="mt-2 flex flex-col gap-2 border-t border-white/20 pt-6">
              <span className="caps text-[10px] tracking-[0.22em] text-haze md:text-[10.5px]">
                Or write directly to
              </span>
              <a
                href={`mailto:${SPONSORSHIP_EMAIL}?subject=EMFC%20Sponsorship%20Enquiry`}
                className="font-serif text-[22px]/[1.15] break-all underline decoration-1 underline-offset-[6px] md:text-3xl/[1.15]"
              >
                {SPONSORSHIP_EMAIL}
              </a>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-6 lg:col-start-7">
            <form
              onSubmit={submit}
              className="grid gap-5 bg-paper p-6 text-ink sm:grid-cols-2 md:p-10"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="sp-name" className={labelClass}>
                  Your name
                </label>
                <input
                  id="sp-name"
                  required
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
                  {formats.map((f) => (
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
                  value={form.message}
                  onChange={set("message")}
                  className={cn(fieldClass, "h-auto resize-y py-3.5 leading-normal")}
                />
              </div>
              <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <span className="text-[13.5px]/[1.5] text-mute">
                  Opens a pre-filled email in your mail app.
                </span>
                <button type="submit" className="btn btn-ink shrink-0">
                  Send enquiry
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
    </SiteLayout>
  );
}
