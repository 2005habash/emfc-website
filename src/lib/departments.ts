// Departments and their desks. Texts are the departments' own, word for word, from the content package
// of 2 November 2026 (content/2026-11-02/departments). People come from src/data/members.ts.
// `drafted: true` marks a text written from the department's material, waiting for its Head or
// Vice-President to confirm (see REVAMP-PLAN.md, section 13). The flag is never shown on the site.

export type Firm = {
  name: string;
  /** Desk slugs the firm is tagged with on the department page. */
  desks?: string[];
  /** Added to fill the grid of 12; the desk can swap it. Not shown on the site. */
  proposed?: boolean;
};

export type WorkItem = { title: string; body: string; frequency?: string };

export type Desk = {
  slug: string;
  name: string;
  /** Fixed Income only: the group the desk belongs to. */
  group?: string;
  /** Shown next to the Head on the desk page. */
  lead?: string;
  /** One line on the department page. */
  line: string;
  description: string;
  does: string[];
  targetFirms: Firm[];
  /** Planned activities without a date yet. */
  planned?: string[];
  drafted?: boolean;
};

export type Department = {
  slug: string;
  name: string;
  short: string;
  long: string;
  function: string;
  associate: string;
  head: string;
  produces: WorkItem[];
  targetFirms: Firm[];
  desks: Desk[];
  /** Fixed Income: desks shown in two groups. */
  groups?: { name: string; lead: string; desks: string[] }[];
};

const firms = (names: string[], proposed: string[] = []): Firm[] => [
  ...names.map((name) => ({ name })),
  ...proposed.map((name) => ({ name, proposed: true })),
];

const IB_FIRMS = firms([
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
]);

const AM_FIRMS = firms(
  ["BlackRock", "Fidelity", "Capital Group", "Vanguard", "State Street", "Schroders", "Amundi", "PIMCO"],
  ["J.P. Morgan Asset Management", "Goldman Sachs Asset Management", "Wellington Management", "T. Rowe Price"],
);

const FI_FIRMS = firms(
  [
    "PIMCO",
    "RBC BlueBay Asset Management",
    "TwentyFour Asset Management",
    "Loomis Sayles",
    "PGIM Fixed Income",
    "Ares Management",
    "Arcmont Asset Management",
    "Hayfin Capital Management",
    "Golub Capital",
    "Pemberton Asset Management",
  ],
  ["Apollo", "Oaktree Capital Management"],
);

/** A Fixed Income desk: the department's own work, applied to one market. */
const fiDesk = (slug: string, name: string, group: string, line: string, lead?: string): Desk => ({
  slug,
  name,
  group,
  lead,
  line,
  description: `${line} Members cover this market in the monthly Fixed Income Market Monitor, work through debt capital markets case studies, and present their findings in desk meetings.`,
  does: [
    `Their section of the monthly Fixed Income Market Monitor`,
    "Debt capital markets case studies across public and private debt markets",
    "Findings presented in desk meetings",
  ],
  targetFirms: FI_FIRMS,
  drafted: true,
});

