-- Security, part 1 of 2 (3 November 2026). Safe to run while the old admin page is live: it only adds.
--   * a second level of access, editor (events and reports), next to admin (everything);
--   * private.caller_is(level): the caller holds that level AND signed in with two-factor (aal2);
--   * the Access tab's functions (access_accounts, set_role, reset_two_factor), deny_account and
--     analytics_summary now ask for caller_is, so they need two-factor;
--   * columns for the server's rate limits; admins may delete newsletter addresses and read analytics
--     (for the Backup tab).
-- Part 2 (20261103170000_security_lockdown.sql) switches the remaining rules over once the new admin page is live.

alter type public.app_role add value if not exists 'editor';

-- The caller has this level of access ('admin', or 'editor' which admins also pass) and this session
-- passed two-factor. Roles are compared as text, so this works in the same run that adds 'editor'.
create or replace function private.caller_is(_level text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    and exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid()
        and (r.role::text = 'admin' or (_level = 'editor' and r.role::text = 'editor'))
    )
$$;
revoke all on function private.caller_is(text) from public;
grant execute on function private.caller_is(text) to anon, authenticated, service_role;

-- Everyone who has signed up, for the Access tab: their level and whether two-factor is set up.
create or replace function public.access_accounts()
returns table (user_id uuid, email text, confirmed boolean, created_at timestamptz, last_sign_in_at timestamptz, role text, two_factor boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not private.caller_is('admin') then
    raise exception 'Only admins, signed in with two-factor, can see the accounts' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.email_confirmed_at is not null, u.created_at, u.last_sign_in_at,
      (select case when bool_or(r.role::text = 'admin') then 'admin' when bool_or(r.role::text = 'editor') then 'editor' end
         from public.user_roles r where r.user_id = u.id),
      exists (select 1 from auth.mfa_factors f where f.user_id = u.id and f.status = 'verified')
    from auth.users u
    order by u.created_at;
end $$;
revoke all on function public.access_accounts() from public, anon;
grant execute on function public.access_accounts() to authenticated;

-- Gives an account a level ('admin', 'editor') or none. Nobody changes their own access, so the club
-- always keeps an admin; only confirmed accounts get access.
create or replace function public.set_role(_user_id uuid, _role text)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not private.caller_is('admin') then
    raise exception 'Only admins, signed in with two-factor, can change access' using errcode = '42501';
  end if;
  if _role not in ('admin', 'editor', 'none') then
    raise exception 'Unknown level of access: %', _role;
  end if;
  if _user_id = auth.uid() then
    raise exception 'You can''t change your own access';
  end if;
  if _role <> 'none' and not exists (select 1 from auth.users where id = _user_id and email_confirmed_at is not null) then
    raise exception 'That account has not confirmed its email yet';
  end if;
  delete from public.user_roles where user_id = _user_id;
  if _role <> 'none' then
    insert into public.user_roles (user_id, role) values (_user_id, _role::public.app_role);
  end if;
end $$;
revoke all on function public.set_role(uuid, text) from public, anon;
grant execute on function public.set_role(uuid, text) to authenticated;

-- Removes someone's authenticator (a lost phone); they set it up again at their next sign-in.
create or replace function public.reset_two_factor(_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not private.caller_is('admin') then
    raise exception 'Only admins, signed in with two-factor, can reset two-factor' using errcode = '42501';
  end if;
  if _user_id = auth.uid() then
    raise exception 'Ask another admin to reset your own two-factor';
  end if;
  delete from auth.mfa_factors where user_id = _user_id;
end $$;
revoke all on function public.reset_two_factor(uuid) from public, anon;
grant execute on function public.reset_two_factor(uuid) to authenticated;

-- Turns down a sign-up: the account is deleted. Only accounts with no access can be denied.
create or replace function public.deny_account(_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not private.caller_is('admin') then
    raise exception 'Only admins, signed in with two-factor, can deny sign-ups' using errcode = '42501';
  end if;
  if _user_id = auth.uid() then
    raise exception 'You can''t deny your own account';
  end if;
  if exists (select 1 from public.user_roles where user_id = _user_id) then
    raise exception 'This account has access. Set it to No access first.';
  end if;
  delete from auth.users where id = _user_id;
end $$;

-- The Analytics tab, now for admins with two-factor, and with days counted in Barcelona time.
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

-- Rate limits: the server stores a code per sender (never the address itself) and counts recent rows.
alter table public.sponsorship_enquiries add column if not exists sender text check (char_length(sender) <= 32);
alter table public.newsletter_signups add column if not exists sender text check (char_length(sender) <= 32);
create index if not exists sponsorship_enquiries_sender on public.sponsorship_enquiries (sender, created_at);
create index if not exists newsletter_signups_sender on public.newsletter_signups (sender, created_at);
create index if not exists analytics_events_visitor on public.analytics_events (visitor, created_at);

-- The Newsletter tab deletes addresses on request; the Backup tab reads the analytics.
create policy "Admins delete signups" on public.newsletter_signups
  for delete to authenticated using (private.caller_is('admin'));
create policy "Admins read analytics" on public.analytics_events
  for select to authenticated using (private.caller_is('admin'));
