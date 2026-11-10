import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { departments } from "@/lib/departments";
import { Download, LogOut, Loader2, ChevronDown, ChevronRight, ExternalLink, X, FileText, Users, Calendar, TrendingUp, Building2, Archive, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { toCsv } from "@/lib/csv";
import { wantToasts } from "@/lib/toast";
import { zip } from "fflate";
import { AnalyticsManager } from "@/components/admin/Analytics";
import { BackupManager, backupDue } from "@/components/admin/Backup";
import { AccessManager, EnquiriesManager, EventsManager, NewsletterManager, ReportsManager } from "@/components/admin/ContentManagers";
import { downloadBlob, readAll } from "@/components/admin/data";
import { SetUpTwoFactor, TwoFactorCode } from "@/components/admin/TwoFactor";

// The admin page, at an unlisted address. Two levels of access: editors manage events and reports;
// admins also see people's data (enquiries, applications, newsletter) and manage access. Every editor
// and admin signs in with two-factor (TwoFactor.tsx); the database checks the role and the second
// factor itself, so the address and the page code alone give no access.
export const Route = createFileRoute("/club-office")({
  head: () => ({ meta: [{ title: "Admin, EMFC" }, { name: "robots", content: "noindex" }] }),
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

type Account = { userId: string; email: string };
const toAccount = (s: Session | null): Account | null =>
  s?.user ? { userId: s.user.id, email: s.user.email ?? "" } : null;

export type Role = "admin" | "editor";
/** Two-factor state of the signed-in person: none set up, set up but not used in this session, or done. */
type Factor = "setup" | "code" | "done";

function Admin() {
  const navigate = useNavigate();
  // This page shows toasts all the time, so the toaster is put on the page straight away.
  useEffect(() => wantToasts(), []);
  const [account, setAccount] = useState<Account | null>(null);
  const [role, setRole] = useState<Role | null | undefined>(undefined);
  const [factor, setFactor] = useState<Factor | undefined>(undefined);
  const [recheck, setRecheck] = useState(0);
  const [checking, setChecking] = useState(true);
  // The link in a "new password" email signs the person in and lands here with ?reset=1; an expired
  // link lands with an error instead. Both are read on the first render, before anything else happens.
  const [resetting, setResetting] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("reset"),
  );
  const [notice] = useState(() => {
    if (typeof window === "undefined") return null;
    // The message is the page's own, never the link's text: a made-up link can't put words on this page.
    const hash = new URLSearchParams(window.location.hash.slice(1));
    if (!hash.has("error") && !hash.has("error_code")) return null;
    return hash.get("error_code") === "otp_expired"
      ? "That link has expired or was already used. Ask for a new one below."
      : "That link didn't work. Ask for a new one below.";
  });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAccount(toAccount(data.session));
      setChecking(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "PASSWORD_RECOVERY") setResetting(true);
      setAccount(toAccount(s));
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // The role and the two-factor state are checked for every account that signs in, also straight
  // after the sign-in form, and again after the two-factor step.
  const userId = account?.userId;
  useEffect(() => {
    setRole(undefined);
    setFactor(undefined);
    if (!userId) return;
    let live = true;
    (async () => {
      const [{ data: roles, error }, { data: aal }] = await Promise.all([
        supabase.from("user_roles" as never).select("role").eq("user_id", userId),
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      ]);
      if (!live) return;
      if (error) toast.error(error.message);
      const held = ((roles ?? []) as { role: string }[]).map((r) => r.role);
      setRole(held.includes("admin") ? "admin" : held.includes("editor") ? "editor" : null);
      setFactor(aal?.currentLevel === "aal2" ? "done" : aal?.nextLevel === "aal2" ? "code" : "setup");
    })();
    return () => { live = false; };
  }, [userId, recheck]);

  const waiting = <SiteLayout><div className="container-emis py-24 text-center text-muted-foreground"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></div></SiteLayout>;
  if (checking) return waiting;
  if (account && resetting) {
    return (
      <SiteLayout>
        <NewPassword
          email={account.email}
          onDone={() => {
            setResetting(false);
            navigate({ to: "/club-office", replace: true });
          }}
        />
      </SiteLayout>
    );
  }
  if (!account) return <SiteLayout><Login notice={notice} /></SiteLayout>;
  if (role === undefined || factor === undefined) return waiting;
  if (role === null) return <SiteLayout><NoAccess email={account.email} /></SiteLayout>;
  const again = () => setRecheck((n) => n + 1);
  if (factor === "setup") return <SiteLayout><SetUpTwoFactor email={account.email} onDone={again} /></SiteLayout>;
  if (factor === "code") return <SiteLayout><TwoFactorCode onDone={again} /></SiteLayout>;
  return <SiteLayout><AdminTabs role={role} /></SiteLayout>;
}

function NoAccess({ email }: { email: string }) {
  return (
    <div className="container-emis py-24 text-center">
      <h1 className="font-serif text-3xl text-navy">No admin access yet</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        You're signed in as <span className="font-medium text-foreground">{email}</span>, but this account doesn't have
        access yet. Ask an admin to give it access on the admin page's Access tab, then check again.
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button onClick={() => window.location.reload()} className="inline-flex h-10 items-center rounded-md bg-navy px-4 text-sm font-medium text-primary-foreground">
          Check again
        </button>
        <button onClick={() => supabase.auth.signOut()} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">
          Sign out
        </button>
      </div>
    </div>
  );
}

/** Tabs, and who sees them. Editors: events and reports. Admins: everything. */
const TABS = [
  { id: "analytics", label: "Analytics", admin: true },
  { id: "events", label: "Events", admin: false },
  { id: "reports", label: "Reports", admin: false },
  { id: "enquiries", label: "Sponsorship enquiries", admin: true },
  { id: "newsletter", label: "Newsletter", admin: true },
  { id: "applications", label: "Applications", admin: true },
  { id: "access", label: "Access", admin: true },
  { id: "backup", label: "Backup", admin: true },
] as const;

function AdminTabs({ role }: { role: Role }) {
  const tabs = TABS.filter((t) => role === "admin" || !t.admin);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>(role === "admin" ? "analytics" : "events");
  return (
    <div>
      {role === "admin" && backupDue() && tab !== "backup" && (
        <div className="container-wide pt-6">
          <p className="rounded-md border border-border bg-secondary px-4 py-2 text-sm">
            No backup from this browser in the last week.{" "}
            <button className="font-medium text-navy underline underline-offset-4" onClick={() => setTab("backup")}>
              Download one
            </button>
          </p>
        </div>
      )}
      <div className="container-wide flex flex-wrap items-center justify-between gap-4 pt-10">
        <div role="tablist" aria-label="Admin sections" className="flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`h-9 rounded-md px-4 text-sm ${tab === t.id ? "bg-navy text-primary-foreground" : "hover:bg-secondary"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={() => supabase.auth.signOut()} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      {tab === "applications" ? (
        <Dashboard />
      ) : (
        <div className="container-wide py-8">
          {tab === "analytics" && <AnalyticsManager />}
          {tab === "events" && <EventsManager />}
          {tab === "reports" && <ReportsManager />}
          {tab === "enquiries" && <EnquiriesManager />}
          {tab === "newsletter" && <NewsletterManager />}
          {tab === "access" && <AccessManager />}
          {tab === "backup" && <BackupManager />}
        </div>
      )}
    </div>
  );
}

