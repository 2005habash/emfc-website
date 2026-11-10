// The finance terms the site explains: underlined on the desk pages (Jargon.tsx) and listed A to Z
// on the glossary page. `pattern` finds the term in a desk's text.

export const GLOSSARY: { name: string; pattern: RegExp; def: string }[] = [
  {
    name: "Paper LBO",

    pattern: /\bpaper LBOs?\b/,
    def: "A buyout's returns worked out in minutes with a pen, a classic private equity interview test.",
  },
  {
    name: "LBO",

    pattern: /\bLBOs?\b/,
    def: "Leveraged buyout: buying a company mostly with borrowed money, repaid from its own cash flow.",
  },
  {
    name: "Leveraged buyout",

    pattern: /\bleveraged buyouts?\b/i,
    def: "Buying a company mostly with borrowed money, repaid from its own cash flow.",
  },
  {
    name: "M&A",
    pattern: /\bM&A\b/,
    def: "Mergers and acquisitions: buying, selling and combining companies.",
  },
  {
    name: "IPO",

    pattern: /\bIPOs?\b/,
    def: "Initial public offering: a company's first sale of shares on a stock exchange.",
  },
  {
    name: "DCM",

    pattern: /\bDCM\b/,
    def: "Debt capital markets: the bankers who help companies and governments issue bonds.",
  },
  {
    name: "Bulge bracket",

    pattern: /\bbulge brackets?\b/i,
    def: "The largest global investment banks, such as Goldman Sachs, J.P. Morgan and Morgan Stanley.",
  },
  {
    name: "Boutique",

    pattern: /\bboutiques?\b/i,
    def: "Smaller, specialist advisory firms, often focused on M&A advice.",
  },
  {
    name: "Mid-market",

    pattern: /\bmid-market\b/i,
    def: "Companies between small and large: in Europe, deals of roughly €50m to €500m.",
  },
  {
    name: "Leveraged finance",

    pattern: /\bLeveraged Finance\b/i,
    def: "Lending to companies that already carry a lot of debt, often to fund buyouts.",
  },
  {
    name: "Investment memo",

    pattern: /\binvestment memos?\b/i,
    def: "The document a deal team writes to convince its investment committee to buy.",
  },
  {
    name: "High yield",

    pattern: /\bhigh yield\b/i,
    def: "Bonds rated below investment grade: more risk of default, so they pay more.",
  },
  {
    name: "Investment grade",

    pattern: /\binvestment grade\b/i,
    def: "Bonds rated BBB- or better: the issuers most likely to pay back.",
  },
  {
    name: "Mortgage-backed securities",

    pattern: /\bmortgage-backed securities\b/i,
    def: "Bonds paid by the interest and repayments of a pool of home loans.",
  },
  {
    name: "Direct lending",

    pattern: /\bdirect lending\b/i,
    def: "Loans made by funds straight to companies, without a bank in the middle.",
  },
  {
    name: "Spread",

    pattern: /\bspreads?\b/i,
    def: "The extra yield a bond pays over a government bond, for its extra risk.",
  },
  {
    name: "Buy side",

    pattern: /\bbuy-side\b/i,
    def: "The firms that invest money: funds, asset managers, private equity.",
  },
  {
    name: "Refinancing",

    pattern: /\brefinancings?\b/i,
    def: "Replacing a company's existing debt with new debt, usually on better terms.",
  },
  {
    name: "Restructuring",

    pattern: /\brestructurings?\b/i,
    def: "Reworking a company's debts when it can no longer pay them as agreed.",
  },
  {
    name: "ETF",

    pattern: /\bETFs?\b/,
    def: "Exchange-traded fund: a fund that trades on a stock exchange like a single share.",
  },
  {
    name: "MSCI World",

    pattern: /\bMSCI World\b/,
    def: "An index of large and mid-sized companies across 23 developed markets.",
  },
  {
    name: "LP",

    pattern: /\bLPs?\b/,
    def: "Limited partners: the investors, such as pension funds, who put money into a fund.",
  },
  {
    name: "Valuation",

    pattern: /\bvaluations?\b/i,
    def: "Working out what a company is worth, with comparables, past deals or a DCF.",
  },
  {
    name: "Infrastructure",

    pattern: /\binfrastructure\b/i,
    def: "Long-lived assets the economy runs on: roads, energy, telecoms towers, data centres.",
  },
  {
    name: "Securitisation",

    pattern: /\bsecuritis(?:ation|ed)\b/i,
    def: "Bundling loans together and selling bonds paid by their cash flows.",
  },
];
