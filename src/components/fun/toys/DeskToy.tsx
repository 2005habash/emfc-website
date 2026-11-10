import type { ComponentType } from "react";
import { Accretion } from "./Accretion";
import { BondYield } from "./BondYield";
import { CapRate } from "./CapRate";
import { toyFor } from "./catalog";
import { Dcf } from "./Dcf";
import { PaperLbo } from "./PaperLbo";
import { ReturnTheFund } from "./ReturnTheFund";

const TOY_COMPONENTS: Record<string, ComponentType> = {
  "paper-lbo": PaperLbo,
  accretion: Accretion,
  "return-the-fund": ReturnTheFund,
  dcf: Dcf,
  "bond-yield": BondYield,
  "cap-rate": CapRate,
};

/** The desk's toy on its page, for the desks that have one (catalog.ts). */
export function DeskToy({ desk }: { desk: string }) {
  const toy = toyFor(desk);
  const Toy = toy ? TOY_COMPONENTS[toy.id] : undefined;
  return Toy ? <Toy /> : null;
}
