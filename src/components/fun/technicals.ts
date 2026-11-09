// "Sixty-second technicals" on the Resources page: classic finance interview questions with a short
// model answer each. Standard textbook material, written for the site; the desks can add their own.

export type Technical = { area: string; question: string; answer: string };

export const TECHNICALS: Technical[] = [
  {
    area: "Accounting",
    question: "Walk me through the three financial statements.",
    answer:
      "The income statement shows revenue, costs and net income over a period. The balance sheet shows assets, liabilities and equity at a point in time, and always balances. The cash flow statement starts from net income, adds back non-cash items, adjusts for working capital, then adds investing and financing flows to explain the change in cash. Net income feeds retained earnings, and ending cash feeds the balance sheet.",
  },
  {
    area: "Accounting",
    question: "Depreciation goes up by €10. Walk me through the statements, at a 40% tax rate.",
    answer:
      "Income statement: operating income falls by €10 and net income by €6, since tax falls by €4. Cash flow: net income is down €6, but you add back the €10 of depreciation, so cash is up €4. Balance sheet: cash up €4, fixed assets down €10, so assets fall €6; retained earnings fall €6, and it balances.",
  },
  {
    area: "Accounting",
    question: "Why does an increase in working capital reduce cash?",
    answer:
      "Because cash gets tied up in the business. If customers owe you more (receivables) or you hold more stock (inventory), you have recorded the sale or bought the goods but not yet turned them into cash. That is why the increase is subtracted on the cash flow statement.",
  },
  {
    area: "Accounting",
    question: "Can a profitable company go bankrupt?",
    answer:
      "Yes. Profit is not cash. A company can report profits while working capital, capital spending or debt repayments drain its cash, and if it can't pay what it owes when it falls due, it can fail anyway.",
  },
  {
    area: "Valuation",
    question: "Walk me through a DCF.",
    answer:
      "Project unlevered free cash flow for five to ten years: EBIT after tax, plus depreciation and amortisation, minus capex and the increase in working capital. Add a terminal value, from a perpetuity growth rate or an exit multiple. Discount both at the WACC to get enterprise value, subtract net debt to get equity value, and divide by diluted shares for a value per share.",
  },
  {
    area: "Valuation",
    question: "How do you get from enterprise value to equity value?",
    answer:
      "Subtract debt, preferred shares and non-controlling interests, and add cash and other non-operating assets. Enterprise value is what the operations are worth to all capital providers; equity value is what is left for shareholders.",
  },
  {
    area: "Valuation",
    question: "Which is usually higher, the cost of equity or the cost of debt? Why?",
    answer:
      "The cost of equity. Shareholders are paid last and carry more risk, so they ask for a higher return. Interest is also tax deductible, which lowers the after-tax cost of debt further.",
  },
  {
    area: "Valuation",
    question: "The discount rate goes up by one point. What happens to a DCF value?",
    answer:
      "It falls, because future cash flows are worth less today. The terminal value, usually the largest part, moves most: with a perpetuity growth method, a higher WACC widens the gap between the discount rate and the growth rate.",
  },
  {
    area: "Valuation",
    question: "Name three ways to value a company.",
    answer:
      "Comparable companies (the multiples peers trade at), precedent transactions (the multiples paid in past deals, which include a control premium) and a DCF (intrinsic value from cash flows). An LBO analysis adds a fourth view: what a financial sponsor could pay and still hit its target return.",
  },
  {
    area: "M&A",
    question: "Buyer at 20x earnings, target at 10x, all-stock deal. Accretive or dilutive?",
    answer:
      "Accretive, before synergies and costs. The buyer pays with shares priced at 20 times earnings to buy earnings priced at 10 times, so it gets more earnings for each share it issues. In an all-stock deal, a buyer with the higher P/E is accretive.",
  },
  {
    area: "M&A",
    question: "Why would a buyer pay more than the target's share price?",
    answer:
      "To win control and the board's recommendation, and because it expects synergies worth more than the premium. Control premiums of 20 to 40 percent over the undisturbed share price are common.",
  },
  {
    area: "M&A",
    question: "What are synergies, and which kind do investors believe?",
    answer:
      "The extra value from combining two companies: cost synergies (overlapping teams, sites and purchasing) and revenue synergies (cross-selling, new markets). Investors trust cost synergies more, because management controls them.",
  },
  {
    area: "LBO",
    question: "Walk me through a basic LBO.",
    answer:
      "A sponsor buys a company with a lot of debt and some equity. Over a holding period of about three to seven years, the company's cash flow repays debt while EBITDA grows. At exit the sponsor sells, repays the remaining debt and keeps the rest. Returns are measured as an IRR and a multiple of money.",
  },
  {
    area: "LBO",
    question: "What makes a good LBO candidate?",
    answer:
      "Stable, predictable cash flow, low capital needs, a strong market position, room to improve operations, a sensible entry price and a clear way to exit. Assets that can support debt help too.",
  },
  {
    area: "LBO",
    question:
      "You buy at 10x EBITDA of 100 with 50% debt. EBITDA reaches 150 in five years, you exit at 10x and have repaid half the debt. Your return?",
    answer:
      "Entry: enterprise value 1,000, debt 500, equity 500. Exit: enterprise value 1,500, debt 250, equity 1,250. That is 2.5 times your money, an IRR of about 20% over five years.",
  },
  {
    area: "LBO",
    question: "What are the three levers of returns in an LBO?",
    answer:
      "EBITDA growth (more revenue and better margins), multiple expansion (selling at a higher multiple than you paid) and deleveraging (repaying debt with the company's own cash flow).",
  },
  {
    area: "Markets",
    question: "What does an inverted yield curve suggest?",
    answer:
      "Short-term government yields above long-term ones. Markets expect rates to fall, often because they expect growth to slow, and an inversion has come before many past recessions.",
  },
  {
    area: "Markets",
    question: "Interest rates rise. What happens to bond prices?",
    answer:
      "They fall: a bond's fixed coupons are worth less when new bonds pay more. The longer the duration, the larger the fall. Roughly, the price change is minus the modified duration times the change in yield.",
  },
  {
    area: "Markets",
    question: "What is the Sharpe ratio?",
    answer:
      "A portfolio's return above the risk-free rate, divided by the volatility of its returns. It measures return per unit of risk: between two portfolios, the higher Sharpe ratio did better for the risk taken.",
  },
  {
    area: "Fixed Income",
    question: "What is duration?",
    answer:
      "The weighted average time until a bond's cash flows arrive and, as modified duration, the percentage change in its price for a one point change in yield. A bond with a modified duration of 7 loses about 7% if yields rise by a point.",
  },
  {
    area: "Fixed Income",
    question: "Where is the line between investment grade and high yield?",
    answer:
      "At BBB- for S&P and Fitch, Baa3 for Moody's. Anything rated lower is high yield: more risk of default, so investors ask for a wider spread over government bonds.",
  },
  {
    area: "Fixed Income",
    question: "What is a credit spread?",
    answer:
      "The extra yield a corporate bond pays over a government bond of the same maturity, for the risk of default and lower liquidity. Spreads widen when investors worry and tighten when they feel confident.",
  },
  {
    area: "Venture",
    question: "Pre-money valuation €8m, the round raises €2m. What does the new investor own?",
    answer:
      "The post-money valuation is €10m (€8m plus €2m), so the investor owns €2m out of €10m: 20%.",
  },
  {
    area: "Venture",
    question: "What is a liquidation preference?",
    answer:
      "Investors' right to get their money back, often one times what they put in, before ordinary shareholders when the company is sold or wound down. It protects them if the company sells for less than the valuation they invested at.",
  },
];

export const TECHNICAL_AREAS = [...new Set(TECHNICALS.map((t) => t.area))];
