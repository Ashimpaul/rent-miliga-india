-- Add country and premium support to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS google_map_link TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image4 TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image5 TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image6 TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image7 TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image8 TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image9 TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS image10 TEXT;
