import { useEffect, useState } from 'react';
import {
  TrendingUp, CheckCircle, Star, AlertCircle,
  Wallet, ArrowRight, Clock,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { PLANS, formatNGN, DAILY_RATE } from '@/lib/plans';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type Investment      = Database['public']['Tables']['investments']['Row'];
type InvestmentInsert = Database['public']['Tables']['investments']['Insert'];
type ProfileUpdate   = Database['public']['Tables']['profiles']['Update'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

// Confirm modal shown before deducting wallet
function ConfirmModal({
  plan,
  walletBalance,
  onConfirm,
  onCancel,
  loading,
}: {
  plan: { id: string; label: string; amount: number };
  walletBalance: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const daily   = plan.amount * DAILY_RATE;
  const monthly = daily * 30;
  const balance = walletBalance - plan.amount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-dark-600 border border-lime-400/20 rounded-2xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-lime-400/10">
          <h3 className="font-bold text-white text-lg">Confirm Investment</h3>
          <p className="text-sm text-gray-400 mt-0.5">Funds will be deducted from your wallet balance</p>
        </div>

        {/* Breakdown */}
        <div className="p-6 space-y-3">
          <div className="bg-dark-700/60 rounded-xl p-4 space-y-3">
            {[
              { label: 'Plan',              value: plan.label,         cls: 'text-white font-bold'    },
              { label: 'Investment Amount', value: formatNGN(plan.amount), cls: 'text-lime-400 font-bold' },
              { label: 'Daily Return (1.3%)', value: `+${formatNGN(daily)}`, cls: 'text-emerald-400 font-semibold' },
              { label: '30-Day Projection', value: `+${formatNGN(monthly)}`, cls: 'text-emerald-400 font-semibold' },
              { label: 'Wallet After',      value: formatNGN(balance),  cls: balance < 0 ? 'text-red-400' : 'text-gray-300' },
            ].map(({ label, value, cls }) => (
              <div key={label} className="flex justify-between items-center text-sm">
                <span className="text-gray-400">{label}</span>
                <span className={cls}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 bg-lime-400/5 border border-lime-400/10 rounded-xl p-3">
            <Clock className="w-4 h-4 text-lime-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400">
              ROI starts accruing from today. Daily earnings are added to your wallet every 24 hours.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-xl border border-lime-400/20 text-gray-300 hover:text-white font-semibold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold text-sm hover:from-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
              : <><CheckCircle className="w-4 h-4" /> Confirm & Invest</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InvestPage() {
  const { profile, refetchProfile } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [investing,   setInvesting]   = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<{ id: string; label: string; amount: number } | null>(null);

  async function loadInvestments() {
    if (!profile) return;
    const { data } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });
    if (data) setInvestments(data);
    setLoadingData(false);
  }

  useEffect(() => {
    loadInvestments();
  }, [profile?.id]);

  const activePlanIds = investments
    .filter(i => i.status === 'active')
    .map(i => i.plan_id);

  async function executeInvestment(planId: string, amount: number, label: string) {
    if (!profile) return;
    setInvesting(true);

    try {
      const currentBalance = profile.wallet_balance ?? 0;

      // Final guard — re-check balance at execution time
      if (currentBalance < amount) {
        toast.error('Insufficient wallet balance');
        setInvesting(false);
        setConfirmPlan(null);
        return;
      }

      const newBalance       = currentBalance - amount;
      const newTotalInvested = (profile.total_invested ?? 0) + amount;

      // 1. Insert investment record
      const invRow: InvestmentInsert = {
        user_id:      profile.id,
        plan_id:      planId,
        amount,
        daily_rate:   DAILY_RATE,
        status:       'active',
        start_date:   new Date().toISOString(),
        total_earned: 0,
      };
      const { error: invErr } = await supabase.from('investments').insert(invRow);
      if (invErr) throw invErr;

      // 2. Deduct wallet, update total_invested
      const profileUpdate: ProfileUpdate = {
        wallet_balance: newBalance,
        total_invested: newTotalInvested,
      };
      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', profile.id);
      if (profileErr) throw profileErr;

      // 3. Log transaction
      const txRow: TransactionInsert = {
        user_id:     profile.id,
        type:        'deposit',
        amount,
        status:      'success',
        reference:   `INVEST-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
        description: `Investment activated — ${label}`,
      };
      await supabase.from('transactions').insert(txRow);

      // 4. Refresh profile in UI
      refetchProfile?.();
      await loadInvestments();

      toast.success(`✅ Investment activated! Earning ${formatNGN(amount * DAILY_RATE)}/day`);
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Investment failed — please try again');
    } finally {
      setInvesting(false);
      setConfirmPlan(null);
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-lime-400" /> Investment Plans
        </h1>
        <p className="mt-1 text-gray-400 text-sm">Earn 1.3% daily returns. Funds deducted directly from your wallet.</p>
      </div>

      {/* Wallet balance banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-lime-400/10 to-emerald-400/5 border border-lime-400/20 rounded-xl px-5 py-4">
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-lime-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-400">Available Wallet Balance</p>
            <p className="text-xl font-bold text-lime-400">{formatNGN(profile?.wallet_balance ?? 0)}</p>
          </div>
        </div>
        <a
          href="/dashboard/wallet"
          className="flex items-center gap-1.5 bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold px-3 py-2 rounded-lg hover:bg-lime-400/20 transition-all"
        >
          Add Funds <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Low balance warning */}
      {(profile?.wallet_balance ?? 0) === 0 && (
        <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-400">Your wallet balance is ₦0.00</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Contact support or wait for your admin to credit your account before investing.
            </p>
          </div>
        </div>
      )}

      {/* Active investments summary */}
      {investments.filter(i => i.status === 'active').length > 0 && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
            Active Plans
          </h2>
          <div className="space-y-2">
            {investments.filter(i => i.status === 'active').map(inv => {
              const days = Math.floor(
                (Date.now() - new Date(inv.start_date).getTime()) / 86400000
              );
              return (
                <div key={inv.id} className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{formatNGN(inv.amount)} plan</p>
                    <p className="text-xs text-gray-500">Day {days} • Started {new Date(inv.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-lime-400">+{formatNGN(inv.amount * DAILY_RATE)}/day</p>
                    <p className="text-xs text-emerald-400">Earned: {formatNGN(inv.total_earned)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isActive  = activePlanIds.includes(plan.id);
          const canAfford = (profile?.wallet_balance ?? 0) >= plan.amount;
          const isLocked  = isActive || !canAfford;

          return (
            <div
              key={plan.id}
              className={`relative bg-dark-600/40 border rounded-2xl p-5 transition-all ${
                isActive   ? 'border-lime-400/40 opacity-80' :
                canAfford  ? 'border-lime-400/10 hover:border-lime-400/30 hover:bg-dark-500/40 cursor-pointer' :
                             'border-dark-50/10 opacity-50'
              }`}
            >
              {/* Badges */}
              {plan.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-dark-800 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <CheckCircle className="w-3 h-3" /> Active
                </div>
              )}

              {/* Plan amount */}
              <div className="text-center mb-4 mt-1">
                <p className="text-2xl font-bold font-serif text-white">{plan.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatNGN(plan.amount)} investment</p>
              </div>

              {/* Earnings breakdown */}
              <div className="space-y-2 mb-4">
                {[
                  { label: 'Daily Return',  value: plan.dailyEarnings, cls: 'text-lime-400 font-bold'   },
                  { label: '7 Days',        value: plan.d7,            cls: 'text-white'                },
                  { label: '30 Days',       value: plan.d30,           cls: 'text-white'                },
                  { label: '90 Days',       value: plan.d90,           cls: 'text-emerald-400 font-bold' },
                ].map(({ label, value, cls }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className={cls}>{formatNGN(Number(value))}</span>
                  </div>
                ))}
              </div>

              {/* ROI badge */}
              <div className="text-center mb-4">
                <span className="inline-block bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold px-3 py-1 rounded-full">
                  {(DAILY_RATE * 100).toFixed(1)}% Daily ROI
                </span>
              </div>

              {/* Action button */}
              {!isActive && (
                <button
                  onClick={() => {
                    if (!canAfford) {
                      toast.error(`You need ${formatNGN(plan.amount)} in your wallet. Current balance: ${formatNGN(profile?.wallet_balance ?? 0)}`);
                      return;
                    }
                    setConfirmPlan({ id: plan.id, label: plan.label, amount: plan.amount });
                  }}
                  disabled={isLocked}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                    canAfford
                      ? 'bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 hover:from-lime-300 shadow-lg shadow-lime-400/20'
                      : 'bg-dark-700/60 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? `Invest ${plan.label}` : `Need ${formatNGN(plan.amount)}`}
                </button>
              )}

              {isActive && (
                <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm text-center">
                  ✓ Currently Active
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-500 pb-2">
        Investments are funded directly from your wallet balance. No external payment required.
        ROI is credited daily. Capital is locked for 90 days.
      </p>

      {/* Confirm modal */}
      {confirmPlan && (
        <ConfirmModal
          plan={confirmPlan}
          walletBalance={profile?.wallet_balance ?? 0}
          onConfirm={() => executeInvestment(confirmPlan.id, confirmPlan.amount, confirmPlan.label)}
          onCancel={() => setConfirmPlan(null)}
          loading={investing}
        />
      )}
    </div>
  );
}
