import { memo, useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { layTable, makePuzzle, random, shuffle, W0, type Level, type Piece, type Pt, type Puzzle, type Table } from "@/components/puzzle/geometry";
import { IMAGES } from "@/lib/site";
import { cn } from "@/lib/utils";

// The team puzzle on emfc.es/puzzle: the club's group photo cut into a jigsaw. Drag a piece (or move
// it with the arrow keys) close to its place and it clicks in. The best time for each size is kept in
// this browser only.

const PHOTO = { src: IMAGES.teamGroup, width: 1920, height: 826 };
/** The board's height in board units: the photo down to row 750, above its faded bottom edge. */
const BOARD_H = (W0 * 750) / PHOTO.width;
/** The whole photo in board units; the faded rest hangs below the board, unseen. */
const IMAGE_H = (W0 * PHOTO.height) / PHOTO.width;

const LEVELS: Level[] = [
  { pieces: 12, cols: 6, rows: 2 },
  { pieces: 24, cols: 8, rows: 3 },
  { pieces: 66, cols: 11, rows: 6 },
];
const BEST_KEY = "emfc-puzzle-best";

type Game = {
  seed: number;
  level: number;
  puzzle: Puzzle;
  /** Where each loose piece lies, as a share of the table's width and height. */
  spots: Pt[];
  placed: boolean[];
  /** Stacking of loose pieces: the one handled last lies on top. */
  z: number[];
  started: number | null;
  finished: number | null;
};

function newGame(level: number, table: Table): Game {
  const seed = Math.floor(Math.random() * 2 ** 31);
  const puzzle = makePuzzle(LEVELS[level], BOARD_H, seed);
  const rand = random(seed ^ 0x5bd1e995);
  const count = puzzle.pieces.length;
  const slots = shuffle(table.slots, rand);
  const jitter = { x: puzzle.cell.w * table.scale * 0.07, y: puzzle.cell.h * table.scale * 0.07 };
  const spots: Pt[] = Array(count);
  shuffle([...Array(count).keys()], rand).forEach((piece, k) => {
    const [x, y] = slots[k % slots.length];
    spots[piece] = [(x + (rand() - 0.5) * 2 * jitter.x) / table.width, (y + (rand() - 0.5) * 2 * jitter.y) / table.height];
  });
  return { seed, level, puzzle, spots, placed: Array(count).fill(false), z: Array(count).fill(0), started: null, finished: null };
}

/** Where a piece's box belongs on the table, in pixels. */
const home = (table: Table, piece: Piece): Pt => [table.board.x + piece.x * table.scale, table.board.y + piece.y * table.scale];

function spotOf(game: Game, table: Table, i: number): Pt {
  if (game.placed[i]) return home(table, game.puzzle.pieces[i]);
  return [game.spots[i][0] * table.width, game.spots[i][1] * table.height];
}

/** Keeps the piece itself (not its knobs) on the table. */
function keepOnTable(table: Table, puzzle: Puzzle, [x, y]: Pt): Pt {
  const m = puzzle.margin * table.scale;
  return [
    Math.min(Math.max(x, -m), table.width - puzzle.cell.w * table.scale - m),
    Math.min(Math.max(y, -m), table.height - puzzle.cell.h * table.scale - m),
  ];
}

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function Clock({ started, finished }: { started: number | null; finished: number | null }) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!started || finished) return;
    const id = window.setInterval(() => tick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [started, finished]);
  return <>{clock(started ? (finished ?? Date.now()) - started : 0)}</>;
}

const PUZZLE_CSS = `
@keyframes puzzle-click { from { transform: scale(1.07) } to { transform: scale(1) } }
.puzzle-click { transform-origin: 50% 50%; animation: puzzle-click 0.3s cubic-bezier(0.2, 0.7, 0.2, 1); }
@keyframes puzzle-done { 0%, 100% { filter: none } 35% { filter: brightness(1.22) } }
.puzzle-done > [role="button"] { animation: puzzle-done 1.4s ease-in-out; }
`;

type PieceProps = {
  piece: Piece;
  index: number;
  count: number;
  id: string;
  x: number;
  y: number;
  scale: number;
  z: number;
  placed: boolean;
  lifted: boolean;
  clicked: boolean;
  done: boolean;
  /** While the photo breaks apart: how long this piece waits before it flies out, in milliseconds. */
  flyAfter: number | null;
  onDown: (e: ReactPointerEvent<HTMLDivElement>, i: number) => void;
  onKey: (e: KeyboardEvent<HTMLDivElement>, i: number) => void;
  setNode: (i: number, el: HTMLDivElement | null) => void;
};

