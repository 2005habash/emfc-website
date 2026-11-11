// The companies EMFC partners with, side by side on the Resources page under the reports. Each
// partner's name is set in the site's type in the partner's own colour, the way Greenroom has been
// shown since October 2026.

export type Partner = {
  name: string;
  /** The partner's colour, on light and on dark backgrounds. */
  colour: string;
  colourDark: string;
  /** What the partner is to the club, in a few words. */
  role: string;
  tagline: string;
  /** What it does for members, in a sentence or two. */
  summary: string;
  /** Where the button goes: the club's own partnership link where the partner has one. */
  link: string;
  cta: string;
};

export const PARTNERS: Partner[] = [
  {
    name: "Trakvia",
    colour: "#4F46E5",
    colourDark: "#A5B4FC",
    role: "Internship tracker partner",
    tagline: "Every internship. Every day.",
    summary:
      "A free tracker of finance internships in Europe: open roles at more than 900 firms, checked every hour, with alerts and a tracker for your applications.",
    // The club's partnership link (11 November 2026): it opens Trakvia's invitation from the club,
    // with the club's logo. Trakvia has nowhere to type a code, so none is shown.
    link: "https://www.trakvia.de/r/MSFC26",
    cta: "Join Trakvia",
  },
  {
    name: "Greenroom",
    colour: "#2A5C3A",
    colourDark: "#7FC596",
    role: "Mock interview partner",
    tagline: "Your mock interview partner for finance.",
    summary:
      "AI mock interviews for Investment Banking, Private Equity and Asset Management, with questions drawn from real interviews at more than 30 banks.",
    link: "https://greenroomprep.live/",
    cta: "Visit Greenroom",
  },
];
