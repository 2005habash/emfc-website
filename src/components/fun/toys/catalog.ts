// The desk toys, by "department/desk": which desks have one, where it sits on the desk's page, and
// how the quiz and the Departments page describe it. The toys themselves are in DeskToy.tsx.

export type ToyInfo = { desk: string; id: string; title: string; hook: string };

export const TOYS: ToyInfo[] = [
  {
    desk: "private-markets/private-equity",
    id: "paper-lbo",
    title: "Run a paper LBO",
    hook: "Four levers, one IRR. Can you clear 20%?",
  },
  {
    desk: "investment-banking/m-and-a",
    id: "accretion",
    title: "Accretive or dilutive?",
    hook: "Price a deal and see what it does to the buyer's earnings per share.",
  },
  {
    desk: "private-markets/vc-and-growth",
    id: "return-the-fund",
    title: "Return the fund",
    hook: "Can one startup pay back a whole venture fund?",
  },
  {
    desk: "asset-management/equity-research",
    id: "dcf",
    title: "What's it worth?",
    hook: "A DCF in four levers, and where the value really sits.",
  },
  {
    desk: "fixed-income/rates-and-government-bonds",
    id: "bond-yield",
    title: "Move the yield",
    hook: "Watch a bond's price fall as yields rise.",
  },
  {
    desk: "private-markets/real-assets",
    id: "cap-rate",
    title: "The cap rate seesaw",
    hook: "Half a point on the cap rate, millions on the value.",
  },
];

export const toyFor = (desk: string) => TOYS.find((t) => t.desk === desk);
