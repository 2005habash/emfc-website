import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { departments } from "@/lib/departments";
import { Download, LogOut, Loader2, ChevronDown, ChevronRight, ExternalLink, X, FileText, Users, Calendar, TrendingUp, Building2, Archive, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { zip } from "fflate";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — EMFC" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type Application = {
  id: string;
  department: string;
  full_name: string;
  email: string;
  program: string;
  graduation_year: string;
  nationality: string | null;
  linkedin_url: string;
  experience: string;
  desk_preference: string | null;
  motivation: string;
  relevant_experience: string | null;
  cv_path: string | null;
  position_type: string | null;
  created_at: string;
};

function Admin() {
  const [session, setSession] = useState<{ userId: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session?.user) {
        setSession({ userId: data.session.user.id });
        const { data: roleData } = await supabase
          .from("user_roles" as never)
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!roleData);
      }
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) setSession({ userId: s.user.id });
      else { setSession(null); setIsAdmin(null); }
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  if (checking) {
    return <SiteLayout><div className="container-emis py-24 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div></SiteLayout>;
  }

  if (!session) return <SiteLayout><Login /></SiteLayout>;
  if (isAdmin === false) {
    return (
      <SiteLayout>
        <div className="container-emis py-24 text-center">
          <h1 className="font-serif text-3xl text-navy">Not authorised</h1>
          <p className="mt-2 text-muted-foreground">Your account does not have admin access.</p>
          <button onClick={() => supabase.auth.signOut()} className="mt-6 inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">Sign out</button>
        </div>
      </SiteLayout>
    );
  }
  if (!isAdmin) {
    return <SiteLayout><div className="container-emis py-24 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div></SiteLayout>;
  }

  return <SiteLayout><Dashboard /></SiteLayout>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
  }
  return (
    <div className="container-emis flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-8">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-2xl text-navy">Sign in</h1>
        </div>
        <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" />
        <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm" />
        <button disabled={busy} type="submit" className="inline-flex h-11 w-full items-center justify-center rounded-md bg-navy text-sm font-medium text-primary-foreground disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
        </button>
        <p className="text-xs text-muted-foreground">Restricted to EMFC admins. Contact a co-president for access.</p>
      </form>
    </div>
  );
}

type SortKey = "created_at" | "full_name" | "email" | "department" | "desk_preference" | "program" | "cv_path";
type SortDir = "asc" | "desc";

