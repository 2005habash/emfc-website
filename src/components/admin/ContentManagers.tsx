import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { invalidateContent } from "@/lib/content";
import { EVENT_TYPE_COLORS, type EventPhoto, type EventType } from "@/data/events";
import { departments } from "@/lib/departments";
import { formatDay } from "@/lib/site";
import { cn } from "@/lib/utils";

// The admin page's content tabs: events, reports and sponsorship enquiries. They write to the
// tables created by supabase/migrations/20261102180000_events_reports_enquiries.sql.

const MIGRATION = "supabase/migrations/20261102180000_events_reports_enquiries.sql";
const field = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm";
const label = "text-xs font-medium text-muted-foreground";
const button =
  "inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm hover:bg-secondary disabled:opacity-50";
const primary =
  "inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-medium text-primary-foreground disabled:opacity-60";

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** A photo this browser can't read, such as an iPhone HEIC photo in Chrome or Firefox. */
class UnreadablePhoto extends Error {}

/** Shrinks a photo in the browser before upload (longest side 1600 px, JPEG), so storage lasts. */
async function shrink(file: File, max = 1600): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UnreadablePhoto(file.name);
  }
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.82));
}

/**
 * Adds a new row, with a unique id if the one made from its title is taken, or updates an existing
 * row by its id. Never replaces a different item.
 */
async function saveRow(table: "events" | "reports", row: { id: string }, isNew: boolean) {
  if (!isNew) return supabase.from(table as never).update(row as never).eq("id", row.id);
  let attempt = row;
  for (let i = 0; i < 4; i++) {
    const res = await supabase.from(table as never).insert(attempt as never);
    if (res.error?.code !== "23505") return res; // 23505: an item with this id exists
    attempt = { ...row, id: `${row.id}-${Math.random().toString(36).slice(2, 6)}` };
  }
  return { error: { message: "Could not find a free address for this item. Change its title and try again." } };
}

