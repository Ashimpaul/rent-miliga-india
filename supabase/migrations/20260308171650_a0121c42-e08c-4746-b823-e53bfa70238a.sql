
-- Function to verify listing password without exposing it
CREATE OR REPLACE FUNCTION public.verify_listing_password(listing_id uuid, input_password text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.listings
    WHERE id = listing_id AND password = input_password
  );
$$;

-- Allow anyone to update listings (password check done in app via function)
CREATE POLICY "Anyone can update listings"
ON public.listings
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete listings (password check done in app via function)
CREATE POLICY "Anyone can delete listings"
ON public.listings
FOR DELETE
USING (true);
