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

/** Resolves with the query's rows, or rejects if the database takes longer than `ms`. */
function within<T>(query: PromiseLike<T>, ms = 2500) {
  return Promise.race([
    query,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export async function loadEvents(): Promise<EventItem[]> {
  try {
    const { data, error } = await within(supabase.from("events" as never).select("*").order("date"));
    const rows = (data ?? []) as unknown as EventRow[];
    return error || rows.length === 0 ? EVENTS : rows.map(toEvent);
  } catch {
    return EVENTS;
  }
}

export async function loadReports(): Promise<Report[]> {
  try {
    const { data, error } = await within(supabase.from("reports" as never).select("*"));
    const rows = (data ?? []) as unknown as ReportRow[];
    return error || rows.length === 0 ? REPORTS : rows.map(toReport);
  } catch {
    return REPORTS;
  }
}
