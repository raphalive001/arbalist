# Arbalist Capital — Deployment Guide

## 1. Supabase Setup
1. Go to https://supabase.com → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Open **SQL Editor** → paste `supabase/schema.sql` → Run
4. Then paste `supabase/002_admin.sql` → Edit your admin email → Run
5. Go to **Storage** → Create bucket named `kyc-documents` (set to **Private**)
6. Enable **Email Auth** in Authentication → Providers

## 2. Grant Admin Access (IMPORTANT)
Run this in Supabase SQL Editor — replace with your email:
```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
WHERE email = 'your@email.com';
```
Then sign out and sign back in. Go to `/admin` to access the panel.

## 3. Admin Panel URL
```
https://www.arbalistcapital.com.ng/admin
```
- Only users with `is_admin: true` in Supabase app_metadata can access it
- Non-admins see an "Access Denied" screen and are redirected
- You can access it from the same login — no separate admin login needed

## 4. Paystack Setup
1. Sign up at https://paystack.com
2. Settings → API Keys → copy your **Public Key**

## 5. Environment Variables
Create a `.env` file (or set in Vercel dashboard):
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_APP_NAME=Arbalist Capital
VITE_APP_URL=https://www.arbalistcapital.com.ng
```

## 6. Vercel Deployment
1. Push code to GitHub
2. Go to https://vercel.com → Import repository
3. Add all 5 environment variables in Vercel Project Settings → Environment Variables
4. Deploy — Vercel auto-detects Vite + React

## 7. Admin Panel Features
| Page | URL | What it does |
|------|-----|-------------|
| Overview | /admin | Live stats, pending alerts, recent transactions |
| Users | /admin/users | Search users, credit ROI, override balance |
| KYC | /admin/kyc | Approve/reject identity documents with image viewer |
| Investments | /admin/investments | Filter and view all investment plans |
| Transactions | /admin/transactions | Approve/reject withdrawals, paginated history |

## 8. Security Checklist
- [x] Admin access via Supabase app_metadata (JWT-based, tamper-proof)
- [x] Admin RLS policies on all tables (002_admin.sql)
- [x] Non-admins see Access Denied — cannot access data
- [x] CSP headers in vercel.json
- [x] HSTS + X-Frame-Options
- [x] .env in .gitignore — never committed to GitHub
