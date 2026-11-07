// Every EMFC event, oldest first. Texts from the content packages of 2 and 5 November 2026
// (events/, in the club Drive): Marketing's version wins where departments differed, and each event
// Marketing posted about links to its LinkedIn post. The site shows the day only, never a time.
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
  /** Registration link, shown while the event is upcoming. */
  link?: string;
  /** The club's LinkedIn post about the event, shown as "See the post". */
  post?: string;
  /** What members took away, one line each. */
  points?: string[];
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
    date: "2026-05-20",
    type: "Speaker",
    location: "ESADE",
    description:
      "The first event of the ESADE Finance Club, which the ESADE Master's Investment Society later took over to form EMFC. Lorenzo Fabiani, founder of GreenRoom and a fellow ESADE student, gave a demo of his finance interview prep platform, and the club announced a partnership giving all its members free access to it.",
    people: ["Lorenzo Fabiani, founder of GreenRoom and an ESADE student"],
    departments: ["marketing"],
    post: "https://www.linkedin.com/feed/update/urn:li:activity:7462893278158278657/",
  },
  {
    id: "kickoff-dinner-2026",
    title: "Kick-off Dinner",
    date: "2026-09-14",
    type: "Social",
    location: "Negro Rojo, Barcelona",
    description:
      "The founding cohort’s first gathering as EMFC. An evening for the new team and incoming associates to meet and set the tone for the year.",
    departments: ["marketing"],
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
    points: [
      "Apply early, not just strategically: applications are reviewed on a rolling basis.",
      "Technical knowledge is the foundation, not the differentiator: motivation, commercial awareness and a feel for the bank's culture stand out.",
      "Stay curious about the industry: follow deals and talk to professionals.",
      "Attitude matters as much as the work: initiative, questions and relationships earn the return offer.",
    ],
    post: "https://www.linkedin.com/feed/update/urn:li:activity:7514748320070651904/",
    departments: ["investment-banking", "corporate-relations", "marketing"],
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
      "EMFC's first open event, run with ESADE Careers. Five tables, one per area of finance, each with an ESADE alumnus: students rotated between them to ask what working in each field is really like and how the alumni got there.",
    people: [
      "Investment Banking: Luis Vega, Investment Banking Associate, XP Advisory",
      "Private Equity: Miquel Petit, Private Equity Associate, Abac Capital",
      "Venture Capital: Miguel Bowden, Portfolio Management, InnoEnergy",
      "Fintech: Martin Nicholls, Team Lead Enterprise, Frekuent",
      "Sustainable Finance: Cristina Costa, Sustainability Lead, Kara",
    ],
    departments: ["investment-banking", "private-markets", "corporate-relations", "marketing"],
    desks: ["private-markets/private-equity", "private-markets/vc-and-growth", "private-markets/fintech"],
    photos: media("alumni-roundtables-2026-10-19", "photo", 10).map((src, i) => ({ src, alt: ROUNDTABLE_PHOTOS[i] })),
    videos: Array.from(
      { length: 8 },
      (_, i) => `/videos/events/alumni-roundtables-2026-10-19/clip-0${i + 1}.mp4`,
    ),
    recap: media("alumni-roundtables-2026-10-19", "recap", 5),
    post: "https://www.linkedin.com/feed/update/urn:li:activity:7519787271789678592/",
  },
  {
    id: "ubs-2026-10-28",
    title: "Inside Equity Research: UBS, fintech and careers in equity markets",
    date: "2026-10-28",
    type: "Speaker",
    location: "ESADE Sant Cugat, Room 0A04 (speaker online)",
    description:
      "A small-group session with Jonathan Glele Ahanhanzo, former Equity Research Analyst at UBS covering FinTech & Payments in the EMEA TMT team, now pursuing an MSc in Development Economics at the University of Oxford. He explained how equity research is structured and what day-to-day work in TMT looks like, gave advice on applications, interviews and pursuing equity research roles, and went through current market trends in fintech and TMT. Members could ask questions and hear first-hand perspectives on equity research and fintech.",
    people: [
      "Jonathan Glele Ahanhanzo, former Equity Research Analyst, UBS (FinTech & Payments, EMEA TMT)",
    ],
    departments: ["private-markets", "corporate-relations"],
    desks: ["private-markets/fintech"],
    recap: media("ubs-2026-10-28", "recap", 5),
    post: "https://www.linkedin.com/feed/update/urn:li:activity:7521955974908309504/",
  },
  {
    id: "coffee-chat-carson-wang-2026-10-29",
    title: "Coffee chat with Carson Wang",
    date: "2026-10-29",
    type: "Speaker",
    location: "ESADE (speaker joined online)",
    description:
      "ESADE Master's Finance Club hosted a coffee chat with Carson Wang, a Wharton student with experience at Centerview Partners and Permira and an incoming analyst at Silver Lake. In an informal Q&A, members asked Carson about recruiting, day-to-day life in banking and PE, and career advice, and came away with practical, honest tips from someone who has worked on both sides.",
    people: [
      "Carson Wang, Wharton student, previously at Centerview Partners and Permira, incoming analyst at Silver Lake",
      "Organised by Constantin Molineus and Investment Banking",
    ],
    departments: ["investment-banking", "private-markets", "marketing"],
    desks: ["investment-banking/m-and-a", "private-markets/private-equity"],
    photos: [
      {
        src: "/images/events/coffee-chat-carson-wang-2026-10-29/photo-01.jpg",
        alt: "Five EMFC members either side of a screen showing Carson Wang on a video call",
      },
    ],
    recap: media("coffee-chat-carson-wang-2026-10-29", "recap", 1),
    post: "https://www.linkedin.com/feed/update/urn:li:activity:7522346528523358208/",
  },
  {
    id: "i-squared-capital-2026-11-02",
    title: "Inside Private Equity: An Exclusive Session with I Squared Capital",
    date: "2026-11-02",
    type: "Speaker",
    location: "ESADE Sant Cugat",
    description:
      "On Monday 2 November, EMFC, together with ESADE Careers, welcomed five professionals from I Squared Capital to the Sant Cugat campus: Harvey Hsieh, Mariam Salama, Alex Chiu, James Caplan and Johnny Costa. The session offered members a first-hand look into the firm's investment approach, from its background and operations to the industries and companies it targets and the key factors driving investment decisions. Afterwards, students connected directly with the team, asked their questions one on one and gained perspectives on the private equity and infrastructure investment landscape.",
    people: [
      "Harvey Hsieh, I Squared Capital",
      "Mariam Salama, I Squared Capital",
      "Alex Chiu, I Squared Capital",
      "James Caplan, I Squared Capital",
      "Johnny Costa, I Squared Capital",
      "With ESADE Careers",
    ],
    departments: ["corporate-relations"],
    post: "https://www.linkedin.com/feed/update/urn:li:activity:7524132345503739904/",
  },
  {
    id: "coffee-chat-maximilian-schierl-2026-11-02",
    title: "Coffee chat with Maximilian Schierl",
    date: "2026-11-02",
    type: "Speaker",
    location: "ESADE (speaker joined online)",
    description:
      "ESADE Master's Finance Club hosted a coffee chat with Maximilian Schierl, HSG graduate and Investment Banking Analyst at J.P. Morgan in Zurich, who will soon join TA Associates on its Healthcare team in London. In an informal Q&A, members asked Maximilian about recruiting, day-to-day life as an analyst, the move from banking to private equity, and career advice, and came away with practical, first-hand insights from someone who has worked across both sides of the deal.",
    people: [
      "Maximilian Schierl, Investment Banking Analyst at J.P. Morgan, previously at Altor Equity Partners, Raymond James and Houlihan Lokey; joining TA Associates",
      "Organised by Fabian Luis Seher and Private Equity, with Investment Banking",
    ],
    departments: ["private-markets", "investment-banking"],
    desks: ["private-markets/private-equity", "investment-banking/m-and-a"],
  },
];

/** Every clip has a still of the same name, shown before it plays (the admin page makes one on upload). */
export const clipPoster = (src: string) => src.replace(/\.(mp4|webm|mov)$/i, ".jpg");

export const eventsFor = (events: EventItem[], department: string, desk?: string) =>
  events.filter((e) =>
    desk ? e.desks?.includes(`${department}/${desk}`) : e.departments.includes(department),
  ).sort((a, b) => b.date.localeCompare(a.date));
