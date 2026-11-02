GRANT SELECT, INSERT ON public.applications TO authenticated;
GRANT INSERT ON public.applications TO anon;
GRANT ALL ON public.applications TO service_role;

GRANT SELECT, INSERT ON public.newsletter_signups TO authenticated;
GRANT INSERT ON public.newsletter_signups TO anon;
GRANT ALL ON public.newsletter_signups TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;