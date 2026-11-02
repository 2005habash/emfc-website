import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { EventArticle } from "@/components/site/EventArticle";
import { loadEvents } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/events_/$eventId")({
  loader: async ({ params }) => {
    const events = await loadEvents();
    const event = events.find((e) => e.id === params.eventId);
    if (!event) throw notFound();
    return { event, events };
  },
  head: ({ loaderData }) => {
    const e = loaderData?.event;
    const picture = e?.photos?.[0]?.src ?? e?.recap?.[0];
    return {
      meta: [
        { title: `${e?.title ?? "Event"}, EMFC` },
        { name: "description", content: e?.description ?? "" },
        { property: "og:title", content: e?.title ?? "EMFC event" },
        { property: "og:description", content: e?.description ?? "" },
        ...(picture ? [{ property: "og:image", content: absoluteUrl(picture) }, { property: "og:image:alt", content: e?.photos?.[0]?.alt ?? e?.title ?? "" }] : []),
      ],
    };
  },
  component: EventPage,
});

function EventPage() {
  const { event, events } = Route.useLoaderData();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const at = sorted.findIndex((x) => x.id === event.id);
  return (
    <SiteLayout>
      <EventArticle event={event} older={sorted[at - 1]} newer={sorted[at + 1]} />
    </SiteLayout>
  );
}
