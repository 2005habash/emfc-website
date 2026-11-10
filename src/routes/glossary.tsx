import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { GLOSSARY } from "@/components/fun/glossary";
import { Em, Eyebrow } from "@/components/site/ui";

export const Route = createFileRoute("/glossary")({
  head: () => ({
    meta: [
      { title: "Glossary, EMFC" },
      {
        name: "description",
        content:
          "Finance words, explained in a line: the jargon of the EMFC desks, from bulge brackets to unitranche.",
      },
    ],
  }),
  component: GlossaryPage,
});

// The desk pages' jargon, plus a few favourites from "Real or made up?".
const EXTRA = [
  { name: "Fallen angel", def: "A bond cut from investment grade to high yield." },
  { name: "Dead cat bounce", def: "A short rally in a market that keeps falling." },
  { name: "Pac-Man defence", def: "A target fights off a hostile bid by bidding for the bidder." },
  { name: "Matador bond", def: "A bond sold in Spain by a foreign issuer." },
  { name: "Sleeping beauty", def: "A company ripe for a takeover that nobody has approached yet." },
  { name: "Poison pill", def: "New shares issued to make a hostile takeover too expensive." },
  { name: "White knight", def: "A friendly buyer who rescues a target from a hostile bid." },
  {
    name: "Tombstone",
    def: "The announcement of a closed deal, listing the parties and their advisers.",
  },
  {
    name: "Carry",
    def: "A fund manager's share of the profits, usually 20%, once investors have their money back.",
  },
  {
    name: "Dry powder",
    def: "Money investors have committed to a fund that has not been invested yet.",
  },
];

/** "Glossary": every term the site explains, A to Z, with a search box. */
function GlossaryPage() {
  const [q, setQ] = useState("");
  const terms = useMemo(
    () =>
      [...GLOSSARY.map(({ name, def }) => ({ name, def })), ...EXTRA]
        .filter((t, i, all) => all.findIndex((x) => x.name === t.name) === i)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  const shown = terms.filter((t) =>
    `${t.name} ${t.def}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const letters = [...new Set(shown.map((t) => t.name[0].toUpperCase()))];

  return (
    <SiteLayout>
      <section className="gutter grid items-end gap-10 border-b border-line pb-12 pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-14 lg:pt-24">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <Eyebrow>Jargon, explained</Eyebrow>
          <h1 className="font-serif text-[64px]/[0.9] tracking-[-0.015em] md:text-[112px]/[0.9]">
            The <Em>glossary</Em>
          </h1>
          <p className="max-w-[520px] text-[15px]/[1.7] text-mute md:text-base/[1.7]">
            Every finance word the site uses, in one line each. For sponsors, first-years and anyone
            who has nodded along in a meeting.
          </p>
        </div>
        <div className="flex flex-col gap-2 lg:col-span-4 lg:col-start-9">
          <label htmlFor="glossary-search" className="caps text-[10px] tracking-[0.2em] text-mute">
            Search {terms.length} terms
          </label>
          <input
            id="glossary-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="LBO, spread, bulge bracket..."
            className="h-12 rounded-full border border-mute bg-field px-5 text-base text-ink placeholder:text-mute focus-visible:outline-2 focus-visible:outline-ink"
          />
        </div>
      </section>
      <section className="gutter py-12 lg:py-16">
        {shown.length === 0 && (
          <p className="font-serif text-[28px] italic text-mute">
            Not in here yet. Ask a member: that is what coffee chats are for.
          </p>
        )}
        <div className="flex flex-col">
          {letters.map((letter) => (
            <div
              key={letter}
              className="grid gap-4 border-t border-line py-8 md:grid-cols-[96px_minmax(0,1fr)]"
            >
              <span className="font-serif text-[56px]/none italic text-bull">{letter}</span>
              <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
                {shown
                  .filter((t) => t.name[0].toUpperCase() === letter)
                  .map((t) => (
                    <div key={t.name} className="flex flex-col gap-1.5">
                      <dt className="font-serif text-[26px]/[1.1]">{t.name}</dt>
                      <dd className="text-[15px]/[1.6] text-mute">{t.def}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          ))}
        </div>
        <Link to="/arcade" hash="real-or-made-up" className="btn btn-sm btn-outline-ink mt-6">
          Test yourself: real or made up?
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </section>
    </SiteLayout>
  );
}