const input = "h-11 w-full rounded-md border border-input bg-background px-3 text-sm";
const submitButton =
  "inline-flex h-11 w-full items-center justify-center rounded-md bg-navy text-sm font-medium text-primary-foreground disabled:opacity-60";
const textButton = "self-start text-left text-sm text-navy underline-offset-4 hover:underline";

type Mode = "sign-in" | "forgot" | "create";
const MODES: Record<Mode, { title: string; action: string }> = {
  "sign-in": { title: "Sign in", action: "Sign in" },
  forgot: { title: "Forgot your password?", action: "Email me a link" },
  create: { title: "Create your account", action: "Create account" },
};

function Login({ notice }: { notice: string | null }) {
  const [mode, setMode] = useState<Mode>(notice ? "forgot" : "sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const switchTo = (m: Mode) => {
    setMode(m);
    setSent(null);
    setPassword("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const here = `${window.location.origin}/club-office`;
    setBusy(true);
    if (mode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${here}?reset=1` });
      if (error) toast.error(error.message);
      else setSent(`If ${email} has an account, an email with a link to choose a new password is on its way. The link works once.`);
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: here } });
      if (error) toast.error(error.message);
      // When the address has to be confirmed first, there is no session until the email's link is opened.
      else if (!data.session) setSent(`Check ${email} for an email to confirm the address, and open its link. Then ask an admin to give your account access.`);
    }
    setBusy(false);
  }

  return (
    <div className="container-emis flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-2xl text-navy">{MODES[mode].title}</h1>
        </div>
        {notice && mode === "forgot" && !sent && <p className="rounded-md bg-secondary p-3 text-sm">{notice}</p>}
        {sent ? (
          <p role="status" className="text-sm">{sent}</p>
        ) : (
          <>
            {mode === "forgot" && <p className="text-sm text-muted-foreground">We'll email you a link to choose a new one.</p>}
            <input type="email" required autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            {mode !== "forgot" && (
              <input
                type="password"
                required
                minLength={mode === "create" ? 8 : undefined}
                autoComplete={mode === "create" ? "new-password" : "current-password"}
                placeholder={mode === "create" ? "Password, at least 8 characters" : "Password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
            )}
            <button disabled={busy} type="submit" className={submitButton}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : MODES[mode].action}
            </button>
          </>
        )}
        <div className="flex flex-col gap-1.5">
          {mode === "sign-in" ? (
            <>
              <button type="button" className={textButton} onClick={() => switchTo("forgot")}>Forgot your password?</button>
              <button type="button" className={textButton} onClick={() => switchTo("create")}>New admin? Create your account</button>
            </>
          ) : (
            <button type="button" className={textButton} onClick={() => switchTo("sign-in")}>Back to sign in</button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">For EMFC admins. A new account opens nothing until an admin gives it access.</p>
      </form>
    </div>
  );
}

function NewPassword({ email, onDone }: { email: string; onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== repeat) {
      toast.error("The two passwords are different.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("New password saved");
    onDone();
  }
  return (
    <div className="container-emis flex min-h-[60vh] items-center justify-center py-16">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-border bg-card p-8">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 font-serif text-2xl text-navy">Choose a new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">For {email}.</p>
        </div>
        <input type="password" required minLength={8} autoComplete="new-password" placeholder="New password, at least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
        <input type="password" required autoComplete="new-password" placeholder="The same password again" value={repeat} onChange={(e) => setRepeat(e.target.value)} className={input} />
        <button disabled={busy} type="submit" className={submitButton}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save password"}
        </button>
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
      try {
        const all = await readAll<Application>("applications");
        setApps(all.sort((a, b) => b.created_at.localeCompare(a.created_at)));
      } catch (err) {
        toast.error((err as Error).message);
      }
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
    // Applicants type these fields, so they are made safe to open in Excel (no formulas).
    const csv = toCsv(cols, filtered.map((r) => cols.map((c) => r[c])));
    downloadBlob(new Blob([csv], { type: "text/csv" }), `emfc-applications-${Date.now()}.csv`);
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
      downloadBlob(new Blob([zipped as BlobPart], { type: "application/zip" }), "ESADE_Finance_Club_CVs.zip");
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
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} showing, {apps.length} total</p>
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
                      <td className="p-3 text-xs">{a.desk_preference ?? "–"}</td>
                      <td className="p-3 text-xs">{a.program}, {a.graduation_year}</td>
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
                        ) : <span className="text-xs text-muted-foreground">–</span>}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr key={a.id + "-details"} className="border-t border-border bg-secondary/20">
                        <td></td>
                        <td colSpan={7} className="p-5">
                          <div className="grid gap-4 md:grid-cols-2">
                            <DetailField label="Full name" value={a.full_name} />
                            <DetailField label="Email" value={<a href={`mailto:${a.email}`} className="text-steel hover:underline">{a.email}</a>} />
                            <DetailField label="Program" value={`${a.program}, Class of ${a.graduation_year}`} />
                            <DetailField label="Nationality" value={a.nationality ?? "–"} />
                            <DetailField label="Department" value={deptName(a.department)} />
                            <DetailField label="Position type" value={a.position_type ?? "–"} />
                            <DetailField label="Team preference" value={a.desk_preference ?? "–"} />
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

