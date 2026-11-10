import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown, Instagram, Linkedin, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Giggle } from "@/components/fun/Giggle";
import { departments, type Department } from "@/lib/departments";
import { IMAGES, NAV_LINKS, SOCIAL } from "@/lib/site";
import { sized } from "@/lib/images";

/** Light and dark mode, or as the toggle calls them, a bull market and a bear market. */
function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("emfc-theme", next ? "dark" : "light");
    } catch {
      // Private mode: the choice just won't be remembered.
    }
    setDark(next);
    toast(next ? "Bear market" : "Bull market", {
      id: "theme",
      description: next ? "Lights down. Stay calm and hold." : "Lights up. Back to the bull.",
      duration: 2200,
    });
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode (bull market)" : "Switch to dark mode (bear market)"}
      title={dark ? "Bull market" : "Bear market"}
      className="flex h-11 w-11 items-center justify-center rounded-full text-[#E3E6EF] hover:bg-white/10"
    >
      {dark ? (
        <Sun className="h-[17px] w-[17px]" strokeWidth={1.6} />
      ) : (
        <Moon className="h-[17px] w-[17px]" strokeWidth={1.6} />
      )}
    </button>
  );
}

/** A department's desks, with Fixed Income's under their two groups. */
function deskGroups(d: Department) {
  if (!d.groups) return [{ name: undefined, desks: d.desks }];
  return d.groups.map((g) => ({
    name: g.name,
    desks: g.desks.map((slug) => d.desks.find((k) => k.slug === slug)!),
  }));
}

/**
 * Arrow keys inside the Departments menu: up and down go through a column's links (and on to the
 * next column), left and right jump to the neighbouring column, Home and End to the first and last link.
 */
function moveInMenu(e: React.KeyboardEvent<HTMLDivElement>) {
  const columns = Array.from(e.currentTarget.querySelectorAll("[data-menu-column]"), (c) =>
    Array.from(c.querySelectorAll<HTMLAnchorElement>("a")),
  );
  const col = columns.findIndex((c) => c.includes(document.activeElement as HTMLAnchorElement));
  if (col < 0) return;
  const row = columns[col].indexOf(document.activeElement as HTMLAnchorElement);
  const beside = (by: number) => columns[(col + by + columns.length) % columns.length];
  const moves: Record<string, () => HTMLElement | undefined> = {
    ArrowDown: () => columns[col][row + 1] ?? beside(1)[0],
    ArrowUp: () => columns[col][row - 1] ?? beside(-1).at(-1),
    ArrowRight: () => beside(1)[Math.min(row, beside(1).length - 1)],
    ArrowLeft: () => beside(-1)[Math.min(row, beside(-1).length - 1)],
    Home: () => columns[0][0],
    End: () => columns.at(-1)?.at(-1),
  };
  const target = moves[e.key]?.();
  if (!target) return;
  e.preventDefault();
  target.focus();
}

