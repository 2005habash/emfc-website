-- Lets admins turn down a sign-up from the Admins tab: the account is deleted, so it can't sign in
-- and drops off the list. Current admins (and the caller) can't be denied; remove admin access first.

create or replace function public.deny_account(_user_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not private.has_role(auth.uid(), 'admin'::app_role) then
    raise exception 'Only admins can deny sign-ups' using errcode = '42501';
  end if;
  if _user_id = auth.uid() then
    raise exception 'You can''t deny your own account';
  end if;
  if private.has_role(_user_id, 'admin'::app_role) then
    raise exception 'This account is an admin. Remove its admin access first.';
  end if;
  delete from auth.users where id = _user_id;
end $$;
revoke all on function public.deny_account(uuid) from public, anon;
grant execute on function public.deny_account(uuid) to authenticated;
