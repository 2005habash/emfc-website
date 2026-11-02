# Fixed Income: content and feedback

| Sent by | What |
|---|---|
| The Fixed Income department | New target firms, the team with each person's desk, the split into public and private markets, new texts for the intro, what associates do and the case studies, and two Market Monitor reports |

Their two messages are in `originals/` exactly as received. The PDFs are in `files/`.

"Now" is the text in the 27 October code (`src/lib/departments.ts`, Fixed Income entry), so each change can be found and replaced.

## 1. Fixed Income page

### Team: two groups, and each person's desk
The department's list, in their order:

| Name in their list | Desk or title | Group |
|---|---|---|
| Luka Thomson | Head of Fixed Income | Whole department |
| Nin Sacristan | Rates & Government Bonds | Public Markets |
| Joan Brugada Mestre | Rates & Government Bonds | Public Markets |
| Paul Manner | Investment Grade Credit | Public Markets |
| Jules Coppens | High Yield Credit | Public Markets |
| Hugo Heise | Mortgage-Backed Securities | Public Markets |
| Tim Ziegler | Head of Private Credit | Private Markets |
| Giulia Weber Colussi | Direct Lending | Private Markets |
| Liam Thiele | Direct Lending | Private Markets |

- Their words: "There are two departments public and private everyone starting from time to time is private the rest public". "Time to time" reads as "Tim": Tim Ziegler and everyone after him are private, the rest public. The team page of their October Market Monitor shows the same split and calls the two groups "Public Markets" and "Private Markets".
- Vasco's decision (2 November): on the site the two groups are called "Public credit" and "Private credit", so they aren't confused with the Private Markets department. The `group` field in `people/` uses these names.
- These desks replace what people picked in the member form. Their titles in `people/` already use them, for example "Associate, Rates & Government Bonds", and Tim's is "Head of Private Credit". The group is in the `group` field.
- Three names are written differently in their list than in the form, where each member wrote their own name for the site: Joan Brugada (form) or Joan Brugada Mestre (list), Paul Emil Manner (form) or Paul Manner (list), Tim Constantin Ziegler (form) or Tim Ziegler (list). Vasco's decision (2 November): the site uses the form's names.

### Categories at the top of the page
- Vasco: "the categories need updating to these ones of the names I sent you with each position".
- Now: `verticals` are "Investment Grade", "High Yield", "Distressed & Special Situations", "Emerging Markets", "Financials".
- New, from their list: Public Markets: "Rates & Government Bonds", "Investment Grade Credit", "High Yield Credit", "Mortgage-Backed Securities". Private Markets: "Private Credit", "Direct Lending".
- The department summary (`function`) also lists the old ones: "Corporate credit research by market (IG, HY, Distressed & Special Situations, Emerging Markets, Financials)."

### "S&P case studies" becomes "debt capital markets case studies"
- Their words, about the screenshot of "What the desk produces": "Where it says S&P case studies Can we change it to debt capital markets case studies which is what we will actually do once ib are done with their reports".
- Every place in the code that mentions it:
  - `long` (intro): "Members publish S&P-style issuer rating case studies, prep for private credit and credit research roles, and meet credit investors through speaker sessions."
  - `function`: "S&P-style issuer ratings, private credit recruiting prep, and networking with credit investors."
  - `associate` (what associates do): "Cover an issuer universe, publish rating case studies, and present credit views in monthly desk meetings."
  - `produces`, point II: title "Issuer Rating Case Studies", text "Full credit reviews using an S&P-style scorecard, walking through business, financial and structural risk."
  - The Resources page repeats the point II text (`src/routes/resources.tsx`, around line 82).
- In a second message the department sent the new texts for all three places (word for word, also in `originals/`):
  - **Intro** (`long`): "A research-led desk covering public and private debt markets. Members produce a monthly Fixed Income Market Monitor, analysing market developments, trends and investment opportunities across asset classes. They also work through debt capital markets case studies and engage with industry professionals through speaker sessions."
  - **What associates do** (`associate`): "Contribute to the monthly Fixed Income Market Monitor, analyse developments in their assigned markets, work through debt capital markets case studies, and present their findings in desk meetings."
  - **Point II** (`produces`, and the copy on the Resources page): title "Debt Capital Markets Case Studies", text "Work through real-world transactions across public and private debt markets, examining financing structures, pricing, investor demand and the factors influencing funding decisions."
- The department summary (`function`): they sent no text for it. Drafted from their new intro: "Research-led coverage of public and private debt markets: a monthly Fixed Income Market Monitor, debt capital markets case studies and speaker sessions with industry professionals."
- Their first message said the case studies start "once ib are done with their reports"; the new texts describe them as a running activity, so use the texts as written.

### Target firms
- Their list (10): PIMCO, RBC BlueBay Asset Management, TwentyFour Asset Management, Loomis Sayles, PGIM Fixed Income, Ares Management, Arcmont Asset Management, Hayfin Capital Management, Golub Capital, Pemberton Asset Management.
- Now (8): PIMCO, Apollo, Ares, Oaktree, HPS, Blackstone Credit, BlueBay, Muzinich.
- Their list replaces the current one.
- Vasco's rule (2 November): every page shows 12 target firms. The department sent 10, so 2 are proposed to reach 12: Apollo and Oaktree Capital Management, both on the 27 October page. For Luka Thomson to confirm or swap. The full list is in `target-firms.json` at the top of the package.

## 2. Reports

Two PDFs in `files/`, also in `reports.json`. The department didn't say where they go; they suit the Resources page.

| File | What it is | Pages |
|---|---|---|
| `EMFC_Fixed_Income_Market_Monitor_Oct2026.pdf` | Fixed Income Market Monitor, October 2026. Section text by Joan Brugada Mestre, Nin Sacristan, Paul Manner, Jules Coppens, Hugo Heise, Giulia Weber Colussi and Liam Thiele; data pages compiled by Luka Thomson | 15 |
| `EMFC_Fixed_Income_Market_Monitor_Sep2026_Updated.pdf` | Fixed Income Market Monitor, week ending 4 September 2026. Its team page shows the September team, with two people not on the current list (Rayane and Keryann) | 9 |

Both say they were "Prepared by students for internal discussion, not investment research or advice." Vasco's decision (2 November): publish both on the Resources page.

## 3. Events
None sent.

## 4. Photos
None sent.
