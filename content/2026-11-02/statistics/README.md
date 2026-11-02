# Statistics from the member form

Counted from the 64 answers to the member form (closed 1 November 2026). The club has 66 people on the site: the 64 who answered plus Luís Laboreiro and Paul Christian Abel. Everything here is a total; nothing is about one person. Vasco chose what goes on the site: only figures that help the club. `statistics.json` has the same numbers for code.

## 1. Numbers to replace on the site

The 27 October site shows four facts in the homepage hero, "Over 90% international" in three places (homepage pillar, homepage photo banner, sponsorship page) and four facts on the sponsorship page. The real figures:

| On the site now | Where | Real figure | Suggested wording |
|---|---|---|---|
| 06 Departments | Homepage hero | 6 | 6 departments (unchanged) |
| 90%+ International cohort | Homepage hero, homepage pillar "International", homepage photo banner, sponsorship page | 86% of members are not Spanish (55 of 64); 27 nationalities | "86% international" or, stronger, "27 nationalities" |
| 12 Firms in our network | Homepage hero (counts `MEMBER_FIRMS`) | 124 firms where members have worked, internships included | "124 firms where our members have worked" |
| 2026 Founded in Barcelona | Homepage hero, sponsorship page | 2026 | unchanged |
| MSc Finance students at ESADE | Sponsorship page | 66 members across 7 ESADE master's programmes | "66 members" |
| 04 Investment desks | Sponsorship page | 4 investment departments (IB, Private Markets, AM, Fixed Income) plus Corporate Relations and Marketing | unchanged |

Other figures worth a place (homepage hero, sponsorship page or the Membership section):

- **27 nationalities**, counting second nationalities (24 first nationalities).
- **16 languages** spoken fluently.
- **49 universities in 22 countries** for the bachelor's degree; 37 members add an exchange or another degree.
- **97% with professional experience** (62 of 64); 38 have a year or more.
- **158+ internships** in total, about 2.5 per member.
- **124 firms** and **21 countries** where members have worked.
- **9 members** (14%) also do the CEMS MIM.
- **88% graduate in 2027** (56 of 64): available for internships in summer 2027 and full-time roles from then. Useful for the sponsorship page.

## 2. "Where our members come from" (the firms strip on the homepage)

The strip (`MEMBER_FIRMS` in `src/lib/site.ts`) should show firms where members have actually worked. From the answers, 12 widely recognised names:

> J.P. Morgan, UBS, BNP Paribas, HSBC, Santander, Ardian, Lazard Asset Management, Allianz Global Investors, William Blair, Euronext, EY, KPMG

More options from the answers, if the design wants a longer strip or a rotation: Crédit Agricole, Natixis CIB, ING Group, Deloitte, PwC, Accenture, Roland Berger, Alantra, Abac Capital, FSN Capital, Aurelius, UniCredit, Bankinter, Meridiam, IMF, Lloyds Banking Group, TD Bank, Nordnet Bank, DZ Bank, ODDO BHF Asset Management, Haitong Bank, Millennium, TotalEnergies, BMW, Airbus GBS, Allianz, Porsche Holding.

Of the current strip, these appear on no member's profile: Amundi, Nordea, CaixaBank. Vasco's decision: they come off; he can add one back if Luís Laboreiro or Paul Christian Abel, who didn't fill in the form, worked there.

Venture firms are left off the strip; Zaid Habash, as Vice-President for VC & Growth, can decide whether any belongs there.

The firms that appear on members' profiles, with the number of members at each, are at the end of `statistics.json`. Firms a member listed beyond the 3 on their profile are counted in the totals but not listed, as the form promised.

## 3. For the sponsorship page: what members aim for

Recruiters want to know what the members want. From the answers (members could pick up to 3):

| Target area | Members | Share |
|---|---|---|
| Private Equity | 28 | 44% |
| Investment Banking | 27 | 42% |
| Consulting | 19 | 30% |
| Asset Management | 18 | 28% |
| Venture Capital | 17 | 27% |
| Sales & Trading | 14 | 22% |
| Fintech | 9 | 14% |
| Private Credit | 8 | 12% |

| Target city | Members | Share |
|---|---|---|
| London | 45 | 70% |
| Madrid | 24 | 38% |
| Barcelona | 17 | 27% |
| Zurich | 17 | 27% |
| Munich | 13 | 20% |
| Amsterdam | 10 | 16% |
| Frankfurt | 10 | 16% |
| Paris | 10 | 16% |

Where members have already worked (areas, up to several each):

| Area | Members |
|---|---|
| Audit, Tax or Transaction Services | 19 |
| Investment Banking | 17 |
| Consulting | 14 |
| Startups or Fintech | 13 |
| Asset Management | 10 |
| Corporate Finance or Strategy (in-house) | 10 |
| Private Equity | 9 |
| Corporate or Commercial Banking | 8 |

## 4. Background

The breakdowns behind these totals (nationalities, languages, programmes, universities, experience, certifications, firms) are kept in the club Drive with Vasco's package, not in this repository, because the repository can be public.

## 5. How these were counted

- International: members with no Spanish nationality (first or second).
- Nationalities: first and second nationalities together.
- Universities: the same university written in different ways is counted once.
- Experience and internships: members picked a range; "158+ internships" counts "5 or more" as 5.
- Firms: every firm a member listed, internships included, the same firm counted once per member; a group's entities count as one firm (for example Santander and Santander CIB).
- Not included, on purpose: anything about one person, and figures that don't help the club.
