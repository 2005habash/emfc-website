# Archived market ticker

The live market prices that ran along the top of every page, from TradingView's free ticker-tape
widget (11 prices: European and US indices, EUR/USD, Brent, gold, the Bund future, Bitcoin). On the
site from 10 November 2026 until the same day's review, when Vasco asked for it to come off: it
added little, and the homepage should show at once where members have worked.

`MarketTicker.tsx` embeds TradingView's frame only, never its script, so no outside code runs in the
site. To bring it back:
1. Move it to `src/components/fun/MarketTicker.tsx` and mount `<MarketTicker />` in the root
   layout, `src/routes/__root.tsx`, above `<Outlet />` on every page but `/club-office`.
2. Allow its frame in the Content Security Policy (`src/lib/server/security-headers.ts`): add
   `https://www.tradingview-widget.com` to `frame-src`.
3. Say so on the privacy page: TradingView sees the visitor's address when its frame loads and may
   set its own cookies, under its own privacy policy.
