import { useEffect, useState } from "react";

/**
 * Live market prices along the very top of every public page, from TradingView's free ticker tape.
 *
 * Only TradingView's frame is embedded, never its script: the frame runs on TradingView's own domain
 * (allowed as a frame-src in src/lib/server/security-headers.ts), sandboxed, so nothing of theirs runs
 * inside this site, where an admin's sign-in lives. The frame's address is the one TradingView's own
 * embed script builds (www.tradingview-widget.com/embed-widget/ticker-tape/, settings in the hash).
 * TradingView's terms require its credit to stay visible: the link at the strip's right end.
 *
 * It loads after the page, so it never holds up the first screen, and stays hidden for reduced motion
 * and without JavaScript (the strip shows only once the page may animate, the `motion` class).
 */

// Each checked on 10 November 2026 to show a live price in the free widget. Index levels that the
// widget doesn't carry come from a broker's CFD on the same index (Euro Stoxx 50, FTSE 100, S&P 500,
// Nasdaq 100); government bond yields aren't available, so the Bund future stands in for them.
const SYMBOLS = [
  { proName: "BME:IBC", title: "IBEX 35" },
  { proName: "OANDA:EU50EUR", title: "Euro Stoxx 50" },
  { proName: "XETR:DAX", title: "DAX" },
  { proName: "FOREXCOM:UKXGBP", title: "FTSE 100" },
  { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
  { proName: "FOREXCOM:NSXUSD", title: "Nasdaq 100" },
  { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
  { proName: "TVC:UKOIL", title: "Brent" },
  { proName: "TVC:GOLD", title: "Gold" },
  { proName: "EUREX:FGBL1!", title: "Bund future" },
  { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
];

const HEIGHT = 46;

function frameSrc() {
  const settings = {
    symbols: SYMBOLS,
    showSymbolLogo: true,
    colorTheme: "dark",
    isTransparent: true,
    displayMode: "adaptive",
    width: "100%",
    height: HEIGHT,
    utm_source: window.location.hostname,
    utm_medium: "widget",
    utm_campaign: "ticker-tape",
    // The site's address only, not the page being read.
    "page-uri": `${window.location.origin}/`,
  };
  return `https://www.tradingview-widget.com/embed-widget/ticker-tape/?locale=en#${encodeURIComponent(JSON.stringify(settings))}`;
}

export function MarketTicker() {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const load = () => setSrc(frameSrc());
    if (document.readyState === "complete") {
      load();
      return;
    }
    window.addEventListener("load", load, { once: true });
    return () => window.removeEventListener("load", load);
  }, []);

  return (
    <div
      aria-label="Market prices"
      role="region"
      className="relative hidden overflow-hidden border-b border-white/10 bg-deep [html.motion_&]:block"
      style={{ height: HEIGHT }}
    >
      {src && (
        <iframe
          src={src}
          title="Market prices from TradingView"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      )}
      <a
        href="https://www.tradingview.com/"
        target="_blank"
        rel="noopener nofollow"
        className="absolute inset-y-0 right-0 flex items-center bg-[linear-gradient(90deg,transparent,var(--c-deep)_28px)] pl-10 pr-4 text-[11px] text-haze hover:text-white md:pr-6"
      >
        <span className="max-sm:hidden">Track all markets on&nbsp;</span>TradingView
      </a>
    </div>
  );
}
