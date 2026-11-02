import { supabase } from "@/integrations/supabase/client";
import { EVENTS, type EventItem, type EventPhoto, type EventType } from "@/data/events";
import { REPORTS, type Report } from "@/data/reports";

// Events and reports come from the database once the admin page is in use, so new ones need no
// code change. Until the tables exist, or if the database can't be reached in time, the site uses
// the lists bundled in src/data.

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
  departments: r.departments ?? [],
  desks: r.desks ?? [],
  photos: r.photos ?? [],
  videos: r.videos ?? [],
  recap: r.recap ?? [],
  link: r.link ?? undefined,
});

const toReport = (r: ReportRow): Report => ({
  id: r.id,
  title: r.title,
  series: r.series,
  issue: r.issue ?? undefined,
  date: r.date,
  department: r.department,
  desk: r.desk ?? undefined,
  authors: r.authors ?? [],
  pages: r.pages ?? undefined,
  file: r.file ?? undefined,
  link: r.link ?? undefined,
  status: r.status,
});

/** Resolves with the query's result, or rejects if the database takes longer than `ms`. */
async function within<T>(query: PromiseLike<T>, ms = 2500): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      query,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("timeout")), ms);
      }),
    ]);
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

// Only published rows, also for a signed-in admin (who may read hidden ones). The bundled lists are
// used only when the database can't answer (no table yet, an error, a timeout), never because a list
// is empty: an empty list means the admins removed everything.
export const loadEvents = (): Promise<EventItem[]> =>
  cached("events", async () => {
    try {
      const { data, error } = await within(
        supabase.from("events" as never).select("*").eq("published" as never, true as never).order("date"),
      );
      if (error) return EVENTS;
      return ((data ?? []) as unknown as EventRow[]).map(toEvent);
    } catch {
      return EVENTS;
    }
  });

export const loadReports = (): Promise<Report[]> =>
  cached("reports", async () => {
    try {
      const { data, error } = await within(
        supabase.from("reports" as never).select("*").eq("published" as never, true as never),
      );
      if (error) return REPORTS;
      return ((data ?? []) as unknown as ReportRow[]).map(toReport);
    } catch {
      return REPORTS;
    }
  });
