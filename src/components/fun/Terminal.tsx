import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EVENTS, type EventItem } from "@/data/events";
import { MEMBERS } from "@/data/members";
import { REPORTS, type Report } from "@/data/reports";
import { STATS } from "@/data/stats";
import { loadEvents, loadReports } from "@/lib/content";
import { departments } from "@/lib/departments";
import { formatDay, NEXT_INTAKE_OPENS, safeUrl, SOCIAL, todayInBarcelona } from "@/lib/site";
import type { Member } from "@/lib/team";
import { cn } from "@/lib/utils";
import {
  barcelonaTime,
  euronextOpen,
  isDark,
  onOpenTerminal,
  setTheme,
  startBullRun,
} from "./signals";

/**
 * The EMFC Terminal: press "/" anywhere (or the terminal button in the menu bar) for a command line in
 * the spirit of a trading terminal. It finds members, desks, events and reports, opens any page, prints
 * the club's real figures (DES) and hides a few jokes. Everything it shows comes from the site's data.
 */

type Target =
  | {
      to:
        | "/"
        | "/team"
        | "/events"
        | "/resources"
        | "/fund"
        | "/sponsorship"
        | "/departments"
        | "/privacy";
      hash?: string;
    }
  | { to: "/departments/$department"; params: { department: string }; hash?: string }
  | {
      to: "/departments/$department/$desk";
      params: { department: string; desk: string };
      hash?: string;
    }
  | { to: "/events/$eventId"; params: { eventId: string } };

type Tone = "cmd" | "out" | "dim" | "accent";
type Line = { id: number; tone: Tone; content: ReactNode };

/** Desk mnemonics, the way a terminal names its screens. */
const DESK_CODES: Record<string, [string, string]> = {
  MA: ["investment-banking", "m-and-a"],
  DA: ["investment-banking", "debt-advisory"],
  PE: ["private-markets", "private-equity"],
  VC: ["private-markets", "vc-and-growth"],
  FT: ["private-markets", "fintech"],
  RA: ["private-markets", "real-assets"],
  MACRO: ["asset-management", "macro-and-strategy"],
  ER: ["asset-management", "equity-research"],
  PM: ["asset-management", "portfolio-management"],
  RATES: ["fixed-income", "rates-and-government-bonds"],
  IG: ["fixed-income", "investment-grade-credit"],
  HY: ["fixed-income", "high-yield-credit"],
  MBS: ["fixed-income", "mortgage-backed-securities"],
  PC: ["fixed-income", "private-credit"],
  DL: ["fixed-income", "direct-lending"],
};
const DEPARTMENT_CODES: Record<string, string> = {
  IB: "investment-banking",
  PMKT: "private-markets",
  AM: "asset-management",
  FI: "fixed-income",
  CR: "corporate-relations",
  MKTG: "marketing",
};
const codeOfDesk = (department: string, desk: string) =>
  Object.entries(DESK_CODES).find(([, [d, k]]) => d === department && k === desk)?.[0];

const PAGES: Record<string, Target> = {
  HOME: { to: "/" },
  TEAM: { to: "/team" },
  DEPARTMENTS: { to: "/departments" },
  EVENTS: { to: "/events" },
  RESOURCES: { to: "/resources" },
  RESEARCH: { to: "/resources", hash: "research" },
  PREP: { to: "/resources", hash: "technicals" },
  FUND: { to: "/fund" },
  SPONSOR: { to: "/sponsorship" },
  PRIVACY: { to: "/privacy" },
  QUIZ: { to: "/departments", hash: "quiz" },
  LBO: {
    to: "/departments/$department/$desk",
    params: { department: "private-markets", desk: "private-equity" },
    hash: "paper-lbo",
  },
};
const ALIASES: Record<string, string> = {
  RES: "RESEARCH",
  REPORTS: "RESEARCH",
  LIB: "RESEARCH",
  EVT: "EVENTS",
  SPONSORSHIP: "SPONSOR",
  DEPTS: "DEPARTMENTS",
  DESKS: "DEPARTMENTS",
  TECH: "PREP",
  TECHNICALS: "PREP",
  FLASH: "PREP",
  INTERVIEW: "PREP",
  CLS: "CLEAR",
  QUIT: "EXIT",
  Q: "EXIT",
  CLOSE: "EXIT",
  APPLY: "JOIN",
  "?": "HELP",
  TIME: "CLOCK",
  DATE: "CLOCK",
};

