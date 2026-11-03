import { strToU8, zip, type Zippable } from "fflate";
import { Archive, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadBlob, listFiles, readAll } from "@/components/admin/data";
import { supabase } from "@/integrations/supabase/client";
import { todayInBarcelona } from "@/lib/site";

// The admin page's Backup tab: one zip with everything the club would want back if the database were
// lost (events, reports, enquiries, newsletter, applications, access, analytics), and optionally every
// uploaded photo, clip, PDF and CV. The free Supabase plan has no restore of its own, so an admin
// downloads this weekly and keeps it in the club Drive.

const LAST_KEY = "emfc-last-backup";
const WEEK = 7 * 24 * 60 * 60 * 1000;

function lastBackup() {
  try {
    return Number(localStorage.getItem(LAST_KEY)) || 0;
  } catch {
    return 0;
  }
}

/** True when this browser hasn't made a backup in the last week. */
export function backupDue() {
  return typeof window !== "undefined" && Date.now() - lastBackup() > WEEK;
}

const TABLES = ["events", "reports", "sponsorship_enquiries", "newsletter_signups", "applications", "analytics_events"] as const;
const BUCKETS = ["event-media", "reports", "cvs"] as const;

export function BackupManager() {
  const [busy, setBusy] = useState<string | null>(null);
  const [withFiles, setWithFiles] = useState(true);
  const [last, setLast] = useState(lastBackup);

  async function download() {
    try {
      const data: Record<string, unknown> = { exported_at: new Date().toISOString() };
      for (const t of TABLES) {
        const name = t.replace(/_/g, " ");
        setBusy(`Reading ${name}`);
        data[t] = await readAll(t, "*", (rows) => setBusy(`Reading ${name} (${rows} rows)`));
      }
      const { data: people, error } = await supabase.rpc("access_accounts" as never);
      if (error) throw new Error(`access: ${error.message}`);
      data.access = people;

      const files: Zippable = { "data.json": strToU8(JSON.stringify(data, null, 2)) };
      if (withFiles) {
        for (const bucket of BUCKETS) {
          setBusy(`Listing ${bucket} files`);
          const paths = await listFiles(bucket);
          for (const [i, path] of paths.entries()) {
            setBusy(`Copying ${bucket} files (${i + 1} of ${paths.length})`);
            const { data: blob, error } = await supabase.storage.from(bucket).download(path);
            if (error || !blob) throw new Error(`${bucket}/${path}: ${error?.message ?? "no file"}`);
            files[`files/${bucket}/${path}`] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
          }
        }
      }

      setBusy("Making the zip");
      const zipped = await new Promise<Uint8Array>((resolve, reject) => zip(files, (err, out) => (err ? reject(err) : resolve(out))));
      downloadBlob(new Blob([zipped as BlobPart], { type: "application/zip" }), `emfc-backup-${todayInBarcelona()}.zip`);
      try {
        localStorage.setItem(LAST_KEY, String(Date.now()));
      } catch {
        // Private mode: the reminder just won't know.
      }
      setLast(Date.now());
      toast.success("Backup downloaded. Keep it in the club Drive.");
    } catch (err) {
      toast.error(`The backup stopped: ${(err as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  const days = last ? Math.floor((Date.now() - last) / (24 * 60 * 60 * 1000)) : null;
  return (
    <div className="max-w-2xl space-y-5 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="font-serif text-2xl text-navy">Backup</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          One zip with the events, reports, sponsorship enquiries, newsletter, applications, access list and analytics,
          and if you like every uploaded photo, clip, PDF and CV. Download it once a week and keep it in the club Drive:
          the free database plan has no restore of its own. It contains people's details, so keep it private.
        </p>
      </div>
      <p className="text-sm">
        {days === null ? "No backup from this browser yet." : days === 0 ? "Last backup from this browser: today." : `Last backup from this browser: ${days} day${days === 1 ? "" : "s"} ago.`}
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={withFiles} onChange={(e) => setWithFiles(e.target.checked)} />
        Include photos, clips, PDFs and CVs (a bigger download)
      </label>
      <button
        onClick={download}
        disabled={Boolean(busy)}
        className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
        {busy ?? "Download the backup"}
      </button>
    </div>
  );
}
