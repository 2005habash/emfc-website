// Every EMFC event, oldest first. Texts from the content package of 2 November 2026
// (content/2026-11-02/events): Marketing's version wins where departments differed, and the kickoff
// dinner is on 26 September (decided 2 November). The site shows the day only, never a time.
// Once the admin page is live, events come from the database and this list is the fallback.

export type EventType = "Networking" | "Workshop" | "Speaker" | "Study Trip" | "Social";

export type EventPhoto = { src: string; alt: string };

export type EventItem = {
  id: string;
  title: string;
  /** ISO date. */
  date: string;
  type: EventType;
  location: string;
  description: string;
  /** Who spoke, led or joined, as one line each. */
  people?: string[];
  /** Department slugs, and "department/desk" for desk pages. */
  departments: string[];
  desks?: string[];
  photos?: EventPhoto[];
  videos?: string[];
  /** Marketing's published LinkedIn recap, as images. */
  recap?: string[];
  link?: string;
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  Networking: "#2F5BFF",
  Workshop: "#1F8A5B",
  Speaker: "#5A67A2",
  "Study Trip": "#B4435A",
  Social: "#6B4FB3",
};

const media = (id: string, kind: "photo" | "recap", count: number) =>
  Array.from({ length: count }, (_, i) => `/images/events/${id}/${kind}-${kind === "photo" ? String(i + 1).padStart(2, "0") : i + 1}.jpg`);

const ROUNDTABLE_PHOTOS = [
  "A group photo in the room after the roundtables",
  "The roundtable circles in the auditorium, with the Esade Alumni slide on screen",
  "A roundtable circle in front of the stage and the Do Good. Do Better. wall",
  "The Finance Round Table Session slide on screen, participants seated",
  "The slide introducing the five alumni guests, with their roles and firms",
  "Circles of students seated in front of the stage",
  "A roundtable circle in conversation, the slide behind",
  "A wide view of several roundtable circles",
  "Participants seated in circles of chairs across the auditorium",
  "One roundtable circle in conversation, the auditorium entrance behind",
];

