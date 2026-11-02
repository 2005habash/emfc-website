# EMFC website: handoff

The EMFC (ESADE Master's Finance Club) website, rebuilt for launch. State as of 2 November 2026. Written for the next owner working with Claude Code: read this, then `REVAMP-PLAN.md` for every decision and the reasons behind it (section 14 lists the decisions of 2 November). Previous owner: Zaid Habash (Vice-President, VC & Growth).

## 1. Where it stands

- **The site is leaving Lovable** (decided 2 November, evening). It moves to the club's own accounts: code in the GitHub organisation `Esade-Master-Finance-Club`, hosting on Cloudflare Workers (free; Vercel's free plan can't deploy an organisation's private repository), and a new Supabase project (`rqgjcdttfccemcyxulub`) that starts fresh. Nothing from Lovable Cloud (applications, CVs, newsletter sign-ups) is carried over. Until the domain switch, https://emfc.es still serves the old Lovable site.
- **The launch build** is on the git branch `revamp` (`main` locally holds the 27 October starting point).
- **Built and checked:** 66 members with matching portraits, 6 department pages and 15 desk pages, 10 events with photos and clips, a library of 12 reports, the club statistics, the sponsorship form that sends from the site, the newsletter with consent, a privacy page, and an admin page. The production build passes; no page overflows at phone width.
- **Not yet working live**, because it needs accounts (section 8): the new database tables, sponsorship emails, admin logins, publishing.

## 2. Run it

```bash
cd ~/Documents/emfc-website
npm install        # first time only
npm run dev        # http://localhost:8080
```

`.claude/launch.json` runs it on port 5173 for Claude's browser preview. Use npm. Keys go in `.env` (never committed; Cloudflare holds the same names): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and for email `RESEND_API_KEY`, `SPONSORSHIP_RECIPIENTS`, `SPONSORSHIP_FROM`.

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

1. **Code:** the private repository `Esade-Master-Finance-Club/emfc-website`, with the launch build as `main`. Follow `AGENTS.md`: Cloudflare deploys every push to `main`.
2. **Database:** in the Supabase project's SQL Editor, run `supabase/migrations/20261102170000_initial_schema.sql` (admin roles, applications, CV storage, newsletter), then `20261102180000_events_reports_enquiries.sql` (events, reports, enquiries, upload buckets, and the launch events and reports). The old Lovable migrations are archived in `supabase/lovable-migrations/`.
3. **Hosting:** a Cloudflare Workers project named `emfc-website`, connected to the GitHub repository (build command `npm run build`, deploy command `npx wrangler deploy`), The public Supabase values are in the repository (`.env.production` for the browser code, `wrangler.jsonc` for the server), so the dashboard only needs the email secrets. Settings live in `vite.config.ts` and `wrangler.jsonc`. Check the site on its `workers.dev` address before touching the domain.
4. **Email:** a Resend account; verify emfc.es there by adding its DNS records at one.com (where the domain's DNS lives), then set `RESEND_API_KEY` (as a secret), `SPONSORSHIP_RECIPIENTS` (comma-separated) and `SPONSORSHIP_FROM` (for example `EMFC website <website@emfc.es>`) in the Cloudflare project. Without them, enquiries are saved but not emailed.
5. **Admin logins** for the two Co-Presidents, the Head of Brand and the site owner:
   - Each of them opens `/club-office`, chooses "New admin? Create your account" and confirms the email. The account opens nothing yet.
   - The site owner gives it the `admin` role in the SQL Editor (the query is at the top of the initial schema file). The page shows "No admin access yet" until then, with the account's email.
   - Forgotten passwords: "Forgot your password?" emails a link back to `/club-office`.
   - In Supabase, Authentication, URL Configuration: set the Site URL to `https://emfc.es` and allow the `workers.dev` address while testing. If an email link lands on another page of the site, the site forwards it to `/club-office`. Supabase's built-in email sends only a few messages an hour; for more, connect Resend as its SMTP sender.
6. **Domain:** add emfc.es as a custom domain in Cloudflare. That needs the domain's DNS on Cloudflare (change the nameservers at one.com to Cloudflare's, after copying any existing records). The old Lovable site serves until then. Afterwards, close the Lovable project.
7. **Check:** the sponsorship form reaches every recipient, one event and one report added on the admin page, every page in light and dark mode at phone width.
8. **Accounts:** GitHub, Cloudflare, Supabase, Resend and the domain registrar under one club-owned login before handing over.

## 9. Known quirks

- `npx tsc` reports one error in `src/routes/__root.tsx` (ErrorComponent props, from the original Lovable template). It was there before and doesn't affect the build.
- Renaming or moving a route file while `npm run dev` runs can leave a stale error in the browser; reload the page.
- Firm and resource logos load from logo.dev with the publishable key the old site used (in `src/lib/site.ts`); it is public by design. The homepage band shows them in colour, on white tiles in dark mode. If a logo looks wrong, try the firm's other domains: Lazard uses `lazardassetmanagement.com`, because `lazard.com` only returns a black letter.
- Link previews (LinkedIn, WhatsApp) need full addresses, so pictures in page tags go through `absoluteUrl()` with `SITE_URL` (`src/lib/site.ts`). Pages without their own picture use the share image.
- Between about 1024 and 1280px wide, the logo's subtitle and the social icons are hidden so the menu fits.
- `vite.config.ts` lists the build plugins itself (Tailwind, paths, TanStack Start, Nitro, React); it no longer uses Lovable's config package.
- The admin page's event, report and enquiry tabs have not been tested end to end yet: they need the database tables and an admin login. The event form, its preview and the clip stills were checked on a temporary copy of the form without the database, and the sign-in page's modes and expired-link message in the browser.

## 10. Other files made along the way

In `~/Documents` on the original machine: `emfc-bull-logo-navy.png` (bull on a navy square, 900×900), `emfc-bull-logo-transparent.png`, and `emfc-website-preview.zip` (the latest preview build).
