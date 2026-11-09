// "Which desk are you?" (the Departments page). Each answer gives points to the desks it sounds like,
// as "department/desk". The weights were tuned by trying all 1,024 ways through the quiz: every one of
// the 15 desks can come out, each for between about 6 and 8 percent of the ways.

export type QuizAnswer = { text: string; points: Record<string, number> };
export type QuizQuestion = { question: string; answers: QuizAnswer[] };

const MA = "investment-banking/m-and-a";
const DA = "investment-banking/debt-advisory";
const PE = "private-markets/private-equity";
const VC = "private-markets/vc-and-growth";
const FT = "private-markets/fintech";
const RA = "private-markets/real-assets";
const MS = "asset-management/macro-and-strategy";
const ER = "asset-management/equity-research";
const PM = "asset-management/portfolio-management";
const RATES = "fixed-income/rates-and-government-bonds";
const IG = "fixed-income/investment-grade-credit";
const HY = "fixed-income/high-yield-credit";
const MBS = "fixed-income/mortgage-backed-securities";
const PC = "fixed-income/private-credit";
const DL = "fixed-income/direct-lending";

/** When two desks tie, the one earlier in this list wins. */
export const TIE_ORDER = [PE, MA, VC, FT, RA, ER, MS, PM, DA, HY, IG, RATES, MBS, PC, DL];

export const QUIZ: QuizQuestion[] = [
  {
    question: "Friday, 11pm. Where are you?",
    answers: [
      {
        text: "In the office, turning comments on a pitch book",
        points: { [MA]: 3, [DA]: 3, [PE]: 1 },
      },
      { text: "At a founders' meetup, collecting LinkedIn requests", points: { [VC]: 3, [FT]: 3 } },
      {
        text: "Reading tomorrow's market wrap before anyone else",
        points: { [MS]: 3, [RATES]: 3, [ER]: 1, [PM]: 2 },
      },
      {
        text: "Touring a building I could buy, in my head",
        points: { [RA]: 4, [DL]: 1, [PC]: 3, [MBS]: 3 },
      },
    ],
  },
  {
    question: "Pick your favourite number.",
    answers: [
      { text: "IRR", points: { [PE]: 3, [VC]: 1, [RA]: 3, [DL]: 1, [PC]: 2 } },
      { text: "EV/EBITDA", points: { [MA]: 3, [ER]: 3, [PE]: 2 } },
      { text: "Yield to maturity", points: { [IG]: 4, [HY]: 3, [RATES]: 2, [MBS]: 2, [DA]: 2 } },
      { text: "Sharpe ratio", points: { [PM]: 4, [MS]: 3, [FT]: 1 } },
    ],
  },
  {
    question: "Your weekend reading?",
    answers: [
      { text: "An annual report, cover to cover", points: { [ER]: 4, [MA]: 1, [IG]: 3 } },
      { text: "A central bank's meeting minutes", points: { [RATES]: 3, [MS]: 1, [MBS]: 1 } },
      { text: "A 300-page credit agreement", points: { [DL]: 4, [PC]: 1, [DA]: 3, [HY]: 3 } },
      { text: "A fintech founder's pitch deck", points: { [FT]: 4, [VC]: 2 } },
    ],
  },
  {
    question: "How much risk do you like?",
    answers: [
      { text: "Senior secured, thank you", points: { [DL]: 3, [PC]: 2, [IG]: 3, [MBS]: 1 } },
      { text: "Leverage it, then leverage it again", points: { [PE]: 3, [HY]: 3, [DA]: 2 } },
      { text: "A hundred bets for one unicorn", points: { [VC]: 4, [FT]: 2 } },
      {
        text: "Diversified, rebalanced, sleeping well",
        points: { [PM]: 1, [RA]: 1, [MBS]: 1, [IG]: 1 },
      },
    ],
  },
  {
    question: "What do you bring to a team?",
    answers: [
      { text: "The model nobody can break", points: { [MBS]: 4, [ER]: 1, [PE]: 2 } },
      { text: "The story, told in ten slides", points: { [MA]: 2, [VC]: 1, [FT]: 1, [RA]: 2 } },
      { text: "The big picture, before anyone else", points: { [MS]: 4, [RATES]: 3, [PM]: 4 } },
      { text: "The fine print nobody else read", points: { [PC]: 4, [DA]: 2, [HY]: 3, [DL]: 4 } },
    ],
  },
];

/** The desk with the most points; ties go to the desk earlier in TIE_ORDER. */
export function deskFor(choices: number[]) {
  const score: Record<string, number> = {};
  choices.forEach((a, q) => {
    for (const [desk, p] of Object.entries(QUIZ[q].answers[a].points))
      score[desk] = (score[desk] ?? 0) + p;
  });
  return [...TIE_ORDER].sort(
    (a, b) => (score[b] ?? 0) - (score[a] ?? 0) || TIE_ORDER.indexOf(a) - TIE_ORDER.indexOf(b),
  )[0];
}
