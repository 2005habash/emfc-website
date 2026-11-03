import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Reveal } from "@/components/Reveal";
import { Hey, KOSTYA_CSS, Portrait, TipJar } from "@/components/kostya/Kostya";
import { memberByName } from "@/lib/team";

// emfc.es/kostya: a tribute to Constantin "Kostya" Molineus, Vice-President of the M&A desk, as a man
// of very particular business (3 November 2026). A joke he agreed to. Everything is innuendo, and only
// about him: never about anyone else in the club. Not linked from the menus, kept out of search engines.
export const Route = createFileRoute("/kostya")({
  head: () => ({
    meta: [
      { title: "Kostya, EMFC" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Heyyyyy." },
    ],
  }),
  component: KostyaPage,
});

const kostya = memberByName("Constantin Molineus")!;

const NUMBERS = [
  { value: "9", label: "Gold rings", note: "One finger stays free. For counting." },
  { value: "2", label: "Phones", note: "One for the club. One for the other business." },
  { value: "4", label: "Fur coats", note: "Barcelona is 24 degrees. He wears them anyway." },
  { value: "70%", label: "His cut", note: "Of everything. Non-negotiable." },
  { value: "0", label: "Nights off this year", note: "The night shift doesn't run itself." },
  { value: "1", label: "Cane", note: "He doesn't need it to walk." },
];

const SKILLS = [
  { what: "Deal flow.", how: "Mostly after midnight." },
  { what: "Client care.", how: "His clients always come back." },
  { what: "Negotiation.", how: "He has never once taken less than his cut." },
  { what: "Presence.", how: "He walks into a room and the room starts paying. Attention, mostly." },
  { what: "Discretion.", how: "What happens with Kostya stays with Kostya." },
];

const THINGS = [
  { quote: "It is 24 degrees in Barcelona. He wears me anyway.", by: "His fur coat" },
  { quote: "I only ring after midnight. He always picks up.", by: "His second phone" },
  { quote: "He doesn't lean on me. He just likes being seen with me.", by: "His gold cane" },
  { quote: "Nobody asked for a chalice at the club dinner. He brought his own.", by: "His gold chalice" },
  { quote: "Double-parked outside ESADE every single day. Not one ticket.", by: "His Cadillac" },
  { quote: "He doesn't need me. He keeps every number in his head, especially what he's owed.", by: "His Excel model" },
];

function KostyaPage() {
  return (
    <SiteLayout>
      <style>{KOSTYA_CSS}</style>
      <Hey />
      <div className="kostya bg-[var(--k-velvet)] text-[var(--k-cream)]">
        {/* The man */}
        <section className="gutter grid items-center gap-14 pb-20 pt-14 md:pt-20 lg:grid-cols-12 lg:gap-10 lg:pb-28">
          <div className="lg:col-span-7">
            <p className="caps text-[11px] tracking-[0.24em] text-[var(--k-gold)]">{kostya.title}</p>
            <h1 className="mt-5 font-serif text-[clamp(104px,18vw,248px)]/[0.85] italic tracking-[-0.02em] text-[var(--k-gold)]">Kostya</h1>
            <p className="mt-8 max-w-[540px] text-lg/[1.65]">
              On paper, Constantin Molineus, Vice-President of the club's {"M&A"} desk. To everyone who matters, Kostya. He
              handles mergers and acquisitions. Mostly the acquisitions.
            </p>
          </div>
          <div className="lg:col-span-5">
            <Portrait src={kostya.photo!} />
          </div>
        </section>

        <div aria-hidden className="kostya-leopard h-7 md:h-9" />

        {/* By the numbers */}
        <section className="bg-[var(--k-velvet-deep)]">
          <div className="gutter py-20 md:py-28">
            <h2 className="font-serif text-5xl/[1] md:text-7xl/[1]">Kostya, by the numbers</h2>
            <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {NUMBERS.map((n, i) => (
                <Reveal key={n.label} delay={(i % 3) * 0.08}>
                  <p className="font-serif text-7xl/none text-[var(--k-gold)] [font-variant-numeric:lining-nums] md:text-8xl/none">{n.value}</p>
                  <p className="mt-4 text-lg font-medium">{n.label}</p>
                  <p className="mt-1 text-base text-[var(--k-lilac)]">{n.note}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The skills */}
        <section className="gutter grid gap-10 py-20 md:py-28 lg:grid-cols-12">
          <h2 className="font-serif text-5xl/[1] md:text-7xl/[1] lg:col-span-5">What he brings to the desk</h2>
          <ul className="flex flex-col gap-8 lg:col-span-7">
            {SKILLS.map((s, i) => (
              <li key={s.what}>
                <Reveal delay={i * 0.06} className="font-serif text-2xl/[1.25] md:text-4xl/[1.2]">
                  <span className="text-[var(--k-gold)]">{s.what}</span> {s.how}
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* His things */}
        <section className="bg-[var(--k-velvet-deep)]">
          <div className="gutter py-20 md:py-28">
            <h2 className="font-serif text-5xl/[1] md:text-7xl/[1]">His things speak for him</h2>
            <div className="mt-14 grid gap-x-12 gap-y-12 md:grid-cols-2">
              {THINGS.map((t, i) => (
                <Reveal key={t.by} delay={(i % 2) * 0.08}>
                  <blockquote className="font-serif text-2xl/[1.35] italic md:text-3xl/[1.35]">“{t.quote}”</blockquote>
                  <p className="mt-3 text-base text-[var(--k-gold)]">{t.by}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* The tip jar */}
        <section className="gutter flex flex-col items-center gap-8 py-20 text-center md:py-28">
          <h2 className="font-serif text-5xl/[1] md:text-7xl/[1]">Kostya always gets paid</h2>
          <p className="max-w-[520px] text-lg/[1.65]">Show your appreciation. He accepts tips, and he never forgets a face.</p>
          <TipJar />
        </section>

        {/* The close */}
        <section className="kostya-leopard">
          <div className="gutter flex flex-col items-center gap-10 py-20 text-center md:py-24">
            <p className="font-serif text-[clamp(72px,13vw,180px)]/[0.9] italic text-[#2a0b36]">Heyyyyy.</p>
            <p className="max-w-[560px] bg-[var(--k-velvet)] px-5 py-3 text-base text-[var(--k-cream)]">
              A joke page, made with Kostya's blessing. Any resemblance to a real business is purely coincidental.
            </p>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
