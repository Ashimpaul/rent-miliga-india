-- Add user_type column to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'owner';
