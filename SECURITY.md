
# RentMilega Security Hardening Guide
Last Updated: 2026-05-22

## Overview
This guide provides step-by-step instructions to fully secure your RentMilega application.

---

## ✅ Already Implemented

### 1. Frontend Security
- ✅ Content Security Policy (CSP) added to `vercel.json`
- ✅ X-Frame-Options (DENY)
- ✅ X-Content-Type-Options (nosniff)
- ✅ X-XSS-Protection (1; mode=block)
- ✅ Strict-Transport-Security (HSTS)
- ✅ Referrer-Policy
- ✅ Admin status validation via database (not just frontend)
- ✅ Auto-logout after 30 minutes of inactivity

### 2. Database & RLS Policies
- ✅ Comprehensive RLS policy migration file created: `supabase/migrations/20260522000000_comprehensive_security_hardening.sql`
- ✅ Phone number encryption migration created: `supabase/migrations/20260522000001_encrypt_phone_numbers.sql`

---

## ⚠️ REQUIRED ACTIONS (IMMEDIATE)

### 1. Deploy & Run RLS Migration
You must run the comprehensive security migration in Supabase:

1. Go to **Supabase Dashboard → SQL Editor**
2. Open **New Query**
3. Copy & paste the entire content of:  
   `supabase/migrations/20260522000000_comprehensive_security_hardening.sql`
4. Click **Run** to execute the migration

### 2. Configure Admin User
You MUST set your admin user ID in the database:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Find your admin user and copy the **User UID**
3. Go to **SQL Editor** and run this query (replace YOUR_ADMIN_UUID):
```sql
INSERT INTO public.admin_config (admin_user_id) 
VALUES ('YOUR_ADMIN_USER_UUID_HERE')
ON CONFLICT (id) DO UPDATE SET admin_user_id = EXCLUDED.admin_user_id;
```

### 3. Set Up Phone Number Encryption (IMPORTANT!)
To encrypt phone numbers:

1. Go to **Supabase Dashboard → SQL Editor**
2. Run the migration from: `supabase/migrations/20260522000001_encrypt_phone_numbers.sql`
3. **CRITICAL**: For production, use Supabase Vault to store your encryption key securely!
   - Go to **Supabase Dashboard → Vault**
   - Create a new secret with key: `ENCRYPTION_KEY`
   - Generate a strong random passphrase as the value
   - Update the `encrypt_phone` and `decrypt_phone` functions to use the Vault key instead of the temp key

### 4. Verify Environment Variables in Vercel
Ensure NO secret keys are exposed to the frontend:

- ✅ Use only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in frontend
- ❌ NEVER expose `SUPABASE_SERVICE_ROLE_KEY` in frontend code
- ✅ Store all server-side secrets only in Vercel Environment Variables (marked as "Secret")

---

## 🔍 Security Validation Checklist

After completing the above steps, verify security:

### 1. Unauthorized Blog Editing Test
- Log OUT of your admin account
- Try to edit or delete a blog post
- Expected Result: ❌ Should fail with RLS policy error

### 2. Unauthorized Listing Edit Test
- Try to edit a listing without knowing the password
- Expected Result: ❌ Should fail

### 3. Admin Dashboard Access Test
- Log OUT of admin account
- Visit /admin page
- Expected Result: ❌ Should show "Access Denied"

### 4. RLS Policy Verification
Run these queries in Supabase SQL Editor to verify:

```sql
-- Check if RLS is enabled on all tables
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

---

## 📊 Security Features Summary

### Frontend
- Content Security Policy (CSP)
- XSS Protection
- Clickjacking Prevention
- MIME Type Sniffing Prevention
- HSTS (HTTPS Enforcement)
- Auto-logout after inactivity

### Backend (Supabase)
- Row Level Security (RLS) on ALL tables
- Admin-only access to blogs and subscribers
- Public read access to listings (SEO friendly)
- Secure admin validation via `admin_config` table
- Phone number encryption (PGP)
- pgcrypto extension for encryption

---

## 🚨 Emergency Procedures

If you suspect a security breach:

1. **Rotate all secrets immediately** in Supabase and Vercel
2. **Review audit logs** in Supabase Dashboard
3. **Contact support** if needed

---

## 📚 Additional Resources
- Supabase RLS Documentation: https://supabase.com/docs/guides/auth/row-level-security
- Supabase Vault: https://supabase.com/docs/guides/database/vault
- Vercel Security: https://vercel.com/docs/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
