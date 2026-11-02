
-- Roles for admin gating
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  department text NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  program text NOT NULL,
  graduation_year text NOT NULL,
  nationality text,
  linkedin_url text NOT NULL,
  experience text NOT NULL,
  desk_preference text,
  motivation text NOT NULL,
  relevant_experience text,
  cv_path text,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.applications TO anon, authenticated;
GRANT SELECT ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply" ON public.applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read applications" ON public.applications FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
