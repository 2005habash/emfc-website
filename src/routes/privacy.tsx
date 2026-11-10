import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Em, Eyebrow } from "@/components/site/ui";
import { SOCIAL } from "@/lib/site";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy, EMFC" },
      { name: "description", content: "What the ESADE Master's Finance Club collects through this website, and why." },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    title: "Who we are",
    body: "The ESADE Master's Finance Club (EMFC) is a student club at ESADE Business School in Barcelona, run by its members.",
  },
  {
    title: "Newsletter",
    body: "When you sign up, we keep your email address and the date you signed up, to send you news about EMFC and our upcoming events. We only add you with your consent, and you can unsubscribe from any email we send.",
  },
  {
    title: "Sponsorship enquiries",
    body: "When a firm writes to us through the sponsorship form, we keep the name, firm, email and message so the Co-Presidents and the Head of Corporate Relations can reply. We use them for nothing else.",
  },
  {
    title: "Members on this site",
    body: "Member profiles show only what members agreed to share: name, photo, role, programme, LinkedIn and up to three firms. Statistics about the club are totals and never describe one person.",
  },
  {
    title: "Visit counts",
    body: "To see which pages and profiles people find useful, the site counts visits anonymously: the page, the country and the kind of device, with no names, IP addresses or cookies. A visitor is counted once a day with a code that changes every day, so nobody can be followed over time. Only the club's administrators see the totals.",
  },
  {
    title: "Where it is kept",
    body: "Sign-ups and enquiries are stored in the club's database, hosted by Supabase, and only the club's administrators can read them. We set no advertising or tracking cookies; the site only remembers whether you chose light or dark mode, in your own browser.",
  },
  {
    title: "Market prices",
    body: "The prices running along the top of each page come from TradingView, in a frame loaded from TradingView's own servers. Like any website, TradingView sees your IP address when the frame loads, and it may set its own cookies inside the frame under its own privacy policy. EMFC receives nothing from it.",
  },
  {
    title: "Your choices",
    body: "To see, correct or delete what we hold about you, or to withdraw your consent, message EMFC on LinkedIn and we will act on it within a month.",
  },
];

function PrivacyPage() {
  return (
    <SiteLayout>
      <section className="gutter grid gap-10 py-16 lg:grid-cols-12 lg:gap-8 lg:py-24">
        <div className="flex flex-col gap-5 lg:col-span-4">
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="font-serif text-[52px]/[0.98] tracking-[-0.01em] md:text-[76px]/[0.98]">
            Your <Em>data</Em>
          </h1>
          <p className="text-[15px]/[1.7] text-mute">Last updated 10 November 2026.</p>
        </div>
        <div className="flex flex-col lg:col-span-7 lg:col-start-6">
          {sections.map((s) => (
            <div key={s.title} className="flex flex-col gap-2.5 border-t border-line py-6">
              <h2 className="font-serif text-[28px]/[1.1]">{s.title}</h2>
              <p className="text-[15px]/[1.7] text-mute md:text-base/[1.7]">{s.body}</p>
            </div>
          ))}
          <a
            href={SOCIAL.linkedin}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-outline-ink mt-4 self-start"
          >
            Message EMFC on LinkedIn
          </a>
        </div>
      </section>
    </SiteLayout>
  );
}
