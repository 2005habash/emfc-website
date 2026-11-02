// Site-wide content and settings for the public EMFC pages.

export const SOCIAL = {
  instagram: "https://instagram.com/esademastersfinanceclub",
  linkedin: "https://www.linkedin.com/company/esade-finance-club/",
} as const;

export const SPONSORSHIP_EMAIL = "removed@example.com";

/**
 * When the next intake opens, as an ISO date-time in Barcelona time
 * (for example "2027-02-01T09:00:00+01:00"). Leave as null while no date is set:
 * the site then shows "Recruiting reopens next term" instead of a countdown.
 */
export const NEXT_INTAKE_OPENS: string | null = null;

export const IMAGES = {
  placaEspanya: "/images/barcelona/placa-espanya.jpg",
  sagradaFamilia: "/images/barcelona/sagrada-familia.jpg",
  parkGuell: "/images/barcelona/park-guell.jpg",
  portOlimpic: "/images/barcelona/port-olimpic.jpg",
  bullMark: "/images/logo/bull-mark.png",
  bullTile: "/images/logo/bull-tile.png",
} as const;

export const MEMBER_FIRMS = [
  "J.P. Morgan",
  "UBS",
  "Ardian",
  "Amundi",
  "Santander",
  "Nordea",
  "Euronext",
  "Meridiam",
  "Deloitte",
  "PwC",
  "KPMG",
  "CaixaBank",
] as const;

export const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/departments", label: "Departments" },
  { to: "/events", label: "Events" },
  { to: "/resources", label: "Resources" },
  { to: "/fund", label: "Fund" },
  { to: "/team", label: "Team" },
  { to: "/sponsorship", label: "Sponsorship" },
] as const;

export const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"] as const;

export type EventType = "Networking" | "Workshop" | "Speaker" | "Study Trip" | "Social";

export type EventItem = {
  id: string;
  title: string;
  date: string; // ISO date
  type: EventType;
  location: string;
  description: string;
  link?: string;
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  Networking: "#2F5BFF",
  Workshop: "#1F8A5B",
  Speaker: "#A8844B",
  "Study Trip": "#B4435A",
  Social: "#6B4FB3",
};

export const EVENTS: EventItem[] = [
  {
    id: "kickoff-dinner-2026",
    title: "Kickoff Dinner",
    date: "2026-09-14",
    type: "Social",
    location: "Barcelona",
    description:
      "The founding cohort's first gathering. An evening to meet the team, welcome incoming associates and set the tone for the year ahead.",
  },
];

export const CO_PRESIDENT_QUOTES = [
  "EMFC was built for master's students who arrive at ESADE already close to recruiting and want a real community around it. The work and the people, in equal measure.",
  "The Support Team is the engine behind everything members see. Corporate Relations and Marketing make the partnerships, the events and the brand of EMFC possible, working hand in hand with every investment desk.",
] as const;
