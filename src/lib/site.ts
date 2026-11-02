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
} as const;

/**
 * Logos come from logo.dev by domain, with the same publishable key the 2026 Lovable site used.
 * The key is public by design (it is sent with every logo request).
 */
const LOGO_DEV_TOKEN = "pk_RUlFftUYS4eetzgWC4_DYA";
export const logoUrl = (domain: string, size = 120) =>
  `https://img.logo.dev/${domain}?token=${LOGO_DEV_TOKEN}&format=png&size=${size}&retina=true`;

/** "Where our members have worked": firms from the member form (content/2026-11-02/statistics). */
export const MEMBER_FIRMS = [
  { name: "J.P. Morgan", domain: "jpmorgan.com" },
  { name: "UBS", domain: "ubs.com" },
  { name: "BNP Paribas", domain: "bnpparibas.com" },
  { name: "HSBC", domain: "hsbc.com" },
  { name: "Santander", domain: "santander.com" },
  { name: "Ardian", domain: "ardian.com" },
  { name: "Lazard Asset Management", domain: "lazard.com" },
  { name: "Allianz Global Investors", domain: "allianzgi.com" },
  { name: "William Blair", domain: "williamblair.com" },
  { name: "Euronext", domain: "euronext.com" },
  { name: "EY", domain: "ey.com" },
  { name: "KPMG", domain: "kpmg.com" },
  { name: "Crédit Agricole", domain: "credit-agricole.com" },
  { name: "Natixis CIB", domain: "natixis.com" },
  { name: "ING Group", domain: "ing.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "PwC", domain: "pwc.com" },
  { name: "Alantra", domain: "alantra.com" },
] as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/departments", label: "Departments", menu: "departments" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
  { to: "/fund", label: "Fund" },
  { to: "/team", label: "Team" },
  { to: "/sponsorship", label: "Sponsorship" },
] as const;

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export const CO_PRESIDENT_QUOTE =
  "EMFC was built for master's students who arrive at ESADE already close to recruiting and want a real community around it. The work and the people, in equal measure.";

export const formatDay = (iso: string, opts: Intl.DateTimeFormatOptions = {}) =>
  new Date(`${iso.length === 10 ? iso : `${iso}-01`}T12:00:00`).toLocaleDateString("en-GB", {
    day: iso.length === 10 ? "numeric" : undefined,
    month: "long",
    year: "numeric",
    ...opts,
  });
