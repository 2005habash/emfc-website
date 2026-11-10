import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpRight, Check } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState, type ComponentType } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { CareerLadder } from "@/components/fun/CareerLadder";
import { Giggle } from "@/components/fun/Giggle";
import { useCareer } from "@/components/fun/career";
import { ACTIVITIES, SHELVES, type Activity } from "@/components/fun/playground";
import { Em, Eyebrow } from "@/components/site/ui";
import { getDepartment } from "@/lib/departments";
import { IMAGES } from "@/lib/site";
import { cn } from "@/lib/utils";
import { sized } from "@/lib/images";

export const Route = createFileRoute("/arcade")({
  head: () => ({
    meta: [
      { title: "Arcade, EMFC" },
      {
        name: "description",
        content:
          "The EMFC Arcade: finance games, puzzles and desk toys. Trade the closing bell, survive a Superday, find the plug in a model, run a paper LBO.",
      },
      { property: "og:title", content: "The EMFC Arcade" },
      {
        property: "og:description",
        content: "Markets are closed. The games are open.",
      },
    ],
  }),
  component: ArcadePage,
});

/**
 * Every activity's game, by its id in playground.ts. Each game's code is fetched when it is first
 * picked, so the shelf opens without carrying all eighteen.
 */
const game = <T extends Record<string, ComponentType>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] })));

const GAMES: Record<string, ComponentType> = {
  "closing-bell": game(() => import("@/components/fun/ClosingBell"), "ClosingBell"),
  superday: game(() => import("@/components/fun/Superday"), "Superday"),
  "bull-or-bear": game(() => import("@/components/fun/BullOrBear"), "BullOrBear"),
  "quick-turn": game(() => import("@/components/fun/QuickTurn"), "QuickTurn"),
  quiz: game(() => import("@/components/fun/DeskQuiz"), "DeskQuiz"),
  "real-or-made-up": game(() => import("@/components/fun/RealOrMadeUp"), "RealOrMadeUp"),
  "mouse-free": game(() => import("@/components/fun/MouseFree"), "MouseFree"),
  "find-the-plug": game(() => import("@/components/fun/FindThePlug"), "FindThePlug"),
  brainteasers: game(() => import("@/components/fun/Brainteasers"), "Brainteasers"),
  frame: game(() => import("@/components/fun/PhotoFrame"), "PhotoFrame"),
  tombstone: game(() => import("@/components/fun/TombstoneMaker"), "TombstoneMaker"),
  roulette: game(() => import("@/components/fun/CoffeeRoulette"), "CoffeeRoulette"),
  "paper-lbo": game(() => import("@/components/fun/toys/PaperLbo"), "PaperLbo"),
  accretion: game(() => import("@/components/fun/toys/Accretion"), "Accretion"),
  "return-the-fund": game(() => import("@/components/fun/toys/ReturnTheFund"), "ReturnTheFund"),
  dcf: game(() => import("@/components/fun/toys/Dcf"), "Dcf"),
  "bond-yield": game(() => import("@/components/fun/toys/BondYield"), "BondYield"),
  "cap-rate": game(() => import("@/components/fun/toys/CapRate"), "CapRate"),
};

/** "Private Equity" for "private-markets/private-equity". */
const deskName = (path: string) => {
  const [department, desk] = path.split("/");
  return getDepartment(department)?.desks.find((k) => k.slug === desk)?.name ?? "";
};

const toShelf = () =>
  document.getElementById("games")?.scrollIntoView({ behavior: "smooth", block: "start" });

/**
 * The Arcade: every game, puzzle and desk toy on the site, on one shelf. Picking one plays it right
 * below the shelf, and the address (/arcade#superday) says which, so a game can be linked to.
 */
