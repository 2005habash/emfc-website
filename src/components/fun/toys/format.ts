// Number formats the desk toys share.

/** Millions of euros as "€560m", or "€1.3bn" from a billion. */
export const eur = (m: number) =>
  Math.abs(m) >= 1000
    ? `€${(m / 1000).toFixed(Math.abs(m) >= 10_000 ? 0 : 1)}bn`
    : `€${Math.round(m).toLocaleString("en-GB")}m`;

/** Always in millions, as "€1,338m", where the precision matters (a paper LBO's table). */
export const eurM = (m: number) => `€${Math.round(m).toLocaleString("en-GB")}m`;

export const pct = (x: number, digits = 1) => `${(x * 100).toFixed(digits)}%`;
export const signedPct = (x: number, digits = 1) => `${x >= 0 ? "+" : ""}${pct(x, digits)}`;
