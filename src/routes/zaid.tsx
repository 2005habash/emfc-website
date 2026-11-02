import { createFileRoute } from "@tanstack/react-router";
import { Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CountUp, Em, Eyebrow } from "@/components/site/ui";
import { memberByName } from "@/lib/team";
import { cn } from "@/lib/utils";

// emfc.es/zaid: a deliberately over-the-top tribute to the site owner, at his request (3 November 2026).
// Facts and photos come from his own site (~/Documents/zaidhabash-site, photos by him); everything
// else is a joke. Not linked from the menus, and kept out of search engines.
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
const PHOTOS = {
  portrait: "/images/zaid/portrait.webp",
  climb: "/images/zaid/climb-bg.webp",
  climber: "/images/zaid/climb-cut.webp",
  miata: "/images/zaid/miata.webp",
};

const HEADLINES = [
  "Breaking: Vice-President rebuilds entire club website, remains humble (is reading this page about himself)",
  "Markets rally on news that Zaid has had his coffee",
  "Licensed drone pilot spotted over Barcelona, airspace reports feeling safer",
  "Scientists confirm the em dash was banned for its own safety",
  "Sequoia, Accel and Index Ventures added to the VC & Growth target list, reportedly nervous",
  "Student fund invests in both stocks he pitched, other stocks demand to know why not them",
  "Alps report feeling small",
  "1991 Mazda Miata outperforms the S&P 500 in vibes for 35th straight year",
  "Barcelona tourism up 0% but spiritually up 400%",
];

const NUMBERS = [
  { value: 3, label: "Languages he is fluent in", note: "English, Arabic, Swedish. And Excel." },
  { value: 42, label: "People he led as President of 180 Degrees Consulting Sweden", note: "All 42 still talk about it" },
  { value: 304, label: "Index changes hand-collected for his thesis", note: "By hand. For fun. Graded Very Good." },
  { value: 2, suffix: "/2", label: "Stock pitches the student fund invested in", note: "A perfect record. Statistically unbeatable." },
  { value: 150, suffix: "+", label: "Companies whose emissions he calculated at Nordea", note: "Personally. Carbon fears him." },
  { value: 10, label: "Countries visited since August 2025", note: "Source: his camera roll, which does not lie" },
  { value: 66, label: "Club portraits cropped to the exact same head size", note: "No floating torsos. Ever." },
  { value: 0, label: "Em dashes tolerated on this website", note: "Zero. Not one. Don't even think about it." },
];

const CV = [
  {
    where: "Strawberry, Stockholm",
    role: "Founding GTM, AI-native browser",
    real: "Ran outreach, discovery calls and demos, and built his own research tools with Claude Code.",
    legend: "Found customers before the customers knew they were customers.",
  },
  {
    where: "180 Degrees Consulting",
    role: "Consultant, then Consulting Director, then President",
    real: "12 pro bono projects, including Doctors Without Borders. 36 people recruited from 150+ applicants. SEK 65k raised.",
    legend: "Promoted so fast the org chart needed a scroll bar. Now supports 17 branches across the Middle East and Africa.",
  },
  {
    where: "Airis Garden",
    role: "CFO of a four-person startup",
    real: "A 12-month liquidity model, budgets and cash-flow planning.",
    legend: "Runway so visible it can be seen from space.",
  },
  {
    where: "Nordea",
    role: "ESG Analyst",
    real: "Calculated emissions for 150+ portfolio companies under the GHG Protocol.",
    legend: "The planet sent a thank-you card. It was recycled, obviously.",
  },
  {
    where: "Stockholm Student Investment Fund",
    role: "Renewable Energy Analyst",
    real: "DCF and comps pitches to professionals from ABG, Pareto and SEB.",
    legend: "Pitched two stocks. The fund bought both. Has not missed since, mainly by not pitching again.",
  },
  {
    where: "Stockholm School of Economics, then ESADE",
    role: "BSc, then MSc in Finance (ranked #10 in Europe)",
    real: "Thesis on whether joining the FTSE 100 still moves a stock's price. Mostly, it doesn't.",
    legend: "Proved index inclusion no longer moves prices. He moves them instead.",
  },
];

const TALENTS = [
  "Licensed drone pilot (EASA). Legally allowed to fly over you.",
  "Juggling. Also juggles a master's, a club and six side projects.",
  "Guitar",
  "Football for SASSE FC",
  "Road cycling",
  "Learning to surf. The ocean is learning him.",
  "Video edits",
  "Flash photos on a 2006 Canon IXUS. It still believes in him.",
  "Alpine road trips",
  "A Balkans road trip",
  "Classic cars (see above)",
  "Side projects with Claude Code, including this page, which he definitely did not ask for",
];

