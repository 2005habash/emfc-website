import { MEMBERS, type Member } from "@/data/members";

export type { Member };

const LEADERSHIP_ORDER = ["head", "cio", "vice-president"] as const;

export const memberByName = (name: string) => MEMBERS.find((m) => m.name === name);

export const PRESIDENTS = MEMBERS.filter((m) => m.department === "co-presidents");
export const ADVISORY = MEMBERS.filter((m) => m.department === "advisory-board");

export const membersOf = (department: string) => MEMBERS.filter((m) => m.department === department);

/** Head, Chief Investment Officer and Vice-Presidents, in that order. */
export const leadershipOf = (department: string) =>
  membersOf(department)
    .filter((m) => m.position !== "associate")
    .sort(
      (a, b) =>
        LEADERSHIP_ORDER.indexOf(a.position as (typeof LEADERSHIP_ORDER)[number]) -
        LEADERSHIP_ORDER.indexOf(b.position as (typeof LEADERSHIP_ORDER)[number]),
    );

export const associatesOf = (department: string, desk?: string) =>
  membersOf(department).filter((m) => m.position === "associate" && (desk === undefined || m.desk === desk));

/** Everyone working on a desk: its Vice-President or lead first, then its associates. */
export const deskTeam = (department: string, desk: string) =>
  membersOf(department)
    .filter((m) => m.desk === desk)
    .sort((a, b) => Number(a.position === "associate") - Number(b.position === "associate"));

/**
 * Everyone with a photo, for the moving strip on the homepage. Departments take turns, so the strip
 * mixes the whole club instead of running one department after another.
 */
export const PEOPLE_STRIP: Member[] = (() => {
  const queues = [...new Set(MEMBERS.map((m) => m.department))].map((d) =>
    MEMBERS.filter((m) => m.department === d && m.photo),
  );
  const out: Member[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
})();

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .map((w) => w[0])
    .filter((_, i, all) => i === 0 || i === all.length - 1)
    .join("");
