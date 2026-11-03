/**
 * One CSV cell, quoted, and safe to open in Excel or Google Sheets: text that starts with = + - @
 * (or a tab or return) would run as a formula there, so it gets a leading apostrophe.
 */
export const csvCell = (value: unknown) => {
  let s = String(value ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

/** A CSV file from a header row and rows, ready for a Blob. */
export const toCsv = (header: string[], rows: unknown[][]) =>
  [header.map(csvCell).join(","), ...rows.map((r) => r.map(csvCell).join(","))].join("\n");
