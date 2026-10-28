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

export function useAdmin() {
  const { profile, loading: authLoading } = useAuth();
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setChecking(false); return; }

    const flag = (profile as any)?.is_admin === true;
    setIsAdmin(flag);
    setChecking(false);
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

    const totalDeposited = (txData ?? [])
      .filter(t => t.type === 'deposit'    && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);

    const totalWithdrawn = (txData ?? [])
      .filter(t => t.type === 'withdrawal' && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);

    const totalROIPaid = (txData ?? [])
      .filter(t => t.type === 'roi'        && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);

    const pendingWithdrawals = (txData ?? [])
      .filter(t => t.type === 'withdrawal' && t.status === 'pending').length;

    const totalPlatformBalance = (profileRows ?? [])
      .reduce((s, p) => s + (p.wallet_balance ?? 0), 0);

    return {
      totalUsers:           totalUsers ?? 0,
      totalDeposited,
      totalWithdrawn,
      totalROIPaid,
      activeInvestments:    activeInvestments ?? 0,
      pendingKYC:           pendingKYC ?? 0,
      pendingWithdrawals,
      totalPlatformBalance,
    };
  }, []);

  // ── Users ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (search = '', page = 0, pageSize = 20) => {
    let q = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    if (search.trim()) {
      q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }
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

  const approveKYC = useCallback(async (
    kycId: string,
    userId: string,
    action: 'verified' | 'rejected',
    reason?: string,
  ) => {
    const { error: kycErr } = await supabase
      .from('kyc_documents')
      .update({
        status:           action,
        rejection_reason: action === 'rejected' ? (reason ?? 'Does not meet requirements') : null,
        reviewed_at:      new Date().toISOString(),
      })
      .eq('id', kycId);
    if (kycErr) return { error: kycErr };

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ kyc_status: action === 'verified' ? 'verified' : 'rejected' })
      .eq('id', userId);

    return { error: profileErr };
  }, []);

  // ── Investments ────────────────────────────────────────────────────
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

  // ── Approve / Reject withdrawal ────────────────────────────────────
  const processWithdrawal = useCallback(async (
    txId: string,
    userId: string,
    amount: number,
    action: 'success' | 'failed',
  ) => {
    const { error: txErr } = await supabase
      .from('transactions')
      .update({ status: action })
      .eq('id', txId);
    if (txErr) return { error: txErr };

    if (action === 'failed') {
      // Refund wallet
      const { data: prof } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
      if (prof) {
        await supabase
          .from('profiles')
          .update({ wallet_balance: prof.wallet_balance + amount })
          .eq('id', userId);
      }
    } else {
      // Mark as paid — update total_withdrawn
      const { data: prof } = await supabase
        .from('profiles')
        .select('total_withdrawn')
        .eq('id', userId)
        .single();
      if (prof) {
        await supabase
          .from('profiles')
          .update({ total_withdrawn: (prof.total_withdrawn ?? 0) + amount })
          .eq('id', userId);
      }
    }
    return { error: null };
  }, []);

  // ── Credit wallet (manual bank transfer confirmed by admin) ────────
  // This is the MAIN method for adding funds without Paystack.
  // Bumps wallet_balance. Type = 'deposit' so it shows in user's Transactions.
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

    const [{ error: txErr }, { error: profileErr }] = await Promise.all([
      // Log transaction visible to the user
      supabase.from('transactions').insert({
        user_id:     userId,
        type,
        amount,
        status:      'success',
        reference:   `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        description: note || (type === 'deposit' ? 'Manual deposit by admin' : 'ROI credit by admin'),
      }),
      // Update profile
      supabase.from('profiles').update({
        wallet_balance: prof.wallet_balance + amount,
        ...(isEarning ? { total_earned: (prof.total_earned ?? 0) + amount } : {}),
      }).eq('id', userId),
    ]);

    return { error: txErr ?? profileErr };
  }, []);

  // ── Credit ROI (alias kept for backwards compatibility) ────────────
  const creditROI = useCallback(async (userId: string, amount: number, note: string) => {
    return creditWallet(userId, amount, note, 'roi');
  }, [creditWallet]);

  // ── Run daily ROI for ALL active investments ───────────────────────
  const runDailyROI = useCallback(async () => {
    const { data: investments, error } = await supabase
      .from('investments')
      .select('id, user_id, amount, daily_rate, plan_id, total_earned')
      .eq('status', 'active');

    if (error || !investments?.length) return { error, count: 0 };

    let credited = 0;
    for (const inv of investments) {
      const roi = inv.amount * inv.daily_rate;
      const { data: prof } = await supabase
        .from('profiles')
        .select('wallet_balance, total_earned')
        .eq('id', inv.user_id)
        .single();
      if (!prof) continue;

      await Promise.all([
        supabase.from('transactions').insert({
          user_id:     inv.user_id,
          type:        'roi',
          amount:      roi,
          status:      'success',
          reference:   `ROI-${inv.id.slice(0, 8)}-${Date.now()}`,
          description: `Daily ROI — ${inv.plan_id}`,
        }),
        supabase.from('profiles').update({
          wallet_balance: prof.wallet_balance + roi,
          total_earned:   (prof.total_earned ?? 0) + roi,
        }).eq('id', inv.user_id),
        supabase.from('investments').update({
          total_earned: inv.total_earned + roi,
        }).eq('id', inv.id),
      ]);
      credited++;
    }
    return { error: null, count: credited };
  }, []);

  // ── Update user profile fields ─────────────────────────────────────
  const updateUserProfile = useCallback(async (
    userId: string,
    updates: Partial<Database['public']['Tables']['profiles']['Update']>,
  ) => {
    return supabase.from('profiles').update(updates).eq('id', userId);
  }, []);

  return {
    isAdmin,
    checking,
    fetchStats,
    fetchUsers,
    fetchKYCQueue,
    approveKYC,
    fetchInvestments,
    fetchTransactions,
    processWithdrawal,
    creditWallet,
    creditROI,
    runDailyROI,
    updateUserProfile,
  };
}
