import { FIRMS, V4, V6 } from "@/lib/server/firm-networks";

// The firm whose own office network an address belongs to, from the table made by
// tools/import-firm-networks.py, or null for everything else (home internet, phones, universities,
// firms on an ordinary provider). The address is only compared here: it is never kept or sent anywhere.

/** An address as fixed-width hex (8 characters for IPv4, 32 for IPv6), or null if it isn't one. */
function toHex(ip: string): { hex: string; v6: boolean } | null {
  const v4 = (s: string) => {
    const parts = s.split(".");
    if (parts.length !== 4 || !parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) < 256)) return null;
    return parts.map((p) => Number(p).toString(16).padStart(2, "0")).join("");
  };
  if (!ip.includes(":")) {
    const hex = v4(ip);
    return hex ? { hex, v6: false } : null;
  }
  // An IPv4 address written as IPv6 (::ffff:1.2.3.4) is looked up as IPv4.
  const mapped = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(ip);
  if (mapped) {
    const hex = v4(mapped[1]);
    return hex ? { hex, v6: false } : null;
  }
  const halves = ip.split("::");
  if (halves.length > 2) return null;
  const groups = (s: string) => (s ? s.split(":") : []);
  const head = groups(halves[0]);
  const tail = halves.length === 2 ? groups(halves[1]) : [];
  const fill = 8 - head.length - tail.length;
  if ((halves.length === 2 && fill < 1) || (halves.length === 1 && fill !== 0)) return null;
  const all = [...head, ...Array(Math.max(fill, 0)).fill("0"), ...tail];
  if (!all.every((g) => /^[0-9a-f]{1,4}$/i.test(g))) return null;
  return { hex: all.map((g) => g.toLowerCase().padStart(4, "0")).join(""), v6: true };
}

export function firmOf(ip: string): string | null {
  const address = toHex(ip.trim());
  if (!address) return null;
  const table = address.v6 ? V6 : V4;
  // The last range that starts at or before the address, if it also ends at or after it.
  let lo = 0;
  let hi = table.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (table[mid][0] <= address.hex) {
      found = mid;
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return found >= 0 && address.hex <= table[found][1] ? FIRMS[table[found][2]] : null;
}
