// "Which desk are you?" (the Arcade). Each answer gives points to the desks it sounds like, as
// "department/desk". The weights were tuned by trying all 1,024 ways through the quiz: every one of
// the 11 desks can come out, each for between about 6 and 10 percent of the ways. When Fixed Income's
// six desks became its two groups (10 November 2026), its points were retuned within bounds that keep
// each answer's meaning (a yield to maturity still says Public Credit).

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
const PUB = "fixed-income/public-credit";
const PRIV = "fixed-income/private-credit";

/** When two desks tie, the one earlier in this list wins. */
export const TIE_ORDER = [PE, MA, VC, FT, RA, ER, MS, PM, DA, PUB, PRIV];

export const QUIZ: QuizQuestion[] = [
  {
    question: "Friday, 11pm. Where are you?",
    answers: [
      {
        text: "In the office, turning comments on a pitch book",
        points: { [PE]: 1, [MA]: 3, [DA]: 3 },
      },
      { text: "At a founders' meetup, collecting LinkedIn requests", points: { [VC]: 3, [FT]: 3 } },
      {
        text: "Reading tomorrow's market wrap before anyone else",
        points: { [ER]: 1, [MS]: 3, [PM]: 2, [PUB]: 1 },
      },
      {
        text: "Touring a building I could buy, in my head",
        points: { [RA]: 4, [PUB]: 3 },
      },
    ],
  },
  {
    question: "Pick your favourite number.",
    answers: [
      { text: "IRR", points: { [PE]: 3, [VC]: 1, [RA]: 3, [PRIV]: 1 } },
      { text: "EV/EBITDA", points: { [PE]: 2, [MA]: 3, [ER]: 3 } },
      { text: "Yield to maturity", points: { [DA]: 2, [PUB]: 4 } },
      { text: "Sharpe ratio", points: { [FT]: 1, [MS]: 3, [PM]: 4 } },
    ],
  },
  {
    question: "Your weekend reading?",
    answers: [
      { text: "An annual report, cover to cover", points: { [MA]: 1, [ER]: 4 } },
      { text: "A central bank's meeting minutes", points: { [MS]: 1, [PUB]: 3 } },
      { text: "A 300-page credit agreement", points: { [DA]: 3, [PRIV]: 3 } },
      { text: "A fintech founder's pitch deck", points: { [VC]: 2, [FT]: 4 } },
    ],
  },
  {
    question: "How much risk do you like?",
    answers: [
      { text: "Senior secured, thank you", points: { [PRIV]: 4 } },
      { text: "Leverage it, then leverage it again", points: { [PE]: 3, [DA]: 2 } },
      { text: "A hundred bets for one unicorn", points: { [VC]: 4, [FT]: 2 } },
      {
        text: "Diversified, rebalanced, sleeping well",
        points: { [RA]: 1, [PM]: 1 },
      },
    ],
  },
  {
    question: "What do you bring to a team?",
    answers: [
      { text: "The model nobody can break", points: { [PE]: 2, [ER]: 1 } },
      { text: "The story, told in ten slides", points: { [MA]: 2, [VC]: 1, [FT]: 1, [RA]: 2 } },
      { text: "The big picture, before anyone else", points: { [MS]: 4, [PM]: 4 } },
      { text: "The fine print nobody else read", points: { [DA]: 2, [PRIV]: 3 } },
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
