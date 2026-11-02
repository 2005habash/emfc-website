-- Remove the permissive anon/authenticated INSERT policy on the cvs bucket.
-- Uploads now flow exclusively through a server function using the service role,
-- which bypasses RLS entirely, so no INSERT policy is needed for that path.
DROP POLICY IF EXISTS "Anyone can upload CV" ON storage.objects;