-- ============================================================
--  ARBALIST CAPITAL — Admin Setup Migration
--  Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Grant yourself admin via Supabase app_metadata ──────
-- Replace 'your@email.com' with your actual admin email.
-- This sets is_admin in the JWT app_metadata — the frontend
-- reads this from supabase.auth.getUser().data.user.app_metadata.

UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"is_admin": true}'
WHERE email = 'your@email.com';  -- ← CHANGE THIS

-- To verify it worked:
-- SELECT email, raw_app_meta_data FROM auth.users WHERE email = 'your@email.com';


-- ── 2. Admin RLS policies (profiles — read all) ─────────────
-- These policies let admins read any row even with RLS on.
-- They use the is_admin flag in the JWT app_metadata.

CREATE POLICY "Admins read all profiles"
  ON public.profiles FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );

CREATE POLICY "Admins update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );


-- ── 3. Admin read all kyc_documents ─────────────────────────
CREATE POLICY "Admins read all kyc_documents"
  ON public.kyc_documents FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );

CREATE POLICY "Admins update all kyc_documents"
  ON public.kyc_documents FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );


-- ── 4. Admin read all investments ───────────────────────────
CREATE POLICY "Admins read all investments"
  ON public.investments FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );


-- ── 5. Admin read + update all transactions ─────────────────
CREATE POLICY "Admins read all transactions"
  ON public.transactions FOR SELECT
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );

CREATE POLICY "Admins update all transactions"
  ON public.transactions FOR UPDATE
  USING (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );

CREATE POLICY "Admins insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'is_admin')::boolean IS TRUE
  );


-- ── 6. To revoke admin access ───────────────────────────────
-- UPDATE auth.users
-- SET raw_app_meta_data = raw_app_meta_data - 'is_admin'
-- WHERE email = 'their@email.com';


-- ── 7. Helper view: admin summary (optional) ────────────────
CREATE OR REPLACE VIEW public.admin_summary AS
SELECT
  (SELECT COUNT(*)                              FROM public.profiles)                                 AS total_users,
  (SELECT COUNT(*)                              FROM public.profiles WHERE kyc_status = 'submitted')  AS pending_kyc,
  (SELECT COUNT(*)                              FROM public.investments WHERE status = 'active')       AS active_investments,
  (SELECT COALESCE(SUM(amount), 0)              FROM public.transactions WHERE type = 'deposit'  AND status = 'success') AS total_deposited,
  (SELECT COALESCE(SUM(amount), 0)              FROM public.transactions WHERE type = 'withdrawal' AND status = 'success') AS total_withdrawn,
  (SELECT COALESCE(SUM(amount), 0)              FROM public.transactions WHERE type = 'roi'       AND status = 'success') AS total_roi_paid,
  (SELECT COUNT(*)                              FROM public.transactions WHERE type = 'withdrawal' AND status = 'pending') AS pending_withdrawals,
  (SELECT COALESCE(SUM(wallet_balance), 0)      FROM public.profiles)                                 AS total_platform_balance;
