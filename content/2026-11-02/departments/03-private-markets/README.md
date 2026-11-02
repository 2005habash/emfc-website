# Private Markets: content and feedback

| Who | What they sent |
|---|---|
| Jan Heibel (Head of Private Markets) | Three target firms, one event, reports and one-pagers in progress |
| Fabian Luis Seher (Vice-President, Private Equity) | Page feedback (six points), events, reports in preparation, photo status |
| Luca Flusche (Vice-President, Real Assets) | Page feedback, the Market Insight Q3 2026 report, the desk's one-pager |
| Zaid Habash (Vice-President, VC & Growth) | Nothing: Zaid writes his own desk (Vasco) |
| Anastasia Murgida (Vice-President, Fintech) | Nothing |

Everything they sent is below, nothing shortened. Their messages and original files are in `originals/`; the PDFs to publish are in `files/`; the structured version of the pages is `desks.json`.

"Now" is the text in the 27 October code (`src/lib/departments.ts`, Private Markets entry), so each change can be found and replaced.

## 1. How the Private Markets pages work (Vasco's decision, 2 November)

One page for the department: description, an overview of what it does, target firms, the team. From it, a page per desk (Private Equity, VC & Growth, Fintech, Real Assets) with the same kind of information for that desk only: its description, what it does, its target firms, reports, events and team. `desks.json` holds all of it, with the source of every item.

Jan Heibel: "the new version looks great, really top."

## 2. The department page

### Description: one line per desk
- Luca: "Could we add one line for each vertical under the Private Markets desk?"
- The lines (also in `desks.json`):
  - Private Equity: "Private Equity: how buyout funds find, value and finance deals, with a monthly Deal of the Month, paper LBO workshops, mock interviews and the annual Spanish Mid-Market PE Review." Drafted from Fabian's material, for Fabian to confirm.
  - VC & Growth: to be written by Zaid, as its Vice-President (Vasco).
  - Fintech: "Fintech: payments, digital banking and the technology changing financial services, from early-stage startups to the fintech teams of banks and investors." Drafted on Vasco's instruction from what exists, for Anastasia to confirm.
  - Real Assets: "Real Assets: deep dives into real estate, infrastructure and the energy transition." Luca's words.

