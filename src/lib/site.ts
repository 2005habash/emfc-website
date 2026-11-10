// Site-wide content and settings for the public EMFC pages.

export const SOCIAL = {
  instagram: "https://instagram.com/esademastersfinanceclub",
  linkedin: "https://www.linkedin.com/company/esade-finance-club/",
} as const;

/**
 * When the next intake opens, as an ISO date-time in Barcelona time
 * (for example "2027-02-01T09:00:00+01:00"). Leave as null while no date is set:
 * the site then shows "Recruiting reopens next term" instead of a countdown.
 */
export const NEXT_INTAKE_OPENS: string | null = null;

/**
 * The full fund page (portfolio, holdings and charts) stays hidden until the portfolio is built.
 * Set to true to show it instead of the "Coming soon" page.
 */
export const FUND_PAGE_LIVE = false;

export const IMAGES = {
  placaEspanya: "/images/barcelona/placa-espanya.jpg",
  sagradaFamilia: "/images/barcelona/sagrada-familia.jpg",
  parkGuell: "/images/barcelona/park-guell.jpg",
  portOlimpic: "/images/barcelona/port-olimpic.jpg",
  teamGroup: "/images/team-group.jpg",
  bullMark: "/images/logo/bull-mark.png",
  bullTile: "/images/logo/bull-tile.png",
  /** The picture LinkedIn, WhatsApp and others show when a link is shared (1200 x 630, from tools/share-card.html). */
  share: "/images/share/emfc.jpg",
} as const;

/** The live address. Link previews need full addresses for their pictures, not paths. */
export const SITE_URL = "https://www.emfc.es";
/** Today's date in Barcelona (YYYY-MM-DD). Events are "upcoming" or "past" by Barcelona's calendar,
 * the same on the server and in the browser, wherever either is. */
export const todayInBarcelona = (at: Date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);

/** Only links that are safe to put in a page: https, mailto or a path on this site. Anything else
 * (for example a "javascript:" link typed into the admin page) is dropped. */
export const safeUrl = (url: string | null | undefined) => {
  const u = url?.trim();
  return u && /^(https:\/\/|mailto:|\/(?!\/))/i.test(u) ? u : undefined;
};

export const absoluteUrl = (path: string) =>
  /^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`;

/**
 * "Where our members have worked", the homepage strip: the best-known firms on members' profiles, 20 of
 * them, each shown as its logo (src/data/logos.ts). The order is Vasco's (10 November 2026): the band
 * starts moving at once, so Santander goes first and eyes land on J.P. Morgan and Goldman Sachs; the
 * most prestigious come together at the front, and the Big Four last. Lazard Asset Management is on a
 * member's profile; the strip shows the group's Lazard logo.
 */
export const MEMBER_FIRMS = [
  "Santander",
  "J.P. Morgan",
  "Goldman Sachs",
  "Ardian",
  "Lazard",
  "UBS",
  "William Blair",
  "BNP Paribas",
  "HSBC",
  "Natixis CIB",
  "Crédit Agricole",
  "UniCredit",
  "Amundi",
  "Allianz Global Investors",
  "Meridiam",
  "Euronext",
  "Deloitte",
  "PwC",
  "EY",
  "KPMG",
] as const;

/** The main menu. "giggle" marks the Arcade, whose name hops when hovered. */
export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/departments", label: "Departments", menu: "departments" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
  { to: "/fund", label: "Fund" },
  { to: "/team", label: "Team" },
  { to: "/sponsorship", label: "Sponsorship" },
  { to: "/arcade", label: "Arcade", giggle: true },
] as const;

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const CO_PRESIDENT_QUOTE =
  "EMFC was built for master's students who arrive at ESADE already close to recruiting and want a real community around it. The work and the people, in equal measure.";

/** A day as "14 September 2026", or with short months as "14 Sep 2026": always three letters, where
 * British English would write "Sept". */
export const formatDay = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Date(`${iso.length === 10 ? iso : `${iso}-01`}T12:00:00`)
    .toLocaleDateString("en-GB", {
      day: iso.length === 10 ? "numeric" : undefined,
      month: "long",
      year: "numeric",
      ...opts,
    })
    .replace(/\bSept\b/, "Sep");

const WORDS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
];

/** A small number in words, the way the site's text writes them ("six departments"); larger ones in digits. */
export const inWords = (n: number) => WORDS[n] ?? String(n);

/** The same, with a capital: the start of a sentence. */
export const InWords = (n: number) => inWords(n).replace(/^./, (c) => c.toUpperCase());
