import { createClient } from '@supabase/supabase-js';

// ─── TypeScript types matching our DB schema ──────────────────────────
export type KYCStatus        = 'pending' | 'approved' | 'rejected';
export type InvestmentStatus = 'active'  | 'completed' | 'cancelled';
export type TxType           = 'deposit' | 'withdrawal' | 'roi' | 'referral_bonus';
export type TxStatus         = 'pending' | 'completed'  | 'failed';
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface Profile {
  id:                string;
  full_name:         string;
  phone:             string;
  referral_code:     string;
  referred_by:       string | null;
  referral_count:    number;
  referral_earnings: number;
  wallet_balance:    number;
  total_deposited:   number;
  total_withdrawn:   number;
  total_roi:         number;
  two_fa_enabled:    boolean;
  is_admin:          boolean;
  last_login:        string | null;
  created_at:        string;
  updated_at:        string;
}

export interface KYC {
  id:               string;
  user_id:          string;
  full_name:        string;
  nin:              string;
  bank_name:        string;
  account_number:   string;
  account_name:     string;
  status:           KYCStatus;
  rejection_reason: string | null;
  reviewed_by:      string | null;
  reviewed_at:      string | null;
  submitted_at:     string;
  updated_at:       string;
}

export interface Investment {
  id:             string;
  user_id:        string;
  plan_label:     string;
  deposit_amount: number;
  daily_rate:     number;
  total_earned:   number;
  status:         InvestmentStatus;
  start_date:     string;
  end_date:       string | null;
  created_at:     string;
  updated_at:     string;
}

export interface Transaction {
  id:          string;
  user_id:     string;
  type:        TxType;
  amount:      number;
  status:      TxStatus;
  description: string;
  reference:   string | null;
  metadata:    Record<string, unknown> | null;
  created_at:  string;
  updated_at:  string;
}

export interface WithdrawalRequest {
  id:               string;
  user_id:          string;
  amount:           number;
  bank_name:        string;
  account_number:   string;
  account_name:     string;
  status:           WithdrawalStatus;
  rejection_reason: string | null;
  processed_by:     string | null;
  processed_at:     string | null;
  created_at:       string;
  updated_at:       string;
}

export interface Database {
  public: {
    Tables: {
      profiles:             { Row: Profile;           Insert: Partial<Profile>;           Update: Partial<Profile>; };
      kyc:                  { Row: KYC;               Insert: Partial<KYC>;               Update: Partial<KYC>; };
      investments:          { Row: Investment;         Insert: Partial<Investment>;         Update: Partial<Investment>; };
      transactions:         { Row: Transaction;        Insert: Partial<Transaction>;        Update: Partial<Transaction>; };
      withdrawal_requests:  { Row: WithdrawalRequest;  Insert: Partial<WithdrawalRequest>;  Update: Partial<WithdrawalRequest>; };
    };
    Functions: {
      activate_investment: {
        Args: { p_user_id: string; p_plan_label: string; p_amount: number; p_reference: string };
        Returns: string;
      };
      submit_withdrawal: {
        Args: { p_user_id: string; p_amount: number; p_bank_name: string; p_account_number: string; p_account_name: string };
        Returns: string;
      };
      credit_daily_roi: { Args: Record<never, never>; Returns: void };
    };
  };
}

// ─── Client ──────────────────────────────────────────────────────────
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env\n' +
    'Create a .env file from .env.example and add your Supabase project credentials.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnon, {
  auth: {
    persistSession:        true,
    autoRefreshToken:      true,
    detectSessionInUrl:    true,
    storageKey:            'arbalist_session',
  },
});

// ─── Auth helpers ────────────────────────────────────────────────────
export const authHelpers = {
  async signUp(email: string, password: string, meta: {
    full_name: string; phone: string; referred_by?: string;
  }) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
  },

  async signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return supabase.auth.signOut();
  },

  async getSession() {
    return supabase.auth.getSession();
  },

  async resetPassword(email: string) {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
  },
};

// ─── Profile helpers ─────────────────────────────────────────────────
export const profileHelpers = {
  async getProfile(userId: string) {
    return supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
  },

  async updateLastLogin(userId: string) {
    return supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  },
};

// ─── KYC helpers ─────────────────────────────────────────────────────
export const kycHelpers = {
  async getKYC(userId: string) {
    return supabase
      .from('kyc')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
  },

  async submitKYC(data: {
    user_id: string; full_name: string; nin: string;
    bank_name: string; account_number: string; account_name: string;
  }) {
    return supabase.from('kyc').insert(data).select().single();
  },
};

// ─── Investment helpers ───────────────────────────────────────────────
export const investmentHelpers = {
  async getInvestments(userId: string) {
    return supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },

  async activateInvestment(userId: string, planLabel: string, amount: number, reference: string) {
    return supabase.rpc('activate_investment', {
      p_user_id:    userId,
      p_plan_label: planLabel,
      p_amount:     amount,
      p_reference:  reference,
    });
  },
};

// ─── Transaction helpers ──────────────────────────────────────────────
export const transactionHelpers = {
  async getTransactions(userId: string, limit = 50) {
    return supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
  },
};

// ─── Withdrawal helpers ───────────────────────────────────────────────
export const withdrawalHelpers = {
  async submitWithdrawal(data: {
    user_id: string; amount: number; bank_name: string;
    account_number: string; account_name: string;
  }) {
    return supabase.rpc('submit_withdrawal', {
      p_user_id:        data.user_id,
      p_amount:         data.amount,
      p_bank_name:      data.bank_name,
      p_account_number: data.account_number,
      p_account_name:   data.account_name,
    });
  },

  async getWithdrawals(userId: string) {
    return supabase
      .from('withdrawal_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  },
};
