import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/types/database';

export type AdminProfile    = Database['public']['Tables']['profiles']['Row'] & { is_admin?: boolean };
export type AdminKYC        = Database['public']['Tables']['kyc_documents']['Row'] & {
  profiles?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email' | 'phone'>;
};
export type AdminInvestment = Database['public']['Tables']['investments']['Row'] & {
  profiles?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email'>;
};
export type AdminTransaction = Database['public']['Tables']['transactions']['Row'] & {
  profiles?: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name' | 'email'>;
};

export interface AdminStats {
  totalUsers:        number;
  totalDeposited:    number;
  totalWithdrawn:    number;
  totalROIPaid:      number;
  activeInvestments: number;
  pendingKYC:        number;
  pendingWithdrawals: number;
  totalPlatformBalance: number;
}

export function useAdmin() {
  const { profile, loading: authLoading } = useAuth();
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!profile) { setChecking(false); return; }

    // Read is_admin directly from the profiles row.
    // app_metadata is only writable via the service-role Admin API,
    // so checking the JWT for it will never work from the client.
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', profile.id)
      .single()
      .then(
        ({ data }) => { setIsAdmin(data?.is_admin === true); setChecking(false); },
        ()         => { setIsAdmin(false);                   setChecking(false); },
      );
  }, [profile, authLoading]);

  // ── Stats ──────────────────────────────────────────────────────────
  const fetchStats = useCallback(async (): Promise<AdminStats> => {
    const [
      { count: totalUsers },
      { data: profiles },
      { count: activeInvestments },
      { count: pendingKYC },
      { data: txData },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('wallet_balance, total_invested, total_earned'),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('kyc_documents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('transactions').select('type, amount, status'),
    ]);

    const totalDeposited = (txData ?? [])
      .filter(t => t.type === 'deposit' && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);

    const totalWithdrawn = (txData ?? [])
      .filter(t => t.type === 'withdrawal' && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);

    const totalROIPaid = (txData ?? [])
      .filter(t => t.type === 'roi' && t.status === 'success')
      .reduce((s, t) => s + t.amount, 0);

    const pendingWithdrawals = (txData ?? [])
      .filter(t => t.type === 'withdrawal' && t.status === 'pending').length;

    const totalPlatformBalance = (profiles ?? [])
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
      .select(`*, profiles(full_name, email, phone)`)
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
        status:          action,
        rejection_reason: action === 'rejected' ? (reason ?? 'Does not meet requirements') : null,
        reviewed_at:     new Date().toISOString(),
      })
      .eq('id', kycId);

    if (kycErr) return { error: kycErr };

    const profileStatus = action === 'verified' ? 'verified' : 'rejected';
    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ kyc_status: profileStatus })
      .eq('id', userId);

    return { error: profileErr };
  }, []);

  // ── Investments ────────────────────────────────────────────────────
  const fetchInvestments = useCallback(async (statusFilter?: string) => {
    let q = supabase
      .from('investments')
      .select(`*, profiles(full_name, email)`)
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
      .select(`*, profiles(full_name, email)`, { count: 'exact' })
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

    // If failed, refund wallet balance
    if (action === 'failed') {
      const { data: prof } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
      if (prof) {
        await supabase.from('profiles')
          .update({ wallet_balance: prof.wallet_balance + amount })
          .eq('id', userId);
      }
    }
    return { error: null };
  }, []);

  // ── Credit manual ROI ──────────────────────────────────────────────
  const creditROI = useCallback(async (userId: string, amount: number, note: string) => {
    const { data: prof } = await supabase.from('profiles').select('wallet_balance, total_earned').eq('id', userId).single();
    if (!prof) return { error: new Error('User not found') };

    const [{ error: txErr }, { error: profileErr }] = await Promise.all([
      supabase.from('transactions').insert({
        user_id:     userId,
        type:        'roi',
        amount,
        status:      'success',
        reference:   `ADM-ROI-${Date.now()}`,
        description: note || 'Manual ROI credit by admin',
      }),
      supabase.from('profiles').update({
        wallet_balance: prof.wallet_balance + amount,
        total_earned:   prof.total_earned + amount,
      }).eq('id', userId),
    ]);
    return { error: txErr ?? profileErr };
  }, []);

  // ── Update user profile ────────────────────────────────────────────
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
    creditROI,
    updateUserProfile,
  };
}
