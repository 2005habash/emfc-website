// The desk toys, played in the Arcade (src/routes/arcade.tsx), each tied to the desk whose craft it
// shows, as "department/desk": the Arcade names the desk on the toy's tile and links to its page,
// and the quiz's result suggests the toy. The toys themselves are the other files in this folder.

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
    desk: "fixed-income/public-credit",
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
