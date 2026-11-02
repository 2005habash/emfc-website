# EMFC website: everything for the new site

For Zaid, and for the AI assistant you build the site with. Made on 2 November 2026 from the EMFC member form (64 answers, closed 1 November) and from what every department sent for its pages. Every member has their own folder with their photo and profile; every department and every event has its own folder.

**Start with `CHECKLIST.md`:** every change to make, one line each, pointing to the file with the material.

## What's in this folder

| Path | What it is |
|---|---|
| `CHECKLIST.md` | Every change to make on the site, in order, with where to find the material. |
| `members.json` | Every member in one list, in site order. Start here. |
| `members.csv` | The same list, to open in Excel or Sheets. |
| `people/<department>/<person>/` | One folder per person: their original photo, named after them, and `profile.json` with that person's entry (the same information as in `members.json`). |
| `statistics/` | The statistics from the form for the site: numbers to replace, the homepage firms strip, what members aim for. `README.md` explains, `statistics.json` has the figures. |
| `departments/` | What each department sent for its pages: text changes, reports and PDFs, organised per department with the originals. Start with `departments/README.md`. |
| `events/` | Every event, one folder each with its text, details and photos. Several departments sent the same events; here each is one entry. `events/events.json` is ready for the Events page. |
| `reports.json` | Every report and PDF from every department, with the page it belongs on. |
| `target-firms.json` | The 12 target firms for every page and desk, with where each came from. |

Departments in `people/`, in site order:

- `01-co-presidents`: 2 people
- `02-investment-banking`: 8 people
- `03-private-markets`: 20 people
- `04-asset-management`: 9 people
- `05-fixed-income`: 9 people
- `06-corporate-relations`: 8 people
- `07-marketing`: 6 people
- `08-advisory-board`: 2 people

Inside each department, people are numbered in order: Head first, then Chief Investment Officer, Vice-Presidents and Associates, each group by desk. Fixed Income follows the department's own order.

## Fields

