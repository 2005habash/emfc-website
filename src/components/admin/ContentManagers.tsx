import { ChevronLeft, ChevronRight, Eye, EyeOff, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { EventArticle } from "@/components/site/EventArticle";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { deskSlug, invalidateContent } from "@/lib/content";
import { clipPoster, EVENT_TYPE_COLORS, type EventPhoto, type EventType } from "@/data/events";
import { departments, departmentSlug } from "@/lib/departments";
import { toCsv } from "@/lib/csv";
import { formatDay, safeUrl, todayInBarcelona } from "@/lib/site";
import { cn } from "@/lib/utils";

// The admin page's content tabs: events, reports and sponsorship enquiries. They write to the
// tables created by supabase/migrations/20261102180000_events_reports_enquiries.sql.

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
async function shrink(file: File, max = 1600, quality = 0.82): Promise<Blob> {
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
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality));
}

/** A clip this browser can't play, so many visitors couldn't either. */
class UnplayableClip extends Error {}

/** The storage's limits for one file (set per bucket in the database). Short clips are a few MB. */
const MAX_CLIP_MB = 50;
const MAX_PDF_MB = 20;

/**
 * Takes a still from a clip, half a second in, for the picture shown before it plays. Resolves with
 * null when the browser won't load the clip in the background (some phones), so it goes up without one.
 */
async function posterFrom(file: File, max = 1080): Promise<Blob | null> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  const reached = (event: "loadeddata" | "seeked") =>
    new Promise<boolean>((resolve, reject) => {
      const timer = setTimeout(() => resolve(false), 15000);
      video.addEventListener(event, () => (clearTimeout(timer), resolve(true)), { once: true });
      video.addEventListener("error", () => (clearTimeout(timer), reject(new UnplayableClip(file.name))), { once: true });
    });
  try {
    const loaded = reached("loadeddata");
    video.src = url;
    if (!(await loaded)) return null;
    if (!video.videoWidth) throw new UnplayableClip(file.name);
    const seeked = reached("seeked");
    video.currentTime = Math.min(0.5, (video.duration || 1) / 2);
    if (!(await seeked)) return null;
    const scale = Math.min(1, max / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}

/** Files in name order, so numbered exports (slide-1, slide-2, ...) keep their order. */
const byName = (a: File, b: File) => a.name.localeCompare(b.name, undefined, { numeric: true });

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

/** The storage paths of uploaded files among these addresses (bundled files like /images/... are skipped). */
function storedPaths(bucket: "event-media" | "reports", urls: (string | null | undefined)[]) {
  const prefix = supabase.storage.from(bucket).getPublicUrl("").data.publicUrl.replace(/\/$/, "") + "/";
  return urls.filter((u): u is string => Boolean(u?.startsWith(prefix))).map((u) => decodeURIComponent(u.slice(prefix.length)));
}

/** Deletes an item's uploaded files after the item itself is deleted, so storage doesn't fill with orphans. */
async function removeFiles(bucket: "event-media" | "reports", urls: (string | null | undefined)[]) {
  const paths = storedPaths(bucket, urls);
  if (!paths.length) return;
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) toast.error(`The item is deleted, but some of its files weren't: ${error.message}`);
}

/** A link typed into the admin page must be https (or empty). */
const badLink = (url: string | null | undefined) => Boolean(url?.trim()) && !/^https:\/\//i.test(url!.trim());

