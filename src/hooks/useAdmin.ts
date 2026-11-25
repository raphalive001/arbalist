import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

export type AdminProfile     = Database['public']['Tables']['profiles']['Row'];
export type AdminKYC = Database['public']['Tables']['kyc_documents']['Row'] & {
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
  const [isAdmin,  setIsAdmin]  = useState(false);
  const [checking, setChecking] = useState(true);

  const checkAdminStatus = useCallback(async (userId: string) => {
    // Check profiles.is_admin from the database — this is the authoritative source.
    // app_metadata requires the service-role key (server-side) to set, so we fall back
    // to the profiles table which is managed via Supabase Table Editor / RLS policies.
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();
    setIsAdmin(profile?.is_admin === true);
    setChecking(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        // Accept either app_metadata flag (if set via service role) OR profiles.is_admin
        const appMetaAdmin = user?.app_metadata?.is_admin === true;
        if (appMetaAdmin) {
          setIsAdmin(true);
          setChecking(false);
        } else {
          checkAdminStatus(user.id);
        }
      } else {
        setIsAdmin(false);
        setChecking(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const appMetaAdmin = session.user?.app_metadata?.is_admin === true;
        if (appMetaAdmin) {
          setIsAdmin(true);
          setChecking(false);
        } else {
          checkAdminStatus(session.user.id);
        }
      } else {
        setIsAdmin(false);
        setChecking(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

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
      .select('*, profiles!kyc_documents_user_id_fkey(full_name, email, phone)')
      .order('created_at', { ascending: false });
  }, []);

  const approveKYC = useCallback(async (
    kycId: string,
    userId: string,
    action: 'verified' | 'rejected',
    reason?: string,
  ) => {
    const { data: { user: reviewer } } = await supabase.auth.getUser();

    const { error: kycErr } = await supabase
      .from('kyc_documents')
      .update({
        status:           action,
        rejection_reason: action === 'rejected' ? (reason ?? 'Does not meet requirements') : null,
        reviewed_by:      reviewer?.id ?? null,
        reviewed_at:      new Date().toISOString(),
      })
      .eq('id', kycId);
    if (kycErr) return { error: kycErr };

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({ kyc_status: action })
      .eq('id', userId);

    return { error: profileErr };
  }, []);

  const getKYCFileUrl = useCallback(async (value: string | null): Promise<string | null> => {
    if (!value) return null;
    const marker = '/kyc-documents/';
    const idx    = value.indexOf(marker);
    const path   = value.startsWith('http') && idx !== -1
      ? decodeURIComponent(value.slice(idx + marker.length).split('?')[0])
      : value;
    const { data, error } = await supabase.storage.from('kyc-documents').createSignedUrl(path, 3600);
    if (error || !data) return value.startsWith('http') ? value : null;
    return data.signedUrl;
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

  // ── Credit wallet ──────────────────────────────────────────────────
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

    const { data: tx, error: txErr } = await supabase
      .from('transactions')
      .insert({
        user_id:     userId,
        type,
        amount,
        status:      'success',
        reference:   `ADM-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        description: note || (type === 'deposit' ? 'Manual deposit by admin' : 'ROI credit by admin'),
      })
      .select('id')
      .single();
    if (txErr || !tx) return { error: txErr ?? new Error('Could not record the transaction') };

    const { error: profileErr } = await supabase
      .from('profiles')
      .update({
        wallet_balance: prof.wallet_balance + amount,
        ...(isEarning ? { total_earned: (prof.total_earned ?? 0) + amount } : {}),
      })
      .eq('id', userId);

    if (profileErr) {
      await supabase.from('transactions').update({ status: 'failed' }).eq('id', tx.id);
      return { error: profileErr };
    }

    return { error: null };
  }, []);

  const creditROI = useCallback(async (userId: string, amount: number, note: string) => {
    return creditWallet(userId, amount, note, 'roi');
  }, [creditWallet]);

  const runDailyROI = useCallback(async () => {
    const { data, error } = await supabase.rpc('credit_daily_roi');
    if (error) return { error, count: 0 };
    return { error: null, count: typeof data === 'number' ? data : 0 };
  }, []);

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
    getKYCFileUrl,
    fetchInvestments,
    fetchTransactions,
    processWithdrawal,
    creditWallet,
    creditROI,
    runDailyROI,
    updateUserProfile,
  };
}
