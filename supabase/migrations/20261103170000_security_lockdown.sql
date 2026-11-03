-- Security, part 2 of 2 (3 November 2026). Run after the new admin page (with two-factor and the
-- server-only writes) is live: from here on the database itself enforces all of it.
--   * every editor and admin power needs two-factor (private.caller_is, from part 1);
--   * the public can no longer write anywhere: the website's server saves enquiries, newsletter
--     sign-ups and analytics with the secret key; applications are closed until the next intake;
--   * the public and signed-in roles keep only the table privileges they need;
--   * only editors can list the storage buckets; upload limits per bucket; links in events and
--     reports must be https or site paths;
--   * analytics older than 13 months are deleted every night.

-- Events and reports: anyone reads what's published; editors (and admins) with two-factor do the rest.
drop policy if exists "Admins read all events" on public.events;
drop policy if exists "Admins add events" on public.events;
drop policy if exists "Admins edit events" on public.events;
drop policy if exists "Admins delete events" on public.events;
create policy "Editors read all events" on public.events for select to authenticated using (private.caller_is('editor'));
create policy "Editors add events" on public.events for insert to authenticated with check (private.caller_is('editor'));
create policy "Editors edit events" on public.events for update to authenticated
  using (private.caller_is('editor')) with check (private.caller_is('editor'));
create policy "Editors delete events" on public.events for delete to authenticated using (private.caller_is('editor'));

drop policy if exists "Admins read all reports" on public.reports;
drop policy if exists "Admins add reports" on public.reports;
drop policy if exists "Admins edit reports" on public.reports;
drop policy if exists "Admins delete reports" on public.reports;
create policy "Editors read all reports" on public.reports for select to authenticated using (private.caller_is('editor'));
create policy "Editors add reports" on public.reports for insert to authenticated with check (private.caller_is('editor'));
create policy "Editors edit reports" on public.reports for update to authenticated
  using (private.caller_is('editor')) with check (private.caller_is('editor'));
create policy "Editors delete reports" on public.reports for delete to authenticated using (private.caller_is('editor'));

-- People's data: admins with two-factor only. Nobody writes from the browser.
drop policy if exists "Anyone sends an enquiry" on public.sponsorship_enquiries;
drop policy if exists "Admins read enquiries" on public.sponsorship_enquiries;
drop policy if exists "Admins delete enquiries" on public.sponsorship_enquiries;
create policy "Admins read enquiries" on public.sponsorship_enquiries for select to authenticated using (private.caller_is('admin'));
create policy "Admins delete enquiries" on public.sponsorship_enquiries for delete to authenticated using (private.caller_is('admin'));

drop policy if exists "Anyone can sign up" on public.newsletter_signups;
drop policy if exists "Admins read signups" on public.newsletter_signups;
create policy "Admins read signups" on public.newsletter_signups for select to authenticated using (private.caller_is('admin'));

drop policy if exists "Anyone can apply" on public.applications;
drop policy if exists "Admins can read applications" on public.applications;
create policy "Admins read applications" on public.applications for select to authenticated using (private.caller_is('admin'));

drop policy if exists "The website records events" on public.analytics_events;

-- Storage: event media and report PDFs stay public to read by their address (public buckets need no
-- rule for that); only editors list, upload and remove them, so drafts' files can't be found by listing.
-- CVs: admins.
drop policy if exists "Anyone reads event media and reports" on storage.objects;
create policy "Editors list event media and reports" on storage.objects for select to authenticated
  using (bucket_id in ('event-media', 'reports') and private.caller_is('editor'));
drop policy if exists "Admins upload event media and reports" on storage.objects;
drop policy if exists "Admins replace event media and reports" on storage.objects;
drop policy if exists "Admins delete event media and reports" on storage.objects;
create policy "Editors upload event media and reports" on storage.objects for insert to authenticated
  with check (bucket_id in ('event-media', 'reports') and private.caller_is('editor'));
create policy "Editors replace event media and reports" on storage.objects for update to authenticated
  using (bucket_id in ('event-media', 'reports') and private.caller_is('editor'))
  with check (bucket_id in ('event-media', 'reports') and private.caller_is('editor'));
create policy "Editors delete event media and reports" on storage.objects for delete to authenticated
  using (bucket_id in ('event-media', 'reports') and private.caller_is('editor'));

drop policy if exists "Admins can read CVs" on storage.objects;
drop policy if exists "Admins can update CVs" on storage.objects;
drop policy if exists "Admins can delete CVs" on storage.objects;
create policy "Admins read CVs" on storage.objects for select to authenticated
  using (bucket_id = 'cvs' and private.caller_is('admin'));
create policy "Admins delete CVs" on storage.objects for delete to authenticated
  using (bucket_id = 'cvs' and private.caller_is('admin'));

-- Upload limits: what the admin page actually sends, and no more.
update storage.buckets set file_size_limit = 52428800,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'] where id = 'event-media';
update storage.buckets set file_size_limit = 20971520, allowed_mime_types = array['application/pdf'] where id = 'reports';
update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['application/pdf'] where id = 'cvs';

-- Table privileges: only what each role needs (the access rules above still decide which rows).
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
grant select on public.events, public.reports to anon, authenticated;
grant insert, update, delete on public.events, public.reports to authenticated;
grant select, delete on public.sponsorship_enquiries, public.newsletter_signups to authenticated;
grant select on public.applications, public.analytics_events, public.user_roles to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
-- New tables and functions no longer get wide privileges by default; grant them explicitly.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;

-- The first Access functions are replaced by access_accounts and set_role (part 1).
drop function if exists public.admin_accounts();
drop function if exists public.set_admin(uuid, boolean);

-- Links: https for links people click, https or a site path for files and pictures.
create or replace function private.safe_url(_u text) returns boolean language sql immutable as $$
  select _u is null or _u ~* '^(https://|/[^/])'
$$;
create or replace function private.safe_link(_u text) returns boolean language sql immutable as $$
  select _u is null or _u ~* '^https://'
$$;
create or replace function private.safe_urls(_us text[]) returns boolean language sql immutable as $$
  select coalesce(bool_and(private.safe_url(u)), true) from unnest(_us) as u
$$;
create or replace function private.safe_photos(_ps jsonb) returns boolean language sql immutable as $$
  select coalesce(bool_and(private.safe_url(p ->> 'src')), true) from jsonb_array_elements(coalesce(_ps, '[]'::jsonb)) as p
$$;
grant execute on function private.safe_url(text), private.safe_link(text), private.safe_urls(text[]), private.safe_photos(jsonb)
  to authenticated, service_role;
alter table public.events add constraint events_safe_links
  check (private.safe_link(link) and private.safe_photos(photos) and private.safe_urls(videos) and private.safe_urls(recap));
alter table public.reports add constraint reports_safe_links check (private.safe_url(file) and private.safe_link(link));

-- Analytics are kept for 13 months, then deleted, every night at 03:15.
create extension if not exists pg_cron;
select cron.schedule('emfc-analytics-retention', '15 3 * * *',
  $$delete from public.analytics_events where created_at < now() - interval '13 months'$$);
