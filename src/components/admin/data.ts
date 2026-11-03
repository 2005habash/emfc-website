import { supabase } from "@/integrations/supabase/client";

// Browser helpers for the admin page: reading a whole table or storage bucket, and saving a file made
// in the browser. The database's API answers with at most 1000 rows or file names at a time, so
// anything bigger is read page by page, until a page comes back empty (so a lower limit set in
// Supabase can't cut it short either).

const PAGE = 1000;

/** Every row of a table the signed-in person may read, in pages ordered by id. */
export async function readAll<T extends { id: string | number }>(table: string, columns = "*", onProgress?: (rows: number) => void) {
  const rows: T[] = [];
  for (;;) {
    let query = supabase.from(table as never).select(columns);
    if (rows.length) query = query.gt("id" as never, rows[rows.length - 1].id as never);
    const { data, error } = await query.order("id" as never).limit(PAGE);
    if (error) throw new Error(`${table}: ${error.message}`);
    const page = (data ?? []) as unknown as T[];
    if (!page.length) return rows;
    rows.push(...page);
    onProgress?.(rows.length);
  }
}

/** Every file path in a storage bucket, folders included. */
export async function listFiles(bucket: string, prefix = ""): Promise<string[]> {
  const out: string[] = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: PAGE, offset });
    if (error) throw new Error(`${bucket}: ${error.message}`);
    if (!data?.length) return out;
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) out.push(...(await listFiles(bucket, path)));
      else out.push(path);
    }
  }
}

/** Saves a file made in the browser. Its address is freed a minute later: freeing it straight away
 * can cancel the download in Safari and Firefox. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
