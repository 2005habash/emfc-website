# Investment Banking: content and feedback

| Desk | Sent by | What |
|---|---|---|
| M&A | Investment Banking (sender not named) | Desk page text, deliverables with frequency, finished work, one report coming |
| Debt | Investment Banking (sender not named) | Desk description ("Debt Advisory") |

Both texts are in `originals/` exactly as received.

"Now" is the text in the 27 October code (`src/lib/departments.ts`, Investment Banking entry), so each change can be found and replaced.

## 1. Investment Banking page

They wrote a "desk page" for M&A and a separate text for Debt. That fits the layout Vasco set for Private Markets: a description of the whole department, then each desk in detail.

### M&A desk: what we do
Their text, word for word:

> The M&A Desk of the ESADE Master's Finance Club gives members hands-on exposure to mergers and acquisitions advisory and helps them prepare for careers in investment banking. Our activities include:
> - Case studies: in-depth analysis of live and recent M&A deals, covering deal rationale, valuation, financing and regulatory issues.
> - Coffee chats: informal sessions with investment banking professionals across teams, sectors and locations.
> - Company visits and networking events: connecting members with banks and other financial firms.
> - CV workshops: helping members tailor their CVs for investment banking applications.
> - Interview preparation: technical and behavioural practice for recruiting season.
> - Market updates: regular discussion of notable deals and trends in M&A and capital markets.

### Debt desk
Their text, word for word, titled "Debt Advisory":

> Every deal needs financing. We cover how companies and private equity funds raise debt, from leveraged buyouts and acquisition financing to refinancings and restructurings. Members follow live deals, build their credit and capital structure skills, and prepare for Leveraged Finance, DCM and debt advisory roles at bulge brackets and boutiques.

The current verticals are "M&A" and "Debt". This text calls the desk "Debt Advisory". Vasco's decision (2 November): the desk is called "Debt Advisory" on the site.

### What the desk produces: their deliverables
| Deliverable | Frequency |
|---|---|
| M&A deal case study | Monthly |
| Coffee chats with investment banking professionals, across teams and locations (London and New York so far) | Every two weeks |
| CV workshops | Once per term, upon demand |
| Interview prep, company visits and networking events | As scheduled |

Now, on the page:
- Monthly Deal Analysis: "Each month the M&A or Debt team brings a live deal to the table: rationale, valuation, structure, financing and key risks. Members leave with frameworks they can reuse in interviews."
- Sector & Market Education: "How bankers actually think. Deal process, league tables, M&A and leveraged-finance trends, and the market awareness to hold a credible conversation with any banker."
- Interview Prep & Cases: "CV screening, mock interviews, and technical drills across LBO, DCF and accretion/dilution, built specifically for IB processes."
- Speaker Events & Podcast: "Sessions with M&A and leveraged-finance professionals, plus introductions to ESADE alumni inside target firms."
- Study Tours & Future Formats: "Working toward London, Madrid and Barcelona trips, alongside deal competitions, buddy systems and alumni dinners."

Their list has no podcast and no study tours. Their coffee chats every two weeks and CV workshops aren't on the page. Vasco's decision (2 November): match the page to their list.

### Target firms
- Their words: "Target firms: bulge-bracket banks, elite boutiques and mid-market or sector-specialist banks, mainly in London, New York and continental Europe."
- Now (12 names): Goldman Sachs, Morgan Stanley, J.P. Morgan, Bank of America, Citi, Evercore, Lazard, Rothschild & Co, Houlihan Lokey, Jefferies, UBS, Crédit Agricole.
- They describe kinds of banks rather than naming firms. The current names fit those kinds. Vasco's decision (2 November): keep the current 12 names, on the department page and on both desk pages (the same banks do M&A and debt advisory). The list is in `target-firms.json` at the top of the package.

## 2. Events
Their coffee chat series and CV workshop, merged with the other departments' events in `events/`:
- "David Karasek: William Blair, London, Industrials investment banking": `events/2026-10-07-william-blair/`.
- "Carson Wang: Centerview Partners, New York, Technology, Media & Telecom (TMT)": `events/2026-10-29-coffee-chat-carson-wang/`. Marketing also says Constantin Molineus and Investment Banking organised it.
- "CV Workshop with all associates": an internal session. Vasco's decision (2 November): not published as an event on the site.

## 3. Reports
- Coming soon: "our first M&A case study, on Paramount Skydance's ~$111bn takeover of Warner Bros. Discovery, to be published next week." No file yet. Also in `reports.json`.

## 4. Photos
None sent.
