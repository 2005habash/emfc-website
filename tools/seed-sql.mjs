// Prints SQL that loads the bundled events and reports into the database, for the first migration.
// Usage: node --experimental-strip-types tools/seed-sql.mjs > seed.sql
const { EVENTS } = await import("../src/data/events.ts");
const { REPORTS } = await import("../src/data/reports.ts");

const q = (v) => (v === undefined || v === null ? "null" : `'${String(v).replaceAll("'", "''")}'`);
const arr = (a) => (a && a.length ? `array[${a.map(q).join(", ")}]::text[]` : "'{}'::text[]");
const json = (v) => `${q(JSON.stringify(v ?? []))}::jsonb`;

const events = EVENTS.map(
  (e) =>
    `  (${[q(e.id), q(e.title), q(e.date), q(e.type), q(e.location), q(e.description), arr(e.people), arr(e.departments), arr(e.desks), json(e.photos), arr(e.videos), arr(e.recap), q(e.link)].join(", ")})`,
);
const reports = REPORTS.map(
  (r) =>
    `  (${[q(r.id), q(r.title), q(r.series), q(r.issue), q(r.date), q(r.department), q(r.desk), arr(r.authors), r.pages ?? "null", q(r.file), q(r.link), q(r.status)].join(", ")})`,
);
console.log(`insert into public.events (id, title, date, type, location, description, people, departments, desks, photos, videos, recap, link) values
${events.join(",\n")}
on conflict (id) do nothing;

insert into public.reports (id, title, series, issue, date, department, desk, authors, pages, file, link, status) values
${reports.join(",\n")}
on conflict (id) do nothing;`);
