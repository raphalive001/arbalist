export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          kyc_status: "pending" | "submitted" | "verified" | "rejected";
          referral_code: string;
          referred_by: string | null;
          wallet_balance: number;
          total_invested: number;
          total_earned: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          kyc_status?: "pending" | "submitted" | "verified" | "rejected";
          referral_code?: string;
          referred_by?: string | null;
          wallet_balance?: number;
          total_invested?: number;
          total_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          avatar_url?: string | null;
          kyc_status?: "pending" | "submitted" | "verified" | "rejected";
          referral_code?: string;
          referred_by?: string | null;
          wallet_balance?: number;
          total_invested?: number;
          total_earned?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      kyc_documents: {
        Row: {
          id: string;
          user_id: string;
          doc_type: "national_id" | "drivers_license" | "passport" | "voters_card";
          doc_number: string;
          front_url: string;
          back_url: string | null;
          selfie_url: string;
          status: "pending" | "verified" | "rejected";
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          doc_type: "national_id" | "drivers_license" | "passport" | "voters_card";
          doc_number: string;
          front_url: string;
          back_url?: string | null;
          selfie_url: string;
          status?: "pending" | "verified" | "rejected";
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          doc_type?: "national_id" | "drivers_license" | "passport" | "voters_card";
          doc_number?: string;
          front_url?: string;
          back_url?: string | null;
          selfie_url?: string;
          status?: "pending" | "verified" | "rejected";
          rejection_reason?: string | null;
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "kyc_documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      investments: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          amount: number;
          daily_rate: number;
          status: "active" | "completed" | "cancelled";
          start_date: string;
          end_date: string | null;
          total_earned: number;
          last_credit_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plan_id: string;
          amount: number;
          daily_rate?: number;
          status?: "active" | "completed" | "cancelled";
          start_date?: string;
          end_date?: string | null;
          total_earned?: number;
          last_credit_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plan_id?: string;
          amount?: number;
          daily_rate?: number;
          status?: "active" | "completed" | "cancelled";
          start_date?: string;
          end_date?: string | null;
          total_earned?: number;
          last_credit_date?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "investments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          type: "deposit" | "withdrawal" | "roi" | "referral_bonus";
          amount: number;
          status: "pending" | "success" | "failed";
          reference: string;
          description: string | null;
          paystack_reference: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "deposit" | "withdrawal" | "roi" | "referral_bonus";
          amount: number;
          status?: "pending" | "success" | "failed";
          reference?: string;
          description?: string | null;
          paystack_reference?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: "deposit" | "withdrawal" | "roi" | "referral_bonus";
          amount?: number;
          status?: "pending" | "success" | "failed";
          reference?: string;
          description?: string | null;
          paystack_reference?: string | null;
          bank_name?: string | null;
          account_number?: string | null;
          account_name?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      referrals: {
        Row: {
          id: string;
          referrer_id: string;
          referred_id: string;
          bonus_amount: number;
          status: "pending" | "credited";
          created_at: string;
        };
        Insert: {
          id?: string;
          referrer_id: string;
          referred_id: string;
          bonus_amount?: number;
          status?: "pending" | "credited";
          created_at?: string;
        };
        Update: {
          id?: string;
          referrer_id?: string;
          referred_id?: string;
          bonus_amount?: number;
          status?: "pending" | "credited";
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
