// Every report and document the departments have published or announced, from the content package
// of 2 November 2026 (reports.json, club Drive). Each one shows on its desk or department
// page and in the library on the Resources page (decided 2 November).
// Once the admin page is live, reports come from the database and this list is the fallback.

export type Report = {
  id: string;
  title: string;
  series: string;
  /** Issue or edition, as printed. */
  issue?: string;
  /** For sorting: the day or month it came out (a month alone counts as its last day). Empty for a
   * standing document, such as a desk one-pager or the fund's policy, which is listed after the dated ones. */
  date: string;
  department: string;
  desk?: string;
  authors?: string[];
  pages?: number;
  file?: string;
  link?: string;
  status: "published" | "coming";
};

export const REPORTS: Report[] = [
  {
    id: "fintech-market-insight-2026-10",
    title: "Fintech in October 2026: scale over disruption",
    series: "FinTech Market Insight",
    issue: "October 2026",
    date: "2026-11-05",
    department: "private-markets",
    desk: "fintech",
    authors: ["Margarida Loureiro", "Anastasia Murgida"],
    pages: 5,
    file: "/reports/fintech-market-insight-2026-10.pdf",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7524133206770495488/",
    status: "published",
  },
  {
    id: "monthly-market-views-2026-10",
    title: "No Country for Cheap Money: Treasury Yields at Their Highest since 2007",
    series: "Monthly Market Views",
    issue: "October 2026",
    date: "2026-10",
    department: "asset-management",
    desk: "macro-and-strategy",
    authors: ["Luís Laboreiro", "Alexander Schilling"],
    pages: 5,
    file: "/reports/monthly-market-views-2026-10.pdf",
    status: "published",
  },
  {
    id: "monthly-market-views-2026-09",
    title: "Empire Strikes Back: Nvidia reclaims control",
    series: "Monthly Market Views",
    issue: "September 2026",
    date: "2026-09",
    department: "asset-management",
    desk: "macro-and-strategy",
    authors: ["Luís Laboreiro", "Luka Thomson"],
    pages: 4,
    file: "/reports/monthly-market-views-2026-09.pdf",
    status: "published",
  },
  {
    id: "monthly-market-views-2026-07",
    title: "Nerves return: geopolitical tension and AI capex fears test market resilience",
    series: "Monthly Market Views",
    issue: "July 2026, Issue 07",
    date: "2026-07",
    department: "asset-management",
    desk: "macro-and-strategy",
    authors: ["Luís Laboreiro", "Luka Thomson"],
    pages: 4,
    file: "/reports/monthly-market-views-2026-07.pdf",
    status: "published",
  },
  {
    id: "fixed-income-market-monitor-2026-10",
    title: "Fixed Income Market Monitor, October 2026",
    series: "Fixed Income Market Monitor",
    issue: "October 2026",
    date: "2026-10",
    department: "fixed-income",
    authors: [
      "Joan Brugada",
      "Nin Sacristan",
      "Paul Emil Manner",
      "Jules Coppens",
      "Hugo Heise",
      "Giulia Weber Colussi",
      "Liam Thiele",
      "Luka Thomson",
    ],
    pages: 15,
    file: "/reports/fixed-income-market-monitor-2026-10.pdf",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7521957921602285568/",
    status: "published",
  },
  {
    id: "fixed-income-market-monitor-2026-09",
    title: "Fixed Income Market Monitor, week ending 4 September 2026",
    series: "Fixed Income Market Monitor",
    issue: "4 September 2026",
    date: "2026-09-04",
    department: "fixed-income",
    authors: ["Fixed Income department", "Luka Thomson"],
    pages: 9,
    file: "/reports/fixed-income-market-monitor-2026-09.pdf",
    status: "published",
  },
  {
    id: "real-assets-market-insight-2026-q3",
    title: "Real assets in Q3 2026: where the money is going",
    series: "Market Insight",
    issue: "Q3 2026",
    date: "2026-10-15",
    department: "private-markets",
    desk: "real-assets",
    authors: ["Jan Heibel", "Luca Flusche"],
    pages: 4,
    file: "/reports/real-assets-market-insight-2026-q3.pdf",
    link: "https://www.linkedin.com/feed/update/urn:li:activity:7515488571969945600/",
    status: "published",
  },
  {
    id: "real-assets-one-pager",
    title: "The Real Assets desk: who we are and how to reach us",
    series: "Desk one-pager",
    date: "",
    department: "private-markets",
    desk: "real-assets",
    pages: 1,
    file: "/reports/real-assets-one-pager.pdf",
    status: "published",
  },
  {
    id: "emfc-global-equity-fund-ips",
    title: "EMFC Global Equity Fund: Investment Policy Statement",
    series: "Fund documents",
    issue: "Version 1.0, October 2026",
    date: "",
    department: "asset-management",
    desk: "portfolio-management",
    pages: 14,
    file: "/reports/emfc-global-equity-fund-ips-v1.0.pdf",
    status: "published",
  },
  {
    id: "ma-case-study-paramount-wbd",
    title: "M&A case study: Paramount Skydance's takeover of Warner Bros. Discovery",
    series: "M&A Deal Case Study",
    date: "2026-11",
    department: "investment-banking",
    desk: "m-and-a",
    status: "coming",
  },
  {
    id: "pe-deal-of-the-month",
    title: "Deal of the Month",
    series: "Monthly",
    date: "2026-11",
    department: "private-markets",
    desk: "private-equity",
    status: "coming",
  },
  {
    id: "spanish-mid-market-pe-review",
    title: "Spanish Mid-Market PE Review",
    series: "Annual",
    date: "2026-11",
    department: "private-markets",
    desk: "private-equity",
    status: "coming",
  },
  {
    id: "pe-investment-memo-drafting",
    title: "Investment Memo Drafting",
    series: "Private Equity",
    date: "2026-11",
    department: "private-markets",
    desk: "private-equity",
    status: "coming",
  },
];

/** A month alone ("2026-10") sorts as the end of that month, after the reports dated within it. */
const sortDate = (r: Report) => (r.date.length === 7 ? `${r.date}-31` : r.date);

/** Newest first; standing documents (no date) after the dated reports; reports in preparation last. */
const newestFirst = (a: Report, b: Report) =>
  Number(a.status === "coming") - Number(b.status === "coming") ||
  Number(!a.date) - Number(!b.date) ||
  sortDate(b).localeCompare(sortDate(a));

export const reportsFor = (reports: Report[], department: string, desk?: string) =>
  reports.filter((r) => r.department === department && (desk === undefined || r.desk === desk)).sort(newestFirst);

export const sortReports = (reports: Report[]) => [...reports].sort(newestFirst);
