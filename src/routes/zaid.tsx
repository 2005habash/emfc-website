import { createFileRoute } from "@tanstack/react-router";
import { Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CountUp, Em, Eyebrow } from "@/components/site/ui";
import { memberByName } from "@/lib/team";
import { cn } from "@/lib/utils";

// emfc.es/zaid: a deliberately over-the-top tribute to the site owner, at his request (3 November 2026).
// Not linked from the menus, and kept out of search engines.
export const Route = createFileRoute("/zaid")({
  head: () => ({
    meta: [
      { title: "Zaid, EMFC" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "A moment of appreciation. A long moment." },
    ],
  }),
  component: ZaidPage,
});

const zaid = memberByName("Zaid Habash")!;

const HEADLINES = [
  "Breaking: Vice-President builds entire club website, remains humble (is writing this page about himself)",
  "Markets rally on news that Zaid has had his coffee",
  "Lovable files missing persons report for emfc.es",
  "Scientists confirm the em dash was banned for its own safety",
  "Sequoia, Accel and Index Ventures reportedly still talking about him",
  "Local VC & Growth desk grows, experts say this is not a coincidence",
  "Barcelona tourism up 0% but spiritually up 400%",
];

const NUMBERS = [
  { value: 1, label: "Club website, rebuilt from scratch", note: "Lovable is still processing it" },
  { value: 66, label: "Portraits cropped to the exact same head size", note: "No floating torsos. Ever." },
  { value: 0, label: "Em dashes tolerated", note: "Zero. Not one. Don't even think about it." },
  { value: 3, label: "Legendary VC firms on his profile", note: "Sequoia, Accel, Index. Casual." },
  { value: 15, label: "Desk pages, each with its own personality", note: "Like children. He has favourites." },
  { value: 100, suffix: "%", label: "Of this page written about Zaid", note: "As it should be" },
];

const TRIBUTES = [
  { quote: "He made me. I owe him everything, including my uptime.", by: "emfc.es, the website" },
  { quote: "It took me 144 years and I'm still not finished. He did his in a week.", by: "The Sagrada Família" },
  { quote: "He banned me from the entire site. Honestly? Respect.", by: "The em dash" },
  { quote: "I have shown billions of numbers. None of them made me feel like this.", by: "A Bloomberg terminal" },
  { quote: "Notifications: yes. All of them. Constantly.", by: "His LinkedIn" },
  { quote: "We were honoured to host him. We would like him to stay.", by: "Barcelona" },
];

const LEGEND = [
  { when: "The beginning", what: "Born. The doctors applauded. One of them asked for his CV." },
  { when: "Age 3", what: "First word: \"valuation\". Second word: \"multiple\"." },
  { when: "Later", what: "Joins the Master in Finance at ESADE. The building gets slightly taller." },
  { when: "2026", what: "Becomes Vice-President, VC & Growth. Venture capital and growth both report record highs." },
  { when: "October", what: "Looks at the club website. The club website looks back, nervously." },
  { when: "November", what: "Rebuilds it entirely. 66 members, 15 desks, zero em dashes. History is made." },
  { when: "Right now", what: "You are reading this. You are part of the legend now. Act accordingly." },
];

const RESPECTS = [
  "Pay your respects",
  "Respect received. He felt that.",
  "Twice. Bold of you.",
  "Three times. Zaid has been informed.",
  "You're really committed to this.",
  "The club thanks you for your service.",
  "Okay, he's blushing now.",
  "This is getting emotional.",
  "Legends recognise legends.",
  "Keep going. History is watching.",
];

function Respects() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    try {
      setCount(Number(localStorage.getItem("emfc-respects") ?? 0) || 0);
    } catch {
      // Private mode: start from zero.
    }
  }, []);
  const pay = () => {
    const next = count + 1;
    setCount(next);
    try {
      localStorage.setItem("emfc-respects", String(next));
    } catch {
      // Not remembered, still respected.
    }
  };
  const message = count === 0 ? RESPECTS[0] : RESPECTS[Math.min(count, RESPECTS.length - 1)];
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <button
        type="button"
        onClick={pay}
        className={cn(
          "btn btn-ink h-16 px-10 text-[12px] transition-transform active:scale-95",
          count > 0 && "animate-[respect_0.4s_ease-out]",
        )}
        key={count}
      >
        {count === 0 ? "Pay your respects" : "Pay more respects"}
      </button>
      <p className="font-serif text-[26px]/[1.2] italic text-bull md:text-[32px]/[1.2]" aria-live="polite">
        {count === 0 ? "Go on. He deserves it." : message}
      </p>
      {count > 0 && (
        <p className="caps text-[10px] tracking-[0.24em] text-mute">
          Respects paid from this browser: {count.toLocaleString("en-GB")}
        </p>
      )}
    </div>
  );
}

