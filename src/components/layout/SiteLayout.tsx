import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function SiteLayout({
  children,
  overlayNav = false,
}: {
  children: ReactNode;
  overlayNav?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col bg-paper text-ink">
      <Nav overlay={overlayNav} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
