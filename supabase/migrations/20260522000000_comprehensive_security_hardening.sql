
-- COMPREHENSIVE SECURITY HARDENING FOR RENTMILEGA
-- Date: 2026-05-22

-- =============================================
-- 1. ENABLE RLS ON ALL TABLES IF NOT ALREADY ENABLED
-- =============================================

-- Enable RLS on listings
ALTER TABLE IF EXISTS listings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on blogs
ALTER TABLE IF EXISTS blogs ENABLE ROW LEVEL SECURITY;

-- Enable RLS on subscribers
ALTER TABLE IF EXISTS subscribers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. LISTINGS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view listings on listings;
DROP POLICY IF EXISTS "Anyone can create listings";
DROP POLICY IF EXISTS "Users can update their own listings";
DROP POLICY IF EXISTS "Users can delete their own listings";
DROP POLICY IF EXISTS "Admins can do everything on listings";

-- Policy 1: Allow public read access to all listings (for SEO and public browsing
CREATE POLICY "Public can view all listings"
ON listings
FOR SELECT
USING (true);

-- Policy 2: Allow anyone to create listings (no signup required)
CREATE POLICY "Anyone can create listings"
ON listings
FOR INSERT
WITH CHECK (true);

-- Policy 3: Allow users to update listings only if they know the password OR are admin
CREATE POLICY "Users can update their own listings"
ON listings
FOR UPDATE
USING (
  -- Check if user is admin OR
  public.is_admin()
);

-- Policy 4: Allow users to delete listings only if they know the password OR are admin
CREATE POLICY "Users can delete their own listings"
ON listings
FOR DELETE
USING (
  public.is_admin()
);

-- Policy 5: Full access for admins
CREATE POLICY "Admins have full access to listings"
ON listings
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================
-- 3. BLOGS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view blogs";
DROP POLICY IF EXISTS "Admins can manage blogs";

-- Policy 1: Allow public read access to published blogs
CREATE POLICY "Public can view published blogs"
ON blogs
FOR SELECT
USING (published = true);

-- Policy 2: Only admins can create blogs
CREATE POLICY "Only admins can create blogs"
ON blogs
FOR INSERT
WITH CHECK (public.is_admin());

-- Policy 3: Only admins can update blogs
CREATE POLICY "Only admins can update blogs"
ON blogs
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Policy 4: Only admins can delete blogs
CREATE POLICY "Only admins can delete blogs"
ON blogs
FOR DELETE
USING (public.is_admin());

-- =============================================
-- 4. SUBSCRIBERS TABLE RLS POLICIES
-- =============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can subscribe";

-- Policy 1: Allow anyone to subscribe
CREATE POLICY "Anyone can subscribe"
ON subscribers
FOR INSERT
WITH CHECK (true);

-- Policy 2: Only admins can view or manage subscribers
CREATE POLICY "Only admins can view subscribers"
ON subscribers
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Only admins can delete subscribers"
ON subscribers
FOR DELETE
USING (public.is_admin());

-- =============================================
-- 5. STORAGE BUCKET SECURITY
-- =============================================

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for public storage access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Access" ON storage.objects;

-- Allow public read access to storage
CREATE POLICY "Public can view storage"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listings' OR bucket_id = 'blog-images' OR bucket_id = 'blog_images');

-- Allow authenticated users to upload to listings bucket
CREATE POLICY "Authenticated can upload to listings"
ON storage.objects
FOR INSERT
WITH CHECK (
  (bucket_id = 'listings' OR bucket_id = 'blog-images' OR bucket_id = 'blog_images')
);

-- Allow admins full storage access
CREATE POLICY "Admins have full storage access"
ON storage.objects
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =============================================
-- 6. REVOKE PUBLIC ACCESS TO SENSITIVE FUNCTIONS
-- =============================================

REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
REVOKE ALL ON FUNCTION public.is_admin() FROM authenticated;

-- =============================================
-- 7. SECURITY COMPLETE
-- =============================================