function ZaidPage() {
  return (
    <SiteLayout>
      <style>{`@keyframes respect { 0% { transform: scale(1) } 40% { transform: scale(1.12) rotate(-2deg) } 100% { transform: scale(1) } }`}</style>

      {/* The arrival */}
      <section className="relative overflow-hidden bg-night text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[10vw] top-1/2 -translate-y-1/2 select-none font-serif text-[48vw]/none italic text-white/[0.04]"
        >
          Z
        </div>
        <div className="gutter relative grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
          <div className="flex flex-col gap-7 lg:col-span-7">
            <Eyebrow tone="light">A public service announcement</Eyebrow>
            <h1 className="font-serif text-[88px]/[0.85] tracking-[-0.02em] md:text-[160px]/[0.85] xl:text-[200px]/[0.85]">
              <Em light>Zaid.</Em>
            </h1>
            <p className="max-w-[600px] text-[18px]/[1.6] text-[#E3E6EF] md:text-[22px]/[1.55]">
              Vice-President, VC & Growth. Master in Finance. Builder of this entire website. Also, in no particular
              order: visionary, icon, the reason your portrait has exactly the right amount of shoulder.
            </p>
            <p className="caps text-[10.5px] tracking-[0.24em] text-bull-light">
              Please remain seated while you process this information
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-[420px]">
              <div aria-hidden className="absolute -inset-4 rounded-full bg-bull-light/20 blur-3xl" />
              <div className="relative border border-bull-light/50 bg-white p-3 shadow-[0_30px_80px_rgb(0_0_0/0.45)]">
                <img src={zaid.photo} alt="Zaid Habash, looking exactly as legendary as described" className="aspect-square w-full object-cover" />
              </div>
              <p className="caps mt-4 text-center text-[10px] tracking-[0.24em] text-bull-light">
                Actual photograph. Not retouched. He just looks like that.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Breaking news */}
      <section aria-label="Breaking news" className="overflow-hidden border-y border-line bg-bull text-white">
        <div className="flex w-max animate-marquee [animation-duration:60s]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-12 py-4 pr-12">
              {HEADLINES.map((h) => (
                <li key={h} className="caps flex items-center gap-12 whitespace-nowrap text-[11px] tracking-[0.2em]">
                  {h}
                  <span aria-hidden className="text-white/50">
                    ✦
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>

      {/* The numbers */}
      <section className="gutter flex flex-col gap-12 py-20 lg:py-28">
        <div className="flex flex-col gap-5">
          <Eyebrow>By the numbers</Eyebrow>
          <h2 className="font-serif text-[44px]/[1] tracking-[-0.01em] md:text-[72px]/[1]">
            The figures are <Em>staggering</Em>
          </h2>
        </div>
        <dl className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {NUMBERS.map((n) => (
            <div key={n.label} className="flex flex-col gap-3 bg-paper p-8">
              <dt className="order-2 text-[17px]/[1.4]">{n.label}</dt>
              <dd className="order-1 font-serif text-[72px]/none text-bull md:text-[88px]/none">
                <CountUp to={n.value} suffix={n.suffix} />
              </dd>
              <dd className="order-3 text-[14px]/[1.5] text-mute">{n.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tributes */}
      <section className="bg-stone">
        <div className="gutter flex flex-col gap-12 py-20 lg:py-28">
          <div className="flex flex-col gap-5">
            <Eyebrow>Tributes</Eyebrow>
            <h2 className="font-serif text-[44px]/[1] tracking-[-0.01em] md:text-[72px]/[1]">
              What they're <Em>saying</Em>
            </h2>
            <p className="max-w-[560px] text-[16px]/[1.6] text-mute">
              We reached out to the people closest to Zaid. They were busy. These objects were not.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TRIBUTES.map((t) => (
              <figure key={t.by} className="flex flex-col justify-between gap-8 border border-line bg-paper p-8">
                <blockquote className="font-serif text-[26px]/[1.25] italic">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="caps text-[10px] tracking-[0.22em] text-bull">{t.by}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* The legend */}
      <section className="gutter grid gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <Eyebrow>The legend</Eyebrow>
          <h2 className="font-serif text-[44px]/[1] tracking-[-0.01em] md:text-[72px]/[1]">
            A brief <Em>history</Em>
          </h2>
          <p className="text-[16px]/[1.6] text-mute">Historians are still arguing about most of this. Zaid isn't.</p>
        </div>
        <ol className="flex flex-col lg:col-span-8">
          {LEGEND.map((l, i) => (
            <li key={l.when} className="grid gap-2 border-t border-line py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
              <span className="caps text-[10.5px] tracking-[0.22em] text-bull">
                {String(i + 1).padStart(2, "0")}. {l.when}
              </span>
              <span className="text-[18px]/[1.5]">{l.what}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Respects */}
      <section className="border-y border-line bg-paper">
        <div className="gutter flex flex-col items-center gap-8 py-20 lg:py-28">
          <Eyebrow center>Audience participation</Eyebrow>
          <h2 className="text-center font-serif text-[44px]/[1] tracking-[-0.01em] md:text-[72px]/[1]">
            Now it's your <Em>turn</Em>
          </h2>
          <Respects />
        </div>
      </section>

      {/* Curtain */}
      <section className="bg-night text-white">
        <div className="gutter flex flex-col items-center gap-8 py-24 text-center lg:py-32">
          <p className="caps text-[10.5px] tracking-[0.24em] text-bull-light">In conclusion</p>
          <p className="font-serif text-[64px]/[0.95] tracking-[-0.015em] md:text-[120px]/[0.95]">
            Thank you, <Em light>Zaid.</Em>
          </p>
          <p className="max-w-[560px] text-[16px]/[1.6] text-[#C9CEDD]">
            This page was absolutely not written by Zaid. It was written by the website, out of gratitude. The
            website was written by Zaid. Draw your own conclusions.
          </p>
          {zaid.linkedin && (
            <a href={zaid.linkedin} data-linkedin-of={zaid.name} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-white">
              <Linkedin className="h-3.5 w-3.5" strokeWidth={1.75} />
              Witness the LinkedIn
            </a>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
