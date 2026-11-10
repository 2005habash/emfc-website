import { Fragment, type ReactNode } from "react";

// "Jargon buster": on the desk pages, finance terms get a dotted underline, and pointing at one (or
// focusing it) shows a one-line explanation. For sponsors, first-years and curious parents.

const GLOSSARY: { pattern: RegExp; def: string }[] = [
  {
    pattern: /\bpaper LBOs?\b/,
    def: "A buyout's returns worked out in minutes with a pen, a classic private equity interview test.",
  },
  {
    pattern: /\bLBOs?\b/,
    def: "Leveraged buyout: buying a company mostly with borrowed money, repaid from its own cash flow.",
  },
  {
    pattern: /\bleveraged buyouts?\b/i,
    def: "Buying a company mostly with borrowed money, repaid from its own cash flow.",
  },
  { pattern: /\bM&A\b/, def: "Mergers and acquisitions: buying, selling and combining companies." },
  {
    pattern: /\bIPOs?\b/,
    def: "Initial public offering: a company's first sale of shares on a stock exchange.",
  },
  {
    pattern: /\bDCM\b/,
    def: "Debt capital markets: the bankers who help companies and governments issue bonds.",
  },
  {
    pattern: /\bbulge brackets?\b/i,
    def: "The largest global investment banks, such as Goldman Sachs, J.P. Morgan and Morgan Stanley.",
  },
  {
    pattern: /\bboutiques?\b/i,
    def: "Smaller, specialist advisory firms, often focused on M&A advice.",
  },
  {
    pattern: /\bmid-market\b/i,
    def: "Companies between small and large: in Europe, deals of roughly €50m to €500m.",
  },
  {
    pattern: /\bLeveraged Finance\b/i,
    def: "Lending to companies that already carry a lot of debt, often to fund buyouts.",
  },
  {
    pattern: /\binvestment memos?\b/i,
    def: "The document a deal team writes to convince its investment committee to buy.",
  },
  {
    pattern: /\bhigh yield\b/i,
    def: "Bonds rated below investment grade: more risk of default, so they pay more.",
  },
  {
    pattern: /\binvestment grade\b/i,
    def: "Bonds rated BBB- or better: the issuers most likely to pay back.",
  },
  {
    pattern: /\bmortgage-backed securities\b/i,
    def: "Bonds paid by the interest and repayments of a pool of home loans.",
  },
  {
    pattern: /\bdirect lending\b/i,
    def: "Loans made by funds straight to companies, without a bank in the middle.",
  },
  {
    pattern: /\bspreads?\b/i,
    def: "The extra yield a bond pays over a government bond, for its extra risk.",
  },
  {
    pattern: /\bbuy-side\b/i,
    def: "The firms that invest money: funds, asset managers, private equity.",
  },
  {
    pattern: /\brefinancings?\b/i,
    def: "Replacing a company's existing debt with new debt, usually on better terms.",
  },
  {
    pattern: /\brestructurings?\b/i,
    def: "Reworking a company's debts when it can no longer pay them as agreed.",
  },
  {
    pattern: /\bETFs?\b/,
    def: "Exchange-traded fund: a fund that trades on a stock exchange like a single share.",
  },
  {
    pattern: /\bMSCI World\b/,
    def: "An index of large and mid-sized companies across 23 developed markets.",
  },
  {
    pattern: /\bLPs?\b/,
    def: "Limited partners: the investors, such as pension funds, who put money into a fund.",
  },
  {
    pattern: /\bvaluations?\b/i,
    def: "Working out what a company is worth, with comparables, past deals or a DCF.",
  },
  {
    pattern: /\binfrastructure\b/i,
    def: "Long-lived assets the economy runs on: roads, energy, telecoms towers, data centres.",
  },
  {
    pattern: /\bsecuritis(?:ation|ed)\b/i,
    def: "Bundling loans together and selling bonds paid by their cash flows.",
  },
];

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
