# EMFC website revamp: plan

Written 2 November 2026 from everything decided so far: two review calls, the club to-do list, Vasco's content package of 2 November, and Zaid's answers to the open questions the same day (section 14). For whoever builds the launch version with Claude Code. Read `HANDOFF.md` first for how the project works; this file says what to change and in what order.

## 1. Summary

The 27 October redesign in this folder becomes the launch version of emfc.es. What changes:

1. **Real people.** 66 members instead of 18: everyone who filled in the member form, with photo, title, programme and up to three firms.
2. **Real content.** Each department's own texts, target firms, reports and events, collected by Vasco by 2 November.
3. **The decisions of two review calls and of 2 November.** These include:
   - bull blue instead of gold, and hover menus;
   - a page for every desk;
   - reports on desk pages and in one library;
   - the fund page parked;
   - a working sponsorship form;
   - a moving strip of member photos, and a shorter homepage.
4. **An admin page** where the Brand team adds events, photos and reports without touching code.
5. **Launch on emfc.es** through Lovable's GitHub sync.
6. **A handover** that next year's owner can run, with every account under a club login.

| Phase | What | Size | Needs first |
|---|---|---|---|
| 0. Set-up | Version control, content into the repo, portrait pipeline | S | Nothing |
| 1. Content and data | People, departments and every desk, events, reports, statistics | L | Phase 0 |
| 2. Site-wide | Colours, copy sweep, clickable states, nav menu, logo band | M | Phase 0 |
| 3. Pages | Home, Departments and desks, Team, Events, Resources, Fund, Sponsorship | L | Phases 1 and 2 |
| 4. Admin and database | Events, reports and enquiries managers | M | Phase 3 |
| 5. Review round | Every Head checks their pages once | S (calendar time) | Phase 3 |
| 6. Launch | GitHub and Lovable, club accounts, final checks | M | Email set-up (section 13) |

All open questions were answered on 2 November. The decisions are listed in section 14 and are already worked into the sections below.

## 2. Sources, and which one wins

| # | Source | Date | Who | What it settles |
|---|---|---|---|---|
| 1 | Wispr Flow meeting "EMFC website call" (folder "Other") | 20 Oct | Zaid, Diogo and others | First review: photos, hover menus, desk discoverability, research into departments, kickoff date, new events, fund "coming soon", automatic sponsorship email, no personal emails, no chatbot |
| 2 | `~/Downloads/emfc-website-prompt.md` | 20 Oct | Written from call 1 | The same change list as an AI prompt, with acceptance details |
| 3 | `~/Downloads/EMFC Website – Club To-Do.md` | 20 Oct | Zaid | Who owes which content. Decided: no chatbot, no personal emails |
| 4 | Wispr Flow meeting "Website Redesign and Team Page Updates" (folder "Other") | 28 Oct | Zaid and Vasco | Second review: gold to light blue, one logo band, people strip moved up and moving, sub-desk buttons, Corporate Relations and Marketing as full departments, advisors not founders, admin page for events, resource cards, team photo |
| 5 | `~/Downloads/EMFC website data/` (`README.md`, `CHECKLIST.md`) | 2 Nov | Vasco, from the member form and every department | All people, photos, department texts, target firms, events, reports, statistics, and Vasco's decisions where departments disagreed |
| 6 | `~/Downloads/EMFC-club-statistics-internal_1.md` | 2 Nov | Vasco, for the board | Internal figures. **Nothing from its "Left out of the site" section goes on the site.** |
| 7 | Zaid's answers to the 15 open questions | 2 Nov | Zaid | Every conflict between sources 1 to 6 (section 14) |

