// Club statistics from the member form (72 answers by 5 November 2026), plus Paul Christian Abel, who
// is on the site but did not fill it in. Totals only, nothing about one person, and only figures that
// help the club (Vasco's decision). Source: the content package statistics (club Drive). When they
// change, the homepage and page descriptions change with them.

export const STATS = {
  members: 73,
  nationalities: 29,
  internationalPct: 88,
  languages: 16,
  universities: 53,
  universityCountries: 22,
  programmes: 7,
  experiencePct: 96,
  internships: 179,
  firms: 129,
  countriesWorked: 22,
  cems: 10,
  graduating2027Pct: 85,
} as const;

/** What members aim for: share of members picking each area or city (up to three each). */
export const TARGET_AREAS = [
  { name: "Private Equity", pct: 44 },
  { name: "Investment Banking", pct: 40 },
  { name: "Consulting", pct: 31 },
  { name: "Asset Management", pct: 29 },
  { name: "Venture Capital", pct: 25 },
  { name: "Sales & Trading", pct: 19 },
  { name: "Fintech", pct: 14 },
  { name: "Private Credit", pct: 11 },
] as const;

export const TARGET_CITIES = [
  { name: "London", pct: 69 },
  { name: "Madrid", pct: 35 },
  { name: "Zurich", pct: 26 },
  { name: "Barcelona", pct: 24 },
  { name: "Munich", pct: 22 },
  { name: "Frankfurt", pct: 17 },
  { name: "Amsterdam", pct: 15 },
  { name: "Paris", pct: 15 },
] as const;
