-- Partner clicks (27 November 2026): the site records a click on a partner's button on the Resources
-- page (Trakvia, Greenroom) as 'partner_click', with the partner's name as the target, and the Analytics
-- tab shows the total and the clicks per partner. Run this before the site version that sends them goes
-- live, or those clicks are refused by the check below (harmlessly: the page still opens the link).

alter table public.analytics_events drop constraint if exists analytics_events_kind_check;
alter table public.analytics_events add constraint analytics_events_kind_check
  check (kind in ('page_view', 'profile_open', 'linkedin_click', 'report_download', 'partner_click'));

-- The Analytics tab's summary, as in 20261103160000, plus partner_clicks and partners.
create or replace function public.analytics_summary(_days integer default 30)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  span integer := greatest(1, least(_days, 400));
  since timestamptz := now() - make_interval(days => span);
  result jsonb;
begin
  if not private.caller_is('admin') then
    raise exception 'Only admins, signed in with two-factor, can see the analytics' using errcode = '42501';
  end if;

  with e as (
    select *, (created_at at time zone 'Europe/Madrid')::date as day from public.analytics_events where created_at >= since
  ),
  views as (select * from e where kind = 'page_view')
  select jsonb_build_object(
    'days', span,
    'totals', jsonb_build_object(
      'page_views', (select count(*) from views),
      'visitors', (select count(distinct (visitor, day)) from views),
      'profile_opens', (select count(*) from e where kind = 'profile_open'),
      'linkedin_clicks', (select count(*) from e where kind = 'linkedin_click'),
      'report_downloads', (select count(*) from e where kind = 'report_download'),
      'partner_clicks', (select count(*) from e where kind = 'partner_click'),
      'enquiries', (select count(*) from public.sponsorship_enquiries where created_at >= since and not suspected_bot),
      'newsletter_signups', (select count(*) from public.newsletter_signups where created_at >= since)
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'views', coalesce(v.views, 0), 'visitors', coalesce(v.visitors, 0)) order by d.day)
      from generate_series((since at time zone 'Europe/Madrid')::date, (now() at time zone 'Europe/Madrid')::date, interval '1 day') as d(day)
      left join (select day, count(*) as views, count(distinct visitor) as visitors from views group by day) v on v.day = d.day
    ), '[]'::jsonb),
    'pages', coalesce((select jsonb_agg(x) from (
      select path as name, count(*) as count, count(distinct (visitor, day)) as visitors
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
    'partners', coalesce((select jsonb_agg(x) from (
      select target as name, count(*) as count from e where kind = 'partner_click' and target is not null
      group by target order by count(*) desc limit 15) x), '[]'::jsonb),
    'referrers', coalesce((select jsonb_agg(x) from (
      select referrer as name, count(*) as count from views where referrer is not null
      group by 1 order by count(*) desc limit 10) x), '[]'::jsonb),
    'countries', coalesce((select jsonb_agg(x) from (
      select coalesce(country, '??') as name, count(distinct (visitor, day)) as count from views
      group by 1 order by 2 desc limit 10) x), '[]'::jsonb),
    'devices', coalesce((select jsonb_agg(x) from (
      select coalesce(device, 'desktop') as name, count(distinct (visitor, day)) as count from views
      group by 1 order by 2 desc) x), '[]'::jsonb)
  ) into result;
  return result;
end $$;
