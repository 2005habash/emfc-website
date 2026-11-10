import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin } from "lucide-react";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { IMAGES, SOCIAL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="overflow-hidden bg-[#02082A] text-mist">
      <div className="gutter flex flex-col gap-12 pb-9 pt-16 lg:gap-14 lg:pt-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-4">
            <div className="flex items-center gap-3.5">
              <img src={IMAGES.bullMark} alt="" className="h-[52px] w-auto transition-transform duration-500 hover:-translate-y-0.5 hover:-rotate-6" />
              <span className="font-serif text-[40px]/none font-semibold tracking-[0.08em] text-white">
                EMFC
              </span>
            </div>
            <p className="max-w-[420px] text-[15px]/[1.7]">
              The ESADE Master's Finance Club. A community at ESADE Business School built around
              careers, companies and the people you meet along the way.
            </p>
            <span className="caps text-[10.5px] tracking-[0.22em] text-haze">
              ESADE Business School, Barcelona
            </span>
          </div>

          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-8 text-[15px] lg:col-span-3 lg:col-start-6"
          >
            <div className="flex flex-col gap-2.5">
              <span className="caps mb-1.5 text-[10.5px] tracking-[0.22em] text-bull-light">
                Club
              </span>
              <Link to="/" className="hover:text-white hover:underline">
                Home
              </Link>
              <Link to="/departments" className="hover:text-white hover:underline">
                Departments
              </Link>
              <Link to="/team" className="hover:text-white hover:underline">
                Team
              </Link>
              <Link to="/fund" className="hover:text-white hover:underline">
                The EMFC Fund
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="caps mb-1.5 text-[10.5px] tracking-[0.22em] text-bull-light">
                Members
              </span>
              <Link to="/events" className="hover:text-white hover:underline">
                Events
              </Link>
              <Link to="/resources" className="hover:text-white hover:underline">
                Resources
              </Link>
              <Link to="/play" className="hover:text-white hover:underline">
                Off the clock
              </Link>
              <Link to="/glossary" className="hover:text-white hover:underline">
                Glossary
              </Link>
              <Link to="/sponsorship" className="hover:text-white hover:underline">
                Sponsorship
              </Link>
            </div>
          </nav>

          <div className="flex flex-col gap-5 md:col-span-2 lg:col-span-4 lg:col-start-9">
            <NewsletterForm dark label="Newsletter" />
            <div className="flex items-center gap-1">
              <a
                href={SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="EMFC on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 hover:text-white"
              >
                <Instagram className="h-5 w-5" strokeWidth={1.6} />
              </a>
              <a
                href={SOCIAL.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="EMFC on LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10 hover:text-white"
              >
                <Linkedin className="h-5 w-5" strokeWidth={1.6} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div
            aria-hidden
            className="font-serif text-[13vw]/none italic tracking-[-0.01em] whitespace-nowrap text-bull md:text-[7.4vw]/none min-[1440px]:text-[104px]/none"
          >
            <span className="md:hidden">EMFC</span>
            <span className="hidden md:inline">ESADE Master's Finance Club</span>
          </div>
          <div className="caps flex flex-col gap-2 border-t border-[#1B2560] pt-5 text-[10px] tracking-[0.2em] text-haze md:flex-row md:justify-between">
            <span>© {new Date().getFullYear()} EMFC, ESADE Master's Finance Club</span>
            <span className="flex flex-wrap gap-x-6 gap-y-2">
              <Link to="/privacy" className="hover:text-white hover:underline">
                Privacy
              </Link>
              <span>Launched September 2026</span>
              <span>Not investment advice</span>
              {/* The admin page's sign-in, kept quiet: same colour as the text around it until hovered. */}
              <Link to="/club-office" className="hover:text-white hover:underline">
                Admin
              </Link>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
