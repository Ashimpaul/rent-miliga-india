-- SAFE UPDATE TO delete_expired_listings FUNCTION
-- Ensures we only delete listings that actually have an expires_at date AND it's in the past
-- NULL expires_at (like old listings or forever plan listings) will NOT be deleted!

CREATE OR REPLACE FUNCTION public.delete_expired_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.listings
  WHERE 
    expires_at IS NOT NULL 
    AND expires_at < NOW();
END;
$$;

-- Also, let's make sure all existing listings without an expires_at date get set to NULL (or keep them as NULL, which they already are)
-- This function is now SAFE and won't delete old listings or forever plan listings!