async function upload(bucket: "event-media" | "reports", path: string, body: Blob, contentType: string) {
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function Missing({ error }: { error: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm">
      <p className="font-medium text-navy">This table isn't set up in the database yet.</p>
      <p className="mt-1 text-muted-foreground">
        Apply <code>{MIGRATION}</code> to the Supabase project (in Lovable, ask it to run the migration).
        Until then the site shows the events and reports bundled with the code.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Database message: {error}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- Events */

type EventRow = {
  id: string;
  title: string;
  date: string;
  type: EventType;
  location: string;
  description: string;
  people: string[];
  departments: string[];
  desks: string[];
  photos: EventPhoto[];
  videos: string[];
  recap: string[];
  link: string | null;
  published: boolean;
};

const emptyEvent = (): EventRow => ({
  id: "",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  type: "Speaker",
  location: "ESADE Sant Cugat",
  description: "",
  people: [],
  departments: [],
  desks: [],
  photos: [],
  videos: [],
  recap: [],
  link: null,
  published: true,
});

export function EventsManager() {
  const [rows, setRows] = useState<EventRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EventRow | null>(null);

  async function load() {
    const { data, error } = await supabase.from("events" as never).select("*").order("date", { ascending: false });
    if (error) setError(error.message);
    else setRows(data as unknown as EventRow[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function togglePublished(e: EventRow) {
    const { error } = await supabase.from("events" as never).update({ published: !e.published } as never).eq("id", e.id);
    if (error) toast.error(error.message);
    else {
      invalidateContent();
      load();
    }
  }
  async function remove(e: EventRow) {
    if (!confirm(`Delete "${e.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("events" as never).delete().eq("id", e.id);
    if (error) toast.error(error.message);
    else {
      invalidateContent();
      toast.success("Event deleted");
      load();
    }
  }

  if (error) return <Missing error={error} />;
  if (!rows) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;
  if (editing) return <EventForm initial={editing} onDone={() => (setEditing(null), load())} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} events. Hidden events stay out of the site.</p>
        <button className={primary} onClick={() => setEditing(emptyEvent())}>
          <Plus className="h-4 w-4" /> New event
        </button>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {rows.map((e) => (
          <li key={e.id} className="flex flex-wrap items-center gap-4 p-4">
            {e.photos[0] ? (
              <img src={e.photos[0].src} alt="" className="h-14 w-14 rounded object-cover" />
            ) : (
              <span className="h-14 w-14 rounded bg-secondary" />
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-navy">{e.title}</p>
              <p className="text-xs text-muted-foreground">
                <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: EVENT_TYPE_COLORS[e.type] }} />
                {formatDay(e.date)}, {e.type}, {e.photos.length} photos
                {!e.published && ", hidden"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className={button} onClick={() => togglePublished(e)} title={e.published ? "Hide" : "Publish"}>
                {e.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
              <button className={button} onClick={() => setEditing(e)}>
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button className={button} onClick={() => remove(e)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventForm({ initial, onDone }: { initial: EventRow; onDone: () => void }) {
  const [e, setE] = useState<EventRow>(initial);
  const [busy, setBusy] = useState(false);
  const isNew = !initial.id;
  const set = <K extends keyof EventRow>(k: K, v: EventRow[K]) => setE((x) => ({ ...x, [k]: v }));
  const toggle = (k: "departments" | "desks", v: string) =>
    set(k, e[k].includes(v) ? e[k].filter((x) => x !== v) : [...e[k], v]);

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const id = e.id || `${slugify(e.title || "event")}-${e.date}`;
    const added: EventPhoto[] = [];
    const unreadable: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const blob = await shrink(file);
        const src = await upload("event-media", `${id}/${Date.now()}-${slugify(file.name)}.jpg`, blob, "image/jpeg");
        added.push({ src, alt: "" });
      } catch (err) {
        if (err instanceof UnreadablePhoto) unreadable.push(file.name);
        else toast.error(`${file.name}: ${(err as Error).message}`);
      }
    }
    if (added.length) {
      set("photos", [...e.photos, ...added]);
      toast.success(`${added.length} photo${added.length === 1 ? "" : "s"} uploaded. Add a short description to each.`);
    }
    if (unreadable.length) {
      toast.error(
        `This browser can't read ${unreadable.join(", ")} (iPhone photos are often HEIC). Open them in Preview and export as JPEG, or upload from Safari.`,
        { duration: 10000 },
      );
    }
    setBusy(false);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (e.photos.some((p) => !p.alt.trim())) {
      toast.error("Describe every photo in a few words, for people using screen readers.");
      return;
    }
    setBusy(true);
    const row = { ...e, id: e.id || `${slugify(e.title)}-${e.date}`, updated_at: new Date().toISOString() };
    const { error } = await saveRow("events", row, isNew);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      invalidateContent();
      toast.success(isNew ? "Event added" : "Event saved");
      onDone();
    }
  }

  return (
    <form onSubmit={save} className="space-y-5 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-navy">{isNew ? "New event" : "Edit event"}</h2>
        <button type="button" className={button} onClick={onDone}>
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className={label}>Title</span>
          <input className={field} required value={e.title} onChange={(x) => set("title", x.target.value)} />
        </label>
        <label className="space-y-1">
          <span className={label}>Date (the site shows the day only)</span>
          <input type="date" className={field} required value={e.date} onChange={(x) => set("date", x.target.value)} />
        </label>
        <label className="space-y-1">
          <span className={label}>Type</span>
          <select className={field} value={e.type} onChange={(x) => set("type", x.target.value as EventType)}>
            {(Object.keys(EVENT_TYPE_COLORS) as EventType[]).map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={label}>Place</span>
          <input className={field} required value={e.location} onChange={(x) => set("location", x.target.value)} />
        </label>
        <label className="space-y-1">
          <span className={label}>Registration link (optional)</span>
          <input className={field} type="url" value={e.link ?? ""} onChange={(x) => set("link", x.target.value || null)} />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className={label}>Text for the site (no middle dots or em dashes)</span>
          <textarea
            className={cn(field, "h-auto py-2")}
            rows={4}
            required
            value={e.description}
            onChange={(x) => set("description", x.target.value)}
          />
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className={label}>Speakers or guests, one per line (optional)</span>
          <textarea
            className={cn(field, "h-auto py-2")}
            rows={3}
            value={e.people.join("\n")}
            onChange={(x) => set("people", x.target.value.split("\n").filter((l) => l.trim()))}
          />
        </label>
      </div>

      <fieldset className="space-y-2">
        <legend className={label}>Departments and desks (the event also shows on their pages)</legend>
        <div className="grid gap-3 md:grid-cols-3">
          {departments.map((d) => (
            <div key={d.slug} className="space-y-1.5 rounded-md border border-border p-3">
              <label className="flex items-center gap-2 text-sm font-medium">
                <input type="checkbox" checked={e.departments.includes(d.slug)} onChange={() => toggle("departments", d.slug)} />
                {d.name}
              </label>
              {d.desks.map((k) => (
                <label key={k.slug} className="ml-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={e.desks.includes(`${d.slug}/${k.slug}`)}
                    onChange={() => toggle("desks", `${d.slug}/${k.slug}`)}
                  />
                  {k.name}
                </label>
              ))}
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={label}>Photos</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {e.photos.map((p, i) => (
            <div key={p.src} className="space-y-2 rounded-md border border-border p-2">
              <img src={p.src} alt="" className="aspect-[4/3] w-full rounded object-cover" />
              <input
                className={field}
                placeholder="What the photo shows"
                value={p.alt}
                onChange={(x) => set("photos", e.photos.map((q, j) => (j === i ? { ...q, alt: x.target.value } : q)))}
              />
              <button type="button" className={button} onClick={() => set("photos", e.photos.filter((_, j) => j !== i))}>
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            </div>
          ))}
        </div>
        <label className={cn(button, "cursor-pointer")}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Add photos
          <input type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(x) => addPhotos(x.target.files)} />
        </label>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={e.published} onChange={(x) => set("published", x.target.checked)} />
        Show on the site
      </label>
      <button className={primary} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? "Add event" : "Save event"}
      </button>
    </form>
  );
}

/* --------------------------------------------------------------- Reports */

type ReportRow = {
  id: string;
  title: string;
  series: string;
  issue: string | null;
  date: string;
  department: string;
  desk: string | null;
  authors: string[];
  pages: number | null;
  file: string | null;
  link: string | null;
  status: "published" | "coming";
  published: boolean;
};

const emptyReport = (): ReportRow => ({
  id: "",
  title: "",
  series: "",
  issue: null,
  date: new Date().toISOString().slice(0, 10),
  department: departments[0].slug,
  desk: null,
  authors: [],
  pages: null,
  file: null,
  link: null,
  status: "published",
  published: true,
});

export function ReportsManager() {
  const [rows, setRows] = useState<ReportRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ReportRow | null>(null);

  async function load() {
    const { data, error } = await supabase.from("reports" as never).select("*").order("date", { ascending: false });
    if (error) setError(error.message);
    else setRows(data as unknown as ReportRow[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(r: ReportRow) {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("reports" as never).delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else {
      invalidateContent();
      load();
    }
  }

  if (error) return <Missing error={error} />;
  if (!rows) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;
  if (editing) return <ReportForm initial={editing} onDone={() => (setEditing(null), load())} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {rows.length} reports. Each shows on its desk page and in the library on Resources.
        </p>
        <button className={primary} onClick={() => setEditing(emptyReport())}>
          <Plus className="h-4 w-4" /> New report
        </button>
      </div>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-4 p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-navy">{r.title}</p>
              <p className="text-xs text-muted-foreground">
                {[r.series, r.issue, departments.find((d) => d.slug === r.department)?.name, r.status === "coming" ? "in preparation" : null, !r.published ? "hidden" : null]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
            <div className="flex gap-2">
              {r.file && (
                <a className={button} href={r.file} target="_blank" rel="noreferrer">
                  PDF
                </a>
              )}
              <button className={button} onClick={() => setEditing(r)}>
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button className={button} onClick={() => remove(r)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportForm({ initial, onDone }: { initial: ReportRow; onDone: () => void }) {
  const [r, setR] = useState<ReportRow>(initial);
  const [busy, setBusy] = useState(false);
  const isNew = !initial.id;
  const set = <K extends keyof ReportRow>(k: K, v: ReportRow[K]) => setR((x) => ({ ...x, [k]: v }));
  const desks = departments.find((d) => d.slug === r.department)?.desks ?? [];

  async function addPdf(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF.");
      return;
    }
    setBusy(true);
    try {
      const id = r.id || slugify(`${r.series || "report"} ${r.issue ?? r.date}`);
      set("file", await upload("reports", `${id}-${Date.now()}.pdf`, file, "application/pdf"));
      toast.success("PDF uploaded");
    } catch (err) {
      toast.error((err as Error).message);
    }
    setBusy(false);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (r.status === "published" && !r.file && !r.link) {
      toast.error("A published report needs a PDF or a link. Mark it 'in preparation' otherwise.");
      return;
    }
    setBusy(true);
    const row = { ...r, id: r.id || slugify(`${r.title} ${r.date}`), updated_at: new Date().toISOString() };
    const { error } = await saveRow("reports", row, isNew);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      invalidateContent();
      toast.success(isNew ? "Report added" : "Report saved");
      onDone();
    }
  }

  return (
    <form onSubmit={save} className="space-y-5 rounded-lg border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-navy">{isNew ? "New report" : "Edit report"}</h2>
        <button type="button" className={button} onClick={onDone}>
          <X className="h-4 w-4" /> Cancel
        </button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 md:col-span-2">
          <span className={label}>Title</span>
          <input className={field} required value={r.title} onChange={(x) => set("title", x.target.value)} />
        </label>
        <label className="space-y-1">
          <span className={label}>Series (for example Monthly Market Views)</span>
          <input className={field} required value={r.series} onChange={(x) => set("series", x.target.value)} />
        </label>
        <label className="space-y-1">
          <span className={label}>Issue (for example November 2026)</span>
          <input className={field} value={r.issue ?? ""} onChange={(x) => set("issue", x.target.value || null)} />
        </label>
        <label className="space-y-1">
          <span className={label}>Date it came out</span>
          <input
            type="date"
            className={field}
            required
            value={r.date.length === 7 ? `${r.date}-01` : r.date}
            onChange={(x) => set("date", x.target.value)}
          />
        </label>
        <label className="space-y-1">
          <span className={label}>Pages</span>
          <input
            type="number"
            min={1}
            className={field}
            value={r.pages ?? ""}
            onChange={(x) => set("pages", x.target.value ? Number(x.target.value) : null)}
          />
        </label>
        <label className="space-y-1">
          <span className={label}>Department</span>
          <select className={field} value={r.department} onChange={(x) => setR((y) => ({ ...y, department: x.target.value, desk: null }))}>
            {departments.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className={label}>Desk (optional)</span>
          <select className={field} value={r.desk ?? ""} onChange={(x) => set("desk", x.target.value || null)}>
            <option value="">Whole department</option>
            {desks.map((k) => (
              <option key={k.slug} value={k.slug}>
                {k.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 md:col-span-2">
          <span className={label}>Authors, separated by commas</span>
          <input
            className={field}
            value={r.authors.join(", ")}
            onChange={(x) => set("authors", x.target.value.split(",").map((a) => a.trim()).filter(Boolean))}
          />
        </label>
        <label className="space-y-1">
          <span className={label}>Status</span>
          <select className={field} value={r.status} onChange={(x) => set("status", x.target.value as ReportRow["status"])}>
            <option value="published">Published</option>
            <option value="coming">In preparation</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className={label}>Link, for example the LinkedIn post (optional)</span>
          <input className={field} type="url" value={r.link ?? ""} onChange={(x) => set("link", x.target.value || null)} />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className={cn(button, "cursor-pointer")}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {r.file ? "Replace PDF" : "Upload PDF"}
          <input type="file" accept="application/pdf" className="sr-only" disabled={busy} onChange={(x) => addPdf(x.target.files)} />
        </label>
        {r.file && (
          <a href={r.file} target="_blank" rel="noreferrer" className="text-sm underline">
            Current PDF
          </a>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={r.published} onChange={(x) => set("published", x.target.checked)} />
        Show on the site
      </label>
      <button className={primary} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? "Add report" : "Save report"}
      </button>
    </form>
  );
}

/* ------------------------------------------------------------- Enquiries */

type Enquiry = {
  id: string;
  name: string;
  firm: string;
  email: string;
  format: string;
  message: string;
  suspected_bot: boolean;
  created_at: string;
};

export function EnquiriesManager() {
  const [rows, setRows] = useState<Enquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("sponsorship_enquiries" as never)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data as unknown as Enquiry[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(q: Enquiry) {
    if (!confirm(`Delete the enquiry from ${q.firm}?`)) return;
    const { error } = await supabase.from("sponsorship_enquiries" as never).delete().eq("id", q.id);
    if (error) toast.error(error.message);
    else load();
  }

  if (error) return <Missing error={error} />;
  if (!rows) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No enquiries yet.</p>;

  return (
    <ul className="space-y-3">
      {rows.map((q) => (
        <li key={q.id} className="rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-navy">
                {q.firm}, {q.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(q.created_at).toLocaleString("en-GB")}, interested in {q.format.toLowerCase()}
              </p>
              {q.suspected_bot && (
                <p className="mt-1 text-xs font-medium text-destructive">
                  Possibly automated: sent too fast or with the hidden field filled in. Not emailed; check before replying.
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <a className={button} href={`mailto:${q.email}?subject=${encodeURIComponent("Your EMFC sponsorship enquiry")}`}>
                Reply to {q.email}
              </a>
              <button className={button} onClick={() => remove(q)} title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm">{q.message}</p>
        </li>
      ))}
    </ul>
  );
}