/** One piece: its part of the photo, clipped to its outline. Only the picture itself catches the pointer. */
const PieceView = memo(function PieceView(p: PieceProps) {
  const { piece, scale } = p;
  return (
    <div
      ref={(el) => p.setNode(p.index, el)}
      role="button"
      tabIndex={p.placed || p.done ? -1 : 0}
      aria-label={`Piece ${p.index + 1} of ${p.count}${p.placed ? ", in place" : ""}`}
      aria-describedby="puzzle-keys"
      onPointerDown={(e) => p.onDown(e, p.index)}
      onKeyDown={(e) => p.onKey(e, p.index)}
      className={cn(
        "group absolute left-0 top-0 touch-none outline-none",
        // A loose piece lies on the table, so it casts a shadow (a longer one while held); placed ones lie flat. taste-skill-ignore
        !p.placed && (p.lifted ? "drop-shadow-[0_12px_14px_rgb(0_0_0/0.32)]" : "drop-shadow-[0_2px_3px_rgb(0_0_0/0.28)]"), // taste-skill-ignore
      )}
      style={{
        width: piece.w * scale,
        height: piece.h * scale,
        transform: `translate(${p.x}px, ${p.y}px)`,
        transition: p.flyAfter === null ? undefined : `transform 0.85s cubic-bezier(0.2, 0.7, 0.2, 1) ${p.flyAfter}ms`,
        zIndex: p.placed ? 1 : 10 + p.z,
        pointerEvents: "none",
      }}
    >
      <svg viewBox={`${piece.x} ${piece.y} ${piece.w} ${piece.h}`} aria-hidden className={cn("block h-full w-full overflow-visible", p.clicked && "puzzle-click")}>
        <clipPath id={p.id}>
          <path d={piece.d} />
        </clipPath>
        <image
          href={PHOTO.src}
          width={W0}
          height={IMAGE_H}
          preserveAspectRatio="none"
          clipPath={`url(#${p.id})`}
          className={p.lifted ? "cursor-grabbing" : "cursor-grab"}
          style={{ pointerEvents: p.placed ? "none" : "auto" }}
        />
        <path
          d={piece.d}
          fill="none"
          vectorEffect="non-scaling-stroke"
          className={cn(
            "stroke-white/50 transition-opacity duration-1000 [stroke-width:1] group-focus-visible:stroke-bull group-focus-visible:[stroke-width:3]",
            p.done && "opacity-0",
          )}
        />
      </svg>
    </div>
  );
});