export const departments: Department[] = [
  {
    slug: "investment-banking",
    name: "Investment Banking",
    short:
      "M&A and Debt Advisory. Monthly deal case studies, coffee chats with bankers, and recruiting prep for investment banking.",
    long: "A coverage desk built like an analyst pool. A monthly M&A deal case study, coffee chats with bankers every two weeks, CV workshops and structured interview prep for investment banking recruiting.",
    function:
      "M&A and Debt Advisory coverage. Monthly deal case studies, coffee chats with investment banking professionals, CV workshops and interview prep.",
    associate:
      "Write live deal notes, build models with the Vice-Presidents, and join mock interview rounds. Meet bankers through coffee chats and small-group sessions.",
    head: "Yonatan Bendler",
    produces: [
      {
        title: "M&A Deal Case Study",
        frequency: "Monthly",
        body: "In-depth analysis of live and recent M&A deals, covering deal rationale, valuation, financing and regulatory issues.",
      },
      {
        title: "Coffee Chats",
        frequency: "Every two weeks",
        body: "Informal sessions with investment banking professionals across teams, sectors and locations, London and New York so far.",
      },
      {
        title: "CV Workshops",
        frequency: "Once per term, upon demand",
        body: "Helping members tailor their CVs for investment banking applications.",
      },
      {
        title: "Interview Prep, Company Visits & Networking",
        frequency: "As scheduled",
        body: "Technical and behavioural practice for recruiting season, and events connecting members with banks and other financial firms.",
      },
    ],
    targetFirms: IB_FIRMS,
    desks: [
      {
        slug: "m-and-a",
        name: "M&A",
        lead: "Constantin Molineus",
        line: "Hands-on exposure to mergers and acquisitions advisory, and preparation for careers in investment banking.",
        description:
          "The M&A Desk of the ESADE Master's Finance Club gives members hands-on exposure to mergers and acquisitions advisory and helps them prepare for careers in investment banking.",
        does: [
          "Case studies: in-depth analysis of live and recent M&A deals, covering deal rationale, valuation, financing and regulatory issues.",
          "Coffee chats: informal sessions with investment banking professionals across teams, sectors and locations.",
          "Company visits and networking events: connecting members with banks and other financial firms.",
          "CV workshops: helping members tailor their CVs for investment banking applications.",
          "Interview preparation: technical and behavioural practice for recruiting season.",
          "Market updates: regular discussion of notable deals and trends in M&A and capital markets.",
        ],
        targetFirms: IB_FIRMS,
      },
      {
        slug: "debt-advisory",
        name: "Debt Advisory",
        lead: "João Salgado",
        line: "How companies and private equity funds raise debt, from leveraged buyouts to refinancings and restructurings.",
        description:
          "Every deal needs financing. We cover how companies and private equity funds raise debt, from leveraged buyouts and acquisition financing to refinancings and restructurings. Members follow live deals, build their credit and capital structure skills, and prepare for Leveraged Finance, DCM and debt advisory roles at bulge brackets and boutiques.",
        does: [
          "Live deals followed from leveraged buyouts and acquisition financing to refinancings and restructurings.",
          "Credit and capital structure skills.",
          "Preparation for Leveraged Finance, DCM and debt advisory roles at bulge brackets and boutiques.",
        ],
        targetFirms: IB_FIRMS,
      },
    ],
  },
  {
    slug: "private-markets",
    name: "Private Markets",
    short:
      "Private markets coverage with direct access to investors across PE, VC & Growth, Fintech and Real Assets.",
    long: "The private markets desk. Associates work on deal teardowns and investment memos, meet investors from partner firms, and sit in on speaker events and recruiting prep across PE, VC & Growth, Fintech and Real Assets.",
    function:
      "Private markets coverage across PE, VC & Growth, Fintech and Real Assets. Deal teardowns, sector sessions, recruiting prep and speaker events with investors from partner firms.",
    associate:
      "Look at private market deals, write investment memos, and present to the desk. Get face time with investors and alumni working in the space.",
    head: "Jan Heibel",
    produces: [
      {
        title: "Deal Teardowns",
        body: "Regular deal coverage across PE, VC & Growth, Fintech and Real Assets, from short deal notes to full investment memos.",
      },
      {
        title: "Sector & Market Education",
        body: "Asset class mechanics, investor thinking and current macro trends across private markets, plus technical training on accounting, valuation and LBO mechanics.",
      },
      {
        title: "Interview Prep & Case Simulations",
        body: "CV screening, mock interviews, paper LBO workshops and case practice tailored to PE, VC, Fintech and Real Assets recruiting.",
      },
      {
        title: "Speaker Events",
        body: "Roundtables and coffee chats with alumni and industry professionals, with an Industry Profile on each speaker planned.",
      },
      {
        title: "Study Tours & Outreach",
        body: "Working toward Barcelona, Madrid and London trips, buddy systems, alumni dinners, company visits and IC competitions.",
      },
      {
        title: "Research & Reports",
        body: "Deal notes and sector reports across the four verticals, such as the quarterly Real Assets Market Insight, with the annual Spanish Mid-Market PE Review and Industry Profiles on our speakers in preparation.",
      },
    ],
    targetFirms: [
      { name: "Blackstone", desks: ["private-equity"] },
      { name: "KKR", desks: ["private-equity"] },
      { name: "CVC", desks: ["private-equity"] },
      { name: "Warburg Pincus", desks: ["private-equity"] },
      { name: "Ardian", desks: ["private-equity", "real-assets"] },
      { name: "Index Ventures", desks: ["vc-and-growth"] },
      { name: "Atomico", desks: ["vc-and-growth"] },
      { name: "Sequoia Capital", desks: ["vc-and-growth"] },
      { name: "General Atlantic", desks: ["vc-and-growth"] },
      { name: "EQT", desks: ["private-equity", "real-assets"] },
      { name: "Brookfield", desks: ["real-assets"] },
      { name: "Hg", desks: ["private-equity"] },
    ],
    desks: [
      {
        slug: "private-equity",
        name: "Private Equity",
        lead: "Fabian Luis Seher",
        line: "How buyout funds find, value and finance deals, with a monthly Deal of the Month, paper LBO workshops, mock interviews and the annual Spanish Mid-Market PE Review.",
        description:
          "How buyout funds find, value and finance deals, with a monthly Deal of the Month, paper LBO workshops, mock interviews and the annual Spanish Mid-Market PE Review.",
        does: [
          "Deal of the Month: one buyout or mid-market deal a month, from short deal notes to a full investment memo.",
          "Technical training: accounting and valuation fundamentals for PE interviews, three-statement links, EV to equity bridge and LBO mechanics.",
          "Paper LBO workshops: building a paper LBO under time pressure, as tested in PE interviews.",
          "CV screening and mock interviews for PE and IB recruiting.",
          "Roundtables and coffee chats with PE professionals and alumni, with Industry Profiles documenting them planned.",
          "The Spanish Mid-Market PE Review, an annual report.",
          "A PE Case Competition: teams analyse a buyout case and pitch to a jury of PE professionals.",
        ],
        targetFirms: firms(
          ["Blackstone", "KKR", "CVC", "Warburg Pincus", "Ardian", "EQT", "Hg", "Silver Lake"],
          ["Carlyle", "Advent International", "Permira", "Cinven"],
        ),
        planned: [
          "Paper LBO Workshop: a hands-on session building a paper LBO under time pressure, as tested in PE interviews.",
          "PE Case Competition: teams analyse a buyout case and pitch an investment recommendation to a jury of PE professionals.",
        ],
        drafted: true,
      },
      {
        slug: "vc-and-growth",
        name: "VC & Growth",
        lead: "Zaid Habash",
        line: "How venture and growth investors find, back and build companies, with a monthly paper on the venture market or a single deal planned.",
        description:
          "How venture and growth investors find, back and build companies. The desk is preparing a regular paper, either on the venture market as a whole or on one fund or deal.",
        does: [
          "A paper on the venture market or on a single fund or deal, planned monthly.",
          "The Venture Capital table at the alumni roundtables, with Miguel Bowden of InnoEnergy.",
          "Recruiting prep for venture capital and growth roles, with the rest of Private Markets.",
        ],
        targetFirms: firms(
          ["Sequoia Capital", "Index Ventures", "Atomico", "General Atlantic"],
          [
            "Accel",
            "General Catalyst",
            "Lightspeed Venture Partners",
            "Balderton Capital",
            "Creandum",
            "EQT Ventures",
            "Northzone",
            "Partech",
          ],
        ),
        drafted: true,
      },
      {
        slug: "fintech",
        name: "Fintech",
        lead: "Anastasia Murgida",
        line: "Payments, digital banking and the technology changing financial services, from early-stage startups to the fintech teams of banks and investors.",
        description:
          "Payments, digital banking and the technology changing financial services, from early-stage startups to the fintech teams of banks and investors.",
        does: [
          "Speaker sessions on fintech and payments, such as the equity research session with a former UBS FinTech & Payments analyst.",
          "The Fintech table at the alumni roundtables, with Martin Nicholls of Frekuent.",
        ],
        targetFirms: firms(
          [],
          [
            "Stripe",
            "Adyen",
            "Revolut",
            "Klarna",
            "Wise",
            "Checkout.com",
            "N26",
            "Monzo",
            "Trade Republic",
            "Nubank",
            "Plaid",
            "Coinbase",
          ],
        ),
        drafted: true,
      },
      {
        slug: "real-assets",
        name: "Real Assets",
        lead: "Luca Flusche",
        line: "Deep dives into real estate, infrastructure and the energy transition.",
        description:
          "We are the Real Assets team of the ESADE Master's Finance Club, a group of finance students who love real estate, infrastructure and the energy transition. We dig into real deals and market data, share what we find, and help each other get ready for a career in private markets.",
        does: [
          "Market Insights: a quarterly report on where capital is flowing across real estate, infrastructure and energy.",
          "Deal breakdowns: live transactions taken apart, structure, pricing, financing and why the buyer bought.",
          "Sector deep dives: focused research on themes such as data centres, logistics, living sectors and the grid.",
          "Modelling workshops: hands-on sessions building real estate and infrastructure models, from appraisals to waterfalls.",
          "Industry sessions: talks and coffee chats with practitioners and ESADE alumni working in real assets.",
          "Recruiting prep: technical drills, case studies and mock interviews for real estate and infrastructure roles.",
        ],
        targetFirms: firms(
          ["EQT", "CBRE Investment Management", "Ardian", "Brookfield"],
          [
            "Macquarie Asset Management",
            "Antin Infrastructure Partners",
            "Meridiam",
            "Copenhagen Infrastructure Partners",
            "Patrizia",
            "Hines",
            "Nuveen Real Estate",
            "AXA IM Alts",
          ],
        ),
        planned: ["A team deal teardown and industry insights."],
      },
    ],
  },
  {
    slug: "asset-management",
    name: "Asset Management",
    short:
      "Run a real paper trading portfolio, build a track record, and meet portfolio managers from Barcelona and beyond.",
    long: "The buy-side desk. Members run a paper portfolio with full attribution, publish research, and host PMs and analysts. Bloomberg training included.",
    function:
      "Runs a paper trading portfolio across Macro & Strategy, Equity Research and Portfolio Management. Bloomberg training, equity research output, and recurring sessions with practising PMs.",
    associate:
      "Cover a sector or strategy, publish research, and pitch ideas into the portfolio. Help organise events with industry guests.",
    head: "Cosimo Dini",
    produces: [
      {
        title: "Portfolio Management",
        body: "Security selection, sector and regional allocation, risk management and execution of the investment committee's themes across the book.",
      },
      {
        title: "Equity Research",
        body: "Research, valuation and risk assessment work, for potential suitable names for the portfolio.",
      },
      {
        title: "Investment Committee",
        body: "Sets the fund's investment themes and approves every thesis before it enters the portfolio.",
      },
      {
        title: "Market & Macro Research",
        body: "Central banks, economic data, geopolitics and asset allocation views, produced by the Macro & Strategy desk.",
      },
      {
        title: "Training & Industry Access",
        body: "Bloomberg training sessions, trading and investment challenges, London and Luxembourg business trips, plus speaker events with AM, WM and ER professionals.",
      },
    ],
    targetFirms: AM_FIRMS,
    desks: [
      {
        slug: "macro-and-strategy",
        name: "Macro & Strategy",
        line: "Central banks, economic data, geopolitics and asset allocation views, published each month in Monthly Market Views.",
        description:
          "Central banks, economic data, geopolitics and asset allocation views. The desk publishes Monthly Market Views and its views feed the investment committee's themes.",
        does: [
          "Monthly Market Views, the desk's monthly report on markets and the economy.",
          "Coverage of central banks, economic data and geopolitics.",
          "Asset allocation views for the investment committee.",
        ],
        targetFirms: AM_FIRMS,
        drafted: true,
      },
      {
        slug: "equity-research",
        name: "Equity Research",
        line: "Research, valuation and risk assessment of potential names for the portfolio.",
        description:
          "Research, valuation and risk assessment work on potential names for the portfolio, taken to the investment committee before any position enters the book.",
        does: [
          "Single-name research and valuation.",
          "Risk assessment of potential portfolio names.",
          "Theses presented to the investment committee before a position enters the portfolio.",
        ],
        targetFirms: AM_FIRMS,
        drafted: true,
      },
      {
        slug: "portfolio-management",
        name: "Portfolio Management",
        lead: "Luís Laboreiro",
        line: "Security selection, sector and regional allocation, risk management and execution of the investment committee's themes across the book.",
        description:
          "Security selection, sector and regional allocation, risk management and execution of the investment committee's themes across the book of the EMFC Global Equity Fund, an active global equity paper portfolio benchmarked against the MSCI World.",
        does: [
          "Runs the EMFC Global Equity Fund, an active global equity paper portfolio benchmarked against the MSCI World.",
          "Security selection, sector and regional allocation.",
          "Risk management and execution of the investment committee's themes.",
        ],
        targetFirms: AM_FIRMS,
        drafted: true,
      },
    ],
  },
  {
    slug: "fixed-income",
    name: "Fixed Income",
    short:
      "Debt capital markets, private credit, and buy-side debt. Prep for recruitment and direct access to fixed income professionals.",
    long: "A research-led desk covering public and private debt markets. Members produce a monthly Fixed Income Market Monitor, analysing market developments, trends and investment opportunities across asset classes. They also work through debt capital markets case studies and engage with industry professionals through speaker sessions.",
    function:
      "Research-led coverage of public and private debt markets: a monthly Fixed Income Market Monitor, debt capital markets case studies and speaker sessions with industry professionals.",
    associate:
      "Contribute to the monthly Fixed Income Market Monitor, analyse developments in their assigned markets, work through debt capital markets case studies, and present their findings in desk meetings.",
    head: "Luka Thomson",
    produces: [
      {
        title: "Monthly Research",
        body: "Each month, associates publish spread moves and rating actions in their assigned market to the desk.",
      },
      {
        title: "Debt Capital Markets Case Studies",
        body: "Work through real-world transactions across public and private debt markets, examining financing structures, pricing, investor demand and the factors influencing funding decisions.",
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
    targetFirms: FI_FIRMS,
    groups: [
      {
        name: "Public credit",
        lead: "Luka Thomson",
        desks: [
          "rates-and-government-bonds",
          "investment-grade-credit",
          "high-yield-credit",
          "mortgage-backed-securities",
        ],
      },
      { name: "Private credit", lead: "Tim Constantin Ziegler", desks: ["private-credit", "direct-lending"] },
    ],
    desks: [
      fiDesk(
        "rates-and-government-bonds",
        "Rates & Government Bonds",
        "Public credit",
        "Government bond markets, central bank policy and the shape of the yield curve.",
      ),
      fiDesk(
        "investment-grade-credit",
        "Investment Grade Credit",
        "Public credit",
        "Investment grade corporate bonds: spreads, new issuance and the credit quality of large issuers.",
      ),
      fiDesk(
        "high-yield-credit",
        "High Yield Credit",
        "Public credit",
        "High yield bonds and leveraged credit: spreads, defaults and the riskier end of corporate debt.",
      ),
      fiDesk(
        "mortgage-backed-securities",
        "Mortgage-Backed Securities",
        "Public credit",
        "Mortgage-backed securities and the housing and securitisation markets behind them.",
      ),
      fiDesk(
        "private-credit",
        "Private Credit",
        "Private credit",
        "Private credit funds and the lending they do outside the public bond markets.",
        "Tim Constantin Ziegler",
      ),
      fiDesk(
        "direct-lending",
        "Direct Lending",
        "Private credit",
        "Direct lending to mid-market companies, often alongside private equity buyouts.",
        "Tim Constantin Ziegler",
      ),
    ],
  },
  {
    slug: "corporate-relations",
    name: "Corporate Relations",
    short: "Build EMFC's relationships with firms. Sponsorships, partnerships and the people behind both.",
    long: "Open to all master's students. Own outreach to partner firms, structure sponsorship conversations, and run logistics for corporate events and company visits with every department.",
    function: "Partnerships, sponsorship and long-term relationships with partner firms.",
    associate:
      "Reach out to partner firms, manage sponsorship conversations, and coordinate logistics for corporate events and company visits.",
    head: "Nick Kriz",
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
        body: "Run logistics for corporate visits, panels and networking events alongside the Department Heads.",
      },
    ],
    targetFirms: [],
    desks: [],
  },
  {
    slug: "brand",
    name: "Brand",
    short: "Brand, communications, social media and event execution.",
    long: "Open to all master's students. Own EMFC's voice, social channels, member communications and on-the-ground event execution.",
    function: "Brand, communications, social media and event execution.",
    associate:
      "Run social channels and newsletters, design member-facing materials, and execute on-site at events and conferences.",
    head: "David Villar",
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
    targetFirms: [],
    desks: [],
  },
];

/** Old department slugs, for links made before the October 2026 rename. */
export const DEPARTMENT_ALIASES: Record<string, string> = {
  "pe-vc-fintech-real-assets": "private-markets",
  marketing: "brand",
};

export const getDepartment = (slug: string) =>
  departments.find((d) => d.slug === (DEPARTMENT_ALIASES[slug] ?? slug));

export const getDesk = (department: string, desk: string) =>
  getDepartment(department)?.desks.find((k) => k.slug === desk);

/** Every desk with its department, in site order. */
export const ALL_DESKS = departments.flatMap((d) => d.desks.map((desk) => ({ department: d, desk })));
