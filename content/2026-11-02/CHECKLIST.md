# Checklist: every change to make on the site

For Zaid and the AI assistant he builds with. One line per change, grouped by page, each pointing to the file with the full material. "Now" means the 27 October code. Tick them off in order; the site-wide rules come first because they touch every page.

## A. Site-wide

- [ ] A1. Titles say "Vice-President", not "VP", everywhere (team page, department pages, homepage mosaic). Source: `README.md`, decisions.
- [ ] A2. No middle dots (·) and no em dashes (—) anywhere in copy or labels. The homepage mosaic roles ("Head · Investment Banking", "VP · M&A") change to "Head of Investment Banking", "Vice-President, M&A" and so on. Source: Vasco's standing rules (`README.md`).
- [ ] A3. Only Diogo Oliveira and Vasco Lemos are founders: "Co-President & Founder". Paul Christian Abel, Moritz Fritsch and Philip Ignatzi are "Advisor", not "Advisor & Founder" (`ADVISORY` and `MOSAIC` in `src/lib/team.ts`). Source: `members.json`, Vasco's rules.
- [ ] A4. Two names change from the current site: "Vasco Barahona de Lemos" becomes "Vasco Lemos", "Fabian Seher" becomes "Fabian Luis Seher". Update the keys in `PHOTOS` (`src/lib/team.ts`) and `LINKEDIN` (`src/lib/departments.ts`). Source: `README.md`, "Names that change".
- [ ] A5. Target firms: 12 on every page that shows them, always the same grid. The lists for every page and desk, with the source of each firm, are in `target-firms.json`. Firms marked "proposed" were added to reach 12 and the department can swap them.

## B. Team and people (`members.json`, `people/`)

