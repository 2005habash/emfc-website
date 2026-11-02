# EMFC website: handoff

The EMFC (ESADE Master's Finance Club) website, rebuilt for launch. State as of 2 November 2026. Written for the next owner working with Claude Code: read this, then `REVAMP-PLAN.md` for every decision and the reasons behind it (section 14 lists the decisions of 2 November). Previous owner: Zaid Habash (Vice-President, VC & Growth).

## 1. Where it stands

- **The launch build is done locally**, on the git branch `revamp` (`main` holds the 27 October starting point). Nothing is pushed or live: https://emfc.es still serves the old Lovable site.
- **Built and checked:** 66 members with matching portraits, 6 department pages and 15 desk pages, 10 events with photos and clips, a library of 12 reports, the club statistics, the sponsorship form that sends from the site, the newsletter with consent, a privacy page, and an admin page. The production build passes; no page overflows at phone width.
- **Not yet working live**, because it needs accounts (section 8): the new database tables, sponsorship emails, admin logins, publishing.

## 2. Run it

```bash
cd ~/Documents/emfc-website
npm install        # first time only
npm run dev        # http://localhost:8080 (Lovable's default port)
```

`.claude/launch.json` runs it on port 5173 for Claude's browser preview. npm works; there is no bun on the original machine.

## 3. Design rules (keep them)

"v2 Institutional", modelled on the Wharton, McIntire, Harvard and Yale club sites.

- **Colours** (`src/styles.css`, flipped for dark mode under `.dark`): page `--c-paper #faf8f4`, alt sections `--c-stone #f1ede5`, text `--c-ink #141b34`, secondary `--c-mute #555c72`, lines `--c-line #ddd6c9`, navy `--c-night #000b3d`. The only accents are the bull logo's blues: `--c-bull #5a67a2` on light backgrounds, `--c-bull-light #9ca8d4` on navy. Use the Tailwind names (`text-bull`, `bg-night`, `border-line`), never raw hex. There is no gold anywhere any more.
- **Type:** Cormorant Garamond (headings, italic accents via `<Em>`) and Geist (body). Small labels use `caps` with wide tracking, never below 10px.
- **Copy rules (Vasco's):** no middle dots and no em dashes anywhere on the site; "Vice-President" written out; only Diogo Oliveira and Vasco Lemos are "Founder"; the Advisory Board are "Advisor"; the Marketing department is called Brand, and David Villar is Head of Brand.
- **Privacy:** members show only name, photo, title, programme, LinkedIn and up to 3 firms. **No email addresses anywhere**, in the pages or in the code. Statistics are totals only.
- **Portraits:** cut out onto white, a 1024 square, head about 55% of the height, face centred, the body always reaching the bottom edge. Grayscale until hovered.
- **Motion:** subtle. `Reveal` fades content up once in view, but only when the page is allowed to animate (the `motion` class, set before paint in `__root.tsx`); with reduced motion or no JavaScript everything is simply visible.

## 4. Where things live

| What | File |
| --- | --- |
| Members (generated, do not edit by hand) | `src/data/members.ts`, made by `tools/import-members.mjs` |
| Departments, their 15 desks, texts and target firms | `src/lib/departments.ts` |
| Events (fallback list), reports (fallback list), statistics | `src/data/events.ts`, `src/data/reports.ts`, `src/data/stats.ts` |
| Loading events and reports from the database, with the fallback | `src/lib/content.ts` |
| Sponsorship form's server function (save and email) | `src/lib/enquiries.ts` |
| Settings: socials, next intake date, fund switch, member firms, nav | `src/lib/site.ts` |
| People helpers (leadership, associates by desk, homepage strip) | `src/lib/team.ts` |
| Shared pieces: portraits, person cards and profiles, page sections | `src/components/site/ui.tsx`, `src/components/site/sections.tsx` |
| Admin page content tabs | `src/components/admin/ContentManagers.tsx` |
| An event's page, also used for the admin page's preview | `src/components/site/EventArticle.tsx` |
| The picture shown when a link to the site is shared | `public/images/share/emfc.jpg`, made from `tools/share-card.html` (instructions inside) |
| The full fund page, hidden until `FUND_PAGE_LIVE` is true | `src/components/fund/FundFull.tsx` |
| Pages | `src/routes/`: `index`, `departments.index` (overview), `departments.$department`, `departments.$department_.$desk` (the `_` stops it nesting), `team`, `events`, `events_.$eventId`, `resources`, `fund`, `sponsorship`, `privacy`, `club-office` (admin) |
| Database changes for this launch | `supabase/migrations/20261102180000_events_reports_enquiries.sql` |
| The content package from Vasco (2 Nov), without emails | `content/2026-11-02/` (raw photos stay in the club Drive) |
| Images, clips, report PDFs | `public/images/{team,events,barcelona,logo}`, `public/videos/events`, `public/reports` |

## 5. Updating the content

- **Events and reports:** once the database is set up (section 8), add and edit them on the admin page at `/club-office`, with photo and PDF uploads. An event also takes short MP4 clips (a still for each is made on upload) and the Brand team's recap slides, and **Preview** shows the event page before it is saved or shown. Until then, edit `src/data/events.ts` and `src/data/reports.ts`.
- **People (each September):** export the member form to `content/<date>/members.json`, then run `node tools/import-members.mjs content/<date>`. People kept from before go in `kept-members.json`; photos that don't come from the form go in `photo-overrides.json`.
- **Portraits:** write a list `[{ "in": "<photo>", "out": "public/images/team/<slug>.jpg" }]` (add `"crop": [x, y, w, h]` for screenshots) and run `swift tools/portraits.swift <list.json>` (macOS 14+). It cuts out the person, frames the head and keeps the body to the bottom edge. Look at every result. Match photos to people only by how the sender labelled them, never by faces.
- **Fund:** set `FUND_PAGE_LIVE = true` in `src/lib/site.ts` once there are holdings; the full page is ready behind it.

## 6. Sharing a private preview

`tools/export-static.sh` builds a static copy of all 39 pages with "don't index" protection and writes `~/Documents/emfc-website-preview.zip` (38 MB). Upload it at dash.cloudflare.com, Workers & Pages, Create, Pages, Upload assets; optionally put Cloudflare Zero Trust Access in front. In a static preview the sponsorship form cannot send (it needs the server) and shows its error message; the newsletter writes to the **real** sign-up list. Re-run the script after every change.

## 7. Before launch: what is still owed

| Who | What |
| --- | --- |
| Zaid | The VC & Growth desk text (the site shows a draft from the 20 October call) and its 8 proposed firms |
| Fabian, Anastasia | Confirm the drafted Private Equity and Fintech lines |
| Cosimo, Luka | Confirm the drafted desk texts for Asset Management (3) and Fixed Income (6) |
| Lara Koch, Aaron Kark, Aditya Sunil Shajwani | Head-and-shoulders photos (they show initials until then) |
| Vasco | Confirm the Team page hero photo and that the Co-Presidents band was the section to turn white |
| Vasco, Diogo, Nick | The addresses that should receive sponsorship enquiries |
| Department Heads | One review round on the private preview (section 6), then freeze |

The full list, with what each item blocks, is in `REVAMP-PLAN.md` section 13.

## 8. Going live

1. **GitHub:** in Lovable, connect the project to GitHub, clone the new repo, and compare its code with this folder's `main` branch (the September zip). Carry over anything changed on the live site since, then bring the `revamp` branch in and merge. Follow `AGENTS.md`: never force-push or rewrite pushed history, and keep the branch working, because commits sync straight into Lovable.
2. **Database:** apply `supabase/migrations/20261102180000_events_reports_enquiries.sql` (ask Lovable to run it). It creates the events, reports and sponsorship enquiries tables, their access rules, the upload buckets, and loads the launch events and reports.
3. **Email:** create a Resend account and set, in Lovable's project settings, `RESEND_API_KEY`, `SPONSORSHIP_RECIPIENTS` (comma-separated addresses) and, once emfc.es is verified in Resend, `SPONSORSHIP_FROM` (for example `EMFC website <website@emfc.es>`). Without them, live enquiries are saved but not emailed; locally the enquiry is printed to the server log instead.
4. **Admin logins** for the two Co-Presidents, the Head of Brand and the site owner:
   - Each of them opens `/club-office`, chooses "New admin? Create your account" and confirms the email if asked. The account opens nothing yet.
   - The site owner then gives it the `admin` role in `user_roles` (ask Lovable: "give the admin role to <email>"). The page shows "No admin access yet" until then, with the account's email.
   - Forgotten passwords: "Forgot your password?" on the same page emails a link that comes back to `/club-office`. If sign-ups are switched off in Lovable Cloud, create the accounts there instead and have each person use that link to choose their own password.
   - Check that Lovable Cloud's sign-in settings allow `https://emfc.es` as a return address. If an email link lands on another page of the site, the site forwards it to `/club-office`.
5. **Check, then publish:** test the sponsorship form with all three recipients, add one event and one report on the admin page, check every page in light and dark mode at phone width, then publish from Lovable.
6. **Accounts:** move Lovable, GitHub, Supabase, the domain registrar and Resend under one club-owned login before handing over (decided 2 November).

## 9. Known quirks

- `npx tsc` reports one error in `src/routes/__root.tsx` (ErrorComponent props, from Lovable's template). It was there before and doesn't affect the build.
- Renaming or moving a route file while `npm run dev` runs can leave a stale error in the browser; reload the page.
- Firm and resource logos load from logo.dev with the publishable key the old site used (in `src/lib/site.ts`); it is public by design. The homepage band shows them in colour, on white tiles in dark mode. If a logo looks wrong, try the firm's other domains: Lazard uses `lazardassetmanagement.com`, because `lazard.com` only returns a black letter.
- Link previews (LinkedIn, WhatsApp) need full addresses, so pictures in page tags go through `absoluteUrl()` with `SITE_URL` (`src/lib/site.ts`). Pages without their own picture use the share image.
- Between about 1024 and 1280px wide, the logo's subtitle and the social icons are hidden so the menu fits.
- Don't add Tailwind, React, path-alias or Nitro plugins to `vite.config.ts`; Lovable's config already includes them.
- The admin page's event, report and enquiry tabs have not been tested end to end yet: they need the database tables and an admin login. The event form, its preview and the clip stills were checked on a temporary copy of the form without the database, and the sign-in page's modes and expired-link message in the browser.

## 10. Other files made along the way

In `~/Documents` on the original machine: `emfc-bull-logo-navy.png` (bull on a navy square, 900×900), `emfc-bull-logo-transparent.png`, and `emfc-website-preview.zip` (the latest preview build).
