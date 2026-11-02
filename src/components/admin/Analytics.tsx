import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatDay } from "@/lib/site";
import { cn } from "@/lib/utils";

// The admin page's Analytics tab. Reads one summary from the database (analytics_summary in
// supabase/migrations/20261103120000_analytics.sql), recorded by src/lib/analytics.ts.

type Row = { name: string; count: number; visitors?: number };
type Summary = {
  days: number;
  totals: {
    page_views: number;
    visitors: number;
    profile_opens: number;
    linkedin_clicks: number;
    report_downloads: number;
    enquiries: number;
    newsletter_signups: number;
  };
  daily: { day: string; views: number; visitors: number }[];
  pages: Row[];
  profiles: Row[];
  linkedin: Row[];
  reports: Row[];
  referrers: Row[];
  countries: Row[];
  devices: Row[];
};

const RANGES = [7, 30, 90] as const;
const countryName = (() => {
  try {
    const names = new Intl.DisplayNames(["en"], { type: "region" });
    return (code: string) => (code === "??" ? "Unknown" : (names.of(code) ?? code));
  } catch {
    return (code: string) => code;
  }
})();
const pageName = (path: string) => (path === "/" ? "Home" : path.replace(/^\//, "").replace(/-/g, " "));

function Tile({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl text-navy">{value.toLocaleString("en-GB")}</p>
      {note && <p className="mt-0.5 text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

function Ranked({ title, rows, label = (n) => n, empty }: { title: string; rows: Row[]; label?: (name: string) => string; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-serif text-lg text-navy">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.map((r) => (
            <li key={r.name} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate first-letter:uppercase">{label(r.name)}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{r.count.toLocaleString("en-GB")}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-secondary">
                <div className="h-1.5 rounded-full bg-navy" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Daily({ daily }: { daily: Summary["daily"] }) {
  const max = Math.max(1, ...daily.map((d) => d.visitors));
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-lg text-navy">Visitors per day</h3>
        <span className="text-xs text-muted-foreground">Busiest day: {max.toLocaleString("en-GB")}</span>
      </div>
      <div className="mt-4 flex h-40 items-end gap-[2px]" role="img" aria-label="Visitors per day">
        {daily.map((d) => (
          <div
            key={d.day}
            className="group relative flex-1 rounded-t-sm bg-navy/80 hover:bg-navy"
            style={{ height: `${Math.max(2, (d.visitors / max) * 100)}%`, opacity: d.visitors ? 1 : 0.25 }}
            title={`${formatDay(d.day)}: ${d.visitors} visitors, ${d.views} page views`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{daily[0] && formatDay(daily[0].day)}</span>
        <span>{daily.at(-1) && formatDay(daily.at(-1)!.day)}</span>
      </div>
    </section>
  );
}

export function AnalyticsManager() {
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setData(null);
    supabase.rpc("analytics_summary" as never, { _days: days } as never).then(({ data, error }) => {
      if (!live) return;
      if (error) setError(error.message);
      else setData(data as unknown as Summary);
    });
    return () => {
      live = false;
    };
  }, [days]);

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm">
        <p className="font-medium text-navy">Analytics aren't set up in the database yet.</p>
        <p className="mt-1 text-muted-foreground">
          Run <code>supabase/migrations/20261103120000_analytics.sql</code> in the Supabase project's SQL Editor.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Database message: {error}</p>
      </div>
    );
  }

  const t = data?.totals;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Anonymous counts: no names, addresses or cookies. A visitor counts once a day; bots are left out.
        </p>
        <div role="tablist" aria-label="Period" className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {RANGES.map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={days === r}
              onClick={() => setDays(r)}
              className={cn("h-8 rounded-md px-3 text-sm", days === r ? "bg-navy text-primary-foreground" : "hover:bg-secondary")}
            >
              {r} days
            </button>
          ))}
        </div>
      </div>

      {!data || !t ? (
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            <Tile label="Visitors" value={t.visitors} note="per day, added up" />
            <Tile label="Page views" value={t.page_views} />
            <Tile label="Profile opens" value={t.profile_opens} />
            <Tile label="LinkedIn clicks" value={t.linkedin_clicks} note="from profiles" />
            <Tile label="Report downloads" value={t.report_downloads} />
            <Tile label="Sponsorship enquiries" value={t.enquiries} />
            <Tile label="Newsletter sign-ups" value={t.newsletter_signups} />
          </div>
          <Daily daily={data.daily} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Ranked title="Most viewed pages" rows={data.pages} label={pageName} empty="No page views yet." />
            <Ranked title="Profiles opened" rows={data.profiles} empty="No profiles opened yet." />
            <Ranked title="LinkedIn clicks, by member" rows={data.linkedin} empty="No LinkedIn clicks yet." />
            <Ranked title="Report downloads" rows={data.reports} empty="No downloads yet." />
            <Ranked title="Sites that sent visitors" rows={data.referrers} empty="No visits from other sites yet." />
            <Ranked title="Countries (visitors)" rows={data.countries} label={countryName} empty="No visits yet." />
            <Ranked title="Devices (visitors)" rows={data.devices} empty="No visits yet." />
          </div>
        </>
      )}
    </div>
  );
}
