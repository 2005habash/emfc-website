-- Security, tidy-up (4 November 2026): part 2's link checks get a fixed search path, as Supabase's
-- Security Advisor asks of every function, so nothing in another schema can stand in for what they use.
-- They only use built-ins and each other (by full name), so they work the same.
alter function private.safe_url(text) set search_path = '';
alter function private.safe_link(text) set search_path = '';
alter function private.safe_urls(text[]) set search_path = '';
alter function private.safe_photos(jsonb) set search_path = '';