- [ ] B1. Add all 64 members from `members.json` to their departments: `name`, `title` as the role, `linkedin`. To show programme, ESADE email and up to 3 firms, add those fields to the `Person` type. Keep Luís Laboreiro (Chief Investment Officer) and Paul Christian Abel (Advisor) as they are now: they didn't fill in the form.
- [ ] B2. Order inside each department: Head, then Chief Investment Officer, Vice-Presidents, Associates, grouped by desk. Fixed Income uses the department's own order: Head, then the Public credit group, then the Private credit group led by Tim Constantin Ziegler, whose title is "Head of Private Credit" (the department's own title for him, although he picked Vice-President in the form). `members.json` is already in order.
- [ ] B3. Fixed Income shows its team in two groups, "Public credit" and "Private credit" (`group` field), with each person's desk. Tim Constantin Ziegler's title is "Head of Private Credit". Source: `departments/05-fixed-income/README.md`.
- [ ] B4. Photos: run every photo in `people/` through the portrait process (section 6 of the HANDOFF.md in Zaid's project folder) and save at `site_photo_path`. Three people keep the photo already on the site (Diogo Oliveira, Vasco Lemos, Luka Thomson: `use_current_site_photo`). Three go up without a photo for now (Aaron Kark, Aditya Sunil Shajwani, Lara Koch: `photo_status` "replace"). Eleven are usable with care (`photo_status` "check"), one of them (Jules Coppens) needs cropping out of a screenshot. Source: `README.md`, photo sections; `members.csv` columns `photo_status`, `photo_note`.
- [ ] B5. Associates without a desk are "Associate, <Department>" (two in Private Markets, two in Investment Banking, one in Asset Management).

## C. Homepage

- [ ] C1. Replace the hero numbers with the real ones in `statistics/README.md`, section 1: 66 members, 27 nationalities, 86% international, 129 firms where members have worked, 6 departments, and the other figures listed there. "Over 90% international" appears in three places (hero, the "International" pillar, the photo banner) and on the sponsorship page: all become the real figure or "27 nationalities".
- [ ] C2. "Where our members come from" (`MEMBER_FIRMS`): replace with the 12 firms in `statistics/README.md`, section 2, all from members' answers. Amundi, Nordea and CaixaBank come off: no member named them. Vasco can add one back if Luís Laboreiro or Paul Christian Abel worked there.
- [ ] C3. Sponsorship page facts: real figures from `statistics/README.md` (members, nationalities, international share, experience, internships, graduation year), and optionally the target areas and cities table from section 3.
- [ ] C4. Homepage events come from `events/events.json` (see F).

## D. Department pages (`src/lib/departments.ts`)

### Investment Banking (`departments/02-investment-banking/README.md`)
- [ ] D1. Desks are "M&A" and "Debt Advisory" (was "Debt"). The department page describes the department and each desk opens in detail, like Private Markets.
- [ ] D2. M&A desk text: their "what we do" paragraph and six activities, word for word.
- [ ] D3. Debt Advisory desk text: their paragraph, word for word.
- [ ] D4. "What the desk produces" matches their deliverables: M&A deal case study (monthly), coffee chats every two weeks, CV workshops once a term, interview prep, company visits and networking events. Remove the podcast and the study tours, which they don't list.
- [ ] D5. Target firms: keep the current 12 names, on the department page and both desk pages (`target-firms.json`).
- [ ] D6. People: Yonatan Bendler (Head), Constantin Molineus (Vice-President, M&A), João Salgado (Vice-President, Debt Advisory), 5 associates (`members.json`). Investment Banking's "where our members come from" is not affected.

### Private Markets (`departments/03-private-markets/README.md`, `desks.json`)
- [ ] D7. Department page: description plus one line per desk. Lines in `desks.json`: Private Equity (drafted, Fabian to confirm), VC & Growth (Zaid writes it), Fintech (drafted, Anastasia to confirm), Real Assets (Luca's).
- [ ] D8. "What the desk produces", from Fabian Seher's six points (the department's only feedback on this section; the current texts are next to each in the README): I becomes "Deal Teardowns" with his text; II keeps its title and gets his addition about technical training (it exists: the 9 October session); III gets his text; IV becomes "Speaker Events" (no podcast exists) with his alternative text; V unchanged; VI "Research & Reports" is new, with his text. Where his texts mention Industry Profiles, write them as planned: none exists yet (Vasco's rule: describe what exists, mark the rest as planned). Also remove "Fortnightly" from the department summary.
- [ ] D9. Target firms: 12, each tagged with its desk: Blackstone, KKR, CVC, Warburg Pincus, Ardian, Index Ventures, Atomico, Sequoia Capital, General Atlantic, EQT, Brookfield, Hg. Tags in `target-firms.json` and `desks.json`.
- [ ] D10. A page per desk, from `desks.json`: description, what the desk does, target firms, reports, events, team. Real Assets links its one-pager PDF and the Market Insight report; the Private Equity page lists its three reports as in preparation; each desk has 12 target firms (`target-firms.json`; the proposed ones are marked); VC & Growth's text waits for Zaid.
- [ ] D11. People: Jan Heibel (Head), four Vice-Presidents, 15 associates by desk (`members.json`).

### Asset Management (`departments/04-asset-management/README.md`)
- [ ] D12. Remove "ETFs & Multi-Asset" from the verticals and from the department summary.
- [ ] D13. "What the desk produces", new order and texts: I Portfolio Management (new text), II Equity Research (new text), III Investment Committee (new text), IV Market & Macro Research (unchanged), V Training & Industry Access (unchanged).
- [ ] D14. Target firms: the department's 8 (BlackRock, Fidelity, Capital Group, Vanguard, State Street, Schroders, Amundi, PIMCO) plus 4 proposed to reach 12 (J.P. Morgan Asset Management, Goldman Sachs Asset Management, Wellington Management, T. Rowe Price).
- [ ] D15. People: Cosimo Dini (Head), Luís Laboreiro (Chief Investment Officer, kept), 8 associates by desk.

### Fixed Income (`departments/05-fixed-income/README.md`)
- [ ] D16. Verticals become the desks in two groups: Public credit (Rates & Government Bonds, Investment Grade Credit, High Yield Credit, Mortgage-Backed Securities) and Private credit (Private Credit, Direct Lending). Update the department summary too.
- [ ] D17. Replace the three texts with the department's new ones (word for word in the README): the intro (`long`), what associates do (`associate`) and point II, now "Debt Capital Markets Case Studies" (`produces`, and its copy on the Resources page). The department summary (`function`) becomes: "Research-led coverage of public and private debt markets: a monthly Fixed Income Market Monitor, debt capital markets case studies and speaker sessions with industry professionals." (drafted from their new intro; the department sent no text for this line).
- [ ] D18. Target firms: the department's 10 (PIMCO, RBC BlueBay Asset Management, TwentyFour Asset Management, Loomis Sayles, PGIM Fixed Income, Ares Management, Arcmont Asset Management, Hayfin Capital Management, Golub Capital, Pemberton Asset Management) plus 2 proposed to reach 12 (Apollo, Oaktree Capital Management).
- [ ] D19. People: Luka Thomson (Head), then the two groups in the department's order (B3).

### Corporate Relations and Marketing
- [ ] D20. No text changes were sent. People: Nick Kriz (Head), Moritz Muellner (Vice-President, Corporate Relations), 6 associates; David Villar (Head of Marketing), 5 associates.

## E. Advisory Board and Co-Presidents
- [ ] E1. Co-Presidents: Diogo Oliveira, Vasco Lemos. Advisory Board: Moritz Fritsch, Philip Ignatzi (from the form) and Paul Christian Abel (kept). Titles per A3.

## F. Events page (`events/events.json`, one folder per event)
- [ ] F1. Replace the `EVENTS` array with the 10 events in `events/events.json`. The two planned events without a date (Paper LBO Workshop, PE Case Competition) stay off the Events page until a date is confirmed; they appear on the Private Equity desk page as planned.
- [ ] F2. The site shows the day only, never a time.
- [ ] F3. Photos for the events that have them: alumni roundtables (13 photos, 8 clips), William Blair (1), Carson Wang coffee chat (1). Marketing's recap images are in `posts/` for reference and may be used as visuals.
- [ ] F4. Each event's text is the "Text for the site" in its README; where sources disagreed, Marketing's version is used (Vasco's rule). The I Squared Capital text is reworded in the past tense until Marketing publishes its recap.

## G. Resources page (`reports.json`)
- [ ] G1. Publish the PDFs: Monthly Market Views July, September and October 2026 (Asset Management); Fixed Income Market Monitor September and October 2026; Real Assets Market Insight Q3 2026 (also link the LinkedIn post). Files in `departments/<dept>/files/`.
- [ ] G2. Mark as coming: Private Equity's Deal of the Month, Spanish Mid-Market PE Review and Investment Memo Drafting; Investment Banking's M&A case study on Paramount Skydance and Warner Bros. Discovery (next week).
- [ ] G3. Update the Fixed Income text repeated on this page (D17).

## H. Fund page
- [ ] H1. Publish the EMFC Global Equity Fund Investment Policy Statement (version 1.0, October 2026): `departments/04-asset-management/files/EMFC_Global_Equity_Fund_IPS_v1.0_October_2026.pdf`.

## Not final yet (Vasco is chasing)
- The VC & Growth desk text (Zaid).
- Confirmation of the drafted Private Equity and Fintech lines and of Fintech's proposed target firms.
- New photos for Aaron Kark, Aditya Sunil Shajwani and Lara Koch; better ones for the eleven marked "check" if the owners send them.
- The departments' confirmation of the target firms marked "proposed" in `target-firms.json`.
- Photos of the I Squared Capital event (2 November), from Marketing.
- Private Equity's report PDFs; Investment Banking's M&A case study; Jan Heibel's one-pagers and pitch deck.
- Details of the I Squared Capital event from an internal document (not for the website).