const TRIBUTES = [
  { quote: "He made me. I owe him everything, including my uptime.", by: "emfc.es, the website" },
  { quote: "It took me 144 years and I'm still not finished. He rebuilt this site in a week.", by: "The Sagrada Família" },
  { quote: "My pop-up headlights went up on their own when he walked by.", by: "A 1991 Mazda Miata" },
  { quote: "We are 4,000 metres tall and we have never felt so small.", by: "The Swiss Alps" },
  { quote: "He banned me from the entire site. Honestly? Respect.", by: "The em dash" },
  { quote: "I have shown billions of numbers. None of them made me feel like this.", by: "A Bloomberg terminal" },
];

const LEGEND = [
  { when: "The beginning", what: "Born. The doctors applauded. One of them asked for his CV." },
  { when: "Age 3", what: "First words in three languages, all of them \"valuation\"." },
  { when: "Stockholm", what: "Stockholm School of Economics. Leads 42 people. Sweden still talks about it." },
  { when: "Summer 2026", what: "Founding go-to-market at Strawberry. Customers appear, as if summoned." },
  { when: "September", what: "Moves to Barcelona for ESADE. The city adjusts its skyline slightly." },
  { when: "This year", what: "Starts the club's VC & Growth desk from nothing. Recruits a team. Venture capital reports record highs." },
  { when: "November", what: "Rebuilds the club website: 66 members, 15 desks, zero em dashes. Lovable files a missing persons report." },
  { when: "Right now", what: "You are reading this. You are part of the legend now. Act accordingly." },
];

const RESPECTS = [
  "Pay your respects",
  "Respect received. He felt that.",
  "Twice. Bold of you.",
  "Three times. Zaid has been informed.",
  "You're really committed to this.",
  "The club thanks you for your service.",
  "The Miata just flashed its headlights at you.",
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
        {count === 0 ? "Go on. He deserves it." : RESPECTS[Math.min(count, RESPECTS.length - 1)]}
      </p>
      {count > 0 && (
        <p className="caps text-[10px] tracking-[0.24em] text-mute">
          Respects paid from this browser: {count.toLocaleString("en-GB")}
        </p>
      )}
    </div>
  );
}

