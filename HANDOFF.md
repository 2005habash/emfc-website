# EMFC website: handoff

The EMFC (ESADE Master's Finance Club) website. State as of 3 November 2026. Written for the next owner working with Claude Code: read this and `AGENTS.md` first. Previous owner: Zaid Habash (Vice-President, VC & Growth).

**This repository is public.** The club's private documents stay out of it, in the club Drive (on the original machine also in `~/Documents/emfc-private`): the revamp plan `REVAMP-PLAN.md` (every decision of the rebuild and its reasons; section 13 is what is still owed, section 14 the decisions of 2 November), the security plan `SECURITY-PLAN.md`, and the content packages `content/<date>/` (the member form export, the departments' texts, events, reports and the internal statistics). `.gitignore` keeps those names out. Never commit people's details, email addresses or keys here.

## 1. Where it stands

- **Live at https://www.emfc.es** (emfc.es forwards to it) since 3 November 2026. The site has left Lovable: https://emfc.lovable.app forwards to emfc.es, and nothing from Lovable Cloud (applications, CVs, newsletter sign-ups) was carried over.
- **Code:** github.com/2005habash/emfc-website, branch `main` (locally the branch `revamp` tracks it). Vercel deploys every push to `main`, see `AGENTS.md`.
- **Hosting:** Vercel, project `emfc1/emfc-website`, free plan. The free plan only deploys repositories of a personal GitHub account, so at the handover the repository moves to a club-owned personal account (GitHub, Settings, Transfer), not to an organisation.
- **Database, sign-in and uploads:** Supabase project `rqgjcdttfccemcyxulub` ("emfc", eu-west-1), free plan. Supabase's Vercel integration keeps its keys in the Vercel project (production only).
- **Email:** Resend, sending as @emfc.es: the sponsorship enquiries, and the admin page's sign-in emails (Supabase sends them through Resend).
- **Domain:** emfc.es at one.com, which also holds the DNS (the records for Vercel and Resend).
- **Built and checked:** 66 members with matching portraits, 6 department pages and 15 desk pages, 10 events with photos and clips, a library of 12 reports, the club statistics, the sponsorship form, the newsletter with consent, a privacy page, anonymous analytics, and the admin page with two levels of access and two-factor sign-in (section 9).
- **Security, part 1b** (`supabase/migrations/20261103165000_rate_limits_and_sign_out.sql`) is ready to run in the SQL Editor; until it runs, the limits on enquiries, sign-ups and analytics let everything through (the server logs "Could not check the ... limit"). Remove this line once it has run.
- **Security, part 2** (`supabase/migrations/20261103170000_security_lockdown.sql`) runs once the admins have set up two-factor sign-in; until then the database still accepts the older, looser rules for events, reports and the people's data.

## 2. Run it

```bash
cd ~/Documents/emfc-website
npm install        # first time only
npm run dev        # http://localhost:8080
```

`.claude/launch.json` runs it on port 5173 for Claude's browser preview. Use npm, and run `npm run build` and `npm run lint:copy` before every push. The public Supabase values are committed in `.env.production`. Secrets go in `.env` (never committed; Vercel holds the same names):

- `SUPABASE_SECRET_KEY` (Supabase, Project Settings, API Keys): the server saves enquiries, newsletter sign-ups and analytics with it. Without it, those forms fail locally with "No server secret".
- `RESEND_API_KEY`, `SPONSORSHIP_RECIPIENTS` (comma-separated), `SPONSORSHIP_FROM`: the sponsorship emails. Without them an enquiry is saved and printed to the server log, not emailed.
- `TURNSTILE_SECRET_KEY`, with `VITE_TURNSTILE_SITE_KEY` in `.env.production`: the bot check on the sponsorship form (section 9). Optional.

The security headers only apply to production builds: to test them locally, `npm run build`, then `node .output/server/index.mjs`.

## 3. Design rules (keep them)

"v2 Institutional", modelled on the Wharton, McIntire, Harvard and Yale club sites.

