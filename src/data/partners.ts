// The companies EMFC partners with, shown first on the Resources page. Each partner's name is set in
// the site's type in the partner's own colour, the way Greenroom has been shown since October 2026.

export type Partner = {
  name: string;
  /** The partner's colour, on light and on dark backgrounds. */
  colour: string;
  colourDark: string;
  /** What the partner is to the club, in a few words. */
  role: string;
  tagline: string;
  heading: string;
  body: string[];
  features: { title: string; body: string }[];
  link: string;
  cta: string;
  /** A code that comes with the club's link, shown next to the button. */
  code?: string;
};

export const PARTNERS: Partner[] = [
  {
    name: "Trakvia",
    colour: "#4F46E5",
    colourDark: "#A5B4FC",
    role: "Internship tracker partner",
    tagline: "Every internship. Every day.",
    heading: "Every finance internship in Europe, in one place",
    body: [
      "Trakvia is a free internship tracker for finance in Europe. It lists open roles at more than 900 firms, from spring weeks to off-cycle internships, across M&A, investment banking, private equity, venture capital and consulting, and checks every one of them every hour.",
      "Members set alerts for the roles they want, follow each application in one place and go straight to the original posting. It is free, with no payment details asked.",
    ],
    features: [
      {
        title: "Every listing",
        body: "Spring weeks, summer and off-cycle internships at over 900 European firms, checked hourly and linked to the original posting.",
      },
      {
        title: "Job alerts",
        body: "An email as soon as a role opens that matches the firms, cities and areas you choose.",
      },
      {
        title: "Application tracker",
        body: "Status, interviews and deadlines in one place, with a reminder before each interview.",
      },
    ],
    link: "https://www.trakvia.de/r/EMSFC26",
    cta: "Join Trakvia",
    code: "EMSFC26",
  },
  {
    name: "Greenroom",
    colour: "#2A5C3A",
    colourDark: "#7FC596",
    role: "Mock interview partner",
    tagline: "Your mock interview partner for finance.",
    heading: "Greenroom Prep",
    body: [
      "Greenroom is an AI-powered mock interview platform built specifically for finance candidates targeting Investment Banking, Private Equity and Asset Management, and a natural partner for EMFC.",
      "Members use Greenroom to prep for interviews at Goldman Sachs, JPMorgan, Morgan Stanley, Blackstone, KKR, Lazard, Rothschild, Evercore, Moelis and other top firms.",
    ],
    features: [
      {
        title: "AI Interviewer",
        body: "Real follow-up questions that expose memorised answers and force you to think on your feet.",
      },
      {
        title: "Bank-specific prep",
        body: "30+ banks mapped by desk and recent deals. Every question drawn from real interviews, not recycled guides.",
      },
      {
        title: "Built for Europe",
        body: "Designed for London, Milan, Madrid, Paris and Frankfurt recruiting, with HireVue practice included.",
      },
    ],
    link: "https://greenroomprep.live/",
    cta: "Visit Greenroom",
  },
];