async function upload(bucket: "event-media" | "reports", path: string, body: Blob, contentType: string) {
  const { error } = await supabase.storage.from(bucket).upload(path, body, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

function Missing({ error }: { error: string }) {
  const notSetUp = /does not exist|schema cache|Could not find/i.test(error);
  const refused = /permission denied|Only admins|42501|row-level security/i.test(error);
  return (
    <div className="rounded-lg border border-border bg-card p-6 text-sm">
      <p className="font-medium text-navy">
        {notSetUp ? "This part isn't set up in the database yet." : refused ? "The database refused this." : "This couldn't be loaded."}
      </p>
      <p className="mt-1 text-muted-foreground">
        {notSetUp ? (
          <>
            Run the files in <code>supabase/migrations</code> in the Supabase project's SQL Editor. Until then the site
            shows the events and reports bundled with the code.
          </>
        ) : refused ? (
          "Your account may not have access to this, or your session needs its two-factor code again: sign out and back in."
        ) : (
          "Reload the page to try again."
        )}
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
  date: todayInBarcelona(),
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
    // A department saved under an old name shows, and is saved again, under its current one.
    else
      setRows(
        (data as unknown as EventRow[]).map((e) => ({
          ...e,
          departments: (e.departments ?? []).map(departmentSlug),
          desks: (e.desks ?? []).map(deskSlug),
        })),
      );
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
    if (!confirm(`Delete "${e.title}" and its photos, clips and slides? This cannot be undone.`)) return;
    const { error } = await supabase.from("events" as never).delete().eq("id", e.id);
    if (error) toast.error(error.message);
    else {
      await removeFiles("event-media", [...e.photos.map((p) => p.src), ...e.videos, ...e.videos.map(clipPoster), ...e.recap]);
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
                {e.videos.length > 0 && `, ${e.videos.length} clips`}
                {e.recap.length > 0 && `, ${e.recap.length} recap slides`}
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
  const [previewing, setPreviewing] = useState(false);
  const previewButton = useRef<HTMLButtonElement>(null);
  const isNew = !initial.id;
  const set = <K extends keyof EventRow>(k: K, v: EventRow[K]) => setE((x) => ({ ...x, [k]: v }));
  const toggle = (k: "departments" | "desks", v: string) =>
    set(k, e[k].includes(v) ? e[k].filter((x) => x !== v) : [...e[k], v]);
  const folder = () => e.id || `${slugify(e.title || "event")}-${e.date}`;
  const moveSlide = (i: number, by: -1 | 1) =>
    setE((x) => {
      const recap = [...x.recap];
      if (!recap[i + by]) return x;
      [recap[i], recap[i + by]] = [recap[i + by], recap[i]];
      return { ...x, recap };
    });

  /** Shrinks and uploads pictures in name order; returns the addresses of those that went up. */
  async function uploadPictures(files: FileList, max: number, quality?: number) {
    const added: string[] = [];
    const unreadable: string[] = [];
    for (const file of Array.from(files).sort(byName)) {
      try {
        const blob = await shrink(file, max, quality);
        added.push(await upload("event-media", `${folder()}/${Date.now()}-${slugify(file.name)}.jpg`, blob, "image/jpeg"));
      } catch (err) {
        if (err instanceof UnreadablePhoto) unreadable.push(file.name);
        else toast.error(`${file.name}: ${(err as Error).message}`);
      }
    }
    if (unreadable.length) {
      toast.error(
        `This browser can't read ${unreadable.join(", ")} (iPhone photos are often HEIC). Open them in Preview and export as JPEG, or upload from Safari.`,
        { duration: 10000 },
      );
    }
    return added;
  }

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const added = await uploadPictures(files, 1600);
    if (added.length) {
      setE((x) => ({ ...x, photos: [...x.photos, ...added.map((src) => ({ src, alt: "" }))] }));
      toast.success(`${added.length} photo${added.length === 1 ? "" : "s"} uploaded. Add a short description to each.`);
    }
    setBusy(false);
  }

  async function addSlides(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    // Recap slides carry text, so they keep more detail than photos.
    const added = await uploadPictures(files, 2000, 0.9);
    if (added.length) {
      setE((x) => ({ ...x, recap: [...x.recap, ...added] }));
      toast.success(`${added.length} slide${added.length === 1 ? "" : "s"} uploaded, in file name order.`);
    }
    setBusy(false);
  }

  async function addClips(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    for (const file of Array.from(files).sort(byName)) {
      if (file.size > MAX_CLIP_MB * 1024 * 1024) {
        toast.error(`${file.name} is over ${MAX_CLIP_MB} MB. Trim it or export it smaller, then add it again.`);
        continue;
      }
      try {
        const poster = await posterFrom(file);
        const ext = file.name.match(/\.(mp4|webm|mov)$/i)?.[1].toLowerCase() ?? "mp4";
        const path = `${folder()}/${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
        // iPhone .mov clips are served as MP4, which every browser opens.
        const src = await upload("event-media", path, file, ext === "webm" ? "video/webm" : "video/mp4");
        if (poster) await upload("event-media", clipPoster(path), poster, "image/jpeg");
        else toast(`No still could be made for ${file.name}, so the site shows its first frame instead.`);
        added.push(src);
      } catch (err) {
        toast.error(
          err instanceof UnplayableClip
            ? `This browser can't play ${file.name}. Export it as an MP4 (H.264) and add it again.`
            : `${file.name}: ${(err as Error).message}`,
        );
      }
    }
    if (added.length) {
      setE((x) => ({ ...x, videos: [...x.videos, ...added] }));
      toast.success(`${added.length} clip${added.length === 1 ? "" : "s"} uploaded.`);
    }
    setBusy(false);
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    if (e.photos.some((p) => !p.alt.trim())) {
      toast.error("Describe every photo in a few words, for people using screen readers.");
      return;
    }
    if (badLink(e.link)) {
      toast.error("The registration link must start with https://");
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

      <fieldset className="space-y-3">
        <legend className={label}>Clips (short MP4 videos, up to {MAX_CLIP_MB} MB each)</legend>
        {e.videos.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {e.videos.map((v, i) => (
              <div key={v} className="space-y-2 rounded-md border border-border p-2">
                <video
                  src={`${v}#t=0.1`}
                  poster={clipPoster(v)}
                  controls
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-[9/16] w-full rounded bg-black object-cover"
                />
                <button type="button" className={button} onClick={() => set("videos", e.videos.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            ))}
          </div>
        )}
        <label className={cn(button, "cursor-pointer")}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Add clips
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            multiple
            className="sr-only"
            disabled={busy}
            onChange={(x) => addClips(x.target.files)}
          />
        </label>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className={label}>Recap slides (the images of the Marketing team's LinkedIn post, in order)</legend>
        {e.recap.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-1">
            {e.recap.map((src, i) => (
              <div key={src} className="w-36 shrink-0 space-y-2 rounded-md border border-border p-2">
                <img src={src} alt="" className="aspect-[4/5] w-full rounded object-cover" />
                <div className="flex gap-1">
                  <button type="button" className={cn(button, "px-2")} disabled={i === 0} onClick={() => moveSlide(i, -1)} aria-label={`Move slide ${i + 1} earlier`}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" className={cn(button, "px-2")} disabled={i === e.recap.length - 1} onClick={() => moveSlide(i, 1)} aria-label={`Move slide ${i + 1} later`}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button type="button" className={cn(button, "px-2")} onClick={() => set("recap", e.recap.filter((_, j) => j !== i))} aria-label={`Remove slide ${i + 1}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <label className={cn(button, "cursor-pointer")}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Add slides
          <input type="file" accept="image/*" multiple className="sr-only" disabled={busy} onChange={(x) => addSlides(x.target.files)} />
        </label>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={e.published} onChange={(x) => set("published", x.target.checked)} />
        Show on the site
      </label>
      <div className="flex flex-wrap gap-2">
        <button className={primary} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isNew ? "Add event" : "Save event"}
        </button>
        <button ref={previewButton} type="button" className={cn(button, "h-10")} disabled={!e.title.trim()} onClick={() => setPreviewing(true)}>
          <Eye className="h-4 w-4" /> Preview
        </button>
      </div>

      <Dialog open={previewing} onOpenChange={setPreviewing}>
        <DialogContent
          className="flex max-h-[92vh] w-[min(96vw,1400px)] max-w-none flex-col gap-0 overflow-hidden p-0"
          onCloseAutoFocus={(x) => {
            x.preventDefault();
            previewButton.current?.focus();
          }}
        >
          <DialogTitle className="border-b border-border bg-card px-6 py-3 pr-14 font-sans text-sm font-normal tracking-normal text-muted-foreground">
            Preview of the event page, as it will look once saved{e.published ? "" : " and shown on the site"}. Links are
            switched off here.
          </DialogTitle>
          <div
            className="overflow-y-auto bg-background"
            onClickCapture={(x) => {
              if ((x.target as HTMLElement).closest("a")) x.preventDefault();
            }}
          >
            <EventArticle event={{ ...e, link: e.link ?? undefined }} />
          </div>
        </DialogContent>
      </Dialog>
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
  date: todayInBarcelona(),
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
    else setRows((data as unknown as ReportRow[]).map((r) => ({ ...r, department: departmentSlug(r.department) })));
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(r: ReportRow) {
    if (!confirm(`Delete "${r.title}" and its PDF? This cannot be undone.`)) return;
    const { error } = await supabase.from("reports" as never).delete().eq("id", r.id);
    if (error) toast.error(error.message);
    else {
      await removeFiles("reports", [r.file]);
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
                <a className={button} href={safeUrl(r.file)} target="_blank" rel="noreferrer">
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
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      toast.error(`${file.name} is over ${MAX_PDF_MB} MB. Export it smaller, then add it again.`);
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
    if (badLink(r.link)) {
      toast.error("The link must start with https://");
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
          <a href={safeUrl(r.file)} target="_blank" rel="noreferrer" className="text-sm underline">
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

/* ---------------------------------------------------------------- Access */

type Person = {
  user_id: string;
  email: string;
  confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  role: "admin" | "editor" | null;
  two_factor: boolean;
};

const ROLE_LABEL = { admin: "Admin", editor: "Editor", none: "No access" } as const;

/**
 * Everyone who has signed up on the admin page. Admins give a role (editors manage events and reports;
 * admins also see people's data and manage access), deny a sign-up, or reset a lost authenticator.
 * Nobody changes their own access, so the club always keeps an admin.
 */
export function AccessManager() {
  const [rows, setRows] = useState<Person[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase.rpc("access_accounts" as never);
    if (error) setError(error.message);
    else setRows(data as unknown as Person[]);
  }
  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  async function run(p: Person, fn: string, args: Record<string, unknown>, done: string) {
    setBusy(p.user_id);
    const { error } = await supabase.rpc(fn as never, args as never);
    setBusy(null);
    if (error) toast.error(error.message);
    else {
      toast.success(done);
      load();
    }
  }
  const setRole = (p: Person, role: keyof typeof ROLE_LABEL) => {
    if (role === "none" && !confirm(`Remove all access for ${p.email}?`)) return;
    run(p, "set_role", { _user_id: p.user_id, _role: role }, `${p.email}: ${ROLE_LABEL[role]}`);
  };
  const deny = (p: Person) => {
    if (!confirm(`Deny ${p.email}? Their account is deleted, so they can't sign in. They can sign up again later.`)) return;
    run(p, "deny_account", { _user_id: p.user_id }, `${p.email} was denied`);
  };
  const resetFactor = (p: Person) => {
    if (!confirm(`Reset two-factor sign-in for ${p.email}? They set it up again at their next sign-in.`)) return;
    run(p, "reset_two_factor", { _user_id: p.user_id }, `Two-factor reset for ${p.email}`);
  };

  if (error) return <Missing error={error} />;
  if (!rows) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        New people create an account on this page ("New admin? Create your account") and confirm their email. Then
        give them access here: <strong>Editor</strong> manages events and reports; <strong>Admin</strong> also sees
        enquiries, applications and the newsletter, and manages access. Everyone with access signs in with two-factor.
      </p>
      <ul className="divide-y divide-border rounded-lg border border-border bg-card">
        {rows.map((p) => {
          const self = p.user_id === me;
          return (
            <li key={p.user_id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-navy">
                  {p.email}
                  {self && <span className="ml-2 text-xs font-normal text-muted-foreground">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  {p.confirmed ? ROLE_LABEL[p.role ?? "none"] : "Email not confirmed yet"}
                  {p.role && (p.two_factor ? ", two-factor on" : ", two-factor not set up yet")}, signed up{" "}
                  {formatDay(p.created_at.slice(0, 10))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor={`role-${p.user_id}`}>
                  Access for {p.email}
                </label>
                <select
                  id={`role-${p.user_id}`}
                  className={cn(field, "h-9 w-auto")}
                  value={p.role ?? "none"}
                  disabled={self || !p.confirmed || busy === p.user_id}
                  title={self ? "You can't change your own access" : undefined}
                  onChange={(x) => setRole(p, x.target.value as keyof typeof ROLE_LABEL)}
                >
                  <option value="none">No access</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
                {p.two_factor && !self && (
                  <button className={button} disabled={busy === p.user_id} onClick={() => resetFactor(p)}>
                    Reset two-factor
                  </button>
                )}
                {!p.role && !self && (
                  <button className={button} disabled={busy === p.user_id} onClick={() => deny(p)}>
                    Deny
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------ Newsletter */

type Signup = { id: string; email: string; created_at: string };

/** Newsletter sign-ups: list, export and delete (the privacy page promises deletion on request). */
export function NewsletterManager() {
  const [rows, setRows] = useState<Signup[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data, error } = await supabase
      .from("newsletter_signups" as never)
      .select("id, email, created_at")
      .order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setRows(data as unknown as Signup[]);
  }
  useEffect(() => {
    load();
  }, []);

  async function remove(n: Signup) {
    if (!confirm(`Delete ${n.email} from the newsletter? This cannot be undone.`)) return;
    const { error } = await supabase.from("newsletter_signups" as never).delete().eq("id", n.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`${n.email} deleted`);
      load();
    }
  }
  function exportCsv() {
    if (!rows) return;
    const blob = new Blob([toCsv(["email", "signed up"], rows.map((r) => [r.email, r.created_at]))], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `emfc-newsletter-${todayInBarcelona()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  if (error) return <Missing error={error} />;
  if (!rows) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "address" : "addresses"}, all with consent to be contacted. Delete anyone who
          asks to be removed.
        </p>
        <button className={button} onClick={exportCsv} disabled={rows.length === 0}>
          Export CSV
        </button>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sign-ups yet.</p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
          {rows.map((n) => (
            <li key={n.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <span>{n.email}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{formatDay(n.created_at.slice(0, 10))}</span>
                <button className={button} onClick={() => remove(n)} title={`Delete ${n.email}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
