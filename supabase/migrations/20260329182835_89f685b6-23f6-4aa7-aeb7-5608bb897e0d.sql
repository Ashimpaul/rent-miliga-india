
-- Create the blog-media storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Allow public read access on blog-media"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'blog-media');

-- Allow public upload
CREATE POLICY "Allow public upload to blog-media"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'blog-media');

-- Allow public update
CREATE POLICY "Allow public update on blog-media"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'blog-media')
WITH CHECK (bucket_id = 'blog-media');

-- Allow public delete
CREATE POLICY "Allow public delete on blog-media"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'blog-media');
