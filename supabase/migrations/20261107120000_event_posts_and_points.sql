-- Events (7 November 2026): the club's LinkedIn post about each event, shown as "See the post", and
-- what members took away, one line each (Vasco's site review, E3). The post link must be https, like
-- the event's other links.
alter table public.events add column if not exists post text;
alter table public.events add column if not exists points text[] not null default '{}';
alter table public.events drop constraint if exists events_safe_post;
alter table public.events add constraint events_safe_post check (private.safe_link(post));
