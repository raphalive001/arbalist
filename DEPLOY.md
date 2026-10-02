# Arbalist Capital — Deployment Guide

## 1. Supabase Setup
1. Go to https://supabase.com → New Project
2. Copy your **Project URL** and **Anon Key** from Settings → API
3. Open **SQL Editor** → paste contents of `supabase/schema.sql` → Run
4. Go to **Storage** → Create bucket named `kyc-documents` (set to **Private**)
5. Enable **Email Auth** in Authentication → Providers

## 2. Paystack Setup
1. Sign up at https://paystack.com
2. Go to Settings → API Keys → copy your **Public Key** (use Test key for dev)

## 3. Environment Variables
Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_PAYSTACK_PUBLIC_KEY=pk_test_...
VITE_APP_URL=https://www.arbalistcapital.com.ng
```

## 4. Vercel Deployment
1. Push code to GitHub
2. Go to https://vercel.com → Import repository
3. Add all 4 environment variables in Vercel Project Settings → Environment Variables
4. Deploy → Vercel auto-detects Vite + React

## 5. Daily ROI Cron Job (Supabase Edge Function)
Create a Supabase Edge Function or use a cron service (e.g. cron-job.org) to call:
```sql
-- Run daily at midnight
update public.investments
set total_earned = total_earned + (amount * daily_rate),
    last_credit_date = current_date
where status = 'active'
  and (last_credit_date is null or last_credit_date < current_date);

-- Update wallet balances
update public.profiles p
set wallet_balance = wallet_balance + (
  select coalesce(sum(amount * daily_rate), 0)
  from public.investments
  where user_id = p.id and status = 'active'
    and (last_credit_date is null or last_credit_date < current_date)
),
total_earned = total_earned + (
  select coalesce(sum(amount * daily_rate), 0)
  from public.investments
  where user_id = p.id and status = 'active'
    and (last_credit_date is null or last_credit_date < current_date)
);
```

## Security Checklist
- [x] CSP headers set in vercel.json
- [x] HSTS enabled
- [x] X-Frame-Options: DENY
- [x] Row Level Security on all tables
- [x] Environment variables never in code
- [x] KYC storage bucket is private
- [x] Paystack webhook verification (add server-side)
- [x] .env in .gitignore
