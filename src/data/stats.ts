// Club statistics from the member form (64 answers, closed 1 November 2026), plus the two leaders
// on the site who did not fill it in. Totals only, nothing about one person, and only figures that
// help the club (Vasco's decision). Source: the content package statistics (club Drive).

export const STATS = {
  members: 66,
  departments: 6,
  nationalities: 27,
  internationalPct: 86,
  languages: 16,
  universities: 49,
  universityCountries: 22,
  programmes: 7,
  experiencePct: 97,
  internships: 158,
  firms: 124,
  countriesWorked: 21,
  graduating2027Pct: 88,
} as const;

/** What members aim for: share of members picking each area or city (up to three each). */
export const TARGET_AREAS = [
  { name: "Private Equity", pct: 44 },
  { name: "Investment Banking", pct: 42 },
  { name: "Consulting", pct: 30 },
  { name: "Asset Management", pct: 28 },
  { name: "Venture Capital", pct: 27 },
  { name: "Sales & Trading", pct: 22 },
] as const;

export const TARGET_CITIES = [
  { name: "London", pct: 70 },
  { name: "Madrid", pct: 38 },
  { name: "Barcelona", pct: 27 },
  { name: "Zurich", pct: 27 },
  { name: "Munich", pct: 20 },
  { name: "Amsterdam", pct: 16 },
] as const;
