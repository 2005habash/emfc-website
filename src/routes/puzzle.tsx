import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { TeamPuzzle } from "@/components/puzzle/TeamPuzzle";
import { Em, Eyebrow } from "@/components/site/ui";

// emfc.es/puzzle: the team photo as a jigsaw, for fun (3 November 2026). Not linked from the menus,
// and kept out of search engines.
export const Route = createFileRoute("/puzzle")({
  head: () => ({
    meta: [
      { title: "Team puzzle, EMFC" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "The EMFC team photo, cut into a jigsaw. Put the team back together." },
    ],
  }),
  component: PuzzlePage,
});

function PuzzlePage() {
  return (
    <SiteLayout>
      <section className="gutter pb-20 pt-10 md:pb-28 md:pt-14">
        <Eyebrow className="animate-rise">Team puzzle</Eyebrow>
        <h1 className="mt-5 animate-rise font-serif text-5xl/[0.95] tracking-[-0.015em] [animation-delay:120ms] md:text-7xl/[0.95]">
          Put the <Em>team</Em> back together
        </h1>
        <TeamPuzzle />
      </section>
    </SiteLayout>
  );
}
