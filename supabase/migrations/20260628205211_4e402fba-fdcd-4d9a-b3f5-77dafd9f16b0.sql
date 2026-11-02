ALTER TABLE public.applications ADD COLUMN IF NOT EXISTS position_type TEXT;
ALTER TABLE public.applications ALTER COLUMN motivation DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.newsletter_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.newsletter_signups TO authenticated;
GRANT INSERT ON public.newsletter_signups TO anon, authenticated;
GRANT ALL ON public.newsletter_signups TO service_role;
ALTER TABLE public.newsletter_signups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can sign up" ON public.newsletter_signups FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read signups" ON public.newsletter_signups FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));