import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Em } from "@/components/site/ui";

/** The 404 page: the address the visitor asked for has been delisted. */
export function Delisted() {
  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-night text-white">
        <div className="gutter grid items-center gap-12 py-20 lg:min-h-[640px] lg:grid-cols-12 lg:gap-8 lg:py-24">
          <div className="flex flex-col gap-7 lg:col-span-6">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] uppercase tracking-[0.1em] text-haze md:text-[13px]">
              <span className="font-medium text-white">PAGE 404</span>
              <span className="text-mist">-100.00%</span>
              <span aria-hidden>▼</span>
              <span>Trading halted</span>
            </p>
            <h1 className="font-serif text-[96px]/[0.88] tracking-[-0.02em] md:text-[160px]/[0.88]">
              Delisted<Em light>.</Em>
            </h1>
            <p className="max-w-[460px] text-[17px]/[1.65] text-mist md:text-lg/[1.65]">
              This page isn&apos;t trading on the EMFC exchange. It may have moved, or it never
              listed.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/" className="btn btn-white" aria-label="Buy the dip: back to the homepage">
                Buy the dip
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>
              <Link to="/arcade" hash="quiz" className="btn btn-outline-white">
                Find your desk instead
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <CrashChart />
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

// A made-up price line that climbs for a while and then falls off a cliff, the same on every visit.
const W = 600;
const H = 360;
const CRASH = 455;
function crashPath() {
  let seed = 404;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
  const points: [number, number][] = [];
  let y = 260;
  for (let x = 0; x <= CRASH; x += 15) {
    y = Math.max(60, Math.min(290, y - 4.2 + rnd() * 26));
    points.push([x, y]);
  }
  points.push([CRASH + 22, 318], [CRASH + 30, 334], [W, 336]);
  return points;
}

function CrashChart() {
  const points = crashPath();
  const top = points.reduce((m, p) => (p[1] < m[1] ? p : m));
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <figure className="flex flex-col gap-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="A price line that climbs and then crashes to zero"
      >
        {[60, 140, 220, 300].map((y) => (
          <line key={y} x1="0" x2={W} y1={y} y2={y} className="stroke-white/10" strokeWidth="1" />
        ))}
        <path d={`${d} L${W},${H} L0,${H} Z`} className="fill-bull-light/10" />
        <path
          d={d}
          fill="none"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="stroke-bull-light"
          style={{
            strokeDasharray: 1400,
            ["--line-length" as string]: 1400,
            animation: "draw-line 2.4s ease-out both",
          }}
        />
        <circle cx={top[0]} cy={top[1]} r="4" className="fill-white" />
        <text
          x={top[0]}
          y={top[1] - 14}
          textAnchor="middle"
          className="fill-mist font-mono text-[13px] uppercase"
        >
          All-time high
        </text>
        <line
          x1={CRASH}
          x2={CRASH}
          y1="40"
          y2={H}
          className="stroke-white/25"
          strokeDasharray="4 5"
        />
        <text
          x={CRASH - 10}
          y="34"
          textAnchor="end"
          className="fill-white font-mono text-[13px] uppercase"
        >
          You clicked
        </text>
      </svg>
      <figcaption className="font-mono text-[11px] uppercase tracking-[0.1em] text-haze">
        Past performance is no guarantee of future pages.
      </figcaption>
    </figure>
  );
}
