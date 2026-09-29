import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  supabase, authHelpers, profileHelpers, kycHelpers,
  investmentHelpers, transactionHelpers, withdrawalHelpers,
  type Profile, type KYC, type Investment, type Transaction, type WithdrawalRequest,
} from '../lib/supabase';

export type { Profile, KYC, Investment, Transaction, WithdrawalRequest };

export interface UserState {
  profile:      Profile;
  kyc:          KYC | null;
  investments:  Investment[];
  transactions: Transaction[];
  withdrawals:  WithdrawalRequest[];
}

interface AuthContextType {
  user:               UserState | null;
  isAuthenticated:    boolean;
  isLoading:          boolean;
  login:              (email: string, password: string)   => Promise<{ success: boolean; message: string }>;
  register:           (data: RegisterData)                => Promise<{ success: boolean; message: string }>;
  logout:             ()                                  => Promise<void>;
  submitKYC:          (data: KYCSubmit)                   => Promise<{ success: boolean; message: string }>;
  activateInvestment: (label: string, amount: number, ref: string) => Promise<{ success: boolean; message: string }>;
  requestWithdrawal:  (amount: number)                    => Promise<{ success: boolean; message: string }>;
  refreshUser:        ()                                  => Promise<void>;
}

interface RegisterData {
  fullName: string; email: string; phone: string;
  password: string; referralCode?: string;
}
interface KYCSubmit {
  nin: string; bank_name: string; account_number: string; account_name: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<UserState | null>(null);
  const [isLoading, setLoading] = useState(true);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [
        { data: profile },
        { data: kyc },
        { data: investments },
        { data: transactions },
        { data: withdrawals },
      ] = await Promise.all([
        profileHelpers.getProfile(userId),
        kycHelpers.getKYC(userId),
        investmentHelpers.getInvestments(userId),
        transactionHelpers.getTransactions(userId),
        withdrawalHelpers.getWithdrawals(userId),
      ]);
      if (!profile) return;
      setUser({
        profile,
        kyc:          kyc          ?? null,
        investments:  investments  ?? [],
        transactions: transactions ?? [],
        withdrawals:  withdrawals  ?? [],
      });
    } catch (err) {
      console.error('loadUserData:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        loadUserData(session.user.id).finally(() => { if (mounted) setLoading(false); });
      } else { setLoading(false); }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        await profileHelpers.updateLastLogin(session.user.id);
        await loadUserData(session.user.id);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null); setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        loadUserData(session.user.id);
      }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, [loadUserData]);

  // Realtime wallet + transaction updates
  useEffect(() => {
    if (!user?.profile?.id) return;
    const channel = supabase
      .channel(`user:${user.profile.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.profile.id}` },
        (p) => setUser(prev => prev ? { ...prev, profile: p.new as Profile } : prev))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.profile.id}` },
        (p) => setUser(prev => prev ? { ...prev, transactions: [p.new as Transaction, ...prev.transactions] } : prev))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.profile?.id]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await authHelpers.signIn(email, password);
    setLoading(false);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Login successful!' };
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    const { error } = await authHelpers.signUp(data.email, data.password, {
      full_name: data.fullName, phone: data.phone,
      referred_by: data.referralCode?.toUpperCase(),
    });
    setLoading(false);
    if (error) return { success: false, message: error.message };
    return { success: true, message: 'Account created! Check your email to verify, then sign in.' };
  };

  const logout = async () => { await authHelpers.signOut(); setUser(null); };

  const submitKYC = async (data: KYCSubmit) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    const { error } = await kycHelpers.submitKYC({
      user_id: user.profile.id, full_name: user.profile.full_name, ...data,
    });
    if (error) return { success: false, message: error.message };
    await loadUserData(user.profile.id);
    return { success: true, message: 'KYC submitted for review.' };
  };

  const activateInvestment = async (label: string, amount: number, ref: string) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    if (user.kyc?.status !== 'approved')
      return { success: false, message: 'KYC must be approved before investing.' };
    const { error } = await investmentHelpers.activateInvestment(user.profile.id, label, amount, ref);
    if (error) return { success: false, message: error.message };
    await loadUserData(user.profile.id);
    return { success: true, message: 'Investment activated! Earning 1.3% daily.' };
  };

  const requestWithdrawal = async (amount: number) => {
    if (!user) return { success: false, message: 'Not authenticated' };
    if (user.kyc?.status !== 'approved')
      return { success: false, message: 'KYC must be approved to withdraw.' };
    const { error } = await withdrawalHelpers.submitWithdrawal({
      user_id: user.profile.id, amount,
      bank_name:      user.kyc.bank_name,
      account_number: user.kyc.account_number,
      account_name:   user.kyc.account_name,
    });
    if (error) return { success: false, message: error.message };
    await loadUserData(user.profile.id);
    return { success: true, message: 'Withdrawal requested. Processing within 24 hours.' };
  };

  const refreshUser = async () => {
    if (user?.profile?.id) await loadUserData(user.profile.id);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, register, logout, submitKYC,
      activateInvestment, requestWithdrawal, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