function SortHeader({ column, label, sort, onSort }: { column: SortKey; label: string; sort: { key: SortKey; dir: SortDir }; onSort: (key: SortKey) => void }) {
  const active = sort.key === column;
  return (
    <button onClick={() => onSort(column)} className="group inline-flex w-full items-center gap-1 py-1 font-medium hover:text-navy">
      {label}
      <span className="inline-flex h-4 w-4 items-center justify-center">
        {!active ? <ArrowUpDown className="h-3 w-3 opacity-40" /> : sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      </span>
    </button>
  );
}

function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{ url: string; name: string } | null>(null);
  const [zipping, setZipping] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "created_at", dir: "desc" });

  const deptName = (slug: string) => departments.find((d) => d.slug === slug)?.name ?? slug;

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setApps((data as Application[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((a) => {
      if (filter !== "all" && a.department !== filter) return false;
      if (!q) return true;
      return (
        a.full_name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.program.toLowerCase().includes(q) ||
        (a.desk_preference ?? "").toLowerCase().includes(q)
      );
    });
  }, [apps, filter, search]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      const fallback = (v: string | null) => (v ?? "").toLowerCase();
      switch (sort.key) {
        case "created_at":
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case "full_name":
          return dir * a.full_name.toLowerCase().localeCompare(b.full_name.toLowerCase());
        case "email":
          return dir * a.email.toLowerCase().localeCompare(b.email.toLowerCase());
        case "department":
          return dir * deptName(a.department).localeCompare(deptName(b.department));
        case "desk_preference":
          return dir * fallback(a.desk_preference).localeCompare(fallback(b.desk_preference));
        case "program":
          return dir * (a.program + a.graduation_year).localeCompare(b.program + b.graduation_year);
        case "cv_path":
          return dir * ((a.cv_path ? 1 : 0) - (b.cv_path ? 1 : 0));
        default:
          return 0;
      }
    });
    return list;
  }, [filtered, sort, deptName]);

  const metrics = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const last7 = now - 7 * dayMs;
    const last24 = now - dayMs;
    const byDept = new Map<string, number>();
    const byDay = new Map<string, number>();
    let todayCount = 0, weekCount = 0, dayCount = 0;
    for (const a of apps) {
      const t = new Date(a.created_at).getTime();
      if (t >= today.getTime()) todayCount++;
      if (t >= last24) dayCount++;
      if (t >= last7) weekCount++;
      byDept.set(a.department, (byDept.get(a.department) ?? 0) + 1);
      const d = new Date(a.created_at); d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    // Build last-14-days series
    const series: { date: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * dayMs);
      const key = d.toISOString().slice(0, 10);
      series.push({
        date: key,
        label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count: byDay.get(key) ?? 0,
      });
    }
    const maxDay = Math.max(1, ...series.map((s) => s.count));
    const deptRows = Array.from(byDept.entries()).sort((a, b) => b[1] - a[1]);
    const maxDept = Math.max(1, ...deptRows.map(([, c]) => c));
    return { todayCount, dayCount, weekCount, series, maxDay, deptRows, maxDept };
  }, [apps]);

  async function openCV(path: string, inline: boolean) {
    const { data, error } = await supabase.storage.from("cvs").createSignedUrl(path, 300);
    if (error || !data) return toast.error("Could not generate link");
    if (inline) {
      setPreview({ url: data.signedUrl, name: path.split("/").pop() ?? "CV.pdf" });
    } else {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSort(key: SortKey) {
    setSort((prev) => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  }

  function exportCSV() {
    const cols: (keyof Application)[] = ["created_at","department","position_type","full_name","email","program","graduation_year","nationality","linkedin_url","experience","desk_preference","motivation","relevant_experience","cv_path"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...filtered.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `emfc-applications-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadAllCVs() {
    const withCV = apps.filter((a) => a.cv_path);
    if (withCV.length === 0) return toast.error("No CVs to download");
    setZipping(true);
    const t = toast.loading(`Preparing ${withCV.length} CVs…`);
    try {
      const files: Record<string, Uint8Array> = {};
      const used = new Set<string>();
      // Fetch in small parallel batches to avoid overwhelming the browser.
      const batchSize = 5;
      let done = 0;
      for (let i = 0; i < withCV.length; i += batchSize) {
        const batch = withCV.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (a) => {
            const { data, error } = await supabase.storage.from("cvs").createSignedUrl(a.cv_path!, 300);
            if (error || !data) throw new Error(error?.message ?? "signed url failed");
            const res = await fetch(data.signedUrl);
            if (!res.ok) throw new Error(`fetch ${a.cv_path} ${res.status}`);
            const buf = new Uint8Array(await res.arrayBuffer());
            const safeName = a.full_name.replace(/[^a-zA-Z0-9._-]+/g, "_");
            let name = `${deptName(a.department)}/${safeName}.pdf`;
            let n = 2;
            while (used.has(name)) { name = `${deptName(a.department)}/${safeName}_${n++}.pdf`; }
            used.add(name);
            files[name] = buf;
            done++;
            toast.loading(`Preparing ${done}/${withCV.length} CVs…`, { id: t });
          }),
        );
      }
      const zipped: Uint8Array = await new Promise((resolve, reject) =>
        zip(files, { level: 0 }, (err, out) => (err ? reject(err) : resolve(out))),
      );
      const blob = new Blob([zipped as BlobPart], { type: "application/zip" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = "ESADE_Finance_Club_CVs.zip"; link.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${withCV.length} CVs`, { id: t });
    } catch (err) {
      console.error(err);
      toast.error("Failed to build zip", { id: t });
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="container-emis py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-3xl text-navy">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} showing · {apps.length} total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={downloadAllCVs} disabled={zipping} className="inline-flex h-10 items-center gap-2 rounded-md border border-navy px-4 text-sm font-medium text-navy hover:bg-secondary disabled:opacity-60">
            {zipping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />} Download all CVs
          </button>
          <button onClick={exportCSV} className="inline-flex h-10 items-center gap-2 rounded-md bg-navy px-4 text-sm font-medium text-primary-foreground">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => supabase.auth.signOut()} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard icon={<Users className="h-5 w-5" />} label="Total applicants" value={apps.length} />
        <MetricCard icon={<Calendar className="h-5 w-5" />} label="Today" value={metrics.todayCount} />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Last 24 hours" value={metrics.dayCount} />
        <MetricCard icon={<TrendingUp className="h-5 w-5" />} label="Last 7 days" value={metrics.weekCount} />
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg text-navy">Applications per day</h2>
            <span className="text-xs text-muted-foreground">Last 14 days</span>
          </div>
          <div className="flex h-40 items-end gap-1.5">
            {metrics.series.map((s) => (
              <div key={s.date} className="group flex flex-1 flex-col items-center gap-1">
                <div className="relative w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t bg-navy transition-all group-hover:bg-navy/80"
                    style={{ height: `${(s.count / metrics.maxDay) * 100}%`, minHeight: s.count ? "4px" : "0" }}
                    title={`${s.label}: ${s.count}`}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{s.count || ""}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{metrics.series[0]?.label}</span>
            <span>{metrics.series[metrics.series.length - 1]?.label}</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-navy" />
            <h2 className="font-serif text-lg text-navy">By department</h2>
          </div>
          {metrics.deptRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No applications yet.</p>
          ) : (
            <div className="space-y-2">
              {metrics.deptRows.map(([slug, count]) => (
                <div key={slug} className="flex items-center gap-3">
                  <div className="w-40 truncate text-sm text-navy">{deptName(slug)}</div>
                  <div className="relative h-6 flex-1 rounded bg-secondary">
                    <div
                      className="h-full rounded bg-navy"
                      style={{ width: `${(count / metrics.maxDept) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm tabular-nums text-navy">{count}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All departments</option>
          {departments.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
        <input
          type="search"
          placeholder="Search by name, email, program…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 min-w-[240px] flex-1 rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-10 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No applications match your filters.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3 w-8"></th>
                <th className="p-3"><SortHeader column="created_at" label="Date" sort={sort} onSort={toggleSort} /></th>
                <th className="p-3"><SortHeader column="full_name" label="Name" sort={sort} onSort={toggleSort} /></th>
                <th className="p-3"><SortHeader column="email" label="Email" sort={sort} onSort={toggleSort} /></th>
                <th className="p-3"><SortHeader column="department" label="Department" sort={sort} onSort={toggleSort} /></th>
                <th className="p-3"><SortHeader column="desk_preference" label="Preference" sort={sort} onSort={toggleSort} /></th>
                <th className="p-3"><SortHeader column="program" label="Program" sort={sort} onSort={toggleSort} /></th>
                <th className="p-3"><SortHeader column="cv_path" label="CV" sort={sort} onSort={toggleSort} /></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => {
                const isOpen = expanded.has(a.id);
                return (
                  <>
                    <tr
                      key={a.id}
                      className="cursor-pointer border-t border-border align-top hover:bg-secondary/30"
                      onClick={() => toggle(a.id)}
                    >
                      <td className="p-3">
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        <div className="text-[10px]">{new Date(a.created_at).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</div>
                      </td>
                      <td className="p-3 font-medium text-navy">{a.full_name}</td>
                      <td className="p-3">
                        <a onClick={(e) => e.stopPropagation()} href={`mailto:${a.email}`} className="text-steel hover:underline">{a.email}</a>
                      </td>
                      <td className="p-3 text-xs">{deptName(a.department)}</td>
                      <td className="p-3 text-xs">{a.desk_preference ?? "—"}</td>
                      <td className="p-3 text-xs">{a.program} · {a.graduation_year}</td>
                      <td className="p-3" onClick={(e) => e.stopPropagation()}>
                        {a.cv_path ? (
                          <div className="flex items-center gap-2">
                            <button onClick={() => openCV(a.cv_path!, true)} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-navy hover:bg-secondary">
                              <FileText className="h-3 w-3" /> View
                            </button>
                            <button onClick={() => openCV(a.cv_path!, false)} title="Open in new tab" className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-navy hover:bg-secondary">
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={a.id + "-details"} className="border-t border-border bg-secondary/20">
                        <td></td>
                        <td colSpan={7} className="p-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailField label="Full name" value={a.full_name} />
                            <DetailField label="Email" value={<a href={`mailto:${a.email}`} className="text-steel hover:underline">{a.email}</a>} />
                            <DetailField label="Program" value={`${a.program} · Class of ${a.graduation_year}`} />
                            <DetailField label="Nationality" value={a.nationality ?? "—"} />
                            <DetailField label="Department" value={deptName(a.department)} />
                            <DetailField label="Position type" value={a.position_type ?? "—"} />
                            <DetailField label="Team preference" value={a.desk_preference ?? "—"} />
                            <DetailField
                              label="LinkedIn"
                              value={(() => {
                                const safe = /^https?:\/\//i.test(a.linkedin_url) ? a.linkedin_url : null;
                                return safe ? (
                                  <a href={safe} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-steel hover:underline">
                                    {safe} <ExternalLink className="h-3 w-3" />
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">{a.linkedin_url}</span>
                                );
                              })()}
                            />
                            <DetailField label="Prior experience" value={a.experience} full />
                            {a.relevant_experience && <DetailField label="Relevant experience" value={a.relevant_experience} full />}
                            {a.motivation && <DetailField label="Motivation" value={a.motivation} full />}
                            <DetailField
                              label="Submitted"
                              value={new Date(a.created_at).toLocaleString()}
                            />
                            <DetailField label="Application ID" value={<code className="text-xs">{a.id}</code>} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreview(null)}>
          <div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-border bg-secondary/50 p-3">
              <div className="flex items-center gap-2 text-sm text-navy">
                <FileText className="h-4 w-4" /> {preview.name}
              </div>
              <div className="flex items-center gap-2">
                <a href={preview.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-navy hover:bg-secondary">
                  <ExternalLink className="h-3 w-3" /> Open in new tab
                </a>
                <a href={preview.url} download className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-navy hover:bg-secondary">
                  <Download className="h-3 w-3" /> Download
                </a>
                <button onClick={() => setPreview(null)} className="inline-flex h-7 w-7 items-center justify-center rounded border border-border text-navy hover:bg-secondary">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <iframe src={preview.url} title={preview.name} className="flex-1 w-full bg-white" />
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="text-navy">{icon}</span>
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 font-serif text-3xl text-navy tabular-nums">{value}</div>
    </div>
  );
}

function DetailField({ label, value, full }: { label: string; value: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-navy">{value}</div>
    </div>
  );
}

