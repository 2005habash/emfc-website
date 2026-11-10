import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ACTIVITIES } from "./playground";

// The playful layer's running joke: each game or toy a visitor plays moves them up a finance career
// ladder, kept only in their own browser (localStorage), never sent anywhere.

export const RANKS = [
  { title: "Analyst", at: 0 },
  { title: "Associate", at: 2 },
  { title: "Vice-President", at: 5 },
  { title: "Director", at: 8 },
  { title: "Managing Director", at: 12 },
  { title: "Partner", at: ACTIVITIES.length },
] as const;

const PROMOTION: Record<string, string> = {
  Associate: "No bonus this year, but the business cards are nicer.",
  "Vice-President": "In banking, more common than you'd think.",
  Director: "You now have opinions about the fonts in pitch books.",
  "Managing Director": "Your calendar is no longer your own.",
  Partner: "Everything played. Your name goes on the door.",
};

const KEY = "emfc-career";
const EVENT = "emfc:career";

function read(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export const rankFor = (n: number) => [...RANKS].reverse().find((r) => n >= r.at) ?? RANKS[0];

/** Counts an activity as played (once), and announces a promotion when one is due. */
export function markPlayed(id: string) {
  const list = read();
  if (list.includes(id)) return;
  const next = [...list, id];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Private mode: the ladder just won't be remembered.
  }
  window.dispatchEvent(new Event(EVENT));
  const before = rankFor(list.length);
  const after = rankFor(next.length);
  if (after.title !== before.title) {
    toast(`Promoted to ${after.title}`, { description: PROMOTION[after.title] });
  }
}

/** The visitor's ladder: what they have played, their rank and the next one. */
export function useCareer() {
  const [played, setPlayed] = useState<string[]>([]);
  useEffect(() => {
    const update = () => setPlayed(read());
    update();
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  const count = played.filter((id) => ACTIVITIES.some((a) => a.id === id)).length;
  return {
    played,
    count,
    total: ACTIVITIES.length,
    rank: rankFor(count),
    next: RANKS.find((r) => r.at > count),
  };
}