export function TeamPuzzle() {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [viewport, setViewport] = useState(800);
  const [level, setLevel] = useState(1);
  const [game, setGame] = useState<Game | null>(null);
  const [lifted, setLifted] = useState<number | null>(null);
  const [clicked, setClicked] = useState<number | null>(null);
  const [guide, setGuide] = useState(true);
  const [keys, setKeys] = useState(false);
  const [best, setBest] = useState<Record<number, number>>({});
  const [record, setRecord] = useState(false);
  const [sideways, setSideways] = useState(false);
  // Each game opens with the whole photo, which then breaks apart onto the table.
  const [breaking, setBreaking] = useState<"together" | "apart" | null>(null);
  const firstLook = useRef(true);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<{ i: number; at: Pt } | null>(null);
  const top = useRef(1);

  const table = useMemo(
    () => (width ? layTable(width, viewport, LEVELS[game?.level ?? level], BOARD_H) : null),
    [width, viewport, game?.level, level],
  );
  // The handlers below read the latest game and table from here, so they never go stale mid-drag.
  const latest = useRef({ game, table, best, breaking });
  latest.current = { game, table, best, breaking };

  useEffect(() => {
    if (!breaking) return;
    // The photo shows whole for a moment (longer the first time), then the pieces fly out together.
    const wait = breaking === "together" ? (firstLook.current ? 700 : 300) : 1500;
    firstLook.current = false;
    const id = window.setTimeout(() => setBreaking(breaking === "together" ? "apart" : null), wait);
    return () => window.clearTimeout(id);
  }, [breaking]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    setViewport(window.innerHeight);
    // Measured now, so the game starts at once, and again whenever the width changes.
    setWidth(Math.round(el.getBoundingClientRect().width));
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    const turn = () => setSideways(window.innerWidth < 640 && window.innerHeight > window.innerWidth);
    turn();
    window.addEventListener("resize", turn);
    try {
      setBest(JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}"));
    } catch {
      // Private mode: no best times.
    }
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", turn);
    };
  }, []);

  useEffect(() => {
    if (!table || game) return;
    setGame(newGame(level, table));
    setBreaking("together");
  }, [table, game, level]);

  const start = (next: number) => {
    if (!width) return;
    const vh = window.innerHeight;
    setViewport(vh);
    setLevel(next);
    setRecord(false);
    setClicked(null);
    setGame(newGame(next, layTable(width, vh, LEVELS[next], BOARD_H)));
    setBreaking("together");
  };

  const update = (next: Game) => {
    latest.current.game = next;
    setGame(next);
  };

  /** Puts a piece down where it was dropped, or in its place when it is close enough. */
  const settle = useCallback((i: number, at: Pt, byKeys = false) => {
    const { game: g, table: t } = latest.current;
    if (!g || !t || g.placed[i] || g.finished) return;
    const [hx, hy] = home(t, g.puzzle.pieces[i]);
    const fits = Math.hypot(at[0] - hx, at[1] - hy) <= t.snap;
    const next: Game = { ...g, started: g.started ?? Date.now() };
    if (!fits) {
      next.spots = g.spots.map((s, j): Pt => (j === i ? [at[0] / t.width, at[1] / t.height] : s));
      update(next);
      return;
    }
    next.placed = g.placed.map((v, j) => v || j === i);
    if (next.placed.every(Boolean)) next.finished = Date.now();
    update(next);
    setClicked(i);
    if (next.finished && next.started) {
      const pieces = LEVELS[g.level].pieces;
      const ms = next.finished - next.started;
      const before = latest.current.best[pieces];
      const isBest = !before || ms < before;
      setRecord(isBest);
      if (isBest) {
        const saved = { ...latest.current.best, [pieces]: ms };
        setBest(saved);
        try {
          localStorage.setItem(BEST_KEY, JSON.stringify(saved));
        } catch {
          // Private mode: the best time lasts until the page closes.
        }
      }
    } else if (byKeys) {
      // Keyboard players carry on with the next loose piece.
      for (let k = 1; k < next.placed.length; k++) {
        const j = (i + k) % next.placed.length;
        if (!next.placed[j]) {
          nodes.current[j]?.focus();
          break;
        }
      }
    }
  }, []);

  const lift = (g: Game, i: number) => {
    const next = { ...g, z: g.z.map((v, j) => (j === i ? ++top.current : v)), started: g.started ?? Date.now() };
    update(next);
    return next;
  };

  const onDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, i: number) => {
      const { game: g, table: t, breaking: opening } = latest.current;
      const el = box.current;
      if (!g || !t || !el || opening || g.placed[i] || g.finished || (e.pointerType === "mouse" && e.button !== 0)) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const [x0, y0] = spotOf(g, t, i);
      const grab: Pt = [e.clientX - rect.left - x0, e.clientY - rect.top - y0];
      drag.current = { i, at: [x0, y0] };
      lift(g, i);
      setLifted(i);
      setClicked(null);
      const node = nodes.current[i];
      const move = (ev: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const at = keepOnTable(t, g.puzzle, [ev.clientX - r.left - grab[0], ev.clientY - r.top - grab[1]]);
        drag.current = { i, at };
        if (node) node.style.transform = `translate(${at[0]}px, ${at[1]}px)`;
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        const d = drag.current;
        drag.current = null;
        setLifted(null);
        if (d) settle(d.i, d.at);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    },
    [settle],
  );

  const onKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>, i: number) => {
      const dir = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, Pt>)[e.key];
      const { game: g, table: t, breaking: opening } = latest.current;
      if (!dir || !g || !t || opening || g.placed[i] || g.finished) return;
      e.preventDefault();
      const step = Math.max(2, (Math.min(g.puzzle.cell.w, g.puzzle.cell.h) * t.scale) / 5) * (e.shiftKey ? 4 : 1);
      const [x, y] = spotOf(lift(g, i), t, i);
      settle(i, keepOnTable(t, g.puzzle, [x + dir[0] * step, y + dir[1] * step]), true);
    },
    [settle],
  );

  const setNode = useCallback((i: number, el: HTMLDivElement | null) => {
    nodes.current[i] = el;
  }, []);

  const count = game?.puzzle.pieces.length ?? LEVELS[level].pieces;
  const inPlace = game?.placed.filter(Boolean).length ?? 0;
  const done = Boolean(game?.finished);
  const bestHere = best[count];

  return (
    <div className="mt-6 md:mt-8">
      <style>{PUZZLE_CSS}</style>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <p className="max-w-[560px] text-base/[1.7] md:text-lg/[1.65]">
          The EMFC members outside ESADE, cut into {count} pieces{count === 66 ? ", one for each member" : ""}. Drag each
          piece to its place on the board.
        </p>
        <div role="radiogroup" aria-label="Number of pieces" className="flex shrink-0 flex-wrap gap-2">
          {LEVELS.map((l, i) => (
            <button
              key={l.pieces}
              type="button"
              role="radio"
              aria-checked={i === level}
              onClick={() => start(i)}
              className={cn("btn btn-sm max-sm:px-3.5", i === level ? "btn-ink" : "btn-outline-ink")}
            >
              {l.pieces} pieces
            </button>
          ))}
        </div>
      </div>

      {done && game?.started && game.finished ? (
        <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-serif text-4xl/[1] tracking-[-0.01em] md:text-5xl/[1]">Back together in {clock(game.finished - game.started)}</h2>
            <p aria-live="polite" className="mt-3 text-base text-mute">
              {record ? `A new best for ${count} pieces.` : bestHere ? `Your best for ${count} pieces is ${clock(bestHere)}.` : ""}
            </p>
          </div>
          <button type="button" onClick={() => start(level)} className="btn btn-sm btn-ink self-start md:self-auto">
            Play again
          </button>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-x-7 gap-y-3 text-base">
          <p aria-live="polite" className="font-medium">
            {inPlace} of {count} in place
          </p>
          <p className="tabular-nums text-mute">
            Time <Clock started={game?.started ?? null} finished={game?.finished ?? null} />
          </p>
          {bestHere && <p className="tabular-nums text-mute">Your best {clock(bestHere)}</p>}
          <label className="flex cursor-pointer items-center gap-2 sm:ml-auto">
            <input type="checkbox" checked={guide} onChange={(e) => setGuide(e.target.checked)} className="h-4 w-4 accent-[var(--c-bull)]" />
            Faint picture
          </label>
          <button type="button" onClick={() => start(level)} disabled={!game} className="btn btn-sm btn-outline-ink">
            Start again
          </button>
        </div>
      )}

      <div
        ref={box}
        className={cn("relative mt-5 w-full select-none overflow-x-clip", table && game && "bg-stone", done && "puzzle-done")}
        style={table && game ? { height: done ? table.board.h + 2 * table.board.y : table.height } : undefined}
        onFocus={(e) => setKeys(e.target instanceof HTMLElement && e.target.matches(":focus-visible"))}
        onBlur={() => setKeys(false)}
      >
        {table && game ? (
          <>
            <div
              aria-hidden
              className="absolute bg-[color-mix(in_oklab,var(--c-ink)_9%,var(--c-stone))]"
              style={{ left: table.board.x, top: table.board.y, width: table.board.w, height: table.board.h }}
            >
              {guide && <img src={PHOTO.src} alt="" className="h-full w-full object-cover object-top opacity-20 grayscale" />}
            </div>
            {game.puzzle.pieces.map((piece, i) => {
              const at =
                breaking === "together" ? home(table, piece) : drag.current?.i === i ? drag.current.at : spotOf(game, table, i);
              return (
                <PieceView
                  key={`${game.seed}-${i}`}
                  piece={piece}
                  index={i}
                  count={count}
                  id={`puzzle-${game.seed}-${i}`}
                  x={at[0]}
                  y={at[1]}
                  scale={table.scale}
                  z={game.z[i]}
                  placed={game.placed[i]}
                  lifted={lifted === i}
                  clicked={clicked === i}
                  done={done}
                  flyAfter={breaking === "apart" ? ((i * 37) % count) * (550 / count) : null}
                  onDown={onDown}
                  onKey={onKey}
                  setNode={setNode}
                />
              );
            })}
          </>
        ) : (
          // Before the game starts (and without JavaScript): the photo, about where the board will be.
          <img
            src={PHOTO.src}
            alt="The EMFC members outside the ESADE building"
            className="aspect-[1920/750] w-full object-cover object-top min-[800px]:mx-auto min-[800px]:mt-5 min-[800px]:w-[62%] min-[800px]:max-w-[920px]"
          />
        )}
      </div>
      <p id="puzzle-keys" className={cn("mt-4 text-sm text-mute", !keys && "sr-only")}>
        Arrow keys move the piece. Hold Shift to move it further.
      </p>
      {sideways && <p className="mt-4 text-sm text-mute">Turn your phone sideways for bigger pieces.</p>}
      <noscript>
        <p className="mt-4 text-sm text-mute">The puzzle needs JavaScript to play.</p>
      </noscript>
    </div>
  );
}
