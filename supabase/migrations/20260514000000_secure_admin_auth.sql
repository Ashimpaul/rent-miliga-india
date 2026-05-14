
-- SUPER SIMPLE & SECURE: Use Supabase Auth for Admin!
-- No more pgcrypto issues!

-- Step 1: First, replace 'YOUR_ADMIN_USER_UUID_HERE' with the actual User UID from your Supabase Auth Users page!
-- Step 2: Then run this query!

-- Cleanup old stuff
DROP FUNCTION IF EXISTS public.verify_admin_password(TEXT);
DROP FUNCTION IF EXISTS public.change_admin_password(TEXT, TEXT);
DROP TABLE IF EXISTS public.admin_credentials CASCADE;

-- Create a simple admin config table to store the admin user ID
CREATE TABLE IF NOT EXISTS public.admin_config (
    id TEXT PRIMARY KEY DEFAULT 'config',
    admin_user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 'config')
);

-- Enable RLS
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "No public access" ON public.admin_config;
CREATE POLICY "No public access" ON public.admin_config FOR ALL USING (false);

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_config 
        WHERE id = 'config' 
        AND admin_user_id = auth.uid()
    );
$$;

-- Optional: Insert your admin user ID (replace with your actual UUID!)
-- INSERT INTO public.admin_config (admin_user_id) 
-- VALUES ('YOUR_ADMIN_USER_UUID_HERE')
-- ON CONFLICT (id) DO UPDATE SET admin_user_id = EXCLUDED.admin_user_id;
