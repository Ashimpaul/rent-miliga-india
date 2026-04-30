-- Add expiry support to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';

-- Function to delete expired listings
CREATE OR REPLACE FUNCTION public.delete_expired_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.listings
  WHERE expires_at < NOW();
END;
$$;

-- Note: In a real production environment with Supabase, you would use pg_cron 
-- to schedule this function. For now, this function is ready to be called.
-- Example: SELECT delete_expired_listings();