### What the desk produces
Fabian's suggestions, "from the PE side". In his words: "These are just ideas, so feel free to take or leave them." They are the department's only feedback on this section. Applied as follows (Vasco's standing rule: describe what exists, mark the rest as planned): I takes his title and text; II keeps its title and gets his addition, since the technical training exists; III takes his text; IV becomes "Speaker Events" with his alternative text, since no podcast exists; V stays; VI is added with his text. Industry Profiles are mentioned in IV and VI: none exists yet, so they are written as planned.

**I. Fortnightly Deal Teardowns**
- Now: title "Fortnightly Deal Teardowns", text "Live deal coverage across all four verticals: PE, VC & Growth, Fintech and Real Assets, with full investment memos."
- Fabian: drop "fortnightly" unless all four desks can commit to it. On the PE side they start with a monthly Deal of the Month.
- His text: title "Deal Teardowns", text "Regular deal coverage across PE, VC & Growth, Fintech and Real Assets, from short deal notes to full investment memos."
- Also note: "Fortnightly" is in the department summary too (`function`): "Fortnightly deal teardowns, sector sessions, recruiting prep and speaker events with investors from partner firms."

**II. Sector & Market Education**
- Now: "Asset class mechanics, investor thinking and current macro trends across private markets."
- Fabian: fine as is. One option is to add at the end: "...plus technical training on accounting, valuation and LBO mechanics."

**III. Interview Prep & Case Simulations**
- Now: "CV screening, mock interviews and case practice tailored to PE, VC, Fintech and Real Assets recruiting."
- Fabian: add paper LBO workshops.
- His text: "CV screening, mock interviews, paper LBO workshops and case practice tailored to PE, VC, Fintech and Real Assets recruiting."

**IV. Speaker Events & Podcast**
- Now: "Monthly sessions with alumni and industry professionals, plus a podcast in build."
- Fabian: if "monthly" and the podcast aren't confirmed yet, an alternative text: "Roundtables and coffee chats with alumni and industry professionals, each documented in an Industry Profile."
- He gives no new title. If the podcast goes, "Podcast" in the title no longer fits.

**V. Study Tours & Outreach**
- Fabian: fine as is.

**VI. Research & Reports (new, fills the empty sixth slot)**
- Fabian's text: title "Research & Reports", text "Industry Profiles on our speakers, deal notes and sector reports across the four verticals, including the annual Spanish Mid-Market PE Review."

### Target firms
- Now (9): Blackstone, KKR, CVC, Warburg Pincus, Ardian, Index Ventures, Atomico, Sequoia, General Atlantic. ("Sequoia" is written "Sequoia Capital" from now on, the same on every page.)
- Jan (Head): "Only thing I'd add are three more target firms for our pages: EQT, Brookfield and Hg."
- Fabian: the last row has three empty cells, and Real Assets isn't covered yet. Add EQT (PE and Infrastructure), Brookfield (Real Assets) and Silver Lake (tech PE; their speaker Carson Wang joins them).
- Luca: "The current list is all PE and VC, so Real Assets has no targets shown. Please add EQT and CBRE Investment Management, and tag Ardian for Real Assets as well. The other verticals could do with the same treatment, for example Fintech." So: show which desk each firm belongs to.
- Vasco's decision: the department page shows the current 9 plus Jan's 3 (EQT, Brookfield, Hg), 12 in all, each tagged with its desk. Silver Lake and CBRE Investment Management go on the desk pages.
- Vasco's rule (2 November): every page shows 12 target firms, desk pages included. Where a desk had fewer, firms were proposed to reach 12 and marked as such, for the desk's VP to confirm or swap: 4 for Private Equity (Carlyle, Advent International, Permira, Cinven), 8 for VC & Growth (leading venture investors active in Europe), all 12 for Fintech (from 2025 and 2026 rankings), 8 for Real Assets (well-known real estate and infrastructure investors). Every list with its sources is in `target-firms.json` at the top of the package and in `desks.json`.

### People and titles
- Luca: his name and title are correct.
- Luca: "maybe u want to change 'VP' uniformly on the detailed departments at least into 'Vice President'". Vasco's decision (2 November): write "Vice-President" everywhere, for example "Vice-President, Real Assets". The titles in `people/` already use it.
- Luca asked whether associates come through the member form. They do: every member who filled it in, associates included, is in `people/`. Luca's three (Kleio Naziri, Isabelle Oliger, Aaron Kark) all did.
- Two Private Markets associates picked no desk in the form (Lili Anna Paczolay-Nagy, Shaivam Sundeep Ravani): shown as "Associate, Private Markets".
- Luca's one-pager spells an associate "Cleo Naziri"; in the form she wrote "Kleio Naziri", which is the name for the site.

### Current site vs new
- Fabian: "Nothing from the current site needs to be kept on my side. I prefer the new version."
- Luca: no requests to keep anything. "It looks great so far, really nice work."
- Jan: "the new version looks great, really top."

## 3. The desk pages

Full detail in `desks.json`. In short:

| Desk | Description | What it does | Target firms | Reports | Events |
|---|---|---|---|---|---|
| Private Equity | Drafted line, for Fabian to confirm | Seven items from Fabian's material (Industry Profiles marked as planned) | 12: Blackstone, KKR, CVC, Warburg Pincus, Ardian, EQT, Hg, Silver Lake, plus Carlyle, Advent International, Permira, Cinven (proposed) | Deal of the Month, Spanish Mid-Market PE Review, Investment Memo Drafting (all in preparation) | 9 Oct sessions, the Abac Capital table at the roundtables, the Carson Wang coffee chat (co-hosted) |
| VC & Growth | Zaid writes it | Zaid writes it | 12: Sequoia Capital, Index Ventures, Atomico, General Atlantic, plus Accel, General Catalyst, Lightspeed Venture Partners, Balderton Capital, Creandum, EQT Ventures, Northzone, Partech (proposed; Zaid confirms) | None | None |
| Fintech | Drafted line, for Anastasia to confirm | Speaker sessions (the UBS session) | 12: Stripe, Adyen, Revolut, Klarna, Wise, Checkout.com, N26, Monzo, Trade Republic, Nubank, Plaid, Coinbase (proposed from 2025 and 2026 rankings) | None | Inside Equity Research (UBS), 28 Oct |
| Real Assets | Luca's line, plus the one-pager's description | Six items from the one-pager | 12: EQT, CBRE Investment Management, Ardian, Brookfield, plus Macquarie Asset Management, Antin Infrastructure Partners, Meridiam, Copenhagen Infrastructure Partners, Patrizia, Hines, Nuveen Real Estate, AXA IM Alts (proposed) | Market Insight Q3 2026 (published); the one-pager, linked from the desk page | None |

### Real Assets one-pager on the desk page
- Luca: the Real Assets one-pager is approved. "Could we link it from the desk page, so companies can see who we are and how to reach us?"
- File: `files/EMFC_PM_RealAssets_External_vf.pdf` (1 page). Contact on it: (email removed). Its footer links the Market Insight post on LinkedIn.

## 4. Resources page
- Luca: the Market Insight Q3 2026 report "is already live on LinkedIn. I would suggest publishing it on the Resources page, either as a downloadable PDF or as a link to the LinkedIn post."
- PDF: `files/EMFC_RealAssets_MarketInsight_Q3_2026_vf.pdf`, "Real assets in Q3 2026: where the money is going", 4 pages, by Jan Heibel and Luca Flusche, data as of 25 September 2026. LinkedIn post: https://lnkd.in/p/ebkynQ-q.
- Jan: "Real Assets Q3 Market Overview, sending you the PDF right after this. Further reports are currently being worked on across the verticals." Vasco confirmed this is the same report.
- All reports, with status, are in `reports.json`.

## 5. Events
All events are in `events/` at the top of the package, one folder each. Private Markets' are:
- 9 Oct 2026: CV Screening & Optimisation, Technical Training, Mock Interviews (Private Equity, led by Fabian Seher).
- 19 Oct 2026: the Private Equity table at "Exploring Careers in Finance: Alumni Roundtables", with Miquel Petit, Associate at Abac Capital, moderated by Fabian Seher. Fabian sent it as "Roundtable with Abac Capital"; it is part of the roundtables event, listed once.
- 28 Oct 2026: "Inside Equity Research: UBS, fintech and careers in equity markets", with Jonathan Glele Ahanhanzo, Room 0A04. Sent by Jan Heibel; Vasco's decision: a Private Markets (Fintech) session, with Marketing's published recap as the text.
- 29 Oct 2026: Coffee chat with Carson Wang. Fabian sent it as a Private Equity event; Marketing's recap says it was organised by Investment Banking. Listed once, under both.
- Planned, dates to be confirmed: Paper LBO Workshop (led by Fabian Seher); PE Case Competition.
- Jan: "Upcoming booked: nothing confirmed yet, several things in the pipeline."

## 6. Reports
- Real Assets: Market Insight Q3 2026, published (section 4). The one-pager calls it a quarterly report.
- Private Equity, in preparation, PDFs to follow: Deal of the Month (monthly), Spanish Mid-Market PE Review (annual), Investment Memo Drafting.
- Fabian's page feedback mentions an "Industry Profile PDF". Vasco: ignore it.
- Jan, in development "so you have it for the pages": one-pager pitches, and a one-pager pitch deck for the Private Markets department.

## 7. Photos
- Alumni roundtables (including the Private Equity table): 13 photos and 8 clips in `events/2026-10-19-alumni-roundtables/`.
- Coffee chat with Carson Wang: 1 photo in `events/2026-10-29-coffee-chat-carson-wang/`.
- 9 October sessions: no photos taken (Fabian). Photos will be taken at future sessions.
- UBS session: no separate photos (Jan); Marketing's recap has photos inside its design.

## Still to come from Private Markets
- The VC & Growth desk, from Zaid.
- Fabian's and Anastasia's confirmation of their drafted lines and of Fintech's proposed target firms.
- The Private Equity report PDFs when ready; Jan's one-pagers and pitch deck.
