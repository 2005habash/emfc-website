import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { ActivityCard, CareerLadder } from "@/components/fun/OffTheClock";
import { MouseFree } from "@/components/fun/MouseFree";
import { TombstoneMaker } from "@/components/fun/TombstoneMaker";
import { useCareer } from "@/components/fun/career";
import { ACTIVITIES } from "@/components/fun/playground";
import { Em, Eyebrow } from "@/components/site/ui";

export const Route = createFileRoute("/play")({
  head: () => ({
    meta: [
      { title: "Off the clock, EMFC" },
      {
        name: "description",
        content:
          "Games and toys from the EMFC desks: find your desk, survive a Superday, call famous market days, run a paper LBO.",
      },
    ],
  }),
  component: PlayPage,
});

const GROUPS = [
  { kind: "game", title: "Games", note: "A few minutes each, and you learn something." },
  { kind: "people", title: "People", note: "The club is its members. Meet one over coffee." },
  { kind: "make", title: "Make your own", note: "Keepsakes to post: a framed photo, a tombstone." },
  {
    kind: "toy",
    title: "Desk toys",
    note: "Each desk's craft in four levers, on the desk's own page.",
  },
] as const;

/** "Off the clock": every game and toy on the site, and the visitor's place on the career ladder. */
function PlayPage() {
  const { played } = useCareer();
  return (
    <SiteLayout>
      <section className="bg-night text-white">
        <div className="gutter grid items-end gap-10 pb-14 pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-16 lg:pt-24">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Eyebrow tone="light">For your coffee break</Eyebrow>
            <h1 className="font-serif text-[64px]/[0.9] tracking-[-0.015em] md:text-[120px]/[0.9]">
              Off the <Em light>clock</Em>
            </h1>
            <p className="max-w-[520px] text-base/[1.7] text-mist md:text-lg/[1.7]">
              Everything on the site you can play with, built around what the desks actually do.
              Play them all and make Partner.
            </p>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <CareerLadder dark />
          </div>
        </div>
      </section>
      {GROUPS.map((g) => (
        <section
          key={g.kind}
          className="gutter flex flex-col gap-8 border-b border-line py-14 lg:py-18"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h2 className="font-serif text-[44px]/none tracking-[-0.01em] md:text-[60px]/none">
              {g.title}
            </h2>
            <p className="max-w-[420px] text-[15px]/[1.6] text-mute">{g.note}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACTIVITIES.filter((a) => a.kind === g.kind).map((a) => (
              <ActivityCard key={a.id} a={a} played={played.includes(a.id)} />
            ))}
          </div>
        </section>
      ))}
      <MouseFree />
      <TombstoneMaker />
    </SiteLayout>
  );
}