/** Lower case without accents, so "luis" finds Luís. */
const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const memberTarget = (m: Member): Target =>
  m.desk && departments.some((d) => d.slug === m.department)
    ? { to: "/departments/$department/$desk", params: { department: m.department, desk: m.desk } }
    : departments.some((d) => d.slug === m.department)
      ? { to: "/departments/$department", params: { department: m.department } }
      : { to: "/team" };

function useClock(active: boolean) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

export function Terminal() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const pending = useRef<string | undefined>(undefined);
  const now = useClock(open);

  const print = (content: ReactNode, tone: Tone = "out") =>
    setLines((l) => [...l, { id: nextId.current++, tone, content }]);

  const go = (target: Target) => {
    setOpen(false);
    navigate(target as never);
  };

  const today = todayInBarcelona();
  // The same events and reports as the pages: the database's, or the bundled lists if it can't answer.
  const [events, setEvents] = useState<EventItem[]>(EVENTS);
  const [allReports, setReports] = useState<Report[]>(REPORTS);
  useEffect(() => {
    if (!open) return;
    loadEvents()
      .then(setEvents)
      .catch(() => {});
    loadReports()
      .then(setReports)
      .catch(() => {});
  }, [open]);
  const publishedReports = allReports.filter((r) => r.status === "published");
  const held = events.filter((e) => e.date <= today).length;

  const welcome = () => {
    print(
      <span className="text-white">EMFC Terminal 1.0, ESADE Master&apos;s Finance Club</span>,
      "out",
    );
    print(
      <>
        Type <Run cmd="HELP" run={run} /> and press Enter, or any member&apos;s name.{" "}
        <Run cmd="DES" run={run} /> prints the club&apos;s numbers.
      </>,
      "dim",
    );
  };

  // Open on request from anywhere on the site, optionally running a command straight away.
  useEffect(
    () =>
      onOpenTerminal((command) => {
        pending.current = command;
        setOpen(true);
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    if (lines.length === 0) welcome();
    if (pending.current) {
      const c = pending.current;
      pending.current = undefined;
      run(c);
    }
    // Only when the terminal opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function help() {
    const row = (label: string, cmds: string[], note?: string) => (
      <span className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 sm:grid-cols-[104px_minmax(0,1fr)]">
        <span className="text-haze">{label}</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1">
          {cmds.map((c) => (
            <Run key={c} cmd={c} run={run} />
          ))}
          {note && <span className="text-haze">{note}</span>}
        </span>
      </span>
    );
    print(
      <span className="flex flex-col gap-1.5">
        {row("Pages", ["HOME", "TEAM", "DEPARTMENTS", "EVENTS", "RESEARCH", "FUND", "SPONSOR"])}
        {row("Desks", Object.keys(DESK_CODES))}
        {row("Departments", Object.keys(DEPARTMENT_CODES))}
        {row("The club", ["DES", "NEXT", "JOIN", "CLOCK"])}
        {row("Play", ["QUIZ", "LBO", "PREP", "BULL", "BEAR"])}
        {row("Terminal", ["CLEAR", "EXIT"], "Up and down for history, Tab to complete.")}
      </span>,
    );
    print("Or type a name: a member, a desk, an event or a report.", "dim");
  }

  function describe() {
    const rows: [string, string][] = [
      ["Name", "ESADE Master's Finance Club"],
      ["Listed", "2026, ESADE Business School, Barcelona"],
      ["Members", `${STATS.members}, from ${STATS.nationalities} nationalities`],
      ["International", `${STATS.internationalPct}% from outside Spain`],
      ["Experience", `${STATS.experiencePct}% with professional experience`],
      ["Internships", `${STATS.internships}+ completed between them`],
      ["Firms", `${STATS.firms} where members have worked`],
      ["Structure", `${STATS.departments} departments, ${STATS.desks} desks`],
      ["Events held", String(held)],
      ["Reports", `${publishedReports.length} published`],
    ];
    print(
      <span className="flex flex-col">
        <span className="mb-1.5 text-white">EMFC Equity, description</span>
        {rows.map(([k, v]) => (
          <span key={k} className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
            <span className="text-haze">{k}</span>
            <span>{v}</span>
          </span>
        ))}
      </span>,
    );
  }

  function nextEvent() {
    const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
    const next = sorted.find((e) => e.date >= today);
    const e = next ?? sorted.at(-1);
    if (!e) return print("No events on the calendar yet.", "dim");
    print(
      <>
        {next ? "Next event" : "Nothing new on the calendar yet. The latest event"}:{" "}
        {formatDay(e.date)},{" "}
        <Go onClick={() => go({ to: "/events/$eventId", params: { eventId: e.id } })}>{e.title}</Go>
      </>,
    );
  }

  function join() {
    if (NEXT_INTAKE_OPENS && new Date(NEXT_INTAKE_OPENS).getTime() > Date.now()) {
      print(`Applications open on ${formatDay(NEXT_INTAKE_OPENS.slice(0, 10))}. Set an alarm.`);
    } else {
      print("Applications are closed for now. Recruiting reopens next term.");
    }
    print(
      <>
        Follow EMFC on{" "}
        <a
          href={SOCIAL.linkedin}
          target="_blank"
          rel="noreferrer"
          className="text-bull-light underline underline-offset-4"
        >
          LinkedIn
        </a>{" "}
        so you don&apos;t miss the window.
      </>,
      "dim",
    );
  }

  function search(query: string) {
    const q = fold(query);
    const words = q.split(/\s+/).filter(Boolean);
    const hit = (text: string) => words.every((w) => fold(text).includes(w));

    // A desk or department typed in full goes straight there.
    for (const d of departments) {
      if (fold(d.name) === q)
        return go({ to: "/departments/$department", params: { department: d.slug } });
      const k = d.desks.find((x) => fold(x.name) === q);
      if (k)
        return go({
          to: "/departments/$department/$desk",
          params: { department: d.slug, desk: k.slug },
        });
    }

    const people = MEMBERS.filter((m) => hit(m.displayName ?? m.name)).slice(0, 6);
    const desks = departments
      .flatMap((d) => d.desks.filter((k) => hit(k.name)).map((k) => ({ d, k })))
      .slice(0, 4);
    const eventHits = events.filter((e) => hit(e.title)).slice(0, 4);
    const reports = publishedReports.filter((r) => hit(`${r.title} ${r.series}`)).slice(0, 4);
    const total = people.length + desks.length + eventHits.length + reports.length;
    if (!total) {
      print(
        <>
          No match for &ldquo;{query}&rdquo;. Type <Run cmd="HELP" run={run} /> for the commands.
        </>,
        "dim",
      );
      return;
    }
    print(`${total} ${total === 1 ? "match" : "matches"}`, "dim");
    for (const m of people) {
      const url = safeUrl(m.linkedin);
      print(
        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <Go onClick={() => go(memberTarget(m))}>{m.displayName ?? m.name}</Go>
          <span className="text-haze">{m.title}</span>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              data-linkedin-of={m.slug}
              className="text-bull-light underline underline-offset-4"
            >
              LinkedIn
            </a>
          )}
        </span>,
      );
    }
    for (const { d, k } of desks) {
      print(
        <span className="flex flex-wrap items-baseline gap-x-3">
          <Go
            onClick={() =>
              go({
                to: "/departments/$department/$desk",
                params: { department: d.slug, desk: k.slug },
              })
            }
          >
            {k.name}
          </Go>
          <span className="text-haze">
            {d.name} desk{codeOfDesk(d.slug, k.slug) ? `, code ${codeOfDesk(d.slug, k.slug)}` : ""}
          </span>
        </span>,
      );
    }
    for (const e of eventHits) {
      print(
        <span className="flex flex-wrap items-baseline gap-x-3">
          <Go onClick={() => go({ to: "/events/$eventId", params: { eventId: e.id } })}>
            {e.title}
          </Go>
          <span className="text-haze">{formatDay(e.date, { month: "short" })}</span>
        </span>,
      );
    }
    for (const r of reports) {
      const href = safeUrl(r.file) ?? safeUrl(r.link);
      print(
        <span className="flex flex-wrap items-baseline gap-x-3">
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-white underline-offset-4 hover:underline"
            >
              {r.title}
            </a>
          ) : (
            <span className="text-white">{r.title}</span>
          )}
          <span className="text-haze">{r.series}</span>
        </span>,
      );
    }
  }

  function run(raw: string) {
    const text = raw.trim();
    if (!text) return;
    print(text, "cmd");
    setHistory((h) => [...h.filter((x) => x !== text), text].slice(-30));
    setCursor(-1);
    // "<GO>" is how a trading terminal says Enter; it works here too.
    const clean = text.replace(/(\s*<\s*go\s*>|\s+go)$/i, "").trim() || text;
    const [head, ...rest] = clean.split(/\s+/);
    let name = head.toUpperCase();
    name = ALIASES[name] ?? name;
    const args = rest.join(" ");

    if (Object.hasOwn(PAGES, name) && !args) return go(PAGES[name]);
    if (Object.hasOwn(DESK_CODES, name) && !args) {
      const [department, desk] = DESK_CODES[name];
      return go({ to: "/departments/$department/$desk", params: { department, desk } });
    }
    if (Object.hasOwn(DEPARTMENT_CODES, name) && !args) {
      return go({ to: "/departments/$department", params: { department: DEPARTMENT_CODES[name] } });
    }

    switch (name) {
      case "HELP":
        return help();
      case "DES":
        return describe();
      case "NEXT":
        return nextEvent();
      case "JOIN":
        return join();
      case "CLEAR":
        return setLines([]);
      case "EXIT":
        return setOpen(false);
      case "CLOCK":
        return print(
          `Barcelona ${barcelonaTime(new Date(), true)}. Euronext is ${euronextOpen() ? "open" : "closed"}.`,
        );
      case "BULL":
        print("Releasing the bulls.", "accent");
        setTimeout(() => {
          setOpen(false);
          startBullRun();
        }, 350);
        return;
      case "BEAR":
      case "DARK":
        if (isDark()) return print("Already a bear market. Type LIGHT for the bulls.", "dim");
        setTheme(true);
        return print("Bear market. Lights down.", "accent");
      case "LIGHT":
        if (!isDark()) return print("Already a bull market. Type BEAR to dim the lights.", "dim");
        setTheme(false);
        return print("Bull market. Lights up.", "accent");
      case "THEME":
        setTheme(!isDark());
        return print(isDark() ? "Bear market. Lights down." : "Bull market. Lights up.", "accent");
      case "LS":
        return print(
          <span className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              "HOME",
              "TEAM",
              "DEPARTMENTS",
              "EVENTS",
              "RESOURCES",
              "FUND",
              "SPONSOR",
              "PRIVACY",
            ].map((p) => (
              <Run key={p} cmd={p} run={run} label={p.toLowerCase()} />
            ))}
          </span>,
        );
      case "CD": {
        const page = ALIASES[args.toUpperCase()] ?? args.toUpperCase().replace(/^\//, "");
        if (!args || page === "~" || page === "") return go({ to: "/" });
        if (Object.hasOwn(PAGES, page)) return go(PAGES[page]);
        return print(`cd: no such page: ${args}`, "dim");
      }
      case "WHOAMI":
        return print("guest@emfc. A future Associate, by the look of it.");
      case "SUDO":
        return print("Permission denied. Seniority is earned here: try JOIN.", "dim");
      case "HIRE":
      case "HIREME":
        return print("Flattered. Applications open with the next intake: try JOIN.");
      case "COFFEE":
        return print(
          "Brewing... ready. The coffee chats with professionals are on the EVENTS page.",
        );
      case "MOON":
        return print("To the moon? We prefer fundamentals. Try DES.", "dim");
      case "PING":
        return print("PONG");
      case "HELLO":
      case "HI":
      case "HOLA":
        return print("Hola. Type HELP to see what this terminal can do.");
    }
    search(clean);
  }

  // Completions for what is being typed: commands first, then people.
  const suggestions = useMemo(() => {
    const t = input.trim();
    if (!t) return [];
    const up = t.toUpperCase();
    const commands = [
      ...Object.keys(PAGES),
      ...Object.keys(DESK_CODES),
      ...Object.keys(DEPARTMENT_CODES),
      "HELP",
      "DES",
      "NEXT",
      "JOIN",
      "BULL",
      "BEAR",
      "CLEAR",
      "EXIT",
      "CLOCK",
    ].filter((c) => c.startsWith(up) && c !== up);
    // People whose first or last name starts with what is typed come first.
    const q = fold(t);
    const starts = (name: string) =>
      fold(name)
        .split(/\s+/)
        .some((w) => w.startsWith(q));
    const people =
      t.length >= 2
        ? MEMBERS.map((m) => m.displayName ?? m.name)
            .filter((name) => fold(name).includes(q))
            .sort((a, b) => Number(starts(b)) - Number(starts(a)))
        : [];
    return [...commands.slice(0, 4), ...people.slice(0, 4)].slice(0, 6);
  }, [input]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [lines, suggestions.length]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = input;
      setInput("");
      run(value);
    } else if (e.key === "Tab" && suggestions.length) {
      e.preventDefault();
      setInput(suggestions[0]);
    } else if (e.key === "ArrowUp" && history.length) {
      e.preventDefault();
      const i = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(i);
      setInput(history[i]);
    } else if (e.key === "ArrowDown" && cursor >= 0) {
      e.preventDefault();
      const i = cursor + 1;
      if (i >= history.length) {
        setCursor(-1);
        setInput("");
      } else {
        setCursor(i);
        setInput(history[i]);
      }
    }
  }

  const tone: Record<Tone, string> = {
    cmd: "text-white",
    out: "text-mist",
    dim: "text-haze",
    accent: "text-bull-light",
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[70] bg-[rgb(2_8_42/0.55)] backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className={cn(
            "fixed z-[71] flex flex-col overflow-hidden bg-deep font-mono text-mist shadow-[0_30px_80px_rgb(0_0_0/0.45)] outline-none",
            "inset-0 sm:inset-auto sm:left-1/2 sm:top-[10vh] sm:h-[min(600px,80vh)] sm:w-[min(800px,calc(100vw-48px))] sm:-translate-x-1/2 sm:rounded-[6px] sm:border sm:border-white/15",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-2",
          )}
        >
          <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.03] py-2.5 pl-4 pr-2 sm:pl-5">
            <DialogPrimitive.Title className="flex items-center gap-2.5 text-[12px] font-medium uppercase tracking-[0.16em] text-white">
              <img src="/images/logo/bull-mark.png" alt="" className="h-5 w-auto" />
              EMFC Terminal
            </DialogPrimitive.Title>
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.12em] text-haze">
              {now && (
                <span className="hidden items-center gap-2 sm:flex" aria-hidden>
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      euronextOpen(now) ? "bg-bull-light" : "bg-haze/50",
                    )}
                  />
                  BCN {barcelonaTime(now, true)}
                </span>
              )}
              <DialogPrimitive.Close
                aria-label="Close the terminal"
                className="flex h-10 w-10 items-center justify-center rounded-full text-mist hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </DialogPrimitive.Close>
            </div>
          </div>
          <DialogPrimitive.Description className="sr-only">
            A command line for the EMFC website. Type HELP for the list of commands.
          </DialogPrimitive.Description>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 overflow-y-auto px-4 py-4 text-[13px]/[1.65] sm:px-5 sm:text-[13.5px]/[1.7]"
            onClick={(e) => {
              if (!(e.target as HTMLElement).closest("a,button")) inputRef.current?.focus();
            }}
          >
            {lines.map((l) => (
              <div key={l.id} className={cn("break-words py-0.5", tone[l.tone])}>
                {l.tone === "cmd" && <span className="mr-2 text-bull-light">EMFC&gt;</span>}
                {l.content}
              </div>
            ))}
          </div>

          <div className="border-t border-white/10">
            {suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 px-4 pt-3 sm:px-5" aria-label="Suggestions">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setInput("");
                      run(s);
                      inputRef.current?.focus();
                    }}
                    className="rounded-[3px] border border-white/15 px-2 py-1 text-[12px] text-mist hover:border-bull-light hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 px-4 py-3.5 sm:px-5">
              <span className="text-[13.5px] text-bull-light" aria-hidden>
                EMFC&gt;
              </span>
              <span className="sr-only">Command</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                placeholder="Type a command, or HELP"
                className="min-w-0 flex-1 bg-transparent text-base text-white caret-bull-light outline-none placeholder:text-haze/70 sm:text-[14px]"
              />
              <button
                type="button"
                onClick={() => {
                  const v = input;
                  setInput("");
                  run(v || "HELP");
                  inputRef.current?.focus();
                }}
                className="rounded-[3px] bg-bull-light px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-deep hover:brightness-110"
              >
                Go
              </button>
            </label>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3.5 sm:hidden">
              {["HELP", "DES", "TEAM", "QUIZ", "LBO", "BULL"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => run(c)}
                  className="shrink-0 rounded-[3px] border border-white/15 px-2.5 py-1.5 text-[12px] text-mist"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/** A command printed in the terminal that runs when clicked. */
function Run({ cmd, run, label }: { cmd: string; run: (c: string) => void; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => run(cmd)}
      className="text-bull-light underline decoration-bull-light/40 underline-offset-4 hover:text-white hover:decoration-white"
    >
      {label ?? cmd}
    </button>
  );
}

/** A result that opens a page when clicked. */
function Go({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-white underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );
}
