import { Fragment, type ReactNode } from "react";
import { GLOSSARY } from "./glossary";

// "Jargon buster": on the desk pages, finance terms get a dotted underline, and pointing at one (or
// focusing it) shows a one-line explanation. For sponsors, first-years and curious parents.

/**
 * Text with its finance terms explained: the first time each term appears, it is underlined and
 * explains itself on hover or focus.
 */
export function Jargon({ children }: { children: string }) {
  const used = new Set<number>();
  let parts: ReactNode[] = [children];
  GLOSSARY.forEach((g, gi) => {
    parts = parts.flatMap((part): ReactNode[] => {
      if (typeof part !== "string" || used.has(gi)) return [part];
      const m = part.match(g.pattern);
      if (!m || m.index === undefined) return [part];
      used.add(gi);
      return [
        part.slice(0, m.index),
        <Term key={`${gi}`} def={g.def}>
          {m[0]}
        </Term>,
        part.slice(m.index + m[0].length),
      ];
    });
  });
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>{p}</Fragment>
      ))}
    </>
  );
}

function Term({ def, children }: { def: string; children: ReactNode }) {
  return (
    <span
      tabIndex={0}
      className="group/term relative cursor-help underline decoration-bull/60 decoration-dotted underline-offset-[5px] outline-none focus-visible:decoration-bull"
    >
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-[min(260px,80vw)] -translate-x-1/2 bg-night px-3.5 py-2.5 text-left font-sans text-[13px]/[1.5] font-normal tracking-normal text-white normal-case not-italic shadow-lg group-hover/term:block group-focus-visible/term:block"
      >
        {def}
      </span>
    </span>
  );
}
