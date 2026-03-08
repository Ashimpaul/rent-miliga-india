-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  rent INTEGER NOT NULL,
  description TEXT,
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  pincode TEXT,
  owner_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  image1 TEXT,
  image2 TEXT,
  image3 TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read listings
CREATE POLICY "Anyone can view listings" ON public.listings FOR SELECT USING (true);

-- Anyone can insert listings (no auth required)
CREATE POLICY "Anyone can create listings" ON public.listings FOR INSERT WITH CHECK (true);

-- Create storage bucket for listing images
INSERT INTO storage.buckets (id, name, public) VALUES ('listing-images', 'listing-images', true);

-- Anyone can view listing images
CREATE POLICY "Listing images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'listing-images');

-- Anyone can upload listing images
CREATE POLICY "Anyone can upload listing images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'listing-images');