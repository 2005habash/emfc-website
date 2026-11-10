import { createFileRoute, redirect } from "@tanstack/react-router";

// emfc.es/board was a page for a few hours on 10 November 2026: the Board, with its members' photos.
// The club's structure is now a chart without faces at the top of the Departments page (Vasco, 10
// November 2026), so the address goes there.
export const Route = createFileRoute("/board")({
  beforeLoad: () => {
    throw redirect({ to: "/departments", hash: "structure", statusCode: 301 });
  },
});