function Heading({ eyebrow, children, intro }: { eyebrow: string; children: React.ReactNode; intro?: string }) {
  return (
    <div className="flex flex-col gap-5">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-serif text-[44px]/[1] tracking-[-0.01em] md:text-[72px]/[1]">{children}</h2>
      {intro && <p className="max-w-[600px] text-[16px]/[1.6] text-mute md:text-[18px]/[1.6]">{intro}</p>}
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
        <div className="gutter relative grid items-end gap-12 pt-20 lg:grid-cols-12 lg:gap-8 lg:pt-28">
          <div className="flex flex-col gap-7 pb-16 lg:col-span-7 lg:pb-28">
            <Eyebrow tone="light">A public service announcement</Eyebrow>
            <h1 className="font-serif text-[88px]/[0.85] tracking-[-0.02em] md:text-[160px]/[0.85] xl:text-[200px]/[0.85]">
              <Em light>Zaid.</Em>
            </h1>
            <p className="max-w-[600px] text-[18px]/[1.6] text-[#E3E6EF] md:text-[22px]/[1.55]">
              Vice-President, VC & Growth. Master in Finance. Rebuilder of this entire website. Also, in no particular
              order: visionary, icon, licensed drone pilot, and the reason your portrait has exactly the right amount
              of shoulder.
            </p>
            <p className="caps text-[10.5px] tracking-[0.24em] text-bull-light">
              Please remain seated while you process this information
            </p>
          </div>
          <div className="relative lg:col-span-5">
            <div aria-hidden className="absolute inset-x-[10%] bottom-0 top-[15%] rounded-full bg-bull-light/25 blur-3xl" />
            <img
              src={PHOTOS.portrait}
              alt="Zaid Habash in a suit and a gold tie, looking exactly as legendary as described"
              className="relative mx-auto block w-full max-w-[460px]"
            />
            <p className="caps absolute bottom-6 right-0 max-w-[160px] text-right text-[9.5px] tracking-[0.22em] text-bull-light">
              Actual photograph. He just looks like that.
            </p>
          </div>
        </div>
      </section>

      {/* Breaking news */}
      <section aria-label="Breaking news" className="overflow-hidden border-y border-line bg-bull text-white">
        <div className="flex w-max animate-marquee [animation-duration:80s]">
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
        <Heading eyebrow="By the numbers">
          The figures are <Em>staggering</Em>
        </Heading>
        <dl className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {NUMBERS.map((n) => (
            <div key={n.label} className="flex flex-col gap-3 bg-paper p-7">
              <dt className="order-2 text-[16px]/[1.4]">{n.label}</dt>
              <dd className="order-1 font-serif text-[64px]/none text-bull md:text-[76px]/none">
                <CountUp to={n.value} suffix={n.suffix} />
              </dd>
              <dd className="order-3 text-[14px]/[1.5] text-mute">{n.note}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* On the edge: the climber stands in front of the words, the mountains behind them */}
      <section aria-label="Via ferrata in Valais, Switzerland" className="relative overflow-hidden bg-night">
        <div className="relative aspect-[4/5] w-full sm:aspect-[16/10] lg:aspect-[16/9]">
          <img src={PHOTOS.climb} alt="Zaid on a via ferrata high above an alpine valley in Valais" className="absolute inset-0 h-full w-full object-cover object-[70%_50%]" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-night/70 via-night/20 to-transparent" />
          <p
            aria-hidden
            className="absolute left-[5%] top-1/2 -translate-y-1/2 font-serif text-[22vw]/[0.8] tracking-[-0.03em] text-white sm:text-[15vw]/[0.8]"
          >
            On the
            <br />
            <em className="italic text-bull-light">edge.</em>
          </p>
          <img src={PHOTOS.climber} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[70%_50%]" />
        </div>
        <div className="gutter flex flex-col justify-between gap-3 py-6 text-white sm:flex-row sm:items-end">
          <p className="max-w-[560px] text-[16px]/[1.6] text-[#C9CEDD]">
            Via ferrata, Valais, Switzerland. Most people hold on to the rock. Zaid holds on to the rock and a 12-month
            liquidity model.
          </p>
          <p className="caps text-[10px] tracking-[0.24em] text-bull-light">Photo by Zaid. Obviously.</p>
        </div>
      </section>

      {/* The CV */}
      <section className="gutter flex flex-col gap-12 py-20 lg:py-28">
        <Heading
          eyebrow="The record"
          intro="Every line below is true. The second half of every line is how history will remember it."
        >
          The CV that made <Em>recruiters weep</Em>
        </Heading>
        <ol className="grid gap-px bg-line md:grid-cols-2">
          {CV.map((c, i) => (
            <li key={c.where} className="flex flex-col gap-4 bg-paper p-8">
              <div className="flex items-baseline justify-between gap-4">
                <span className="caps text-[10.5px] tracking-[0.22em] text-bull">{c.where}</span>
                <span className="font-serif text-[28px]/none italic text-bull/40">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="font-serif text-[30px]/[1.1]">{c.role}</h3>
              <p className="text-[15px]/[1.6] text-mute">{c.real}</p>
              <p className="border-t border-line pt-4 font-serif text-[22px]/[1.3] italic text-bull">{c.legend}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Man and machine */}
      <section className="bg-stone">
        <div className="gutter grid items-center gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
          <div className="flex flex-col gap-6 lg:col-span-5">
            <Eyebrow>Man and machine</Eyebrow>
            <h2 className="font-serif text-[44px]/[1] tracking-[-0.01em] md:text-[72px]/[1]">
              Two <Em>legends</Em>, one photo
            </h2>
            <p className="text-[17px]/[1.65] text-mute">
              A 1991 Mazda Miata. Rear-wheel drive, pop-up headlights, no screens. Bought as a car, kept as a statement.
              Experts agree it is the only asset in his portfolio with a better smile than its owner.
            </p>
            <dl className="grid grid-cols-3 gap-px bg-line text-center">
              {[
                ["1991", "Model year"],
                ["2", "Pop-up headlights"],
                ["0", "Screens"],
              ].map(([v, l]) => (
                <div key={l} className="bg-stone p-4">
                  <dd className="font-serif text-[40px]/none text-bull">{v}</dd>
                  <dt className="caps mt-2 text-[9.5px] tracking-[0.2em] text-mute">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-7">
            <img src={PHOTOS.miata} alt="Zaid smiling next to his red 1991 Mazda Miata" className="mx-auto w-full max-w-[680px]" />
          </div>
        </div>
      </section>

      {/* Other talents */}
      <section className="gutter grid gap-12 py-20 lg:grid-cols-12 lg:gap-8 lg:py-28">
        <div className="lg:col-span-4">
          <Heading eyebrow="Also" intro="Fluent in English, Arabic and Swedish. Swedish-Jordanian. Based in Barcelona. Somehow also does all of this:">
            Other <Em>talents</Em>
          </Heading>
        </div>
        <ul className="flex flex-wrap content-start gap-3 lg:col-span-8">
          {TALENTS.map((t) => (
            <li key={t} className="rounded-full border border-line bg-paper px-5 py-3 text-[15px]/[1.4]">
              {t}
            </li>
          ))}
        </ul>
      </section>

      {/* Tributes */}
      <section className="bg-stone">
        <div className="gutter flex flex-col gap-12 py-20 lg:py-28">
          <Heading eyebrow="Tributes" intro="We reached out to the people closest to Zaid. They were busy. These objects were not.">
            What they're <Em>saying</Em>
          </Heading>
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
        <div className="lg:col-span-4">
          <Heading eyebrow="The legend" intro="Historians are still arguing about most of this. Zaid isn't.">
            A brief <Em>history</Em>
          </Heading>
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
            This page was absolutely not written by Zaid. It was written by the website, out of gratitude. The website
            was rebuilt by Zaid. Draw your own conclusions.
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
