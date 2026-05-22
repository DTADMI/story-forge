-- 003_storage_buckets.rollout.sql
-- Rollout: Storage buckets for media

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('private-media', 'private-media', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public media is viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload to public media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can manage own private media"
  ON storage.objects FOR ALL
  USING (bucket_id = 'private-media' AND auth.uid()::text = owner_id::text);
