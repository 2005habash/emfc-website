-- The club's own Supabase project (November 2026), started fresh when the site left Lovable.
-- This is the final state of the old Lovable Cloud migrations (supabase/lovable-migrations):
-- admin roles, membership applications with their CV storage, and newsletter sign-ups.
-- Run it first, then 20261102180000_events_reports_enquiries.sql.

-- Admin roles. Give someone admin access with:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where email = '<their email>';
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users see own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);

-- Kept outside the public schema, so the website's API can't call it directly.
create schema if not exists private;
grant usage on schema private to anon, authenticated;
create function private.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
revoke all on function private.has_role(uuid, public.app_role) from public;
grant execute on function private.has_role(uuid, public.app_role) to anon, authenticated, service_role;

-- Membership applications. The application form is archived (archive/apply) until the next intake;
-- the admin page's Applications tab reads this table.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  department text not null,
  position_type text,
  full_name text not null,
  email text not null,
  program text not null,
  graduation_year text not null,
  nationality text,
  linkedin_url text not null,
  experience text not null,
  desk_preference text,
  motivation text,
  relevant_experience text,
  cv_path text,
  consent boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.applications to anon, authenticated;
grant select on public.applications to authenticated;
grant all on public.applications to service_role;
alter table public.applications enable row level security;
create policy "Anyone can apply" on public.applications
  for insert to anon, authenticated
  with check (
    full_name is not null and char_length(full_name) between 1 and 200
    and email is not null and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    and department is not null and char_length(department) between 1 and 100
    and cv_path is not null and cv_path like (department || '/%')
    and consent = true
  );
create policy "Admins can read applications" on public.applications
  for select to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));

-- CVs: private. Uploads go through a server function with the secret key (archive/apply), which
-- skips these rules, so only admins' reading and tidying need policies.
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false)
on conflict (id) do nothing;
create policy "Admins can read CVs" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can update CVs" on storage.objects
  for update to authenticated
  using (bucket_id = 'cvs' and private.has_role(auth.uid(), 'admin'::app_role))
  with check (bucket_id = 'cvs' and private.has_role(auth.uid(), 'admin'::app_role));
create policy "Admins can delete CVs" on storage.objects
  for delete to authenticated
  using (bucket_id = 'cvs' and private.has_role(auth.uid(), 'admin'::app_role));

-- Newsletter sign-ups from the footer and the homepage.
create table public.newsletter_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);
grant insert on public.newsletter_signups to anon, authenticated;
grant select on public.newsletter_signups to authenticated;
grant all on public.newsletter_signups to service_role;
alter table public.newsletter_signups enable row level security;
create policy "Anyone can sign up" on public.newsletter_signups
  for insert to anon, authenticated
  with check (
    email is not null
    and char_length(email) between 5 and 254
    and email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );
create policy "Admins read signups" on public.newsletter_signups
  for select to authenticated using (private.has_role(auth.uid(), 'admin'::app_role));
