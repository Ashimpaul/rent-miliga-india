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

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for everyone" ON public.blogs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert for everyone" ON public.blogs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update for everyone" ON public.blogs FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow delete for everyone" ON public.blogs FOR DELETE TO anon, authenticated USING (true);