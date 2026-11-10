// Everything a visitor can play with on the site, in one list: the homepage's coffee break section,
// the career ladder and the lab page all read it. `to` and `params` are router links.

export type Activity = {
  id: string;
  title: string;
  hook: string;
  /** Where it lives, as shown on cards. */
  where: string;
  kind: "game" | "toy" | "people" | "make";
  to: string;
  params?: Record<string, string>;
  hash?: string;
};

const desk = (department: string, desk: string) => ({
  to: "/departments/$department/$desk",
  params: { department, desk },
});

export const ACTIVITIES: Activity[] = [
  {
    id: "quiz",
    title: "Which desk are you?",
    hook: "Five questions, fifteen desks, one answer.",
    where: "Departments",
    kind: "game",
    to: "/departments",
    hash: "quiz",
  },
  {
    id: "superday",
    title: "The Superday",
    hook: "Six questions, sixty seconds, one offer letter.",
    where: "Resources",
    kind: "game",
    to: "/resources",
    hash: "superday",
  },
  {
    id: "bull-or-bear",
    title: "Bull or bear?",
    hook: "Eight days that moved markets. Call each one.",
    where: "The Fund",
    kind: "game",
    to: "/fund",
    hash: "bull-or-bear",
  },
  {
    id: "real-or-made-up",
    title: "Real or made up?",
    hook: "Matador bonds, Pac-Man defences, paella defences. Which are real?",
    where: "Resources",
    kind: "game",
    to: "/resources",
    hash: "real-or-made-up",
  },
  {
    id: "roulette",
    title: "Coffee chat roulette",
    hook: "Spin, meet a member, say hello on LinkedIn.",
    where: "Team",
    kind: "people",
    to: "/team",
    hash: "roulette",
  },
  {
    id: "frame",
    title: "Wear the bull",
    hook: "An EMFC frame for your LinkedIn photo.",
    where: "Team",
    kind: "make",
    to: "/team",
    hash: "frame",
  },
  {
    id: "mouse-free",
    title: "Mouse-free",
    hook: "Name the Excel shortcut. The MD is watching.",
    where: "Off the clock",
    kind: "game",
    to: "/play",
    hash: "mouse-free",
  },
  {
    id: "tombstone",
    title: "Tombstone maker",
    hook: "Announce a deal of your own, banker style.",
    where: "Off the clock",
    kind: "make",
    to: "/play",
    hash: "tombstone",
  },
  {
    id: "paper-lbo",
    title: "Run a paper LBO",
    hook: "Four levers, one IRR. Can you clear 20%?",
    where: "Private Equity",
    kind: "toy",
    ...desk("private-markets", "private-equity"),
    hash: "paper-lbo",
  },
  {
    id: "accretion",
    title: "Accretive or dilutive?",
    hook: "Price a deal, watch the buyer's EPS.",
    where: "M&A",
    kind: "toy",
    ...desk("investment-banking", "m-and-a"),
    hash: "accretion",
  },
  {
    id: "return-the-fund",
    title: "Return the fund",
    hook: "Can one startup pay back a venture fund?",
    where: "VC & Growth",
    kind: "toy",
    ...desk("private-markets", "vc-and-growth"),
    hash: "return-the-fund",
  },
  {
    id: "dcf",
    title: "What's it worth?",
    hook: "A DCF in four levers.",
    where: "Equity Research",
    kind: "toy",
    ...desk("asset-management", "equity-research"),
    hash: "dcf",
  },
  {
    id: "bond-yield",
    title: "Move the yield",
    hook: "Watch a bond's price fall as yields rise.",
    where: "Rates & Government Bonds",
    kind: "toy",
    ...desk("fixed-income", "rates-and-government-bonds"),
    hash: "bond-yield",
  },
  {
    id: "cap-rate",
    title: "The cap rate seesaw",
    hook: "Half a point on the cap rate, millions on the value.",
    where: "Real Assets",
    kind: "toy",
    ...desk("private-markets", "real-assets"),
    hash: "cap-rate",
  },
];
