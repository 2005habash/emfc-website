
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;

-- Storage policies for cvs bucket
CREATE POLICY "Anyone can upload CV" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'cvs');
CREATE POLICY "Admins can read CVs" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'cvs' AND public.has_role(auth.uid(), 'admin'));
