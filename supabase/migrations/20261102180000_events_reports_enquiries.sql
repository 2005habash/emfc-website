-- Events, reports and sponsorship enquiries for the launch site (November 2026).
-- Events and reports are managed from the admin page; the site falls back to the lists bundled in
-- src/data when these tables are missing or empty. Same access pattern as the existing tables:
-- anyone can read what is published, only admins (private.has_role) can write.

create table if not exists public.events (
  id text primary key,
  title text not null,
  date date not null,
  type text not null check (type in ('Networking', 'Workshop', 'Speaker', 'Study Trip', 'Social')),
  location text not null,
  description text not null,
  people text[] not null default '{}',
  departments text[] not null default '{}',
  desks text[] not null default '{}',
  photos jsonb not null default '[]'::jsonb,
  videos text[] not null default '{}',
  recap text[] not null default '{}',
  link text,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "Anyone reads published events" on public.events
  for select to anon, authenticated using (published);
create policy "Admins read all events" on public.events
  for select to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins add events" on public.events
  for insert to authenticated with check (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins edit events" on public.events
  for update to authenticated using (private.has_role(auth.uid(), 'admin'::app_role))
  with check (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins delete events" on public.events
  for delete to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));

create table if not exists public.reports (
  id text primary key,
  title text not null,
  series text not null,
  issue text,
  date text not null,
  department text not null,
  desk text,
  authors text[] not null default '{}',
  pages integer,
  file text,
  link text,
  status text not null default 'published' check (status in ('published', 'coming')),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.reports enable row level security;
create policy "Anyone reads published reports" on public.reports
  for select to anon, authenticated using (published);
create policy "Admins read all reports" on public.reports
  for select to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins add reports" on public.reports
  for insert to authenticated with check (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins edit reports" on public.reports
  for update to authenticated using (private.has_role(auth.uid(), 'admin'::app_role))
  with check (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins delete reports" on public.reports
  for delete to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));

create table if not exists public.sponsorship_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  firm text not null check (char_length(firm) between 2 and 160),
  email text not null check (char_length(email) between 3 and 200),
  format text not null check (char_length(format) <= 60),
  message text not null check (char_length(message) between 10 and 4000),
  created_at timestamptz not null default now()
);
alter table public.sponsorship_enquiries enable row level security;
create policy "Anyone sends an enquiry" on public.sponsorship_enquiries
  for insert to anon, authenticated with check (true);
create policy "Admins read enquiries" on public.sponsorship_enquiries
  for select to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins delete enquiries" on public.sponsorship_enquiries
  for delete to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));

-- Photos, clips and report PDFs uploaded from the admin page. Public to read, admins to write.
insert into storage.buckets (id, name, public)
values ('event-media', 'event-media', true), ('reports', 'reports', true)
on conflict (id) do nothing;
create policy "Anyone reads event media and reports" on storage.objects
  for select using (bucket_id in ('event-media', 'reports'));
