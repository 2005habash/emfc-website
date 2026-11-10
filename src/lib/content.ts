import { EVENTS, type EventItem, type EventPhoto, type EventType } from "@/data/events";
import { REPORTS, type Report } from "@/data/reports";
import { departmentSlug } from "@/lib/departments";

// Events and reports come from the database once the admin page is in use, so new ones need no
// code change. Until the tables exist, or if the database can't be reached in time, the site uses
// the lists bundled in src/data. Departments saved under an old name read as their current one.
// They are read with a plain request to the database's public interface, the rows any visitor may
// read, so public pages don't carry the database client: only the admin page loads that.

/** A desk saved as "department/desk", with the department under its current name. */
export const deskSlug = (desk: string) => desk.replace(/^[^/]+/, departmentSlug);

type EventRow = {
  id: string;
  title: string;
  date: string;
  type: EventType;
  location: string;
  description: string;
  people: string[] | null;
  departments: string[] | null;
  desks: string[] | null;
  photos: EventPhoto[] | null;
  videos: string[] | null;
  recap: string[] | null;
  link: string | null;
  post: string | null;
  points: string[] | null;
};

type ReportRow = {
  id: string;
  title: string;
  series: string;
  issue: string | null;
  date: string;
  department: string;
  desk: string | null;
  authors: string[] | null;
  pages: number | null;
  file: string | null;
  link: string | null;
  status: "published" | "coming";
};

const toEvent = (r: EventRow): EventItem => ({
  id: r.id,
  title: r.title,
  date: r.date,
  type: r.type,
  location: r.location,
  description: r.description,
  people: r.people ?? [],
  departments: (r.departments ?? []).map(departmentSlug),
  desks: (r.desks ?? []).map(deskSlug),
  photos: r.photos ?? [],
  videos: r.videos ?? [],
  recap: r.recap ?? [],
  link: r.link ?? undefined,
  post: r.post ?? undefined,
  points: r.points ?? [],
});

const toReport = (r: ReportRow): Report => ({
  id: r.id,
  title: r.title,
  series: r.series,
  issue: r.issue ?? undefined,
  date: r.date,
  department: departmentSlug(r.department),
  desk: r.desk ?? undefined,
  authors: r.authors ?? [],
  pages: r.pages ?? undefined,
  file: r.file ?? undefined,
  link: r.link ?? undefined,
  status: r.status,
});

const SUPABASE_URL: string | undefined =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);
const SUPABASE_KEY: string | undefined =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  (typeof process !== "undefined" ? process.env.SUPABASE_PUBLISHABLE_KEY : undefined);

/**
 * The rows of a table that match `query` (PostgREST's filters), read with the public key. Throws if
 * the database refuses, or takes longer than `ms`.
 */
async function rows<T>(table: string, query: string, ms = 2500): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY)
    throw new Error("The database address or public key is missing");
  const stop = new AbortController();
  const timer = setTimeout(() => stop.abort(), ms);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      // The new public keys (sb_publishable_...) go in "apikey" alone; the older ones are also the bearer.
      headers: {
        apikey: SUPABASE_KEY,
        ...(SUPABASE_KEY.startsWith("sb_") ? {} : { Authorization: `Bearer ${SUPABASE_KEY}` }),
      },
      signal: stop.signal,
    });
    if (!res.ok) throw new Error(`${table}: ${res.status}`);
    return (await res.json()) as T[];
  } finally {
    clearTimeout(timer);
  }
}

// Every page asks for the same two lists, so they are kept for a short while instead of being fetched
// again on each navigation. The admin page clears them after each save.
const TTL = 30_000;
const cache = new Map<string, { at: number; value: Promise<unknown> }>();
function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL) return hit.value as Promise<T>;
  const value = load();
  cache.set(key, { at: Date.now(), value });
  return value;
}
export const invalidateContent = () => cache.clear();

// Only published rows (the database shows the public nothing else). The bundled lists are used only
// when the database can't answer (no table yet, an error, a timeout), never because a list is empty:
// an empty list means the admins removed everything.
export const loadEvents = (): Promise<EventItem[]> =>
  cached("events", async () => {
    try {
      // Every column, not a list of them: a column added later (or not there yet) can't break the page.
      return (await rows<EventRow>("events", "select=*&published=eq.true&order=date.asc")).map(
        toEvent,
      );
    } catch {
      return EVENTS;
    }
  });

export const loadReports = (): Promise<Report[]> =>
  cached("reports", async () => {
    try {
      return (await rows<ReportRow>("reports", "select=*&published=eq.true")).map(toReport);
    } catch {
      return REPORTS;
    }
  });
