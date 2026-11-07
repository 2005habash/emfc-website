import { MEMBERS, type Member } from "@/data/members";
import { getDepartment } from "@/lib/departments";

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

/**
 * Everyone working on a desk: its Vice-President or lead first, then its associates. In a department
 * whose associates work across all desks (Investment Banking), that is every associate without a desk.
 */
export const deskTeam = (department: string, desk: string) => {
  const across = getDepartment(department)?.associatesAcrossDesks;
  return membersOf(department)
    .filter((m) => m.desk === desk || (across && m.position === "associate" && !m.desk))
    .sort((a, b) => Number(a.position === "associate") - Number(b.position === "associate"));
};

/**
 * The order of the portraits on the homepage strip: spread evenly across both rows, as Vasco asked on
 * 5 November 2026 (site review S4), and arranged by looking at the portraits. The site keeps only this
 * order, nothing about anyone. Departments stay mixed. Anyone with a photo who is not in the list yet
 * (a new member) follows at the end until the order is redone.
 */
const STRIP_ORDER = [
  "diogo-oliveira", "kateryna-mohylevska", "yonatan-bendler", "jan-heibel", "cosimo-dini", "maria-anjos",
  "luka-thomson", "nick-kriz", "anastasia-murgida", "david-villar", "paul-christian-abel", "vasco-lemos",
  "maria-fe-lopez-de-romana", "constantin-molineus", "fabian-luis-seher", "carolina-gouveia",
  "luis-laboreiro", "nin-sacristan", "moritz-muellner", "sara-berglind-omarsdottir-saenz", "moritz-fritsch",
  "joao-salgado", "carmen-amelia-albuja", "zaid-habash", "alexander-schilling", "joan-brugada",
  "martina-guardiola", "aditya-sunil-shajwani", "philip-ignatzi", "alice-lafreniere", "erik-oostendorp",
  "joao-rawes-freitas", "paul-emil-manner", "lara-koch", "anubhav-tamak", "jack-hermansson",
  "giulia-weber-colussi", "luca-flusche", "alessandro-patta", "lili-anna-paczolay-nagy", "jules-coppens",
  "kian-chirani", "hunter-crawford", "rui-long", "hugo-heise", "jose-rangel", "tea-polimac", "taha-aksu",
  "louis-pfaar", "jakob-sebastian-kroen", "maria-heuveldop-pfeiffer", "jose-ruivo", "tim-constantin-ziegler",
  "maria-jastrzebska", "mustafa-batuhan-ayd-n", "miguel-gomes", "henri-de-canecaude", "viola-suter",
  "pol-bonet-malga", "liam-thiele", "margarida-loureiro", "marwin-aprin", "maximilian-merlin-kammermeier",
  "walden-sanchez", "maria-marti", "paul-spieker", "alexander-kostyuk", "isabelle-oliger", "caetano-cunha",
  "christopher-weigt", "shaivam-sundeep-ravani", "kleio-naziri", "aaron-kark",
];

/** Everyone with a photo, for the moving strip on the homepage, in STRIP_ORDER. */
export const PEOPLE_STRIP: Member[] = (() => {
  const withPhoto = MEMBERS.filter((m) => m.photo);
  const listed = STRIP_ORDER.map((slug) => withPhoto.find((m) => m.slug === slug)).filter((m): m is Member => !!m);
  return [...listed, ...withPhoto.filter((m) => !STRIP_ORDER.includes(m.slug))];
})();

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter((w) => /^\p{Lu}/u.test(w))
    .map((w) => w[0])
    .filter((_, i, all) => i === 0 || i === all.length - 1)
    .join("");
