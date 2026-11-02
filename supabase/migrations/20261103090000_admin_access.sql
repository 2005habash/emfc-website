-- Lets admins manage admin access from the admin page's Admins tab: see who has signed up and
-- switch admin access on or off. Both functions check that the caller is an admin, so signing up
-- alone gives nothing. An admin can't remove their own access, so the club always keeps one.

create or replace function public.admin_accounts()
returns table (user_id uuid, email text, confirmed boolean, created_at timestamptz, last_sign_in_at timestamptz, is_admin boolean)
language plpgsql stable security definer set search_path = public as $$
begin
  if not private.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Only admins can see the accounts' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.email_confirmed_at is not null, u.created_at, u.last_sign_in_at,
           exists (select 1 from public.user_roles r where r.user_id = u.id and r.role = 'admin')
    from auth.users u
    order by u.created_at;
end $$;
revoke all on function public.admin_accounts() from public, anon;
grant execute on function public.admin_accounts() to authenticated;

create or replace function public.set_admin(_user_id uuid, _admin boolean)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not private.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Only admins can change admin access' using errcode = '42501';
  end if;
  if _admin then
    if not exists (select 1 from auth.users where id = _user_id and email_confirmed_at is not null) then
      raise exception 'That account has not confirmed its email yet';
    end if;
    insert into public.user_roles (user_id, role) values (_user_id, 'admin') on conflict (user_id, role) do nothing;
  else
    if _user_id = auth.uid() then
      raise exception 'You can''t remove your own admin access';
    end if;
    delete from public.user_roles where user_id = _user_id and role = 'admin';
  end if;
end $$;
revoke all on function public.set_admin(uuid, boolean) from public, anon;
grant execute on function public.set_admin(uuid, boolean) to authenticated;
