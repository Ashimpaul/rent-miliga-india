-- Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    video_url TEXT,
    author TEXT DEFAULT 'Admin',
    is_published BOOLEAN DEFAULT false
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blogs_updated_at
    BEFORE UPDATE ON blogs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up RLS (Row Level Security)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow select for everyone
DROP POLICY IF EXISTS "Allow select for everyone" ON public.blogs;
CREATE POLICY "Allow select for everyone" ON public.blogs
    FOR SELECT TO anon, authenticated USING (true);

-- Allow insert for everyone (for custom admin password system)
DROP POLICY IF EXISTS "Allow insert for admins" ON public.blogs;
CREATE POLICY "Allow insert for everyone" ON public.blogs
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Allow update for everyone
DROP POLICY IF EXISTS "Allow update for admins" ON public.blogs;
CREATE POLICY "Allow update for everyone" ON public.blogs
    FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Allow delete for everyone
DROP POLICY IF EXISTS "Allow delete for admins" ON public.blogs;
CREATE POLICY "Allow delete for everyone" ON public.blogs
    FOR DELETE TO anon, authenticated USING (true);

-- Create storage bucket for blog media if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'blog-media', 
    'blog-media', 
    true, 
    5242880, -- 5MB limit
    '{image/*,video/*}' -- Allow images and videos
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-media
-- Public Read Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'blog-media');

-- Insert Access
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Insert Access" ON storage.objects
    FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'blog-media');

-- Update Access
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Update Access" ON storage.objects
    FOR UPDATE TO anon, authenticated USING (bucket_id = 'blog-media') WITH CHECK (bucket_id = 'blog-media');

-- Delete Access
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Delete Access" ON storage.objects
    FOR DELETE TO anon, authenticated USING (bucket_id = 'blog-media');