export const EVENTS: EventItem[] = [
  {
    id: "kickoff-greenroom-2026-05",
    title: "ESADE Finance Club Kick-off: GreenRoom demo",
    date: "2026-05-28",
    type: "Speaker",
    location: "ESADE",
    description:
      "The first event of the ESADE Finance Club, one of the two clubs that later merged into EMFC. Lorenzo demoed GreenRoom, a platform for finance interview prep, and the club announced a partnership giving all members free access to it.",
    people: ["Lorenzo Fabiani, founder of GreenRoom and an ESADE student"],
    departments: ["brand"],
  },
  {
    id: "kickoff-dinner-2026",
    title: "Kick Off Dinner",
    date: "2026-09-26",
    type: "Social",
    location: "Negro Rojo, Barcelona",
    description:
      "The founding cohort’s first gathering as EMFC. An evening for the new team and incoming associates to meet and set the tone for the year.",
    departments: ["brand"],
  },
  {
    id: "william-blair-2026-10-07",
    title: "Speaker session: Investment Banking at William Blair",
    date: "2026-10-07",
    type: "Speaker",
    location: "ESADE Sant Cugat",
    description:
      "A small-group discussion with David Karasek, ESADE alumnus and Investment Banking Analyst in William Blair’s Industrials team in London, on his move from engineering into investment banking, how recruiting works, and how to land a return offer. Key advice: apply early, show real motivation beyond the technical skills, and take initiative during internships.",
    people: ["David Karasek, ESADE alumnus and Investment Banking Analyst, William Blair, London"],
    departments: ["investment-banking", "corporate-relations", "brand"],
    desks: ["investment-banking/m-and-a"],
    photos: [
      {
        src: "/images/events/william-blair-2026-10-07/photo-01.jpg",
        alt: "EMFC members around a meeting-room table at ESADE Sant Cugat, with the speaker on the screen",
      },
    ],
    recap: media("william-blair-2026-10-07", "recap", 1),
  },
  {
    id: "pe-cv-screening-2026-10-09",
    title: "CV Screening & Optimisation",
    date: "2026-10-09",
    type: "Workshop",
    location: "ESADE",
    description:
      "One-to-one review of members' CVs against PE and IB standards: deal sheet structure, quantified impact and formatting for buy-side applications.",
    people: ["Led by Fabian Luis Seher"],
    departments: ["private-markets"],
    desks: ["private-markets/private-equity"],
  },
  {
    id: "pe-technical-training-2026-10-09",
    title: "Technical Training",
    date: "2026-10-09",
    type: "Workshop",
    location: "ESADE",
    description:
      "Accounting and valuation fundamentals for PE interviews: three-statement links, EV to equity bridge and LBO mechanics.",
    people: ["Led by Fabian Luis Seher"],
    departments: ["private-markets"],
    desks: ["private-markets/private-equity"],
  },
  {
    id: "pe-mock-interviews-2026-10-09",
    title: "Mock Interviews",
    date: "2026-10-09",
    type: "Workshop",
    location: "ESADE",
    description:
      "Live PE interview simulations covering fit, technical and deal discussion questions, with individual feedback.",
    people: ["Led by Fabian Luis Seher"],
    departments: ["private-markets"],
    desks: ["private-markets/private-equity"],
  },
  {
    id: "alumni-roundtables-2026-10-19",
    title: "Exploring Careers in Finance: Alumni Roundtables (with ESADE Careers)",
    date: "2026-10-19",
    type: "Networking",
    location: "Auditorium, ESADE",
    description:
      "EMFC’s first open event, run with ESADE Careers. Five tables, one per area of finance, where students could talk directly with alumni about what working in each field is really like. Students rotated between sectors to ask alumni what the job is really like, and how they got there.",
    people: [
      "Investment Banking: Luis Vega, Investment Banking Associate, XP Advisory",
      "Private Equity: Miquel Petit, Private Equity Associate, Abac Capital",
      "Venture Capital: Miguel Bowden, Portfolio Management, InnoEnergy",
      "Fintech: Martin Nicholls, Team Lead Enterprise, Frekuent",
      "Sustainable Finance: Cristina Costa, Sustainability Lead, Kara",
    ],
    departments: ["investment-banking", "private-markets", "corporate-relations", "brand"],
    desks: ["private-markets/private-equity", "private-markets/vc-and-growth", "private-markets/fintech"],
    photos: media("alumni-roundtables-2026-10-19", "photo", 10).map((src, i) => ({ src, alt: ROUNDTABLE_PHOTOS[i] })),
    videos: Array.from(
      { length: 8 },
      (_, i) => `/videos/events/alumni-roundtables-2026-10-19/clip-0${i + 1}.mp4`,
    ),
    recap: media("alumni-roundtables-2026-10-19", "recap", 5),
  },
  {
    id: "ubs-2026-10-28",
    title: "Inside Equity Research: UBS, fintech and careers in equity markets",
    date: "2026-10-28",
    type: "Speaker",
    location: "Room 0A04, ESADE Sant Cugat",
    description:
      "A small-group session with Jonathan Glele Ahanhanzo, former Equity Research Analyst at UBS covering FinTech & Payments in the EMEA TMT team, now pursuing an MSc in Development Economics at the University of Oxford. How equity research is structured and what day-to-day work in TMT looks like, advice on applications, interviews and pursuing equity research roles, and current market trends in fintech and TMT. An opportunity for EMFC members to ask questions and hear first-hand perspectives on equity research and fintech.",
    people: [
      "Jonathan Glele Ahanhanzo, former Equity Research Analyst, UBS (FinTech & Payments, EMEA TMT)",
    ],
    departments: ["private-markets", "corporate-relations"],
    desks: ["private-markets/fintech"],
    recap: media("ubs-2026-10-28", "recap", 5),
  },
  {
    id: "coffee-chat-carson-wang-2026-10-29",
    title: "Coffee chat with Carson Wang",
    date: "2026-10-29",
    type: "Speaker",
    location: "ESADE, speaker online",
    description:
      "ESADE Master’s Finance Club hosted a coffee chat with Carson Wang, Wharton student with experience at Centerview Partners, Permira and Silver Lake. An informal Q&A where members asked Carson about recruiting, day-to-day life in banking and PE, and career advice, and came away with practical, honest tips from someone who has worked at top firms on both sides.",
    people: [
      "Carson Wang, Wharton student, previously at Centerview Partners, Permira and Silver Lake",
      "Organised by Constantin Molineus and Investment Banking",
    ],
    departments: ["investment-banking", "private-markets", "brand"],
    desks: ["investment-banking/m-and-a", "private-markets/private-equity"],
    photos: [
      {
        src: "/images/events/coffee-chat-carson-wang-2026-10-29/photo-01.jpg",
        alt: "Five EMFC members either side of a screen showing Carson Wang on a video call",
      },
    ],
    recap: media("coffee-chat-carson-wang-2026-10-29", "recap", 1),
  },
  {
    id: "i-squared-capital-2026-11-02",
    title: "Networking Event with I Squared Capital",
    date: "2026-11-02",
    type: "Networking",
    location: "ESADE Sant Cugat",
    description:
      "An exclusive session for EMFC members on working at I Squared Capital and its recruiting process, followed by a networking cocktail with recruiters and professionals from the firm.",
    departments: ["corporate-relations"],
  },
];

export const eventsFor = (department: string, desk?: string) =>
  EVENTS.filter((e) =>
    desk ? e.desks?.includes(`${department}/${desk}`) : e.departments.includes(department),
  ).sort((a, b) => b.date.localeCompare(a.date));