/** The wide Departments menu: one column per department, its desks under it. */
function DepartmentsMenu({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  return (
    <div
      id={id}
      onKeyDown={moveInMenu}
      className="absolute inset-x-0 top-full border-b border-white/20 bg-[#000B3D] text-left normal-case tracking-normal shadow-[0_24px_48px_rgb(0_0_0/0.25)]"
    >
      <div className="gutter grid grid-cols-6 gap-6 py-9 xl:gap-8">
        {departments.map((d) => (
          <div key={d.slug} data-menu-column className="flex flex-col gap-4">
            <Link
              to="/departments/$department"
              params={{ department: d.slug }}
              onClick={onNavigate}
              className="font-serif text-[22px]/[1.1] text-white underline-offset-4 hover:underline xl:text-2xl/[1.1]"
            >
              {d.name}
            </Link>
            {d.desks.length > 0 ? (
              <div className="flex flex-col gap-3">
                {deskGroups(d).map((g) => (
                  <ul key={g.name ?? d.slug} className="flex flex-col gap-2">
                    {g.name && (
                      <li className="font-serif text-[15px] italic text-bull-light">{g.name}</li>
                    )}
                    {g.desks.map((k) => (
                      <li key={k.slug}>
                        <Link
                          to="/departments/$department/$desk"
                          params={{ department: d.slug, desk: k.slug }}
                          onClick={onNavigate}
                          className="caps text-[10.5px]/[1.5] tracking-[0.14em] text-[#C9CEDD] underline-offset-4 hover:text-white hover:underline"
                        >
                          {k.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            ) : (
              <p className="text-[13px]/[1.55] text-[#A9B0C6]">{d.function}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Site menu bar. With `overlay` it sits transparently on top of the hero photo
 * (used on the homepage); otherwise it is a solid navy bar that sticks to the top.
 */
export function Nav({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mobileDepartments, setMobileDepartments] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const menuRef = useRef<HTMLDivElement>(null);

  // Hover opens after a short pause and closes a moment after leaving, so the menu doesn't flicker.
  const hover = (next: boolean) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMenu(next), next ? 90 : 160);
  };

  useEffect(() => {
    setMenu(false);
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu(false);
        menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [menu]);

  const handleNav = (to: string) => (e: React.MouseEvent) => {
    if (pathname === to) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpen(false);
    setMenu(false);
  };

  const linkClass = "flex h-11 items-center px-1.5 underline-offset-8 xl:px-2.5";
  const active = { className: "text-white underline decoration-bull-light" };
  const inactive = { className: "text-[#E3E6EF] hover:underline" };

  return (
    <header
      className={cn(
        "z-50 text-white",
        overlay ? "absolute inset-x-0 top-0" : "sticky top-0 bg-[#000B3D]",
        (open || menu) && "bg-[#000B3D]",
      )}
    >
      <div className="gutter flex h-[72px] items-center justify-between border-b border-white/20 lg:h-[88px]">
        <Link
          to="/"
          onClick={handleNav("/")}
          aria-label="EMFC home"
          className="group/logo flex animate-logo-in items-center gap-3 lg:gap-3.5"
        >
          <img
            {...sized(IMAGES.bullMark, "52px")}
            alt=""
            width={560}
            height={510}
            className="h-10 w-auto transition-transform duration-500 ease-out lg:h-[46px] group-hover/logo:-translate-y-0.5 group-hover/logo:-rotate-6 group-hover/logo:scale-105"
          />
          <span className="font-serif text-[28px]/none font-semibold tracking-[0.08em] lg:text-[34px]/none">
            EMFC
          </span>
          <span className="hidden h-[30px] w-px bg-white/40 sm:block lg:hidden 2xl:block" />
          <span className="caps hidden text-[10px]/[1.5] tracking-[0.22em] text-[#E3E6EF] sm:block lg:hidden 2xl:block">
            ESADE Master's
            <br />
            Finance Club
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="caps hidden items-center gap-0.5 text-[11px] tracking-[0.14em] lg:flex xl:gap-1 xl:text-xs xl:tracking-[0.16em]"
        >
          {NAV_LINKS.map((l) =>
            "menu" in l ? (
              <div
                key={l.to}
                ref={menuRef}
                className="flex items-center"
                onMouseEnter={() => hover(true)}
                onMouseLeave={() => hover(false)}
                onFocus={(e) => {
                  // Keyboard focus arriving from outside opens the menu; a mouse click on the chevron just
                  // toggles it, and focus coming back from the menu (after Escape) leaves it closed.
                  if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                  if ((e.target as HTMLElement).matches(":focus-visible")) setMenu(true);
                }}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setMenu(false);
                }}
                onKeyDown={(e) => {
                  // Down arrow on "Departments" or its chevron opens the menu and moves into it.
                  if (e.key !== "ArrowDown" || (e.target as HTMLElement).closest("#departments-menu")) return;
                  e.preventDefault();
                  flushSync(() => setMenu(true));
                  document.querySelector<HTMLAnchorElement>("#departments-menu a")?.focus();
                }}
              >
                <Link
                  to={l.to}
                  onClick={handleNav(l.to)}
                  activeProps={active}
                  inactiveProps={inactive}
                  className={cn(linkClass, "pr-1 xl:pr-1")}
                >
                  {l.label}
                </Link>
                <button
                  type="button"
                  aria-expanded={menu}
                  aria-controls="departments-menu"
                  aria-label={menu ? "Close the departments menu" : "Open the departments menu"}
                  onClick={() => setMenu((m) => !m)}
                  className="flex h-11 w-7 items-center justify-center text-[#E3E6EF] hover:text-white"
                >
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 transition-transform", menu && "rotate-180")}
                    strokeWidth={1.75}
                  />
                </button>
                {menu && <DepartmentsMenu id="departments-menu" onNavigate={() => setMenu(false)} />}
              </div>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                onClick={handleNav(l.to)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={active}
                inactiveProps={inactive}
                className={cn(linkClass, "giggle" in l && "group")}
              >
                {"giggle" in l ? <Giggle text={l.label} /> : l.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-0.5">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="EMFC on Instagram"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-[#E3E6EF] hover:bg-white/10 sm:flex lg:hidden 2xl:flex"
          >
            <Instagram className="h-[17px] w-[17px]" strokeWidth={1.6} />
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="EMFC on LinkedIn"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-[#E3E6EF] hover:bg-white/10 sm:flex lg:hidden 2xl:flex"
          >
            <Linkedin className="h-[17px] w-[17px]" strokeWidth={1.6} />
          </a>
          <ThemeToggle />
          <button
            type="button"
            className="ml-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <X className="h-[18px] w-[18px]" strokeWidth={1.5} />
            ) : (
              <Menu className="h-[18px] w-[18px]" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      {open && (
        <nav
          aria-label="Mobile"
          className="gutter flex flex-col border-b border-white/20 bg-[#000B3D] pb-6 pt-2 lg:hidden"
        >
          {NAV_LINKS.map((l) =>
            "menu" in l ? (
              <div key={l.to} className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Link
                    to={l.to}
                    onClick={handleNav(l.to)}
                    activeProps={{ className: "text-bull-light" }}
                    className="py-4 font-serif text-3xl"
                  >
                    {l.label}
                  </Link>
                  <button
                    type="button"
                    aria-expanded={mobileDepartments}
                    aria-controls="mobile-departments"
                    aria-label={mobileDepartments ? "Hide the departments" : "Show the departments"}
                    onClick={() => setMobileDepartments((v) => !v)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30"
                  >
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", mobileDepartments && "rotate-180")}
                      strokeWidth={1.6}
                    />
                  </button>
                </div>
                {mobileDepartments && (
                  <ul id="mobile-departments" className="flex flex-col gap-5 pb-6 pl-1">
                    {departments.map((d) => (
                      <li key={d.slug} className="flex flex-col gap-2.5">
                        <Link
                          to="/departments/$department"
                          params={{ department: d.slug }}
                          onClick={() => setOpen(false)}
                          className="font-serif text-2xl"
                        >
                          {d.name}
                        </Link>
                        {d.desks.length > 0 && (
                          <div className="flex flex-wrap gap-x-4 gap-y-2">
                            {d.desks.map((k) => (
                              <Link
                                key={k.slug}
                                to="/departments/$department/$desk"
                                params={{ department: d.slug, desk: k.slug }}
                                onClick={() => setOpen(false)}
                                className="caps text-[10.5px] tracking-[0.14em] text-[#C9CEDD]"
                              >
                                {k.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                onClick={handleNav(l.to)}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-bull-light" }}
                className={cn(
                  "border-b border-white/10 py-4 font-serif text-3xl",
                  "giggle" in l && "group",
                )}
              >
                {"giggle" in l ? <Giggle text={l.label} /> : l.label}
              </Link>
            ),
          )}
          <div className="mt-5 flex gap-2">
            <a
              href={SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-white flex-1"
            >
              Instagram
            </a>
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm btn-outline-white flex-1"
            >
              LinkedIn
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
