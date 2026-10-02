-- ============================================================
--  ARBALIST CAPITAL — Supabase Database Schema
--  Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── PROFILES ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  full_name        text,
  phone            text,
  avatar_url       text,
  kyc_status       text not null default 'pending'
                   check (kyc_status in ('pending','submitted','verified','rejected')),
  referral_code    text not null unique default upper(substring(gen_random_uuid()::text, 1, 8)),
  referred_by      text,
  wallet_balance   numeric(18,2) not null default 0,
  total_invested   numeric(18,2) not null default 0,
  total_earned     numeric(18,2) not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  ref_code text;
  referrer_id uuid;
begin
  -- Generate unique referral code
  ref_code := upper(substring(gen_random_uuid()::text, 1, 8));

  insert into public.profiles (id, email, full_name, referred_by, referral_code)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'referred_by',
    ref_code
  );

  -- Process referral if code provided
  if new.raw_user_meta_data->>'referred_by' is not null then
    select id into referrer_id
    from public.profiles
    where referral_code = new.raw_user_meta_data->>'referred_by'
    limit 1;

    if referrer_id is not null then
      insert into public.referrals (referrer_id, referred_id, bonus_amount, status)
      values (referrer_id, new.id, 0, 'pending');
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── KYC DOCUMENTS ────────────────────────────────────────────
create table if not exists public.kyc_documents (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  doc_type         text not null check (doc_type in ('national_id','drivers_license','passport','voters_card')),
  doc_number       text not null,
  front_url        text not null,
  back_url         text,
  selfie_url       text not null,
  status           text not null default 'pending' check (status in ('pending','verified','rejected')),
  rejection_reason text,
  reviewed_by      uuid references public.profiles(id),
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

-- ── INVESTMENTS ──────────────────────────────────────────────
create table if not exists public.investments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  plan_id          text not null,
  amount           numeric(18,2) not null,
  daily_rate       numeric(8,6) not null default 0.013,
  status           text not null default 'active' check (status in ('active','completed','cancelled')),
  start_date       timestamptz not null default now(),
  end_date         timestamptz,
  total_earned     numeric(18,2) not null default 0,
  last_credit_date date,
  created_at       timestamptz not null default now()
);

-- ── TRANSACTIONS ─────────────────────────────────────────────
create table if not exists public.transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.profiles(id) on delete cascade,
  type                text not null check (type in ('deposit','withdrawal','roi','referral_bonus')),
  amount              numeric(18,2) not null,
  status              text not null default 'pending' check (status in ('pending','success','failed')),
  reference           text not null unique,
  description         text,
  paystack_reference  text,
  bank_name           text,
  account_number      text,
  account_name        text,
  created_at          timestamptz not null default now()
);

-- ── REFERRALS ────────────────────────────────────────────────
create table if not exists public.referrals (
  id           uuid primary key default gen_random_uuid(),
  referrer_id  uuid not null references public.profiles(id) on delete cascade,
  referred_id  uuid not null references public.profiles(id) on delete cascade,
  bonus_amount numeric(18,2) not null default 0,
  status       text not null default 'pending' check (status in ('pending','credited')),
  created_at   timestamptz not null default now(),
  unique (referrer_id, referred_id)
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.kyc_documents  enable row level security;
alter table public.investments    enable row level security;
alter table public.transactions   enable row level security;
alter table public.referrals      enable row level security;

-- profiles: users see & edit only their own
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- kyc_documents
create policy "kyc_select_own"  on public.kyc_documents for select using (auth.uid() = user_id);
create policy "kyc_insert_own"  on public.kyc_documents for insert with check (auth.uid() = user_id);

-- investments
create policy "inv_select_own"  on public.investments for select using (auth.uid() = user_id);
create policy "inv_insert_own"  on public.investments for insert with check (auth.uid() = user_id);

-- transactions
create policy "tx_select_own"   on public.transactions for select using (auth.uid() = user_id);
create policy "tx_insert_own"   on public.transactions for insert with check (auth.uid() = user_id);

-- referrals
create policy "ref_select_own"  on public.referrals for select using (auth.uid() = referrer_id);

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Run this in Supabase Storage UI or use the dashboard
-- Bucket name: kyc-documents (private)
-- insert into storage.buckets (id, name, public) values ('kyc-documents', 'kyc-documents', false);

-- ── INDEXES ──────────────────────────────────────────────────
create index if not exists idx_investments_user     on public.investments(user_id);
create index if not exists idx_investments_status   on public.investments(status);
create index if not exists idx_transactions_user    on public.transactions(user_id);
create index if not exists idx_transactions_type    on public.transactions(type);
create index if not exists idx_referrals_referrer   on public.referrals(referrer_id);
create index if not exists idx_profiles_referral    on public.profiles(referral_code);
