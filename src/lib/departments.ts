export type Person = { name: string; role: string; linkedin?: string };

export const LINKEDIN: Record<string, string> = {
  "Diogo Oliveira": "https://www.linkedin.com/in/diogo-oliveira-83bb39230",
  "Vasco Barahona de Lemos": "https://www.linkedin.com/in/vascobarahona",
  "Jan Heibel": "https://www.linkedin.com/in/jan-heibel-294a15248",
  "Yonatan Bendler": "https://www.linkedin.com/in/yonatan-bendler-055a44320",
  "Cosimo Dini": "https://www.linkedin.com/in/cosimo-dini",
  "Luka Thomson": "https://www.linkedin.com/in/luka-thomson-255411243",
  "Fabian Seher": "https://www.linkedin.com/in/fabian-seher-8b102a26a",
  "Luís Laboreiro": "https://www.linkedin.com/in/luis-laboreiro",
  "Anastasia Murgida": "https://www.linkedin.com/in/anastasia-murgida-6b2727293",
  "Luca Flusche": "https://www.linkedin.com/in/luca-flusche/",
  "Nick Kriz": "https://www.linkedin.com/in/nick-kriz/",
  "David Villar": "https://www.linkedin.com/in/david-villar-455a78242/",
  "Constantin Molineus": "https://www.linkedin.com/in/cmolineus",
  "João Salgado": "https://www.linkedin.com/in/jo%C3%A3o-salgado-943665266",
  "Zaid Habash": "https://www.linkedin.com/in/zaid-habash",
  "Paul Christian Abel": "https://www.linkedin.com/in/paul-christian-abel-2a1a03203",
  "Moritz Fritsch": "https://www.linkedin.com/in/moritzfritsch",
  "Philip Ignatzi": "https://www.linkedin.com/in/philip-ignatzi-111922186",
};

export type DetailSection = { title: string; body: string };

export type Department = {
  slug: string;
  name: string;
  short: string;
  long: string;
  function: string;
  head: string;
  cio?: string;
  verticals: string[];
  deskLabel: string;
  associate: string;
  support?: boolean;
  produces: DetailSection[];
  targetFirms?: string[];
  people: Person[];
};

