
-- PHONE NUMBER ENCRYPTION MIGRATION
-- Date: 2026-05-22

-- Step 1: Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Add encrypted_phone column to listings
ALTER TABLE IF EXISTS listings
ADD COLUMN IF NOT EXISTS encrypted_phone TEXT;

-- Step 3: Create a function to encrypt phone numbers
CREATE OR REPLACE FUNCTION public.encrypt_phone(phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Use a placeholder encryption key for now
  -- In production, store this key in Supabase Vault!
  RETURN pgp_sym_encrypt(phone, 'temp-encryption-key-change-me-in-vault');
END;
$$;

-- Step 4: Create a function to decrypt phone numbers
CREATE OR REPLACE FUNCTION public.decrypt_phone(encrypted_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted_phone::bytea, 'temp-encryption-key-change-me-in-vault');
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- Step 5: Create a policy that only allows decrypting if user is admin OR (for listings, maybe allow public read for contact?)
-- Note: For public listings, we need to allow decryption for contact purposes
-- For stricter security, you could require auth, but that breaks your "no signup" UX

-- Optional: Migrate existing phone numbers to encrypted
-- UPDATE listings 
-- SET encrypted_phone = public.encrypt_phone(phone_number)
-- WHERE encrypted_phone IS NULL;