- **Colours** (`src/styles.css`, flipped for dark mode under `.dark`): page `--c-paper #faf8f4`, alt sections `--c-stone #f1ede5`, text `--c-ink #141b34`, secondary `--c-mute #555c72`, lines `--c-line #ddd6c9`, navy `--c-night #000b3d`. The only accents are the bull logo's blues: `--c-bull #5a67a2` on light backgrounds, `--c-bull-light #9ca8d4` on navy. Use the Tailwind names (`text-bull`, `bg-night`, `border-line`), never raw hex. There is no gold anywhere any more.
- **Type:** Cormorant Garamond (headings, italic accents via `<Em>`) and Geist (body). Small labels use `caps` with wide tracking, never below 10px.
- **Copy rules (Vasco's):** no middle dots and no em dashes anywhere on the site; "Vice-President" written out; only Diogo Oliveira and Vasco Lemos are "Founder"; the Advisory Board are "Advisor"; the Marketing department is called Marketing, and David Villar is Head of Marketing (it was called Brand from 2 to 4 November 2026; old `/departments/brand` links and saved events still work).
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
| Sponsorship form's server function (checks, saves and emails) | `src/lib/enquiries.ts` |
| Newsletter sign-up's server function | `src/lib/newsletter.ts` |
| Server-only helpers: the secret-key database client, rate limits, the bot check | `src/lib/server/guard.ts` (nothing in `server/` can reach the browser) |
| Security headers and the Content Security Policy | `src/lib/server/security-headers.ts`, applied in `src/server.ts`; static files get theirs in `vite.config.ts` |
| Settings: socials, next intake date, fund switch, member firms, nav | `src/lib/site.ts` |
| People helpers (leadership, associates by desk, homepage strip) | `src/lib/team.ts` |
| Shared pieces: portraits, person cards and profiles, page sections | `src/components/site/ui.tsx`, `src/components/site/sections.tsx` |
| The admin page: sign-in, two-factor, which tabs each level sees | `src/routes/club-office.tsx`, `src/components/admin/TwoFactor.tsx` |
| Admin page tabs: events, reports, enquiries, newsletter, applications, Access (who can do what) | `src/components/admin/ContentManagers.tsx` |
| Admin page's Backup tab (one zip of the data and files) | `src/components/admin/Backup.tsx` |
| Admin page helpers: every row of a table and every file in a bucket (the database answers 1000 at a time), saving a download | `src/components/admin/data.ts` |
| Analytics: what is counted (`src/lib/analytics.ts`) and the admin page's Analytics tab (`src/components/admin/Analytics.tsx`); database in `supabase/migrations/20261103120000_analytics.sql` | anonymous page views, profile opens, LinkedIn clicks and report downloads; no names, IPs or cookies |
| An event's page, also used for the admin page's preview | `src/components/site/EventArticle.tsx` |
| The picture shown when a link to the site is shared | `public/images/share/emfc.jpg`, made from `tools/share-card.html` (instructions inside) |
| The full fund page, hidden until `FUND_PAGE_LIVE` is true | `src/components/fund/FundFull.tsx` |
| Pages | `src/routes/`: `index`, `departments.index` (overview), `departments.$department`, `departments.$department_.$desk` (the `_` stops it nesting), `team`, `events`, `events_.$eventId`, `resources`, `fund`, `sponsorship`, `privacy`, `club-office` (admin) |
| Extra pages for fun, not in the menus and kept out of search engines | `src/routes/zaid.tsx` (a tribute to the site owner), `src/routes/puzzle.tsx` with `src/components/puzzle/` (the team photo as a jigsaw), `src/routes/kostya.tsx` with `src/components/kostya/` (a joke tribute to Constantin Molineus, which he agreed to) |
| Database: every change, in the order they were run (section 8) | `supabase/migrations/` |
| The content package from Vasco (2 Nov), without emails | the club Drive, `content/2026-11-02/` (private; not in this repository) |
| Images, clips, report PDFs | `public/images/{team,events,barcelona,logo}`, `public/videos/events`, `public/reports` |

## 5. Updating the content

- **Events and reports:** editors and admins add and edit them on the admin page at `/club-office`, with photo and PDF uploads. An event also takes short MP4 clips (a still for each is made on upload) and the Marketing team's recap slides, and **Preview** shows the event page before it is saved or shown. `src/data/events.ts` and `src/data/reports.ts` are only the fallback for when the database can't be reached.
- **People (each September):** make a new private content package in the club Drive: the member form export as `content/<date>/members.json`, plus `kept-members.json` (people kept from before), `photo-overrides.json` (photos that don't come from the form) and `role-changes.json` (title, desk and firm changes), copied from the last package and updated. Then run `node tools/import-members.mjs <that folder>`.
- **Portraits:** write a list `[{ "in": "<photo>", "out": "public/images/team/<slug>.jpg" }]` (add `"crop": [x, y, w, h]` for screenshots) and run `swift tools/portraits.swift <list.json>` (macOS 14+). It cuts out the person, frames the head and keeps the body to the bottom edge. Look at every result. Match photos to people only by how the sender labelled them, never by faces.
- **Fund:** set `FUND_PAGE_LIVE = true` in `src/lib/site.ts` once there are holdings; the full page is ready behind it.

## 6. Previews

Every branch pushed to GitHub other than `main` gets a private preview on Vercel (the project's Deployments page; only members of the Vercel team can open it). Previews don't get the Supabase secret key (the integration sets it for production only), so on a preview the sponsorship form, the newsletter and analytics can't save. `tools/export-static.sh` still builds a static copy, `~/Documents/emfc-website-preview.zip`, for sharing outside Vercel; nothing can be sent from it.

## 7. What is still owed

| Who | What |
| --- | --- |
| Zaid | The VC & Growth desk text (the site shows a draft from the 20 October call) and its 8 proposed firms |
| Fabian, Anastasia | Confirm the drafted Private Equity and Fintech lines |
| Cosimo, Luka | Confirm the drafted desk texts for Asset Management (3) and Fixed Income (6) |
| Lara Koch | A head-and-shoulders photo (she shows initials until then) |
| Vasco | Confirm the Team page hero photo and that the Co-Presidents band was the section to turn white |
| Department Heads | One review round on the live site |

The full list, with what each item blocks, is in the revamp plan (club Drive), section 13.

## 8. How it is set up

1. **Code and hosting:** `main` of `2005habash/emfc-website`, deployed by the Vercel project `emfc1/emfc-website` with the build settings Vercel suggested. Vercel's environment variables: the Supabase integration's keys (the site uses `SUPABASE_SECRET_KEY`; the Postgres, JWT, anon and `NEXT_PUBLIC_` ones are unused, and the integration keeps them in sync), `RESEND_API_KEY`, `SPONSORSHIP_RECIPIENTS`, `SPONSORSHIP_FROM`, and `TURNSTILE_SECRET_KEY` once the bot check is set up.
2. **Database:** the files in `supabase/migrations/`, run in this order in the Supabase SQL Editor: `20261102170000_initial_schema` (roles, applications, CV storage, newsletter), `20261102180000_events_reports_enquiries` (events, reports, enquiries, upload buckets, the launch events and reports), `20261103090000_admin_access`, `20261103120000_analytics`, `20261103140000_deny_account`, `20261103160000_security_roles_and_two_factor` (security, part 1), `20261103165000_rate_limits_and_sign_out` (part 1b) and `20261103170000_security_lockdown` (part 2). The old Lovable migrations are archived in `supabase/lovable-migrations/`.
3. **Sign-in:** in Supabase, Authentication: the Site URL is `https://www.emfc.es`, emails go out through Resend (custom SMTP) with a raised hourly limit, and two-factor with an authenticator app (TOTP) is on. If an email link lands on another page of the site, the site forwards it to `/club-office`.
4. **Email:** emfc.es is verified in Resend (its DKIM, SPF and DMARC records are at one.com).
5. **Domain:** at one.com, an A record for emfc.es and a CNAME for www, both to Vercel; Vercel forwards emfc.es to www.emfc.es.
6. **Access to the admin page** (linked, quietly, as "Admin" at the bottom of the footer):
   - Someone new opens `/club-office`, chooses "New admin? Create your account" and confirms the email. The account opens nothing yet.
   - An admin gives it a level on the **Access** tab: **Editor** (events and reports) or **Admin** (everything). The admins are the site owner, the two Co-Presidents and the Head of Marketing; everyone else who needs access is an editor. **Deny** deletes a sign-up nobody recognises.
   - At their next sign-in they set up two-factor sign-in (a QR code for an authenticator app), and from then on type a code at each sign-in.
   - A forgotten password: "Forgot your password?". A lost or stolen phone or laptop: another admin uses **Reset two-factor** on the Access tab, which also signs that person out everywhere at once.
7. **Accounts:** GitHub, Vercel, Supabase, Resend, one.com and Cloudflare under one club-owned login before handing over, each with two-factor sign-in on.

## 9. Security

- **Two levels, and two-factor enforced by the database.** Editors manage events and reports. Admins also see the enquiries, the newsletter, the analytics and the applications, manage access and download backups. The database honours either level only in a session that passed two-factor and is still signed in (`private.caller_is` in the security migrations), so a password alone opens nothing, and signing out, **Deny** or **Reset two-factor** ends a session's powers at once.
- **The public only reads.** Anyone can read published events and reports. Sponsorship enquiries, newsletter sign-ups and analytics are saved by the site's server with the secret key (`src/lib/server/guard.ts`), with limits per sender (a hashed code, never the address itself): 3 enquiries an hour, 40 enquiry emails a day (only enquiries that pass the bot checks count), 30 sign-ups an hour (everyone on the campus Wi-Fi can share one address), 150 analytics events in 10 minutes. The database counts and records each request in one step (`public.take_slot`), so a burst sent all at once can't slip through. A check that can't run (the database or Cloudflare unreachable, a key missing or wrong) lets the request through and logs an error, so a real sponsor is never turned away for the site's fault. The server functions only answer the site's own pages (TanStack's CSRF check in `src/start.ts`), so another site can't make its visitors send sign-ups from their addresses.
- **Bot check:** Cloudflare Turnstile on the sponsorship form, active once `VITE_TURNSTILE_SITE_KEY` (in `.env.production`) and `TURNSTILE_SECRET_KEY` (in Vercel) are set. Until then the form relies on the limits, a hidden field and a minimum time to fill it in. A token works once, so after a send that doesn't go through the form shows a fresh check. If the secret in Vercel is wrong, enquiries still go through and the log says "The bot check could not run": check the log once after setting it up.
- **Security headers** on every response (`src/lib/server/security-headers.ts`). The Content Security Policy only runs the site's own scripts (the one inline script carries a fresh nonce per request), so injected scripts can't run; the site can't be framed; no camera, microphone or location. A new outside service (an embed, a font, a widget) has to be added there, or the browser blocks it.
- **Links and uploads:** links saved on the admin page must be `https://` (files may also be site paths), checked in the form, in the database and when shown. Uploads are limited per bucket (event media: 50 MB, JPEG, PNG, WebP, MP4, WebM; reports: 20 MB PDF; CVs: 10 MB PDF), and deleting an event or report deletes its files.
- **Privileges:** the public and signed-in roles have only the table rights they need, and new tables get none by default. When adding a table, grant what it needs and add its row-level policies in the same migration.
- **Secrets** live only in Vercel and a local `.env`; `.env.production` holds public values only. If one leaks: in Supabase, API Keys, create a new secret key and delete the old one (the integration updates Vercel); in Resend, make a new API key and replace it in Vercel; then redeploy.
- **Analytics** keep no names, addresses or cookies, and rows older than 13 months are deleted every night.

**Monthly checklist** (about 15 minutes):

1. Admin page, **Backup**: download the zip and keep it in the club Drive (the free database plan has no restore of its own). Weekly is better; the admin page reminds you after a week.
2. Admin page, **Access**: remove people who have left, deny sign-ups nobody knows, and check that every editor and admin has two-factor on.
3. Supabase: Advisors, Security Advisor shows no errors; Authentication, Users has no unexpected accounts.
4. GitHub: merge Dependabot's updates once their Vercel preview builds; `npm audit --omit=dev` finds nothing.
5. Vercel: the latest production deployment is one of yours and Ready; no unknown environment variables.
6. Resend: emfc.es still verified, no spike in bounces.
7. Once a term: send one real enquiry from www.emfc.es/sponsorship and check that every recipient gets it.

Each September, at the handover: give the new admins and editors their levels and remove the old ones, move the accounts to the new owner, and rotate the Supabase secret key and the Resend API key.

## 10. Known quirks

- `npx tsc` reports one error in `src/routes/__root.tsx` (ErrorComponent props, from the original Lovable template). It was there before and doesn't affect the build.
- Renaming or moving a route file while `npm run dev` runs can leave a stale error in the browser; reload the page.
- Firm and resource logos load from logo.dev with the publishable key the old site used (in `src/lib/site.ts`); it is public by design. The homepage band shows them in colour, on white tiles in dark mode. If a logo looks wrong, try the firm's other domains: Lazard uses `lazardassetmanagement.com`, because `lazard.com` only returns a black letter.
- Link previews (LinkedIn, WhatsApp) need full addresses, so pictures in page tags go through `absoluteUrl()` with `SITE_URL` (`src/lib/site.ts`). Pages without their own picture use the share image.
- Between about 1024 and 1280px wide, the logo's subtitle and the social icons are hidden so the menu fits.
- `vite.config.ts` lists the build plugins itself (Tailwind, paths, TanStack Start, Nitro, React); it no longer uses Lovable's config package.
- On Vercel previews the Content Security Policy blocks Vercel's own feedback toolbar. That is expected and harmless.
- Adding an event and a report on the admin page, with uploads, has not yet been tested end to end on the live site.

## 11. Other files made along the way

In `~/Documents` on the original machine: `emfc-bull-logo-navy.png` (bull on a navy square, 900×900), `emfc-bull-logo-transparent.png`, and `emfc-website-preview.zip` (the latest preview build).
