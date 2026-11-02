// Every report and document the departments have published or announced, from the content package
// of 2 November 2026 (content/2026-11-02/reports.json). Each one shows on its desk or department
// page and in the library on the Resources page (decided 2 November).
// Once the admin page is live, reports come from the database and this list is the fallback.

export type Report = {
  id: string;
  title: string;
  series: string;
  /** Issue or edition, as printed. */
  issue?: string;
  /** For sorting: the month or day it came out. */
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
    link: "https://lnkd.in/p/ebkynQ-q",
    status: "published",
  },
  {
    id: "real-assets-one-pager",
    title: "The Real Assets desk: who we are and how to reach us",
    series: "Desk one-pager",
    date: "2026-10",
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
    date: "2026-10",
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

const newestFirst = (a: Report, b: Report) =>
  Number(a.status === "coming") - Number(b.status === "coming") || b.date.localeCompare(a.date);

export const reportsFor = (department: string, desk?: string) =>
  REPORTS.filter((r) => r.department === department && (desk === undefined || r.desk === desk)).sort(newestFirst);

export const ALL_REPORTS = [...REPORTS].sort(newestFirst);