export const departments: Department[] = [
  {
    slug: "investment-banking",
    name: "Investment Banking",
    short:
      "M&A and Debt advisory. Live deal coverage, technical drills, and direct contact with bankers from partner firms.",
    long: "A coverage desk built like an analyst pool. Monthly live deals, technical workshops on LBO, DCF and accretion/dilution, and structured interview prep with bankers who recruit at ESADE.",
    function:
      "M&A and Debt advisory coverage. Live deal write-ups, technical drills, IB recruiting prep, and networking with bankers from partner firms.",
    head: "Yonatan Bendler",
    verticals: ["M&A", "Debt"],
    deskLabel: "Team preference",
    associate:
      "Write live deal notes, build models with the VPs, and join mock interview rounds. Meet bankers through speaker events and small-group sessions.",
    produces: [
      {
        title: "Monthly Deal Analysis",
        body: "Each month the M&A or Debt team brings a live deal to the table: rationale, valuation, structure, financing and key risks. Members leave with frameworks they can reuse in interviews.",
      },
      {
        title: "Sector & Market Education",
        body: "How bankers actually think. Deal process, league tables, M&A and leveraged-finance trends, and the market awareness to hold a credible conversation with any banker.",
      },
      {
        title: "Interview Prep & Cases",
        body: "CV screening, mock interviews, and technical drills across LBO, DCF and accretion/dilution, built specifically for IB processes.",
      },
      {
        title: "Speaker Events & Podcast",
        body: "Sessions with M&A and leveraged-finance professionals, plus introductions to ESADE alumni inside target firms.",
      },
      {
        title: "Study Tours & Future Formats",
        body: "Working toward London, Madrid and Barcelona trips, alongside deal competitions, buddy systems and alumni dinners.",
      },
    ],
    targetFirms: [
      "Goldman Sachs",
      "Morgan Stanley",
      "J.P. Morgan",
      "Bank of America",
      "Citi",
      "Evercore",
      "Lazard",
      "Rothschild & Co",
      "Houlihan Lokey",
      "Jefferies",
      "UBS",
      "Crédit Agricole",
    ],
    people: [
      { name: "Yonatan Bendler", role: "Head of Investment Banking" },
      { name: "Constantin Molineus", role: "VP, M&A" },
      { name: "João Salgado", role: "VP, Debt" },
    ],
  },
  {
    slug: "pe-vc-fintech-real-assets",
    name: "Private Markets",
    short:
      "Private markets coverage with direct access to investors across PE, VC & Growth, Fintech and Real Assets.",
    long: "The private markets desk. Associates work on deal teardowns and investment memos, meet investors from partner firms, and sit in on speaker events and recruiting prep across PE, VC & Growth, Fintech and Real Assets.",
    function:
      "Private markets coverage across PE, VC & Growth, Fintech and Real Assets. Fortnightly deal teardowns, sector sessions, recruiting prep and speaker events with investors from partner firms.",
    head: "Jan Heibel",
    verticals: ["Private Equity", "Venture Capital & Growth", "Fintech", "Real Assets"],
    deskLabel: "Team preference",
    associate:
      "Look at private market deals, write investment memos, and present to the desk. Get face time with investors and alumni working in the space.",
    produces: [
      {
        title: "Fortnightly Deal Teardowns",
        body: "Live deal coverage across all four verticals: PE, VC & Growth, Fintech and Real Assets, with full investment memos.",
      },
      {
        title: "Sector & Market Education",
        body: "Asset class mechanics, investor thinking and current macro trends across private markets.",
      },
      {
        title: "Interview Prep & Case Simulations",
        body: "CV screening, mock interviews and case practice tailored to PE, VC, Fintech and Real Assets recruiting.",
      },
      {
        title: "Speaker Events & Podcast",
        body: "Monthly sessions with alumni and industry professionals, plus a podcast in build.",
      },
      {
        title: "Study Tours & Outreach",
        body: "Working toward Barcelona, Madrid and London trips, buddy systems, alumni dinners, company visits and IC competitions.",
      },
    ],
    targetFirms: [
      "Blackstone",
      "KKR",
      "CVC",
      "Warburg Pincus",
      "Ardian",
      "Index Ventures",
      "Atomico",
      "Sequoia",
      "General Atlantic",
    ],
    people: [
      { name: "Jan Heibel", role: "Head of Private Markets" },
      { name: "Fabian Seher", role: "VP, Private Equity" },
      { name: "Zaid Habash", role: "VP, VC & Growth" },
      { name: "Anastasia Murgida", role: "VP, Fintech" },
      { name: "Luca Flusche", role: "VP, Real Assets" },
    ],
  },
  {
    slug: "asset-management",
    name: "Asset Management",
    short:
      "Run a real paper trading portfolio, build a track record, and meet portfolio managers from Barcelona and beyond.",
    long: "The buy-side desk. Members run a paper portfolio with full attribution, publish research, and host PMs and analysts. Bloomberg training included.",
    function:
      "Runs a paper trading portfolio across Macro & Strategy, Equity Research, Portfolio Management and ETFs & Multi-Asset. Bloomberg training, equity research output, and recurring sessions with practising PMs.",
    head: "Cosimo Dini",
    cio: "Luís Laboreiro",
    verticals: [
      "Macro & Strategy",
      "Equity Research",
      "Portfolio Management",
      "ETFs & Multi-Asset",
    ],
    deskLabel: "Team preference",
    associate:
      "Cover a sector or strategy, publish research, and pitch ideas into the portfolio. Help organise events with industry guests.",
    produces: [
      {
        title: "Market & Macro Research",
        body: "Central banks, economic data, geopolitics and asset allocation views, produced by the Macro & Strategy desk.",
      },
      {
        title: "Investment Thesis Development",
        body: "Equity research, valuation and risk assessment work, leading to publishable single-name and thematic pieces.",
      },
      {
        title: "Investment Committee",
        body: "Thesis presentations, committee debate and final approval before positions enter the paper portfolio.",
      },
      {
        title: "Portfolio Monitoring & Review",
        body: "Performance attribution, rebalancing and post-mortems across the live book.",
      },
      {
        title: "Training & Industry Access",
        body: "Bloomberg training sessions, trading and investment challenges, London and Luxembourg business trips, plus speaker events with AM, WM and ER professionals.",
      },
    ],
    targetFirms: [
      "Schroders",
      "BlackRock",
      "Fidelity",
      "Capital Group",
      "Citadel",
      "Point72",
      "Brevan Howard",
      "Marshall Wace",
    ],
    people: [
      { name: "Cosimo Dini", role: "Head of Asset Management" },
      { name: "Luís Laboreiro", role: "Chief Investment Officer" },
    ],
  },
  {
    slug: "fixed-income",
    name: "Fixed Income",
    short:
      "Debt Capital Markets, private credit, and buy-side debt. Prep for recruitment and direct access to fixed income professionals.",
    long: "A research-led credit desk covering corporate debt across the rating spectrum. Members publish S&P-style issuer rating case studies, prep for private credit and credit research roles, and meet credit investors through speaker sessions.",
    function:
      "Corporate credit research by market (IG, HY, Distressed & Special Situations, Emerging Markets, Financials). S&P-style issuer ratings, private credit recruiting prep, and networking with credit investors.",
    head: "Luka Thomson",
    verticals: [
      "Investment Grade",
      "High Yield",
      "Distressed & Special Situations",
      "Emerging Markets",
      "Financials",
    ],
    deskLabel: "Team preference",
    associate:
      "Cover an issuer universe, publish rating case studies, and present credit views in monthly desk meetings.",
    produces: [
      {
        title: "Monthly Research",
        body: "Each month, associates publish spread moves and rating actions in their assigned market to the desk.",
      },
      {
        title: "Issuer Rating Case Studies",
        body: "Full credit reviews using an S&P-style scorecard, walking through business, financial and structural risk.",
      },
      {
        title: "Associate-Led Lessons",
        body: "Each associate teaches a session on their corner of the credit market, building both depth and presentation reps.",
      },
      {
        title: "Private Credit Recruitment",
        body: "CV reviews, mock interviews and case practice for private credit and fixed income roles.",
      },
    ],
    targetFirms: [
      "PIMCO",
      "Apollo",
      "Ares",
      "Oaktree",
      "HPS",
      "Blackstone Credit",
      "BlueBay",
      "Muzinich",
    ],
    people: [{ name: "Luka Thomson", role: "Head of Fixed Income" }],
  },
  {
    slug: "corporate-relations",
    name: "Corporate Relations",
    short:
      "Build EMFC's relationships with firms. Sponsorships, partnerships and the people behind both.",
    long: "A support function open to all master's students. Own outreach to partner firms, structure sponsorship conversations, and run logistics for corporate events and study trips.",
    function: "Partnerships, sponsorship and long-term relationships with partner firms.",
    head: "Nick Kriz",
    verticals: [],
    deskLabel: "Area of interest",
    associate:
      "Reach out to partner firms, manage sponsorship conversations, and coordinate logistics for corporate events and study trips.",
    support: true,
    produces: [
      {
        title: "Partner Firm Outreach",
        body: "Identify and engage partner firms across banking, private capital and asset management.",
      },
      {
        title: "Sponsorship Programme",
        body: "Structure and manage sponsorship packages that fund events, trips and member resources.",
      },
      {
        title: "Event Logistics",
        body: "Run logistics for corporate visits, panels and study trips alongside the Department Heads.",
      },
    ],
    people: [{ name: "Nick Kriz", role: "Head of Corporate Relations" }],
  },
  {
    slug: "marketing",
    name: "Marketing",
    short: "Brand, communications, social media and event execution.",
    long: "A support function open to all master's students. Own EMFC's voice, social channels, member communications and on-the-ground event execution.",
    function: "Brand, communications, social media and event execution.",
    head: "David Villar",
    verticals: [],
    deskLabel: "Area of interest",
    associate:
      "Run social channels and newsletters, design member-facing materials, and execute on-site at events and conferences.",
    support: true,
    produces: [
      {
        title: "Brand & Identity",
        body: "Own EMFC's visual identity across digital and print, from member-facing materials to event collateral.",
      },
      {
        title: "Social & Communications",
        body: "Run Instagram, LinkedIn and the member newsletter. Cover events live and grow the EMFC audience.",
      },
      {
        title: "Event Execution",
        body: "On-site execution at speaker events, panels and conferences, working alongside Corporate Relations and the Department Heads.",
      },
    ],
    people: [{ name: "David Villar", role: "Head of Brand" }],
  },
];

export const getDepartment = (slug: string) => departments.find((d) => d.slug === slug);
