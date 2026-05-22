-- 003_storage_buckets.rollback.sql
-- Rollback: Removes storage buckets and policies

DROP POLICY IF EXISTS "Public media is viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to public media" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage own private media" ON storage.objects;
DELETE FROM storage.buckets WHERE id = 'media';
DELETE FROM storage.buckets WHERE id = 'private-media';
