import { LINKEDIN, type Person } from "./departments";

export const PHOTOS: Record<string, string> = {
  "Diogo Oliveira": "/images/team/diogo.webp",
  "Vasco Barahona de Lemos": "/images/team/vasco.webp",
  "Yonatan Bendler": "/images/team/yonatan.webp",
  "Constantin Molineus": "/images/team/constantin.webp",
  "João Salgado": "/images/team/joao.webp",
  "Jan Heibel": "/images/team/jan.jpg",
  "Fabian Seher": "/images/team/fabian.webp",
  "Zaid Habash": "/images/team/zaid.jpg",
  "Anastasia Murgida": "/images/team/anastasia.jpg",
  "Luca Flusche": "/images/team/luca.webp",
  "Cosimo Dini": "/images/team/cosimo.webp",
  "Luís Laboreiro": "/images/team/luis.webp",
  "Luka Thomson": "/images/team/luka.webp",
  "Nick Kriz": "/images/team/nick.jpg",
  "David Villar": "/images/team/david.jpg",
  "Paul Christian Abel": "/images/team/paul.webp",
  "Moritz Fritsch": "/images/team/moritz.webp",
  "Philip Ignatzi": "/images/team/philip.webp",
};

export const photoOf = (name: string): string | undefined => PHOTOS[name];
export const linkedinOf = (p: Person): string | undefined => p.linkedin ?? LINKEDIN[p.name];

export const PRESIDENTS: Person[] = [
  { name: "Diogo Oliveira", role: "Co-President & Founder" },
  { name: "Vasco Barahona de Lemos", role: "Co-President & Founder" },
];

export const ADVISORY: Person[] = [
  { name: "Paul Christian Abel", role: "Advisor & Founder" },
  { name: "Moritz Fritsch", role: "Advisor & Founder" },
  { name: "Philip Ignatzi", role: "Advisor & Founder" },
];

/** Everyone with a portrait, in the order used by the homepage mosaic. */
export const MOSAIC: Person[] = [
  { name: "Diogo Oliveira", role: "Co-President" },
  { name: "Vasco Barahona de Lemos", role: "Co-President" },
  { name: "Yonatan Bendler", role: "Head · Investment Banking" },
  { name: "Constantin Molineus", role: "VP · M&A" },
  { name: "Anastasia Murgida", role: "VP · Fintech" },
  { name: "João Salgado", role: "VP · Debt" },
  { name: "Jan Heibel", role: "Head · Private Markets" },
  { name: "Fabian Seher", role: "VP · Private Equity" },
  { name: "Zaid Habash", role: "VP · VC & Growth" },
  { name: "Luca Flusche", role: "VP · Real Assets" },
  { name: "Cosimo Dini", role: "Head · Asset Management" },
  { name: "Luís Laboreiro", role: "Chief Investment Officer" },
  { name: "Luka Thomson", role: "Head · Fixed Income" },
  { name: "Nick Kriz", role: "Head · Corporate Relations" },
  { name: "David Villar", role: "Head · Brand" },
  { name: "Paul Christian Abel", role: "Advisor & Founder" },
  { name: "Moritz Fritsch", role: "Advisor & Founder" },
  { name: "Philip Ignatzi", role: "Advisor & Founder" },
];
