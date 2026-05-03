-- Create subscribers table for newsletter
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (subscribe)
CREATE POLICY "Enable insert for all" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- Only authenticated admins can view (you might need to adjust this based on your admin role logic)
CREATE POLICY "Enable read for admins only" ON public.subscribers
    FOR SELECT USING (auth.role() = 'authenticated');
