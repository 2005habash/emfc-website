# Asset Management: content and feedback

| Sent by | What |
|---|---|
| The Asset Management department | Six changes to the Asset Management page, and four PDFs: three Monthly Market Views issues and the fund's Investment Policy Statement |

Their message was partly in Portuguese. It is in `originals/` exactly as received; the English version is below, nothing left out. The PDFs are in `files/`.

"Now" is the text in the 27 October code (`src/lib/departments.ts`, Asset Management entry), so each change can be found and replaced.

## 1. Asset Management page

### Top of the page: the verticals
- Their point 6: remove "ETFs & Multi-Asset" from the top part of the page ("Remover ETFs e Multi-Asset da parte inicial").
- Now: `verticals` are "Macro & Strategy", "Equity Research", "Portfolio Management", "ETFs & Multi-Asset". Remove the last one.
- Also note: the department summary (`function`) names it too: "Runs a paper trading portfolio across Macro & Strategy, Equity Research, Portfolio Management and ETFs & Multi-Asset."

### What the desk produces

Now, in this order:
- I. Market & Macro Research: "Central banks, economic data, geopolitics and asset allocation views, produced by the Macro & Strategy desk."
- II. Investment Thesis Development: "Equity research, valuation and risk assessment work, leading to publishable single-name and thematic pieces."
- III. Investment Committee: "Thesis presentations, committee debate and final approval before positions enter the paper portfolio."
- IV. Portfolio Monitoring & Review: "Performance attribution, rebalancing and post-mortems across the live book."
- V. Training & Industry Access: "Bloomberg training sessions, trading and investment challenges, London and Luxembourg business trips, plus speaker events with AM, WM and ER professionals."

Their changes:
- Point 2: swap point I and point IV ("trocar o Ponto I com o Ponto IV").
- Point 3: rename the new point I (Portfolio Monitoring & Review) to "Portfolio Management", with the text: "Security selection, sector and regional allocation, risk management and execution of the investment committee's themes across the book."
- Point 4: rename point II to "Equity Research", with the text: "Research, valuation and risk assessment work, for potential suitable names for the portfolio"
- Point 5: "Sets the fund's investment themes and approves every thesis before it enters the portfolio." They don't say which point it is for. It follows their changes to points I and II and describes the committee, so it is the new text of point III (Investment Committee). Confirmed by Vasco, 2 November.

The result:
- I. Portfolio Management: "Security selection, sector and regional allocation, risk management and execution of the investment committee's themes across the book."
- II. Equity Research: "Research, valuation and risk assessment work, for potential suitable names for the portfolio"
- III. Investment Committee: "Sets the fund's investment themes and approves every thesis before it enters the portfolio."
- IV. Market & Macro Research: text unchanged.
- V. Training & Industry Access: unchanged.

### Target firms
- Their point 1: "Blackrock, Fidelity, Capital Group, Vanguard, State Street, Schroders, Amundi, PIMCO" (8 firms, in their order).
- Now (8): Schroders, BlackRock, Fidelity, Capital Group, Citadel, Point72, Brevan Howard, Marshall Wace.
- So Citadel, Point72, Brevan Howard and Marshall Wace come out, and Vanguard, State Street, Amundi and PIMCO come in. The current site spells "BlackRock".
- Vasco's rule (2 November): every page shows 12 target firms. The department sent 8, so 4 are proposed to reach 12: J.P. Morgan Asset Management, Goldman Sachs Asset Management, Wellington Management, T. Rowe Price. For Cosimo Dini and Luís Laboreiro to confirm or swap. The full list is in `target-firms.json` at the top of the package.

## 2. Reports and documents

Four PDFs in `files/`, also listed in `reports.json`. The department didn't say where each goes. Vasco's decision (2 November): the three Monthly Market Views go on the Resources page, including the July issue (the file called "redesign"), and the Investment Policy Statement goes on the Fund page.

| File | What it is | Authors | Pages |
|---|---|---|---|
| `Monthly_Market_Views_Oct_2026.pdf` | Monthly Market Views, October 2026: "No Country for Cheap Money: Treasury Yields at Their Highest since 2007" | Luís Laboreiro (Chief Investment Officer), Alexander Schilling (Macro Associate) | 5 |
| `Monthly_Market_Views_Sept_2026_1.pdf` | Monthly Market Views, September 2026: "Empire Strikes Back: Nvidia reclaims control" | Luís Laboreiro, Luka Thomson (Head of Fixed Income) | 4 |
| `Monthly_market_views_redesign.pdf` | Monthly Market Views, July 2026, Issue 07: "Nerves return: geopolitical tension and AI capex fears test market resilience". Despite the file name, it is the July issue, in a different layout from September and October | Luís Laboreiro, Luka Thomson | 4 |
| `EMFC_Global_Equity_Fund_IPS_v1.0_October_2026.pdf` | EMFC Global Equity Fund, Investment Policy Statement, version 1.0, October 2026. Active global equity paper portfolio, benchmark MSCI World: objective, portfolio rules, investment process, governance and risk | No author named | 14 |

The reports call the club "Esade Master's in Finance Club".

## 3. Events
None sent.

## 4. Photos
None sent.
