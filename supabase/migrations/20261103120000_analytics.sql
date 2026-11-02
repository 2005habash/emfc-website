-- Site analytics for the admin page's Analytics tab. The website records anonymous events through a
-- server function (src/lib/analytics.ts): page views, profile opens, LinkedIn clicks and report
-- downloads. No names, IP addresses or cookies are stored; "visitor" is a daily code made from a hash,
-- so the same person counts once a day and can't be followed from one day to the next.

create table public.analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('page_view', 'profile_open', 'linkedin_click', 'report_download')),
  path text not null check (char_length(path) <= 300),
  target text check (char_length(target) <= 300),
  referrer text check (char_length(referrer) <= 200),
  country text check (char_length(country) <= 2),
  device text check (device in ('mobile', 'tablet', 'desktop')),
  visitor text not null check (char_length(visitor) <= 32)
);
create index analytics_events_created_at on public.analytics_events (created_at);
grant insert on public.analytics_events to anon, authenticated;
grant all on public.analytics_events to service_role;
alter table public.analytics_events enable row level security;
create policy "The website records events" on public.analytics_events
  for insert to anon, authenticated with check (true);
-- No read policy: the numbers are only read through analytics_summary, by admins.

-- Everything the Analytics tab shows, for the last _days days, as one JSON object.
create or replace function public.analytics_summary(_days integer default 30)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  since timestamptz := now() - make_interval(days => greatest(1, least(_days, 400)));
  result jsonb;
begin
  if not private.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Only admins can see the analytics' using errcode = '42501';
  end if;

  with e as (select * from public.analytics_events where created_at >= since),
  views as (select * from e where kind = 'page_view')
  select jsonb_build_object(
    'days', greatest(1, least(_days, 400)),
    'totals', jsonb_build_object(
      'page_views', (select count(*) from views),
      'visitors', (select count(distinct (visitor, created_at::date)) from views),
      'profile_opens', (select count(*) from e where kind = 'profile_open'),
      'linkedin_clicks', (select count(*) from e where kind = 'linkedin_click'),
      'report_downloads', (select count(*) from e where kind = 'report_download'),
      'enquiries', (select count(*) from public.sponsorship_enquiries where created_at >= since and not suspected_bot),
      'newsletter_signups', (select count(*) from public.newsletter_signups where created_at >= since)
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'views', coalesce(v.views, 0), 'visitors', coalesce(v.visitors, 0)) order by d.day)
      from generate_series(since::date, now()::date, interval '1 day') as d(day)
      left join (
        select created_at::date as day, count(*) as views, count(distinct visitor) as visitors from views group by 1
      ) v on v.day = d.day
    ), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(x) from (
      select path as name, count(*) as count, count(distinct (visitor, created_at::date)) as visitors
      from views group by path order by count(*) desc limit 15) x), '[]'::jsonb),
    'profiles', coalesce((select jsonb_agg(x) from (
      select target as name, count(*) as count from e where kind = 'profile_open' and target is not null
      group by target order by count(*) desc limit 15) x), '[]'::jsonb),
    'linkedin', coalesce((select jsonb_agg(x) from (
      select target as name, count(*) as count from e where kind = 'linkedin_click' and target is not null
      group by target order by count(*) desc limit 15) x), '[]'::jsonb),
    'reports', coalesce((select jsonb_agg(x) from (
      select target as name, count(*) as count from e where kind = 'report_download' and target is not null
      group by target order by count(*) desc limit 15) x), '[]'::jsonb),
    'referrers', coalesce((select jsonb_agg(x) from (
      select referrer as name, count(*) as count from views where referrer is not null
      group by 1 order by count(*) desc limit 10) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(x) from (
      select coalesce(country, '??') as name, count(distinct (visitor, created_at::date)) as count from views
      group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(x) from (
      select coalesce(device, 'desktop') as name, count(distinct (visitor, created_at::date)) as count from views
      group by 1 order by 2 desc) x), '[]'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function public.analytics_summary(integer) from public, anon;
grant execute on function public.analytics_summary(integer) to authenticated;
