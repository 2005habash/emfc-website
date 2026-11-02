
-- Replace the INSERT policy on storage.objects to require a UUID-prefixed unique subpath per upload
DROP POLICY IF EXISTS "Anyone can upload CV" ON storage.objects;

CREATE POLICY "Anyone can upload CV"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'cvs'
  AND lower(storage.extension(name)) = 'pdf'
  AND char_length(name) <= 255
  AND name ~ '^[a-z][a-z-]*/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[^/]+\.pdf$'
);

-- Admin-only UPDATE / DELETE on the cvs bucket
CREATE POLICY "Admins can update CVs"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'cvs' AND private.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'cvs' AND private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete CVs"
ON storage.objects
FOR DELETE
USING (bucket_id = 'cvs' AND private.has_role(auth.uid(), 'admin'));
