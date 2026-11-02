
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated, anon;

ALTER FUNCTION public.has_role(uuid, app_role) SET SCHEMA private;
REVOKE ALL ON FUNCTION private.has_role(uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, app_role) TO authenticated;

DROP POLICY IF EXISTS "Admins read signups" ON public.newsletter_signups;
CREATE POLICY "Admins read signups" ON public.newsletter_signups
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can read applications" ON public.applications;
CREATE POLICY "Admins can read applications" ON public.applications
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can read CVs" ON storage.objects;
CREATE POLICY "Admins can read CVs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND private.has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anyone can sign up" ON public.newsletter_signups;
CREATE POLICY "Anyone can sign up" ON public.newsletter_signups
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND char_length(email) BETWEEN 5 AND 254
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

DROP POLICY IF EXISTS "Anyone can apply" ON public.applications;
CREATE POLICY "Anyone can apply" ON public.applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    full_name IS NOT NULL AND char_length(full_name) BETWEEN 1 AND 200
    AND email IS NOT NULL AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND department IS NOT NULL AND char_length(department) BETWEEN 1 AND 100
    AND cv_path IS NOT NULL AND cv_path LIKE (department || '/%')
    AND consent = true
  );

DROP POLICY IF EXISTS "Anyone can upload CV" ON storage.objects;
CREATE POLICY "Anyone can upload CV" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'cvs'
    AND lower(storage.extension(name)) = 'pdf'
    AND (storage.foldername(name))[1] IS NOT NULL
    AND char_length(name) <= 255
  );
