# Archived extra pages

Three pages that were never in the menus and were kept out of search engines. Taken off the site on
10 November 2026 because they were no longer needed; kept here rather than deleted.

- `/zaid`: an over-the-top tribute to the site owner, with the Miata Run driving game.
  `src/routes/zaid.tsx`, `src/components/zaid/`, and its photos in `public/images/zaid/`.
- `/kostya`: a joke tribute to Constantin Molineus, which he agreed to.
  `src/routes/kostya.tsx` and `src/components/kostya/`. It uses his team portrait, which stays in
  `public/images/team/`.
- `/puzzle`: the team photo as a jigsaw. `src/routes/puzzle.tsx` and `src/components/puzzle/`. It uses
  the team photo, which stays in `public/images/`.

The files keep their paths inside this folder. To bring a page back, move its files to the same paths
in the project (for example `archive/extra-pages/src/routes/zaid.tsx` to `src/routes/zaid.tsx`), run
`npm run build` (the route list regenerates itself), and update the code to the site as it is then:
nothing here has been kept up to date since it was archived.
