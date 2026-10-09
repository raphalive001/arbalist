import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: true,
  },
});

// ─── Derived types from the Database schema ───
export type Profile           = Database['public']['Tables']['profiles']['Row'];
export type KYC               = Database['public']['Tables']['kyc_documents']['Row'];
export type Investment        = Database['public']['Tables']['investments']['Row'];
export type Transaction       = Database['public']['Tables']['transactions']['Row'];
export type WithdrawalRequest = Database['public']['Tables']['referrals']['Row'];

// ─── Auth helpers ───
export const authHelpers = {
  signIn: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),

  signUp: (email: string, password: string, metadata: Record<string, unknown>) =>
    supabase.auth.signUp({ email, password, options: { data: metadata } }),

  signOut: () => supabase.auth.signOut(),
};

// ─── Profile helpers ───
export const profileHelpers = {
  getProfile: (userId: string) =>
    supabase.from('profiles').select('*').eq('id', userId).single(),

  updateLastLogin: (userId: string) =>
    supabase.from('profiles').update({ updated_at: new Date().toISOString() }).eq('id', userId),
};

// ─── KYC helpers ───
export const kycHelpers = {
  getKYC: (userId: string) =>
    supabase.from('kyc_documents').select('*').eq('user_id', userId).maybeSingle(),

  submitKYC: (data: Database["public"]["Tables"]["kyc_documents"]["Insert"]) =>
    supabase.from('kyc_documents').insert(data),
};

// ─── Investment helpers ───
export const investmentHelpers = {
  getInvestments: (userId: string) =>
    supabase.from('investments').select('*').eq('user_id', userId).order('created_at', { ascending: false }),

  activateInvestment: (userId: string, planId: string, amount: number, _ref: string) =>
    supabase.from('investments').insert({
      user_id:      userId,
      plan_id:      planId,
      amount,
      daily_rate:   0.013,
      status:       'active',
      start_date:   new Date().toISOString(),
      total_earned: 0,
    }),
};

// ─── Transaction helpers ───
export const transactionHelpers = {
  getTransactions: (userId: string) =>
    supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
};

// ─── Withdrawal helpers ───
export const withdrawalHelpers = {
  getWithdrawals: (_userId: string) =>
    // Referrals table is the closest analogue; return empty for withdrawals not tracked there
    Promise.resolve({ data: [] as WithdrawalRequest[], error: null }),

  submitWithdrawal: (data: {
    user_id:        string;
    amount:         number;
    bank_name:      string;
    account_number: string;
    account_name:   string;
  }) =>
    supabase.from('transactions').insert({
      user_id:        data.user_id,
      type:           'withdrawal',
      amount:         data.amount,
      status:         'pending',
      reference:      `WDR-${Date.now()}`,
      bank_name:      data.bank_name,
      account_number: data.account_number,
      account_name:   data.account_name,
      description:    'Withdrawal request',
    }),
};
