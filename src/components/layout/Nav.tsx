import { Link, useRouterState } from "@tanstack/react-router";
import { Instagram, Linkedin, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IMAGES, NAV_LINKS, SOCIAL } from "@/lib/site";

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
  };
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
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

/**
 * Site menu bar. With `overlay` it sits transparently on top of the hero photo
 * (used on the homepage); otherwise it is a solid navy bar that sticks to the top.
 */
export function Nav({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const handleNav = (to: string) => (e: React.MouseEvent) => {
    if (pathname === to) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setOpen(false);
  };

  return (
    <header
      className={cn(
        "z-50 text-white",
        overlay ? "absolute inset-x-0 top-0" : "sticky top-0 bg-[#030C3B]",
        open && "bg-[#030C3B]",
      )}
    >
      <div className="gutter flex h-[72px] items-center justify-between border-b border-white/20 lg:h-[88px]">
        <Link
          to="/"
          onClick={handleNav("/")}
          aria-label="EMFC home"
          className="flex animate-logo-in items-center gap-3 lg:gap-3.5"
        >
          <img src={IMAGES.bullMark} alt="" className="h-10 w-auto lg:h-[46px]" />
          <span className="font-serif text-[28px]/none font-semibold tracking-[0.08em] lg:text-[34px]/none">
            EMFC
          </span>
          <span className="hidden h-[30px] w-px bg-white/40 sm:block lg:hidden xl:block" />
          <span className="caps hidden text-[9px]/[1.5] tracking-[0.22em] text-[#E3E6EF] sm:block lg:hidden xl:block xl:text-[10px]/[1.5]">
            ESADE Master's
            <br />
            Finance Club
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="caps hidden items-center gap-1 text-[11px] tracking-[0.18em] lg:flex xl:gap-1.5 xl:text-xs"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={handleNav(l.to)}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-white underline decoration-brass-light" }}
              inactiveProps={{ className: "text-[#E3E6EF] hover:underline" }}
              className="flex h-11 items-center px-2.5 underline-offset-8 xl:px-3.5"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="EMFC on Instagram"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-[#E3E6EF] hover:bg-white/10 sm:flex"
          >
            <Instagram className="h-[17px] w-[17px]" strokeWidth={1.6} />
          </a>
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noreferrer"
            aria-label="EMFC on LinkedIn"
            className="hidden h-11 w-11 items-center justify-center rounded-full text-[#E3E6EF] hover:bg-white/10 sm:flex"
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
          className="gutter flex flex-col border-b border-white/20 bg-[#030C3B] pb-6 pt-2 lg:hidden"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={handleNav(l.to)}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "text-brass-light" }}
              className="border-b border-white/10 py-4 font-serif text-3xl"
            >
              {l.label}
            </Link>
          ))}
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
