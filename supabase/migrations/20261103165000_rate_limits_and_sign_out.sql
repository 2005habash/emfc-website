-- Security, part 1b (3 November 2026). Safe to run straight away, before part 2: it only adds and
-- tightens, and the live site keeps working.
--   * rate limits that hold when requests arrive together: the server takes a slot (public.take_slot)
--     before it saves an enquiry, a newsletter sign-up or an analytics event, and before it emails
--     an enquiry;
--   * editor and admin powers need a session that is still signed in, so signing out, Deny and
--     Reset two-factor take effect at once, not when the sign-in token runs out (up to an hour later);
--   * Reset two-factor also signs the person out everywhere.

-- Rate limits: one row per request let through, kept for a day. Only the website's server (with the
-- secret key) takes slots; the table can't be read or written from the browser.
create table if not exists private.rate_slots (
  bucket text not null,
  key text not null,
  created_at timestamptz not null default now()
);
alter table private.rate_slots enable row level security;
revoke all on private.rate_slots from public, anon, authenticated;
create index if not exists rate_slots_recent on private.rate_slots (bucket, key, created_at);
create index if not exists rate_slots_age on private.rate_slots (created_at);

-- Takes one of the `_max` slots a sender (`_key`) has per `_minutes` for one kind of request
-- (`_bucket`), or returns false when none is left. The lock makes one sender's requests take turns,
-- so a burst sent all at once can't pass the count before any of it is recorded.
create or replace function public.take_slot(_bucket text, _key text, _minutes integer, _max integer)
returns boolean
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended(_bucket || '|' || _key, 0));
  if (select count(*) from private.rate_slots
      where bucket = _bucket and key = _key and created_at > now() - make_interval(mins => _minutes)) >= _max then
    return false;
  end if;
  insert into private.rate_slots (bucket, key) values (_bucket, _key);
  return true;
end $$;
revoke all on function public.take_slot(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.take_slot(text, text, integer, integer) to service_role;

-- Slots older than the longest limit (a day, for the enquiry emails) are deleted every night at 03:20.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('emfc-rate-slots', '20 3 * * *',
  $$delete from private.rate_slots where created_at < now() - interval '1 day'$$);

-- Editor and admin powers: the level, two-factor in this session (aal2), and now a session that is
-- still signed in. Signing out deletes the session, and with it these powers.
create or replace function private.caller_is(_level text)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
    and exists (
      select 1 from auth.sessions s
      where s.id = (auth.jwt() ->> 'session_id')::uuid and s.user_id = auth.uid()
    )
    and exists (
      select 1 from public.user_roles r
      where r.user_id = auth.uid()
        and (r.role::text = 'admin' or (_level = 'editor' and r.role::text = 'editor'))
    )
$$;

-- Reset two-factor (a lost or stolen phone) also ends all of that person's sessions, so whoever holds
-- their phone or laptop is signed out now. They sign in again and set up two-factor afresh.
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
  delete from auth.sessions where user_id = _user_id;
end $$;
