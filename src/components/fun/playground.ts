// Everything in the Arcade (src/routes/arcade.tsx), in one list: its shelf of games and the career
// ladder both read it. Each activity is played on the Arcade page at /arcade#<id>, and only there:
// the games stay out of the department and desk pages (Vasco, 10 November 2026).

import { DESK_COUNT } from "@/lib/departments";
import { inWords } from "@/lib/site";
import { TOYS } from "./toys/catalog";

export type Kind = "game" | "puzzle" | "make" | "toy";

export type Activity = {
  id: string;
  title: string;
  hook: string;
  kind: Kind;
  /** Roughly how long one go takes. */
  time: string;
  /** "department/desk" for a desk toy, which also sits on that desk's page. */
  desk?: string;
};

export const SHELVES: { kind: Kind; title: string; note: string }[] = [
  { kind: "game", title: "Games", note: "A few minutes each, and you learn something on the way." },
  { kind: "puzzle", title: "Puzzles", note: "For the analyst who checks every footnote." },
  { kind: "make", title: "Make and meet", note: "Something to post, and someone to meet." },
  {
    kind: "toy",
    title: "Desk toys",
    note: "Each desk's craft in four levers.",
  },
];

export const ACTIVITIES: Activity[] = [
  {
    id: "closing-bell",
    title: "Closing bell",
    hook: "Sixty seconds to the close. Trade the headlines and finish green.",
    kind: "game",
    time: "1 min",
  },
  {
    id: "superday",
    title: "The Superday",
    hook: "Six questions, sixty seconds, one offer letter.",
    kind: "game",
    time: "2 min",
  },
  {
    id: "bull-or-bear",
    title: "Bull or bear?",
    hook: "Eight days that moved markets. Call each one.",
    kind: "game",
    time: "3 min",
  },
  {
    id: "quick-turn",
    title: "Quick turn",
    hook: "Friday, 18:47. The MD has one small request. Choose your weekend.",
    kind: "game",
    time: "2 min",
  },
  {
    id: "quiz",
    title: "Which desk are you?",
    hook: `Five questions, ${inWords(DESK_COUNT)} desks, one answer.`,
    kind: "game",
    time: "1 min",
  },
  {
    id: "real-or-made-up",
    title: "Real or made up?",
    hook: "Matador bonds, Pac-Man defences, paella defences. Which are real?",
    kind: "game",
    time: "3 min",
  },
  {
    id: "mouse-free",
    title: "Mouse-free",
    hook: "Name the Excel shortcut. The MD is watching.",
    kind: "game",
    time: "2 min",
  },
  {
    id: "find-the-plug",
    title: "Find the plug",
    hook: "The model doesn't tie. Find the wrong cell before the MD does.",
    kind: "puzzle",
    time: "3 min",
  },
  {
    id: "technicals",
    title: "Sixty-second technicals",
    hook: "The questions finance interviews ask again and again. Answer out loud, then flip.",
    kind: "puzzle",
    time: "5 min",
  },
  {
    id: "brainteasers",
    title: "Brainteasers",
    hook: "The puzzles trading desks love to ask. No calculator needed.",
    kind: "puzzle",
    time: "5 min",
  },
  {
    id: "frame",
    title: "Wear the bull",
    hook: "An EMFC frame for your LinkedIn photo.",
    kind: "make",
    time: "1 min",
  },
  {
    id: "tombstone",
    title: "Tombstone maker",
    hook: "Announce a deal of your own, banker style.",
    kind: "make",
    time: "1 min",
  },
  {
    id: "roulette",
    title: "Coffee chat roulette",
    hook: "Spin, meet a member, say hello on LinkedIn.",
    kind: "make",
    time: "1 min",
  },
  ...TOYS.map((t) => ({
    id: t.id,
    title: t.title,
    hook: t.hook,
    kind: "toy" as const,
    time: "2 min",
    desk: t.desk,
  })),
];