function ArcadePage() {
  const hash = useRouterState({ select: (s) => s.location.hash });
  const navigate = useNavigate();
  const { played } = useCareer();
  // The address's #game is only known in the browser, so the first render matches the server's.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const current = ready ? ACTIVITIES.find((a) => a.id === hash) : undefined;
  const Game = current ? GAMES[current.id] : undefined;

  const play = (id: string) =>
    navigate({ to: "/arcade", hash: id, replace: true, resetScroll: false });
  const random = () => {
    const pool = ACTIVITIES.filter((a) => a.id !== current?.id);
    const fresh = pool.filter((a) => !played.includes(a.id));
    const list = fresh.length ? fresh : pool;
    play(list[Math.floor(Math.random() * list.length)].id);
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-night text-white">
        {/* Lazy, so a phone, where it is hidden, never downloads it. */}
        <img
          {...sized(IMAGES.bullMark, "620px")}
          alt=""
          loading="lazy"
          className="pointer-events-none absolute -right-28 top-1/2 hidden w-[620px] -translate-y-1/2 -rotate-12 opacity-[0.06] lg:block"
        />
        <div className="gutter relative grid items-end gap-10 pb-14 pt-20 lg:grid-cols-12 lg:gap-8 lg:pb-18 lg:pt-24">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <Eyebrow tone="light">After the closing bell</Eyebrow>
            <h1 className="font-serif text-[80px]/[0.88] tracking-[-0.015em] md:text-[150px]/[0.86]">
              <Giggle text="The" />{" "}
              <Em light>
                <Giggle text="Arcade" every={6500} />
              </Em>
            </h1>
            <p className="max-w-[540px] text-base/[1.7] text-mist md:text-lg/[1.7]">
              Markets are closed. The games are open. Trade a minute of headlines, survive a
              Superday, find the plug in a model or run a paper LBO. Every one you play moves you up
              the ladder.
            </p>
            <div className="flex flex-wrap gap-3">
              <InsertCoin onInsert={random} />
              <button type="button" onClick={toShelf} className="btn btn-outline-white">
                See all {ACTIVITIES.length}
                <ArrowDown className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
          <div className="lg:col-span-4 lg:col-start-9">
            <CareerLadder dark />
          </div>
        </div>
      </section>

      <section id="games" aria-label="Every game" className="scroll-mt-24">
        {SHELVES.map((shelf) => (
          <div
            key={shelf.kind}
            className="gutter grid gap-6 border-b border-line py-12 lg:grid-cols-12 lg:gap-8 lg:py-16"
          >
            <div className="flex flex-col gap-3 lg:col-span-3">
              <h2 className="font-serif text-[40px]/none tracking-[-0.01em] md:text-[52px]/none">
                <Giggle text={shelf.title} />
              </h2>
              <p className="max-w-[300px] text-[14.5px]/[1.6] text-mute">{shelf.note}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-3">
              {ACTIVITIES.filter((a) => a.kind === shelf.kind).map((a) => (
                <Tile
                  key={a.id}
                  a={a}
                  played={played.includes(a.id)}
                  current={a.id === current?.id}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {current && Game && (
        <>
          <Suspense fallback={<Loading id={current.id} />}>
            <Game key={current.id} />
          </Suspense>
          <UpNext current={current} played={played} />
        </>
      )}
    </SiteLayout>
  );
}

/** A game's place for the moment its code is on its way: the page moves there at once. */
function Loading({ id }: { id: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // In braces: scrollIntoView now returns a promise in some browsers, and an effect must return nothing.
    ref.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, []);
  return <div ref={ref} id={id} aria-busy className="min-h-[70vh] scroll-mt-24 bg-stone" />;
}

/** A game on the shelf. Picking it plays it below; the one playing is shown in navy. */
function Tile({ a, played, current }: { a: Activity; played: boolean; current: boolean }) {
  return (
    <Link
      to="/arcade"
      hash={a.id}
      replace
      resetScroll={false}
      // Only the tile of the game playing counts as the current page, not every link to /arcade.
      activeOptions={{ includeHash: true }}
      onClick={() => {
        // Picking the game already playing just goes back to it.
        if (current)
          document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
      className={cn(
        "group flex min-h-[148px] flex-col gap-2.5 border p-5 transition duration-300 md:p-6",
        current
          ? "border-night bg-night text-white"
          : "border-line bg-panel hover:-translate-y-1 hover:border-ink",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "caps text-[10px] tracking-[0.18em]",
            current ? "text-bull-light" : "text-mute",
          )}
        >
          {current ? "Now playing" : a.desk ? deskName(a.desk) : a.time}
        </span>
        {played ? (
          <span
            className={cn(
              "caps inline-flex items-center gap-1 text-[10px] tracking-[0.18em]",
              current ? "text-bull-light" : "text-bull",
            )}
          >
            <Check className="h-3 w-3" strokeWidth={2} />
            Played
          </span>
        ) : (
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            strokeWidth={1.5}
          />
        )}
      </span>
      <span className="font-serif text-[26px]/[1.1] md:text-[28px]/[1.1]">
        <Giggle text={a.title} />
      </span>
      <span className={cn("text-[14px]/[1.55]", current ? "text-mist" : "text-mute")}>
        {a.hook}
      </span>
    </Link>
  );
}

/** "Insert coin": a coin drops into the slot and a game the visitor hasn't played yet starts. */
function InsertCoin({ onInsert }: { onInsert: () => void }) {
  const [dropping, setDropping] = useState(false);
  const insert = () => {
    if (dropping) return;
    if (!document.documentElement.classList.contains("motion")) {
      onInsert();
      return;
    }
    setDropping(true);
    setTimeout(() => {
      setDropping(false);
      onInsert();
    }, 650);
  };
  return (
    <button type="button" onClick={insert} className="btn btn-white">
      <span
        aria-hidden
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-bull font-mono text-[10px] font-semibold text-white ring-2 ring-bull-light/50",
          dropping && "coin-drop",
        )}
      >
        €
      </span>
      Insert coin
    </button>
  );
}

/** Under the game: three more to play, unplayed first, and the way back to the shelf. */
function UpNext({ current, played }: { current: Activity; played: string[] }) {
  const i = ACTIVITIES.findIndex((a) => a.id === current.id);
  const order = [...ACTIVITIES.slice(i + 1), ...ACTIVITIES.slice(0, i)];
  const next = [
    ...order.filter((a) => !played.includes(a.id)),
    ...order.filter((a) => played.includes(a.id)),
  ].slice(0, 3);
  const [department, desk] = current.desk?.split("/") ?? [];
  return (
    <section className="border-t border-line">
      <div className="gutter flex flex-col gap-8 py-12 lg:py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="font-serif text-[40px]/none tracking-[-0.01em] md:text-[52px]/none">
            Up <Em>next</Em>
          </h2>
          <div className="flex flex-wrap gap-3">
            {desk && (
              <Link
                to="/departments/$department/$desk"
                params={{ department, desk }}
                className="btn btn-sm btn-outline-ink"
              >
                The {deskName(current.desk!)} desk
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.75} />
              </Link>
            )}
            <button type="button" onClick={toShelf} className="btn btn-sm btn-outline-ink">
              All games
              <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.75} />
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {next.map((a) => (
            <Tile key={a.id} a={a} played={played.includes(a.id)} current={false} />
          ))}
        </div>
      </div>
    </section>
  );
}
