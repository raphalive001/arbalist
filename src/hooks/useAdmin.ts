import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/types/database';

export type AdminProfile     = Database['public']['Tables']['profiles']['Row'];
export type AdminKYC         = Database['public']['Tables']['kyc_documents']['Row'] & {
  profiles?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email' | 'phone'> | null;
};
export type AdminInvestment  = Database['public']['Tables']['investments']['Row'] & {
  profiles?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email'> | null;
};
export type AdminTransaction = Database['public']['Tables']['transactions']['Row'] & {
  profiles?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email'> | null;
};

export interface AdminStats {
  totalUsers:           number;
  totalDeposited:       number;
  totalWithdrawn:       number;
  totalROIPaid:         number;
  activeInvestments:    number;
  pendingKYC:           number;
  pendingWithdrawals:   number;
  totalPlatformBalance: number;
}

/** Guaranteed-unique reference string — timestamp + 8 random chars */
function makeRef(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export function useAdmin() {
  const { profile, loading: authLoading } = useAuth();
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setChecking(false); return; }
    supabase.auth.getUser().then(({ data: { user } }) => {
      const flag =
        user?.app_metadata?.is_admin === true ||
        user?.user_metadata?.is_admin === true;
      setIsAdmin(flag);
      setChecking(false);
    });
  }, [profile, authLoading]);

  // ── Stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (): Promise<AdminStats> => {
    const [
      { count: totalUsers },
      { data: profileRows },
      { count: activeInvestments },
      { count: pendingKYC },
      { data: txData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('wallet_balance'),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('transactions').select('type, amount, status'),
    ]);

    // tx_status enum: 'pending' | 'success' | 'failed'  ← confirmed in schema.sql
    const totalDeposited    = (txData ?? []).filter(t => t.type === 'deposit'    && t.status === 'success').reduce((s, t) => s + t.amount, 0);
    const totalWithdrawn    = (txData ?? []).filter(t => t.type === 'withdrawal' && t.status === 'success').reduce((s, t) => s + t.amount, 0);
    const totalROIPaid      = (txData ?? []).filter(t => t.type === 'roi'        && t.status === 'success').reduce((s, t) => s + t.amount, 0);
    const pendingWithdrawals = (txData ?? []).filter(t => t.type === 'withdrawal' && t.status === 'pending').length;
    const totalPlatformBalance = (profileRows ?? []).reduce((s, p) => s + (p.wallet_balance ?? 0), 0);

    return { totalUsers: totalUsers ?? 0, totalDeposited, totalWithdrawn, totalROIPaid, activeInvestments: activeInvestments ?? 0, pendingKYC: pendingKYC ?? 0, pendingWithdrawals, totalPlatformBalance };
  }, []);

  // ── Users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (search = '', page = 0, pageSize = 20) => {
    let q = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (search.trim()) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    return q;
  }, []);

  // ── KYC ───────────────────────────────────────────────────────────
  const fetchKYCQueue = useCallback(async () => {
    return supabase
      .from('kyc_documents')
      .select('*, profiles(full_name, email, phone)')
      .in('status', ['pending', 'verified', 'rejected'])
      .order('created_at', { ascending: false });
  }, []);

  const approveKYC = useCallback(async (kycId: string, userId: string, action: 'verified' | 'rejected', reason?: string) => {
    const { error: kycErr } = await supabase
      .from('kyc_documents')
      .update({ status: action, rejection_reason: action === 'rejected' ? (reason ?? 'Does not meet requirements') : null, reviewed_at: new Date().toISOString() })
      .eq('id', kycId);
    if (kycErr) return { error: kycErr };

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ kyc_status: action })
      .eq('id', userId);
    return { error: profileErr };
  }, []);

  // ── Investments ────────────────────────────────────────────────────
  // NOTE: Reads all investments — requires admin RLS policy (see supabase/003_admin_rls.sql)
  const fetchInvestments = useCallback(async (statusFilter?: string) => {
    let q = supabase
      .from('investments')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    if (statusFilter && statusFilter !== 'all') {
      q = q.eq('status', statusFilter as 'active' | 'completed' | 'cancelled');
    }
    return q;
  }, []);

  // ── Transactions ───────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (typeFilter?: string, page = 0, pageSize = 30) => {
    let q = supabase
      .from('transactions')
      .select('*, profiles(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (typeFilter && typeFilter !== 'all') {
      q = q.eq('type', typeFilter as 'deposit' | 'withdrawal' | 'roi' | 'referral_bonus');
    }
    return q;
  }, []);

  // ── Process withdrawal (approve = 'success', reject = 'failed') ────
  const processWithdrawal = useCallback(async (txId: string, userId: string, amount: number, action: 'success' | 'failed') => {
    const { error: txErr } = await supabase.from('transactions').update({ status: action }).eq('id', txId);
    if (txErr) return { error: txErr };

    if (action === 'failed') {
      // Refund: add amount back to wallet
      const { data: prof } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
      if (prof) {
        await supabase.from('profiles').update({ wallet_balance: prof.wallet_balance + amount }).eq('id', userId);
      }
    }
    // Note: profiles table in schema.sql does NOT have total_withdrawn / total_deposited / total_roi
    // columns — those are in database.ts only. We only touch wallet_balance and total_earned.
    return { error: null };
  }, []);

  // ── Credit wallet — FIX: unique reference + correct status enum ────
  // tx_status enum values: 'pending' | 'success' | 'failed'
  const creditWallet = useCallback(async (
    userId: string,
    amount: number,
    note: string,
    type: 'deposit' | 'roi' | 'referral_bonus' = 'deposit',
  ) => {
    const { data: prof, error: fetchErr } = await supabase
      .from('profiles')
      .select('wallet_balance, total_earned')
      .eq('id', userId)
      .single();
    if (fetchErr || !prof) return { error: fetchErr ?? new Error('User not found') };

    const isEarning = type === 'roi' || type === 'referral_bonus';

    // FIX 1: makeRef() guarantees uniqueness — no more duplicate key violations
    // FIX 2: status is 'success' — matches schema check constraint exactly
    const [{ error: txErr }, { error: profileErr }] = await Promise.all([
      supabase.from('transactions').insert({
        user_id:     userId,
        type,
        amount,
        status:      'success',                                   // ✅ correct enum value
        reference:   makeRef('ADM'),                              // ✅ unique every time
        description: note || (type === 'deposit' ? 'Manual deposit by admin' : 'ROI credit by admin'),
      }),
      supabase.from('profiles').update({
        wallet_balance: prof.wallet_balance + amount,
        ...(isEarning ? { total_earned: (prof.total_earned ?? 0) + amount } : {}),
      }).eq('id', userId),
    ]);

    return { error: txErr ?? profileErr ?? null };
  }, []);

  const creditROI = useCallback(async (userId: string, amount: number, note: string) => {
    return creditWallet(userId, amount, note, 'roi');
  }, [creditWallet]);

  // ── Run Daily ROI — FIX: correct column name 'amount', unique refs ─
  const runDailyROI = useCallback(async () => {
    // FIX: select 'amount' — confirmed in schema.sql as `amount numeric(18,2)`
    const { data: investments, error } = await supabase
      .from('investments')
      .select('id, user_id, plan_id, amount, daily_rate, total_earned, last_credit_date')
      .eq('status', 'active');

    if (error) return { error, count: 0 };
    if (!investments?.length) return { error: null, count: 0 };

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let credited = 0;

    for (const inv of investments) {
      // Skip if already credited today (idempotency guard)
      if (inv.last_credit_date === today) continue;

      const roi = Math.round((inv.amount * inv.daily_rate) * 100) / 100;

      const { data: prof } = await supabase
        .from('profiles')
        .select('wallet_balance, total_earned')
        .eq('id', inv.user_id)
        .single();
      if (!prof) continue;

      // FIX: makeRef ensures unique reference per investment per day
      const [txResult, , invResult] = await Promise.all([
        supabase.from('transactions').insert({
          user_id:     inv.user_id,
          type:        'roi',
          amount:      roi,
          status:      'success',                                 // ✅ correct enum value
          reference:   makeRef(`ROI-${inv.id.slice(0, 6)}`),     // ✅ unique every time
          description: `Daily ROI — ${inv.plan_id}`,
        }),
        supabase.from('profiles').update({
          wallet_balance: prof.wallet_balance + roi,
          total_earned:   (prof.total_earned ?? 0) + roi,
        }).eq('id', inv.user_id),
        supabase.from('investments').update({
          total_earned:      inv.total_earned + roi,
          last_credit_date:  today,                               // prevents double-credit
        }).eq('id', inv.id),
      ]);

      if (!txResult.error) credited++;
    }

    return { error: null, count: credited };
  }, []);

  // ── Update any profile fields ──────────────────────────────────────
  const updateUserProfile = useCallback(async (
    userId: string,
    updates: Partial<Database['public']['Tables']['profiles']['Update']>,
  ) => {
    return supabase.from('profiles').update(updates).eq('id', userId);
  }, []);

  return {
    isAdmin, checking,
    fetchStats, fetchUsers,
    fetchKYCQueue, approveKYC,
    fetchInvestments, fetchTransactions,
    processWithdrawal,
    creditWallet, creditROI,
    runDailyROI,
    updateUserProfile,
  };
}