create policy "Admins upload event media and reports" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('event-media', 'reports') and private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins replace event media and reports" on storage.objects
  for update to authenticated
  using (bucket_id in ('event-media', 'reports') and private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins delete event media and reports" on storage.objects
  for delete to authenticated
  using (bucket_id in ('event-media', 'reports') and private.has_role(auth.uid(), 'admin'::app_role));

-- The events and reports the site launched with (generated by tools/seed-sql.mjs).
insert into public.events (id, title, date, type, location, description, people, departments, desks, photos, videos, recap, link) values
  ('kickoff-greenroom-2026-05', 'ESADE Finance Club Kick-off: GreenRoom demo', '2026-05-28', 'Speaker', 'ESADE', 'The first event of the ESADE Finance Club, one of the two clubs that later merged into EMFC. Lorenzo demoed GreenRoom, a platform for finance interview prep, and the club announced a partnership giving all members free access to it.', array['Lorenzo Fabiani, founder of GreenRoom and an ESADE student']::text[], array['brand']::text[], '{}'::text[], '[]'::jsonb, '{}'::text[], '{}'::text[], null),
  ('kickoff-dinner-2026', 'Kick Off Dinner', '2026-09-26', 'Social', 'Negro Rojo, Barcelona', 'The founding cohort’s first gathering as EMFC. An evening for the new team and incoming associates to meet and set the tone for the year.', '{}'::text[], array['brand']::text[], '{}'::text[], '[]'::jsonb, '{}'::text[], '{}'::text[], null),
  ('william-blair-2026-10-07', 'Speaker session: Investment Banking at William Blair', '2026-10-07', 'Speaker', 'ESADE Sant Cugat', 'A small-group discussion with David Karasek, ESADE alumnus and Investment Banking Analyst in William Blair’s Industrials team in London, on his move from engineering into investment banking, how recruiting works, and how to land a return offer. Key advice: apply early, show real motivation beyond the technical skills, and take initiative during internships.', array['David Karasek, ESADE alumnus and Investment Banking Analyst, William Blair, London']::text[], array['investment-banking', 'corporate-relations', 'brand']::text[], array['investment-banking/m-and-a']::text[], '[{"src":"/images/events/william-blair-2026-10-07/photo-01.jpg","alt":"EMFC members around a meeting-room table at ESADE Sant Cugat, with the speaker on the screen"}]'::jsonb, '{}'::text[], array['/images/events/william-blair-2026-10-07/recap-1.jpg']::text[], null),
  ('pe-cv-screening-2026-10-09', 'CV Screening & Optimisation', '2026-10-09', 'Workshop', 'ESADE', 'One-to-one review of members'' CVs against PE and IB standards: deal sheet structure, quantified impact and formatting for buy-side applications.', array['Led by Fabian Luis Seher']::text[], array['private-markets']::text[], array['private-markets/private-equity']::text[], '[]'::jsonb, '{}'::text[], '{}'::text[], null),
  ('pe-technical-training-2026-10-09', 'Technical Training', '2026-10-09', 'Workshop', 'ESADE', 'Accounting and valuation fundamentals for PE interviews: three-statement links, EV to equity bridge and LBO mechanics.', array['Led by Fabian Luis Seher']::text[], array['private-markets']::text[], array['private-markets/private-equity']::text[], '[]'::jsonb, '{}'::text[], '{}'::text[], null),
  ('pe-mock-interviews-2026-10-09', 'Mock Interviews', '2026-10-09', 'Workshop', 'ESADE', 'Live PE interview simulations covering fit, technical and deal discussion questions, with individual feedback.', array['Led by Fabian Luis Seher']::text[], array['private-markets']::text[], array['private-markets/private-equity']::text[], '[]'::jsonb, '{}'::text[], '{}'::text[], null),
  ('alumni-roundtables-2026-10-19', 'Exploring Careers in Finance: Alumni Roundtables (with ESADE Careers)', '2026-10-19', 'Networking', 'Auditorium, ESADE', 'EMFC’s first open event, run with ESADE Careers. Five tables, one per area of finance, where students could talk directly with alumni about what working in each field is really like. Students rotated between sectors to ask alumni what the job is really like, and how they got there.', array['Investment Banking: Luis Vega, Investment Banking Associate, XP Advisory', 'Private Equity: Miquel Petit, Private Equity Associate, Abac Capital', 'Venture Capital: Miguel Bowden, Portfolio Management, InnoEnergy', 'Fintech: Martin Nicholls, Team Lead Enterprise, Frekuent', 'Sustainable Finance: Cristina Costa, Sustainability Lead, Kara']::text[], array['investment-banking', 'private-markets', 'corporate-relations', 'brand']::text[], array['private-markets/private-equity', 'private-markets/vc-and-growth', 'private-markets/fintech']::text[], '[{"src":"/images/events/alumni-roundtables-2026-10-19/photo-01.jpg","alt":"A group photo in the room after the roundtables"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-02.jpg","alt":"The roundtable circles in the auditorium, with the Esade Alumni slide on screen"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-03.jpg","alt":"A roundtable circle in front of the stage and the Do Good. Do Better. wall"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-04.jpg","alt":"The Finance Round Table Session slide on screen, participants seated"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-05.jpg","alt":"The slide introducing the five alumni guests, with their roles and firms"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-06.jpg","alt":"Circles of students seated in front of the stage"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-07.jpg","alt":"A roundtable circle in conversation, the slide behind"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-08.jpg","alt":"A wide view of several roundtable circles"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-09.jpg","alt":"Participants seated in circles of chairs across the auditorium"},{"src":"/images/events/alumni-roundtables-2026-10-19/photo-10.jpg","alt":"One roundtable circle in conversation, the auditorium entrance behind"}]'::jsonb, array['/videos/events/alumni-roundtables-2026-10-19/clip-01.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-02.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-03.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-04.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-05.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-06.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-07.mp4', '/videos/events/alumni-roundtables-2026-10-19/clip-08.mp4']::text[], array['/images/events/alumni-roundtables-2026-10-19/recap-1.jpg', '/images/events/alumni-roundtables-2026-10-19/recap-2.jpg', '/images/events/alumni-roundtables-2026-10-19/recap-3.jpg', '/images/events/alumni-roundtables-2026-10-19/recap-4.jpg', '/images/events/alumni-roundtables-2026-10-19/recap-5.jpg']::text[], null),
  ('ubs-2026-10-28', 'Inside Equity Research: UBS, fintech and careers in equity markets', '2026-10-28', 'Speaker', 'Room 0A04, ESADE Sant Cugat', 'A small-group session with Jonathan Glele Ahanhanzo, former Equity Research Analyst at UBS covering FinTech & Payments in the EMEA TMT team, now pursuing an MSc in Development Economics at the University of Oxford. How equity research is structured and what day-to-day work in TMT looks like, advice on applications, interviews and pursuing equity research roles, and current market trends in fintech and TMT. An opportunity for EMFC members to ask questions and hear first-hand perspectives on equity research and fintech.', array['Jonathan Glele Ahanhanzo, former Equity Research Analyst, UBS (FinTech & Payments, EMEA TMT)']::text[], array['private-markets', 'corporate-relations']::text[], array['private-markets/fintech']::text[], '[]'::jsonb, '{}'::text[], array['/images/events/ubs-2026-10-28/recap-1.jpg', '/images/events/ubs-2026-10-28/recap-2.jpg', '/images/events/ubs-2026-10-28/recap-3.jpg', '/images/events/ubs-2026-10-28/recap-4.jpg', '/images/events/ubs-2026-10-28/recap-5.jpg']::text[], null),
  ('coffee-chat-carson-wang-2026-10-29', 'Coffee chat with Carson Wang', '2026-10-29', 'Speaker', 'ESADE, speaker online', 'ESADE Master’s Finance Club hosted a coffee chat with Carson Wang, Wharton student with experience at Centerview Partners, Permira and Silver Lake. An informal Q&A where members asked Carson about recruiting, day-to-day life in banking and PE, and career advice, and came away with practical, honest tips from someone who has worked at top firms on both sides.', array['Carson Wang, Wharton student, previously at Centerview Partners, Permira and Silver Lake', 'Organised by Constantin Molineus and Investment Banking']::text[], array['investment-banking', 'private-markets', 'brand']::text[], array['investment-banking/m-and-a', 'private-markets/private-equity']::text[], '[{"src":"/images/events/coffee-chat-carson-wang-2026-10-29/photo-01.jpg","alt":"Five EMFC members either side of a screen showing Carson Wang on a video call"}]'::jsonb, '{}'::text[], array['/images/events/coffee-chat-carson-wang-2026-10-29/recap-1.jpg']::text[], null),
  ('i-squared-capital-2026-11-02', 'Networking Event with I Squared Capital', '2026-11-02', 'Networking', 'ESADE Sant Cugat', 'An exclusive session for EMFC members on working at I Squared Capital and its recruiting process, followed by a networking cocktail with recruiters and professionals from the firm.', '{}'::text[], array['corporate-relations']::text[], '{}'::text[], '[]'::jsonb, '{}'::text[], '{}'::text[], null)
on conflict (id) do nothing;

insert into public.reports (id, title, series, issue, date, department, desk, authors, pages, file, link, status) values
  ('monthly-market-views-2026-10', 'No Country for Cheap Money: Treasury Yields at Their Highest since 2007', 'Monthly Market Views', 'October 2026', '2026-10', 'asset-management', 'macro-and-strategy', array['Luís Laboreiro', 'Alexander Schilling']::text[], 5, '/reports/monthly-market-views-2026-10.pdf', null, 'published'),
  ('monthly-market-views-2026-09', 'Empire Strikes Back: Nvidia reclaims control', 'Monthly Market Views', 'September 2026', '2026-09', 'asset-management', 'macro-and-strategy', array['Luís Laboreiro', 'Luka Thomson']::text[], 4, '/reports/monthly-market-views-2026-09.pdf', null, 'published'),
  ('monthly-market-views-2026-07', 'Nerves return: geopolitical tension and AI capex fears test market resilience', 'Monthly Market Views', 'July 2026, Issue 07', '2026-07', 'asset-management', 'macro-and-strategy', array['Luís Laboreiro', 'Luka Thomson']::text[], 4, '/reports/monthly-market-views-2026-07.pdf', null, 'published'),
  ('fixed-income-market-monitor-2026-10', 'Fixed Income Market Monitor, October 2026', 'Fixed Income Market Monitor', 'October 2026', '2026-10', 'fixed-income', null, array['Joan Brugada', 'Nin Sacristan', 'Paul Emil Manner', 'Jules Coppens', 'Hugo Heise', 'Giulia Weber Colussi', 'Liam Thiele', 'Luka Thomson']::text[], 15, '/reports/fixed-income-market-monitor-2026-10.pdf', null, 'published'),
  ('fixed-income-market-monitor-2026-09', 'Fixed Income Market Monitor, week ending 4 September 2026', 'Fixed Income Market Monitor', '4 September 2026', '2026-09-04', 'fixed-income', null, array['Fixed Income department', 'Luka Thomson']::text[], 9, '/reports/fixed-income-market-monitor-2026-09.pdf', null, 'published'),
  ('real-assets-market-insight-2026-q3', 'Real assets in Q3 2026: where the money is going', 'Market Insight', 'Q3 2026', '2026-10-15', 'private-markets', 'real-assets', array['Jan Heibel', 'Luca Flusche']::text[], 4, '/reports/real-assets-market-insight-2026-q3.pdf', 'https://lnkd.in/p/ebkynQ-q', 'published'),
  ('real-assets-one-pager', 'The Real Assets desk: who we are and how to reach us', 'Desk one-pager', null, '2026-10', 'private-markets', 'real-assets', '{}'::text[], 1, '/reports/real-assets-one-pager.pdf', null, 'published'),
  ('emfc-global-equity-fund-ips', 'EMFC Global Equity Fund: Investment Policy Statement', 'Fund documents', 'Version 1.0, October 2026', '2026-10', 'asset-management', 'portfolio-management', '{}'::text[], 14, '/reports/emfc-global-equity-fund-ips-v1.0.pdf', null, 'published'),
  ('ma-case-study-paramount-wbd', 'M&A case study: Paramount Skydance''s takeover of Warner Bros. Discovery', 'M&A Deal Case Study', null, '2026-11', 'investment-banking', 'm-and-a', '{}'::text[], null, null, null, 'coming'),
  ('pe-deal-of-the-month', 'Deal of the Month', 'Monthly', null, '2026-11', 'private-markets', 'private-equity', '{}'::text[], null, null, null, 'coming'),
  ('spanish-mid-market-pe-review', 'Spanish Mid-Market PE Review', 'Annual', null, '2026-11', 'private-markets', 'private-equity', '{}'::text[], null, null, null, 'coming'),
  ('pe-investment-memo-drafting', 'Investment Memo Drafting', 'Private Equity', null, '2026-11', 'private-markets', 'private-equity', '{}'::text[], null, null, null, 'coming')
on conflict (id) do nothing;
