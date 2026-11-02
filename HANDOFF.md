# EMFC website: handoff

Everything needed to pick up the EMFC (ESADE Master's Finance Club) website redesign where it was left on 27 October 2026. Written for a new owner working with Claude Code; read it once before changing anything. Previous owner: Zaid Habash (VP, VC & Growth).

## 1. What this is

- **Live site today:** https://emfc.es, built and hosted on Lovable. The old version is still live; this redesign has **not** been published there yet.
- **This folder:** the redesigned site. It started from the Lovable project's code (TanStack Start), with the new design built into it. It is **not** a git repository and is **not** connected to Lovable's GitHub repo yet.
- **Design canvas (early exploration, now out of date):** https://claude.ai/artifact/DQbuDRtiXkMDsUXVunYPyL. It shows v1 "trading floor" (rejected) and v2 "Institutional" (chosen). The code is now the source of truth; the canvas does not have the latest team or photo changes.
- **Club to-do list (content still owed by members):** https://claude.ai/artifact/JvVMVUyUEXt7MobN292FyV. Summary in section 8.

## 2. Run it

```bash
cd ~/Documents/emfc-website
npm install        # first time only
npm run dev        # http://localhost:8080 (Lovable's default port)
```

`.claude/launch.json` runs it on port 5173 instead, which is what Claude's browser preview uses. There is no bun on the original machine; npm works.

## 3. Design direction (keep it)

"v2 · Institutional": elegant, photo-led, modelled on Wharton (pennwitg.com), McIntire (mcintireinvestmentinstitute.org), Harvard (harvardcap.org) and Yale (yalesig.org) club sites, pushed a step further.

- **Colours** (CSS variables in `src/styles.css`, flipped for dark mode under `.dark`):
  `--c-paper #faf8f4` (page) · `--c-stone #f1ede5` (alt sections) · `--c-ink #141b34` (text) · `--c-mute #555c72` · `--c-line #ddd6c9` · `--c-night #030c3b` (navy: nav, dark sections) · `--c-deep #02082a` · `--c-brass #a8844b` and `--c-brass-light #d9bc85` (the only accent).
  Use the Tailwind names (`bg-night`, `text-brass`, `border-line`), never raw hex in components.
- **Type:** Cormorant Garamond (serif, headings, italic accents via `<Em>`) + Geist (sans, body). Small caps labels use the `caps` class with wide tracking.
- **Imagery:** Barcelona photography for heroes (`public/images/barcelona/`). Team portraits are grayscale and turn colour on hover.
- **Motion:** subtle. `Reveal` (framer-motion fade-up on scroll), Ken Burns on heroes, the timeline line drawing in. Respects reduced motion.
- **Voice:** restrained and factual. No hype words, no personal email addresses on the site, no chatbot (both decided by the board).

## 4. Where things live

| What | File |
| --- | --- |
| Site settings: social links, sponsorship email, next intake date, image paths, member firms, nav links, events, quotes | `src/lib/site.ts` |
| Departments/desks: descriptions, heads, people, LinkedIn links, target firms | `src/lib/departments.ts` |
| Team photos map, Co-Presidents, Advisory Board, homepage mosaic order | `src/lib/team.ts` |
| Shared UI pieces (Eyebrow, Em, Numeral, PageHero, Portrait, PersonCard, CountUp) | `src/components/site/ui.tsx` |
| Nav (overlay on hero pages, dark-mode toggle, mobile menu), Footer, layout | `src/components/layout/` |
| Pages | `src/routes/`: `index` (home), `team`, `departments` (desk tabs via `?desk=slug`), `events` (calendar + .ics download), `resources`, `fund` (new; "coming soon" until there's data), `sponsorship` (mailto form), `admin` (Lovable's application-review page, Supabase login, `noindex`) |
| Colours, fonts, buttons (`.btn`), animations | `src/styles.css` |
| Images | `public/images/{barcelona,team,logo}/` |
| Helper scripts | `tools/` (section 6) |

Most content edits are data-only: change `site.ts`, `departments.ts` or `team.ts` and every page updates.

## 5. Team (18 people, complete)

Co-Presidents: Diogo Oliveira, Vasco Barahona de Lemos.
- **Investment Banking:** Yonatan Bendler (Head), Constantin Molineus (VP M&A), João Salgado (VP Debt)
- **Private Markets:** Jan Heibel (Head), Fabian Seher (VP PE), Zaid Habash (VP VC & Growth), Anastasia Murgida (VP Fintech), Luca Flusche (VP Real Assets)
- **Asset Management:** Cosimo Dini (Head), Luís Laboreiro (CIO)
- **Fixed Income:** Luka Thomson (Head)
- **Support:** Nick Kriz (Head of Corporate Relations), David Villar (Head of Brand; the department is still named "Marketing" in `departments.ts`, worth renaming to "Brand")
- **Advisory Board (founders):** Paul Christian Abel, Moritz Fritsch, Philip Ignatzi

The homepage mosaic order is `MOSAIC` in `team.ts`; Anastasia is deliberately 5th (middle of the first row).

## 6. Adding or replacing a team photo

Portraits must match: background removed onto pure white, square (ideally 1024×1024), head about 55% of the frame height, hair starting about 7% from the top, face centred horizontally. Yonatan's photo is the reference.

1. Cut out the person (macOS 14+):
   ```bash
   swift tools/cutout.swift ~/Downloads/photo.jpg /tmp/cut.png
   ```
2. Crop a square around the head to the framing above and save as JPEG, for example with `sips -c <side> <side> --cropOffset <y> <x>` then `sips -z 1024 1024 -s format jpeg -s formatOptions 88`.
3. Save to `public/images/team/<firstname>.jpg` and point the person's entry in `PHOTOS` (`src/lib/team.ts`) at it.
4. Check the Team page next to the others.

Match names to photos only from how they're labelled (on emfc.es/team or by the sender), never by guessing from faces. LinkedIn photos were used for Luca, Nick and David.

## 7. Sharing a preview

The site can't be shared from localhost. `tools/export-static.sh` builds a static copy of every page with "don't index" protection (meta tag, `robots.txt`, Cloudflare `_headers`) and writes `~/Documents/emfc-website-preview.zip`. Upload it at dash.cloudflare.com → Workers & Pages → Create → Pages → Upload assets. Optionally put Cloudflare Zero Trust Access (email one-time code) in front to restrict who can see it. The newsletter form on a preview writes to the **real** Supabase sign-up list.

Re-run the script after every change; the zip is a snapshot.

## 8. Open items

**Start with `REVAMP-PLAN.md`** (2 November 2026): the full plan for the launch version, built from the two review calls (20 and 28 October), the to-do list and Vasco's content package. It replaces the list below where they differ.

**Content owed by members** (tracked in the to-do doc linked above):
- Photos: a higher-quality photo from Diogo; kickoff dinner, roundtable (19 Oct) and CV-event photos for Events.
- Event write-ups: kickoff dinner (26 Sept), roundtable (19 Oct), the I-squared event with Esade Careers (date + description). Upcoming events as they're confirmed. Events live in `EVENTS` in `site.ts`.
- Every desk: review its page, fill every target-firm cell (no blanks go live), list real deliverables and cadence.
- Fund: holdings and performance once the portfolio is built; the Fund page stays "coming soon" until then. Asset Management to describe how ideas are developed.
- Research: Luca's published paper (PDF/link + desk); IB deal-analysis format; any Markets/Credit research; VC paper cadence.

**Site settings to fill:**
- `NEXT_INTAKE_OPENS` in `site.ts`: set an ISO date to switch "Recruiting reopens next term" into a countdown.
- `SPONSORSHIP_EMAIL` is currently Vasco's alumni address. Switch it to a shared address (e.g. partnerships@emfc.es) once one exists; check whether the emfc.es registrar supports mailboxes. Then test the form.
- Sponsorship pricing/tiers: not on the site yet.

**Later:** EMFC's own resources section with email sign-up and consent wording ("I consent to being contacted about future events"), then decide whether to keep the Green Room and Esade databases on Resources.

**Going live:** to replace emfc.es, the code has to get into the Lovable project's GitHub repo (connect Lovable to GitHub, clone it, bring these changes in, push). Read `AGENTS.md` first: never force-push or rewrite pushed history on that repo, and keep the branch working, because commits sync straight into Lovable.

## 9. Known quirks

- `npx tsc` reports one existing type error in `src/routes/__root.tsx` (ErrorComponent props, from Lovable's template). It doesn't affect the build.
- The desk tabs use the `?desk=` URL parameter rather than `#hash`, to avoid a server/browser rendering mismatch. Keep it that way.
- Between about 1024 and 1280px wide, the logo's "ESADE Master's Finance Club" subtitle is hidden so it doesn't collide with the menu.
- Lovable's `vite.config.ts` already includes Tailwind, React, the path alias and Nitro (Cloudflare target). Don't add those plugins again.

## 10. Other assets made along the way

In `~/Documents` on the original machine: `emfc-bull-logo-navy.png` (bull on navy square, 900×900, bull at 82%), `emfc-bull-logo-transparent.png`, and `emfc-website-preview.zip` (the last shareable build).