How conflicts are settled:
- Zaid's answers of 2 November (7) settle the conflicts they cover, even where they differ from the package. One example is the kickoff dinner date.
- Otherwise newer beats older: 2 Nov (5) beats 28 Oct (4) beats 20 Oct (1 to 3).
- A department's own text is used word for word on its pages.
- For events, Marketing's version wins on everything except the kickoff date, and Marketing's published LinkedIn recap is the official text (Vasco's rule).

## 3. Where the code stands (27 October)

- None of the 20 October changes are in the code yet. The sponsorship form still opens the visitor's mail app and shows Vasco's address (`src/routes/sponsorship.tsx:83` and `:202`). The full fund page is public. Research sits on Resources. The nav has no dropdowns.
- 18 people with old titles ("VP", "Advisor & Founder", "Vasco Barahona de Lemos"), a separate "Support Team", and "Over 90% international" (the real figure is 86%).
- Copy written before associates joined: the Departments hero says "EMFC is recruiting Associates" (`src/routes/departments.tsx:66`), and the Team page calls itself "the founding team".
- About 60 lines with middle dots or em dashes.
- Supabase (Lovable Cloud project `mibdxttlhzvsesfbetfc`) already has an email and password login with an `admin` role (`user_roles`, `private.has_role`), `applications` with CV storage (shown on `/admin`), and `newsletter_signups` (the footer and homepage forms, live).
- Not a git repository. emfc.es still serves the old Lovable site.

## 4. Rules for every page

From Vasco's rules (package README), the two calls and the decisions of 2 November:

- **Titles:**
  - "Co-President & Founder" for Diogo Oliveira and Vasco Lemos only.
  - "Head of <Department>", "Chief Investment Officer" and "Vice-President, <Desk>", written out.
  - "Associate, <Desk>", or the department's name when there is no desk.
  - "Advisor".
  - Exceptions: Tim Constantin Ziegler is "Head of Private Credit", and David Villar is "Head of Brand".
- **The Marketing department is called Brand** on the site (decided 2 Nov). Its associates are "Associate, Brand".
- **Names** exactly as in `members.json`: "Vasco Lemos" (not Barahona de Lemos), "Fabian Luis Seher", "Joan Brugada", and so on.
- **No middle dots and no em dashes** anywhere on the site, labels and captions included.
- **Privacy:**
  - Show only name, photo, role, programme, LinkedIn and up to 3 firms. Nothing else from the form.
  - No email addresses for anyone (decided 2 Nov). Keep them out of the code too, since everything in it reaches the visitor's browser.
  - Statistics are totals only, with no gender split.
- **No personal email addresses** as contact points anywhere. No chatbot.
- **Photos** are matched to people only through the package folders, never by faces.
- **Target firms:** a 12-cell grid on every page that shows them, never a blank cell. Firms marked "proposed" in the package go live as they are (decided 2 Nov). The data keeps the flag so desks can swap them later; the site doesn't show it.
- **Events:** show the day only, never a time.
- **Describe what exists** and mark the rest as planned. No podcast or study tours written as if they happen.
- **Design:** keep the v2 Institutional system and spacing (`HANDOFF.md` section 3), except where this plan changes it.

## 5. Phase 0: set-up

1. **Version control.** `git init` and commit the 27 October state, so every later change can be undone. Once the Lovable GitHub repo exists (section 11), the work moves there on a branch.
2. **Bring the content in.** Copy the small files of the package to `content/2026-11-02/`: `members.json`, `events/events.json`, `reports.json`, `target-firms.json`, `statistics/statistics.json`, every `departments/*/README.md`, `departments/03-private-markets/desks.json` and `CHECKLIST.md`. Keep the raw photos (113 MB) out of the repo, in the club Drive. Only processed portraits go into `public/images/team/`.
3. **Reports.** Copy the 8 PDFs to `public/reports/` with clean names (for example `monthly-market-views-2026-10.pdf`). Once the admin page exists (section 9), new reports are uploaded there instead.
4. **Portrait pipeline.** Turn `tools/cutout.swift` into `tools/portraits.swift`. It should cut out the person (the existing Vision code), find the face (`VNDetectFaceRectanglesRequest`) and crop a square to the house framing: head about 55% of the height, top of the hair about 7% from the top, face centred. Then save a 1024 × 1024 JPEG at the member's `site_photo_path`. Run it on the 58 usable photos (47 "ok", 11 "check") in one go, then look at the 11 by eye. Jules Coppens needs his screenshot cropped first (package README: x 544, y 828 to x 3079, y 3148).
5. **Design skill.** `design-taste-frontend` is installed at `.claude/skills/design-taste-frontend`. Decided 2 Nov: use it to critique and polish within the current design, not to restyle. Its house rules ban the small labels above headings and thin divider lines. Ignore those two rules here: they are part of the EMFC design.

Done when: there is a first commit, `content/2026-11-02/` exists, and 58 portraits are processed and checked.

## 6. Phase 1: content and data model

### 6.1 One list of people
Replace the hand-kept lists (`people` in `src/lib/departments.ts`; `PRESIDENTS`, `ADVISORY`, `MOSAIC` and `PHOTOS` in `src/lib/team.ts`) with one typed list, `src/data/members.ts`. Generate it from `members.json` with a small script, so next year's list is regenerated rather than retyped. Fields: `name, slug, title, department, desk, group, position, programme, linkedin, firms, photo`. **Leave out `email`:** emails are not shown (decided 2 Nov), and anything in this file reaches every visitor's browser. Every page takes its people from this list.

- 64 from the form, plus Luís Laboreiro (Chief Investment Officer) and Paul Christian Abel (Advisor) kept as they are: 66 in all.
- Order inside each department as in `members.json`: Head, CIO, Vice-Presidents, then Associates by desk. Fixed Income follows its own order, in two groups.
- New on the site: Moritz Muellner (Vice-President, Corporate Relations) and 46 associates.
- Brand: David Villar becomes "Head of Brand", and his five associates "Associate, Brand". The package says "Marketing".
- Photos: Diogo Oliveira, Vasco Lemos and Luka Thomson keep their current site photos. Lara Koch, Aaron Kark and Aditya Sunil Shajwani have no usable photo yet and get an initials tile until one arrives. David Villar's form photo replaces the LinkedIn one.
- CHECKLIST A1 to A4, B1 to B5 and E1.

### 6.2 Departments and desks: a page for every desk
Decided 2 Nov: every desk of the four investment departments gets its own page. Add desks to the `Department` type:

```ts
type Firm = { name: string; desk?: string; proposed?: boolean }; // proposed: kept in data, not shown
type Desk = {
  slug: string; name: string; group?: string; lead?: string; line?: string; description?: string;
  does: string[]; targetFirms: Firm[]; reports: string[]; events: string[];
};
```

| Department | Desks (each with a page) | Shown next to the Head on the desk page | Desk texts |
|---|---|---|---|
| Investment Banking | M&A, Debt Advisory | Constantin Molineus, João Salgado | The department's own texts |
| Private Markets | Private Equity, VC & Growth, Fintech, Real Assets | Fabian Luis Seher, Zaid Habash, Anastasia Murgida, Luca Flusche | `desks.json`. VC & Growth comes from Zaid |
| Asset Management | Macro & Strategy, Equity Research, Portfolio Management | Portfolio Management: Luís Laboreiro (CIO). The other two: no desk lead | Drafted from the department's texts, for Cosimo Dini to confirm |
| Fixed Income | Public credit: Rates & Government Bonds, Investment Grade Credit, High Yield Credit, Mortgage-Backed Securities. Private credit: Private Credit, Direct Lending | Private credit desks: Tim Constantin Ziegler | Drafted from the department's texts, for Luka Thomson to confirm |
| Corporate Relations | None | | Department page only |
| Brand (was Marketing) | None | | Department page only |

- **Asset Management and Fixed Income desks** have no texts of their own yet. Draft each desk's line and "what it does" from the department's own material, as Vasco did for Private Equity and Fintech, and mark them for the Head to confirm.
- **Portfolio Management** has no associates in the form. Its page shows the Head and the CIO, and links to the Fund page and the Investment Policy Statement.
- **Fixed Income desks** have one or two people each. Their pages sit under their group: the Public credit desks are led by the Head, the Private credit desks by Tim Constantin Ziegler.
- **Target firms per desk:**
  - Both Investment Banking desks use the department's 12.
  - The Private Markets desks use their own lists in `target-firms.json`.
  - Asset Management and Fixed Income desks reuse their department's 12 until a desk sends its own.

Content per department, word for word from the package (CHECKLIST D1 to D20):

| Department | Main changes | Source |
|---|---|---|
| Investment Banking | Desks "M&A" and "Debt Advisory". Their M&A text and six activities, and their Debt Advisory text. "What the desk produces" matched to their deliverables list (no podcast, no study tours). The current 12 target firms on the department page and both desks | `departments/02-investment-banking/README.md` |
| Private Markets | One line per desk. Fabian's six "produces" points (I becomes "Deal Teardowns" without "fortnightly", IV becomes "Speaker Events", VI "Research & Reports" is new). 12 firms tagged by desk. Four desk pages from `desks.json`. Real Assets links its one-pager | `departments/03-private-markets/` |
| Asset Management | Remove "ETFs & Multi-Asset". New order and texts: Portfolio Management, Equity Research, Investment Committee, Market & Macro Research, Training & Industry Access. 8 firms plus 4 proposed | `departments/04-asset-management/README.md` |
| Fixed Income | Desks in two groups, Public credit and Private credit. New intro, "what associates do", and point II "Debt Capital Markets Case Studies" (also on Resources). 10 firms plus 2 proposed | `departments/05-fixed-income/README.md` |
| Corporate Relations | No text changes sent; people only | CHECKLIST D20 |
| Brand | No text changes sent; people only; renamed from Marketing | CHECKLIST D20 |

The VC & Growth desk (line, description, what it does, target firms) is Zaid's to write (section 13).

### 6.3 Events
- **All 10 events go up** (decided 2 Nov). That includes the William Blair, UBS and Carson Wang sessions and the three Private Equity workshops of 9 October. The CV workshop stays off (Vasco).
- **The source:** the `EVENTS` array becomes the 10 events in `events.json`, and later the database (section 9). Add `photos`, `videos`, `recap`, `departments` and `desk` to `EventItem`, so each event can also show on its desk page.
- **Kickoff dinner: 26 September 2026** (decided 2 Nov). Marketing's events doc, `events.json` and the current site all say 14 September. Change `events.json` and the Team timeline to the 26th, and ask the Brand team to correct their doc.
- **Planned events:** the two with no date (Paper LBO Workshop, PE Case Competition) appear on the Private Equity desk page as "planned", not on the Events page.

### 6.4 Reports
Decided 2 Nov: each report appears **on its desk or department page** and also **in one library on the Resources page**. Give every entry a `department` and, where it applies, a `desk`:

| Report | Department page | Desk page |
|---|---|---|
| Monthly Market Views (July, September, October) | Asset Management | Macro & Strategy |
| Fixed Income Market Monitor (September, October) | Fixed Income | (all desks wrote it; department page only) |
| Real assets in Q3 2026 (Market Insight), plus its LinkedIn link | Private Markets | Real Assets |
| Real Assets one-pager | | Real Assets |
| EMFC Global Equity Fund, Investment Policy Statement | Fund page | Portfolio Management |
| Coming: M&A case study (Paramount Skydance and Warner Bros. Discovery) | Investment Banking | M&A |
| Coming: Deal of the Month, Spanish Mid-Market PE Review, Investment Memo Drafting | Private Markets | Private Equity |

### 6.5 Statistics
Create `src/data/stats.ts` from `statistics.json`: 66 members, 27 nationalities, 86% international, 16 languages, 49 universities in 22 countries, 97% with professional experience, 158+ internships, 124 firms, 21 countries worked in, and 88% graduating in 2027. CHECKLIST C1 says 129 firms, but `statistics.json` and its README both say 124, so use 124.

The new firms strip uses the 12 firms in `statistics/README.md` section 2. Amundi, Nordea and CaixaBank come off.

## 7. Phase 2: site-wide changes

### 7.1 Gold becomes bull blue (28 Oct)
The logo's colours, measured from `public/images/logo/bull-tile.png`, are navy `#000B3D`, mid blue `#5A67A2`, light blue `#9CA8D4` and white.

| Now | Becomes | Why |
|---|---|---|
| `--c-brass #A8844B` (accents on light backgrounds) | `#5A67A2` | Light blue on ivory is about 2.2:1 contrast, too faint for text; mid blue is about 5:1 |
| `--c-brass-light #D9BC85` (accents on navy) | `#9CA8D4` | About 8:1 on navy |
| `--c-night #030C3B` | `#000B3D` (optional) | Matches the logo exactly |
| Event type colour "Speaker" `#A8844B` | A blue from the set | No gold left anywhere |

Rename the tokens to `--c-accent` and `--c-accent-light`, so gold can't come back by name. Then check dark mode, the italic accent words (`<Em>`), numerals, buttons and the timeline line.

### 7.2 Copy sweep
- Replace every middle dot and em dash. Examples: the hero line "Est. 2026 · ESADE Business School · Barcelona", photo captions, the ticker, resource descriptions and mosaic roles. Add `npm run lint:copy`, a grep that fails on `·` or `—` anywhere in `src/`, so they don't come back.
- Change "VP" to "Vice-President", "Advisor & Founder" to "Advisor", and "Marketing" to "Brand".
- Remove the "Support Team" labels: Corporate Relations and Brand are departments like the others (28 Oct). Rewrite or replace the Co-Presidents' "Support Team" quote (`CO_PRESIDENT_QUOTES[1]`).
- Rewrite "founding team" and "EMFC is recruiting Associates" for a club of 66.

### 7.3 Make clickable things look clickable (20 and 28 Oct)
One rule for the whole site: anything clickable has a visible sign at rest (a button shape, an arrow or an underline), a hover state and a focus ring. This covers department tabs, desk buttons and cards, person cards, resource cards and event cards.

### 7.4 Navigation menu (20 Oct)
- **Departments:** opens a wide menu with one column per department and its desks listed under it. Fixed Income's desks sit under their two groups. Corporate Relations and Brand have no desks.
- **Other items** get a dropdown only once they have real subpages or sections worth linking to.
- **Behaviour:**
  - Opens on hover (after a short delay so it doesn't flicker), on keyboard focus and on tap.
  - Closes when the mouse leaves, on Escape and on a click outside.
  - Uses `aria-expanded` and supports arrow keys.
  - On phones, the same items appear as an accordion in the menu.
- **Data:** generated from the departments and desks data, not hard-coded.

### 7.5 One moving logo band (28 Oct)
The homepage has two bands that do the same job: the moving department ticker and the static "Where our members come from" strip. Keep one, a slow band of member-firm logos.
- **Content:** the 12 firms from 6.5, plus more from the "more options" list if it looks thin.
- **Behaviour:** monochrome, pauses on hover, static for reduced motion.
- **Logos:** one-colour SVGs from each firm's press page. Until a logo is sourced, its name appears in the serif typeface instead.

## 8. Phase 3: page by page

### 8.1 Home
New order: the 28 Oct swap, the band merge and the cuts decided on 2 Nov.
1. **Hero:** the facts become 66 members, 27 nationalities, 124 firms and 6 departments. The founding year stays in the line above the title.
2. **The moving logo band** (7.5).
3. **Welcome and the four pillars.** The "International" pillar uses the real figure.
4. **People strip, moved up** (it was 8th).
   - Shows every member with a photo (63), moving slowly in two rows that run in opposite directions on desktop.
   - Names appear on hover or focus.
   - The order mixes departments round-robin rather than grouping them. That spreads the club evenly without anyone sorting people by gender.
   - A static, swipeable row for reduced motion.
5. **Departments ("Structure"):** the six departments on equal footing, each linking to its page.
6. **Membership benefits, cut from five to three** (decided 2 Nov):
   - "Exclusive networking sessions".
   - "Top-tier recruitment opportunities", which absorbs the application workshops (CV reviews, technical training, mock interviews).
   - "Real research and deal work".
   - "Study trips" goes, since none has happened yet.
7. **Barcelona panorama, moved down:** "27 nationalities" (or "86% international").
8. **Join:** next intake (`NEXT_INTAKE_OPENS`), the next event from the events data, and the newsletter with its consent line (8.8).

The fund teaser is removed (decided 2 Nov) and comes back when the fund page goes live.

### 8.2 Departments and desk pages
- **Routes:** `/departments` (overview of all six), `/departments/<department>`, and `/departments/<department>/<desk>` for every desk (decided 2 Nov). Real URLs replace `?desk=`, so the menu and shared links go straight to a desk. Keep a redirect for old `?desk=` links.
- **Selector:** at the top of every department page, a clearly visible selector of all six departments with the current one highlighted (20 Oct). Keep today's spacing.
- **Department page:**
  - Description, the Head and leadership.
  - The desks as clickable buttons or cards, each with its one-line description. These are the 28 Oct "sub-desk buttons", and each opens its desk page.
  - "What the desk produces", 12 target firms tagged by desk, and the department's reports and events.
  - "On the desk" with associates grouped by desk.
  - Fixed Income shows its desks in the two groups.
- **Desk page:**
  - The Head with the desk's lead beside them (28 Oct: clicking "M&A" shows its Vice-President next to the Head).
  - The desk's description and what it does, its 12 target firms, its reports, events and planned events.
  - Its associates.
  - A link back to the department, and to the next and previous desk.
- **Corporate Relations and Brand:** a department page each, no desk pages.

### 8.3 Team
- **Hero image:** the club group photo (28 Oct). The one on the current site is still online at `emfc.es/__l5e/assets-v1/cb56cea6-469d-401e-980c-56f35628680e/team-group-photo.jpg` (371 KB). Vasco confirms it's the right one in the review round.
- **Co-Presidents:** same size, side by side. Their band changes from beige (`stone`) to white (the page's ivory `paper` in light mode; dark mode unchanged). On 28 Oct Vasco asked for one Team section to become white. On 2 Nov Zaid said "second I think", read here as the second section from the top. Vasco confirms in the review round.
- **Six departments, same layout each:** leadership (Head, CIO, Vice-Presidents) at today's card size, associates below in a denser grid grouped by desk. No "Support Team" section.
- **Person card:** photo, name and title. Clicking opens a small panel with programme, up to 3 firms and LinkedIn. No email (decided 2 Nov).
- **Our story:**
  - Add the ESADE Finance Club kick-off with GreenRoom on 28 May 2026. It was the first event of one of the two clubs that merged into EMFC.
  - Change the kickoff dinner to 26 September 2026.
  - Add the first open event, the alumni roundtables of 19 October.
- **Advisory Board** at the very bottom of the page, titled "Advisor" (28 Oct).

### 8.4 Events
- **All 10 events,** past and upcoming, with the kickoff dinner on 26 September. Keep the calendar view and the `.ics` download.
- **Event detail** (a page or a drawer): text, place, departments, a photo gallery, video clips and Marketing's recap images.
  - Alumni roundtables: 13 photos and 8 clips (7 to 18 seconds each, 11 MB in all).
  - William Blair and Carson Wang: one photo each.
  - I Squared Capital: photos to come from the Brand team.
- **Dates:** the day only, never times. The I Squared text stays in the past tense until the Brand team's recap replaces it.
- **Desk pages** list their own events from the same data (`desk` field).
- **The source:** `src/data/events.ts` until the admin page exists (section 9), then the database.

### 8.5 Resources
- Keep the Green Room section and the ESADE databases, with their live links (20 Oct).
- Cards show logo and name together; clicking opens the description and a "Visit website" link, as on the old site (28 Oct).
- **Publications library** (decided 2 Nov). Every report and document, newest first, filterable by department. Each links to its PDF and to its desk or department page. Reports still marked "coming" are listed as coming.
- No EMFC resources section and no new email sign-up yet (20 Oct).
- Update Fixed Income's point II text here too (CHECKLIST G3).

### 8.6 Fund
- `/fund` shows a clean "Coming soon" page in the site style.
- The current page and its charts move to their own component, behind one flag, `FUND_PAGE_LIVE` in `src/lib/site.ts` (20 and 28 Oct).
- Add the Investment Policy Statement (v1.0, October 2026) as a download (decided 2 Nov), with two lines on the mandate: an active global equity paper portfolio, benchmarked against the MSCI World.
- Link it from the Portfolio Management desk page.

### 8.7 Sponsorship
- **Submitting sends the email from the site** (20 Oct). A server function (`createServerFn` in TanStack Start):
  - validates the fields, checks a hidden honeypot field and a minimum time to fill in;
  - saves the enquiry to a new `sponsorship_enquiries` table;
  - sends it through an email service (Resend is the simplest and has a free tier) to the addresses in the `SPONSORSHIP_RECIPIENTS` environment variable. For now that's Vasco, Diogo and Nick; later, one partnerships@emfc.es address.
- The page shows clear success and error messages.
- No email address appears anywhere on the page, and no `mailto:` link.
- **Facts from the statistics:** 66 members, 27 nationalities, 86% international, 97% with experience, 158+ internships and 88% graduating in 2027. Optionally add the "what members aim for" tables (target areas and cities, `statistics/README.md` section 3).
- **Needs:** the three addresses, an email service account, and access to the emfc.es DNS to send from @emfc.es (section 13).

### 8.8 Footer and legal
- Check that every social link (Instagram, LinkedIn) and all 66 member LinkedIn links point to the right profiles.
- **Newsletter sign-up stays** in the footer and on the homepage, now with a consent line (decided 2 Nov). The 20 Oct call suggested "I consent to being contacted about future events".
- **A short privacy page** says who collects the address, what for, and how to unsubscribe or ask for it to be deleted. The consent line links to it.

## 9. Phase 4: admin page and database

Agreed on 28 Oct: a hard-to-find login for managing content, instead of an AI pipeline (rejected because of token costs). Scope and logins decided on 2 Nov.

- **Login:** reuse the existing Supabase login and `admin` role. Move the page from `/admin` to an unlisted path and keep `noindex`. The applications and CV views stay as they are.
- **Logins:** one account each for the two Co-Presidents (Diogo Oliveira, Vasco Lemos), the Head of Brand (David Villar) and the site owner.
- **Events manager:**
  - List, add, edit and unpublish events, with the fields from `events.json`.
  - Upload photos and short clips to a public `event-media` storage bucket. Resize images in the browser before upload, so the free tier lasts.
  - Preview before publishing.
- **Reports manager:**
  - Upload a PDF with title, department, desk, date, authors and status ("coming" or "published").
  - Published reports appear on their desk page and in the Resources library at once.
  - The monthly series (Monthly Market Views, Market Monitor, Deal of the Month, M&A case study) then need no code changes.
- **Enquiries:** the sponsorship enquiries, newest first, so nothing is lost if an email goes astray.
- **Database:**
  - New tables: `events` (anyone can read published rows; only admins write), `event_media`, `reports` (the same rules), and `sponsorship_enquiries` (only admins read).
  - New storage buckets: `event-media` and `reports`, readable by anyone.
  - Use the same access-rule pattern as the existing tables (`private.has_role(auth.uid(), 'admin')`).
- **Pages read events and reports from the database,** and fall back to the bundled lists if it can't be reached.
- **Check first:** how Lovable Cloud applies database changes that arrive through GitHub. They may have to be run from Lovable's own editor.

## 10. Phase 5: review round with the departments

Vasco told the VPs and Heads on 28 October: "After this round we're not changing it again." So hold exactly one final round:
1. **Share a private preview,** either with `tools/export-static.sh` and Cloudflare Pages behind an email check (`HANDOFF.md` section 7), or as a Lovable preview.
2. **Each Head checks** their department and desk pages, people and events by a fixed deadline:
   - The "proposed" target firms are live already (decided 2 Nov), and Heads can swap any of them here.
   - Cosimo Dini and Luka Thomson confirm the drafted texts of their desk pages.
   - Vasco confirms the Team hero photo and the section that turns white.
3. **One batch of fixes,** then freeze.

## 11. Phase 6: launch

The site stays on Lovable, with GitHub (decided 2 Nov).
1. **Get the live code.** In Lovable, connect the project to GitHub (Lovable creates the repo), then clone it.
2. **Compare first.** Check the live code against the September zip this folder came from, and carry over anything changed since. The live `/admin` is one example.
3. **Bring this folder in.** Add it on a branch; build, test and preview; then merge. Commits sync to Lovable; publish from there. Follow `AGENTS.md`: no force pushes, and keep the branch working.
4. **Environment variables in Lovable:** the email service key and `SPONSORSHIP_RECIPIENTS`.
5. **Before going public:**
   - Remove the preview `noindex`, and set page titles and share images.
   - Test every page in light and dark mode and at phone width.
   - Go through the menus by keyboard only, and with reduced motion on.
   - Check the sponsorship form reaches all three recipients.
   - Run `npm run lint:copy`, check there are no empty target-firm cells, and open every PDF and every LinkedIn link.
6. **Move the accounts** to the club login (section 12) before handing over.

## 12. Ownership for next year

On 28 October Vasco raised that next year's owner must be able to understand and update the site. To make that work:
- **Events and reports** are managed in the admin page, not in code.
- **People** are one generated list. Each September, run the member form, export to `members.json`, regenerate, and process the photos with `tools/portraits.swift`.
- **Statistics** are one data file, refreshed yearly.
- **Accounts (decided 2 Nov).** Lovable, GitHub, the domain registrar and the email service move under one club-owned login before the handover. Supabase sits inside Lovable Cloud, so it should move with the Lovable workspace; check this. Use a shared club Google account, or info@emfc.es once the domain email exists.
- **Docs:** update `HANDOFF.md` after launch with what changed here.

## 13. Still owed (who sends what)

| Who | What | Blocks |
|---|---|---|
| Zaid | VC & Growth: desk line, description and what the desk does; confirm or swap its 8 proposed firms; VC paper format and cadence | VC & Growth desk page |
| Zaid | Find the emfc.es registrar; set up @emfc.es mailboxes and partnerships@emfc.es; the club login for all accounts | Sending from the club domain, handover |
| Vasco, Diogo, Nick | The addresses that should receive sponsorship enquiries | Sponsorship form |
| Vasco | Confirm the Team hero photo and the section that turns white | Team page polish |
| Fabian Luis Seher | Confirm the Private Equity line; the PE report PDFs when ready | Reports only (proposed firms are live) |
| Anastasia Murgida | Confirm the Fintech line; swap any proposed firm she disagrees with | Nothing |
| Luca Flusche | Swap any proposed Real Assets firm he disagrees with | Nothing |
| Cosimo Dini, Luís Laboreiro | Confirm the drafted texts of the three desk pages; swap any proposed firm; how ideas are developed (for the full fund page later) | Desk texts |
| Luka Thomson | Confirm the drafted texts of the six desk pages; swap Apollo or Oaktree if needed; a larger photo if he has one | Desk texts |
| Jan Heibel | The one-pagers and the Private Markets pitch deck | Optional |
| Investment Banking | The Paramount Skydance and Warner Bros. Discovery case study PDF | M&A desk research |
| Brand (was Marketing) | I Squared Capital photos and recap; the roundtables reel; firm logo files if they have them; correct the kickoff dinner date to 26 September in their events doc | Events, logo band |
| Lara Koch, Aaron Kark, Aditya Sunil Shajwani | A head-and-shoulders photo | Their cards |
| Asset Management (fund) | Holdings and performance once the portfolio exists | Full fund page |
| Board | Next intake date (`NEXT_INTAKE_OPENS`); upcoming events as they're confirmed | Countdown, events |

## Parked for after launch

- **Interactive org tree** (28 Oct, maybe for the homepage). The homepage "Structure" section could grow into it: click a department to see its leaders, then its associates.
- **EMFC's own resources hub** with email sign-up and consent wording (20 Oct). After it exists, decide whether the Green Room and ESADE databases stay.
- **A reel of the roundtables** (offered by Marketing on 20 Oct).
- **Industry Profiles, a podcast, study tours:** only once they exist.
- **Not doing:** a chatbot (decided 20 Oct) and the bull intro animation (decided 2 Nov).

## 14. Decisions of 2 November

| # | Question | Decision | Where it lands |
|---|---|---|---|
| 1 | Where do reports live? | Both: each report on its desk or department page, and one library of all publications on Resources | 6.4, 8.2, 8.5, 9 |
| 2 | Internal sessions on the Events page? | Yes: all 10 events go up. The CV workshop stays off | 6.3, 8.4 |
| 3 | Kickoff dinner date | 26 September 2026 | 6.3, 8.3, 8.4, 13 |
| 4 | "Proposed" target firms | They go live as proposed; desks can swap them later | 4, 6.2, 10, 13 |
| 5 | Which departments get desk pages | All desks, in all four investment departments | 6.2, 7.4, 8.2 |
| 6 | Marketing or Brand | David Villar is Head of Brand, and the department is called Brand | 4, 6.1, 7.2 |
| 7 | Members' emails | Not shown; LinkedIn only | 4, 6.1, 8.3 |
| 8 | Fund page | "Coming soon" plus the Investment Policy Statement | 8.6 |
| 9 | Admin scope and logins | Events, reports and sponsorship enquiries; logins for the two Co-Presidents, the Head of Brand and the site owner | 9 |
| 10 | Hosting and accounts | Stay on Lovable with GitHub; every account under one club-owned login before the handover | 11, 12 |
| 11 | Homepage length | Drop the fund teaser; cut the benefits from five to three | 8.1 |
| 12 | Team page: the white section and the photo | "Second I think": the second section from the top, the Co-Presidents band, becomes white; Vasco confirms. The group photo from the current site, which Vasco also confirms | 8.3, 10 |
| 13 | Newsletter sign-up | Keep it; add a consent line and a short privacy page | 8.8 |
| 14 | Bull intro animation | Not added | Parked list |
| 15 | Design skill | Critique and polish within the current design only | 5 |

### Read this way, change it if wrong
- **Brand:** Vasco's rule is "Head of <Department>", so "Head of Brand" is taken to mean the department is called Brand and its five associates are "Associate, Brand". If the department should stay "Marketing" with David as "Head of Brand", only the department's name changes back.
- **The white section:** "second" is read as the second section of the Team page from the top: the Co-Presidents band, beige today.

### Assumed unless you say otherwise
- Associates appear on the Team page and also on their desk and department pages. The 28 Oct summary says "departments page shows VPs; associates appear on the team page", but later in that call, and in Vasco's 2 Nov package, the desk pages list their associates.
- The single moving band shows member-firm logos; the department ticker goes.
- All gold becomes blue, including italic accent words, numerals and lines.
- Hero facts: 66 members, 27 nationalities, 124 firms, 6 departments.
- 124 firms, not the 129 in CHECKLIST C1.
- The people strip shows everyone with a photo, in mixed order.
- The Advisory Board is the last section of the Team page.