| Field | Meaning |
|---|---|
| `name` | Exactly as the member wrote it. Use as is. |
| `title` | Ready to show. Worked out from position and desk with the rules below. |
| `department`, `position`, `desk` | As chosen in the form, except where a department sent its own list of desks (Fixed Income): then theirs. `desk` is empty when the person has none. |
| `group` | Only in Fixed Income: "Public credit" or "Private credit", the department's two groups (Vasco's names for them). |
| `title_source` | Where the title comes from: the member form, or a department's own list. |
| `programme_display` | Programme as it should read, for example "Master in Finance, CEMS MIM". `programme` and `double_degree` are the raw parts. |
| `email` | ESADE email. Fine to show. |
| `linkedin` | Profile link, cleaned to https://www.linkedin.com/in/... |
| `firms` | Up to 3 firms, most important first, as the member listed them. |
| `photo` | The original photo in the person's folder. |
| `site_photo_path` | Suggested path once processed, for example `/images/team/vasco-lemos.jpg`. |
| `photo_status` | `ok`, `check` (works, with a weakness), `replace` (don't use) or `missing`. |
| `photo_note` | The reason behind a `check` or `replace`. |
| `use_current_site_photo` | When set, use this photo from the 27 October site instead of the uploaded one. |

## How to add it to the site

1. **Photos.** Turn each original photo into the site portrait style (section 6 of the HANDOFF.md in Zaid's project folder: background removed onto white, square, same framing as the others) and save it at `site_photo_path`.
2. **People.** Add every member to their department with `name`, `title` (as the role) and `linkedin`. In the 27 October code that is the `people` arrays in `src/lib/departments.ts`, and `PRESIDENTS` and `ADVISORY` in `src/lib/team.ts`. To show programme, email and firms, add those fields to the `Person` type.
3. **Photo map.** Point each name to its new photo (`PHOTOS` in `src/lib/team.ts`).
4. **Homepage and sponsorship numbers.** Take them from `statistics/README.md`: it says which figure replaces which, and gives the new firms strip.
5. **Department pages, events and reports.** Go through `departments/`, one department at a time: each README lists every change with the current text next to the new one. Events are in `events/events.json` (one folder per event with its photos) and reports in `reports.json`, ready for the Events and Resources pages.
6. **Check nothing is missing.** 64 people from the form, 62 photos, plus the 2 people below who are already on the site. Then every item in each department README.

## Decisions already taken by Vasco (2 November 2026)

These settle the points where departments disagreed or left something open. Each is also noted where it applies.

- **Titles** say "Vice-President", written out, not "VP". Example: "Vice-President, Real Assets".
- **Events:** when departments describe the same event differently, Marketing's version wins, because Marketing organises and publishes every event once it has happened. Where Marketing's published LinkedIn recap exists, its text is the official one.
- **Private Markets pages:** one page for the department (description, overview, target firms, team), and from it a page per desk (Private Equity, VC & Growth, Fintech, Real Assets) with the same information for that desk: description, what it does, target firms, reports, events, team. The VC & Growth desk is written by Zaid himself. The Private Equity and Fintech one-line descriptions were drafted from existing material and need the VPs' confirmation.
- **Private Markets target firms:** the department page shows the current 9 plus Jan Heibel's 3 (EQT, Brookfield, Hg), each tagged with its desk. The other suggestions (Silver Lake, CBRE Investment Management) go on the desk pages.
- **The UBS session of 28 October** is a Private Markets (Fintech) event, as Jan Heibel sent it, with Marketing's published recap "Inside Equity Research" as its text. Corporate Relations is co-organiser.
- **Asset Management:** the three Monthly Market Views (July, September, October) go on the Resources page; the fund's Investment Policy Statement goes on the Fund page; their point 5 is the new text of "Investment Committee".
- **Fixed Income:** both Market Monitors are published on the Resources page. The two groups are called "Public credit" and "Private credit" on the site (the department's own names were Public Markets and Private Markets). Names are as each member wrote them in the form (Joan Brugada, Paul Emil Manner, Tim Constantin Ziegler). The intro, "what associates do" and the case studies use the department's new texts.
- **Investment Banking:** the debt desk is called "Debt Advisory". The target firms stay the current 12 names. "What the desk produces" is matched to their own deliverables list (no podcast, no study tours). The CV workshop with associates was internal and is not published as an event.
- **GreenRoom kick-off (May 2026):** only "late May" is known; the date used is 28 May 2026, chosen on Vasco's instruction.
- **Luís Laboreiro and Paul Christian Abel** didn't fill in the form: they keep their current entries and photos from the 27 October site.
- **Photos too small or unusable:** where the person is already on the 27 October site (Diogo Oliveira, Vasco Lemos, Luka Thomson), use that site's photo. Otherwise the entry goes up without a photo until a new one arrives.
- **Fabian Seher's "Industry Profile" PDF:** not needed. Jan Heibel's "Real Assets Q3 Market Overview" is the same report as Luca Flusche's Market Insight Q3 2026.
- **Marketing's brand system** (in their shared Drive folder) is not part of this package.
- **Statistics on the site:** only totals that help the club (members, nationalities, international share, languages, universities, experience, internships, firms, target areas and cities). Nothing about one person; no figures that don't help, such as the gender split.
- **Fintech target firms:** proposed from 2025 and 2026 fintech rankings on Vasco's instruction, for Anastasia Murgida to confirm.
- **Vasco's own firms:** Santander Corporate and Investment Banking, Athos Partners, CoRe Capital (Sixty Degrees is the one left off).
- **Target firms:** 12 on every page that shows them, the same grid everywhere. Where a department sent fewer, firms were proposed to reach 12 and marked as such, for the department to confirm or swap (`target-firms.json`).

## Rules

- Names and firms exactly as written here.
- Titles: "Co-President & Founder" (only Diogo Oliveira and Vasco Lemos are founders), "Head of <Department>", "Chief Investment Officer", "Vice-President, <Desk>" (written out, not "VP"), "Associate, <Desk>" (the department when there is no desk), "Advisor" (the Advisory Board are not founders). One exception: Tim Constantin Ziegler is "Head of Private Credit", the title Fixed Income gave him.
- Photos and PDFs are exactly the files members sent, not compressed or edited. One photo came as HEIC: the original is kept, with a full-size JPG copy next to it.
- Match photos to people only through these folders, never by guessing from faces.
- Show nothing else from the form. Phones, nationality, gender and the other answers stay private. Members were told the site only shows name, photo, role, programme, ESADE email, LinkedIn and up to 3 firms.
- No middle dots (·) or em dashes in any text on the site.

## Not in the form

These people didn't fill in the form. Keep their current entries and photos from the site:

- Luís Laboreiro (Chief Investment Officer)
- Paul Christian Abel (Advisory Board)

## Photos to replace

Every photo was looked at. These don't work for the site. Where the person is already on the 27 October site, use that photo; otherwise Vasco is asking for a new one, and the entry goes up without a photo until it arrives.

- Diogo Oliveira (`people/01-co-presidents/01-diogo-oliveira`): Replace: 400 x 400 pixels, too small. Use the photo already on the site, /images/team/diogo.webp.
- Vasco Lemos (`people/01-co-presidents/02-vasco-lemos`): Replace: 390 x 352 pixels, too small. Use the photo already on the site, /images/team/vasco.webp.
- Lara Koch (`people/03-private-markets/08-lara-koch`): Replace: 241 x 288 pixels, far too small for the site's 1024-pixel portraits. Needs the original photo.
- Aaron Kark (`people/03-private-markets/16-aaron-kark`): Replace: uploaded an image of his CV instead of a photo. Not included in the package. Needs a head-and-shoulders photo.
- Luka Thomson (`people/05-fixed-income/01-luka-thomson`): Replace: 200 x 200 pixels (a LinkedIn thumbnail). Use the photo already on the site, /images/team/luka.webp, unless he sends a larger one.
- Aditya Sunil Shajwani (`people/06-corporate-relations/03-aditya-sunil-shajwani`): Replace: his file was a screenshot and came out of Google Drive empty (0 bytes). Needs a head-and-shoulders photo, as an original file.

## Photos that work but need care

- Alice Lafrenière (`people/02-investment-banking/07-alice-lafreniere`): Check: taken at an event with coloured lighting, not a plain background. Works after cutting out the background.
- Maria Marti (`people/03-private-markets/15-maria-marti`): Check: full-length photo. The head-and-shoulders crop still has enough resolution (about 900 pixels).
- Isabelle Oliger (`people/03-private-markets/17-isabelle-oliger`): Check: 654 x 754 pixels, a little under the site's 1024. Usable.
- Hunter Crawford (`people/04-asset-management/05-hunter-crawford`): Check: 724 x 1086 pixels and slightly soft. Usable.
- José Ruivo (`people/04-asset-management/06-jose-ruivo`): Check: taken at a distance with a busy background. Works after cutting out the background, crop about 900 pixels.
- Pol Bonet Malgà (`people/04-asset-management/09-pol-bonet-malga`): Check: 711 x 678 pixels, a little under the site's 1024. Usable.
- Jules Coppens (`people/05-fixed-income/05-jules-coppens`): Check: a phone screenshot with the photo inside a black frame. Crop to the photo: the usable part is 2535 x 2320 pixels (from about x 544, y 828 to x 3079, y 3148), a good head-and-shoulders portrait.
- Hugo Heise (`people/05-fixed-income/06-hugo-heise`): Check: full-length photo at a distance. The crop has enough resolution (about 700 pixels).
- Anubhav Tamak (`people/06-corporate-relations/04-anubhav-tamak`): Check: a casual photo in a hoodie with people behind him, not a portrait. Works after cutting out the background, but a head-and-shoulders photo would be better.
- Jose Rangel (`people/06-corporate-relations/06-jose-rangel`): Check: full-length photo at 1200 x 1600, so the head-and-shoulders crop is small (about 400 pixels). A closer photo would be better.
- Maria Anjos (`people/07-marketing/03-maria-anjos`): Check: full-length photo indoors. The crop is about 500 pixels, on the small side.

## Names that change from the current site

People already on the 27 October site who wrote their name differently in the form. The form name is the one to show, so the keys in `PHOTOS` and `LINKEDIN` (`src/lib/team.ts`, `src/lib/departments.ts`) change too:

- "Vasco Barahona de Lemos" becomes "Vasco Lemos"
- "Fabian Seher" becomes "Fabian Luis Seher"
