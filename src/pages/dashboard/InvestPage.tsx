import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle, Star, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { PLANS, formatNGN, DAILY_RATE } from '@/lib/plans';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type Investment = Database['public']['Tables']['investments']['Row'];
type InvestmentInsert = Database['public']['Tables']['investments']['Insert'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export default function InvestPage() {
  const { profile, refetchProfile } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [investing,   setInvesting]   = useState(false);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('investments')
      .select('*')
      .eq('user_id', profile.id)
      .then(({ data }) => {
        if (data) setInvestments(data);
        setLoading(false);
      });
  }, [profile]);

  const activePlanIds = investments
    .filter((i) => i.status === 'active')
    .map((i) => i.plan_id);

  async function handleInvest(planId: string, amount: number) {
    if (!profile) return;
    if (profile.kyc_status !== 'verified')         { toast.error('Complete KYC verification before investing'); return; }
    if ((profile.wallet_balance ?? 0) < amount)    { toast.error(`Insufficient balance. You need ${formatNGN(amount)} in your wallet.`); return; }
    if (activePlanIds.includes(planId))            { toast.error('You already have an active investment in this plan'); return; }

    setInvesting(true);
    try {
      const dailyEarnings    = amount * DAILY_RATE;
      const newBalance       = (profile.wallet_balance   ?? 0) - amount;
      const newTotalInvested = (profile.total_invested   ?? 0) + amount;

      const invInsert: InvestmentInsert = {
        user_id:    profile.id,
        plan_id:    planId,
        amount,
        daily_rate: DAILY_RATE,
        status:     'active',
        start_date: new Date().toISOString(),
        total_earned: 0,
      };

      const { error: invErr } = await supabase.from('investments').insert(invInsert);
      if (invErr) throw invErr;

      const profileUpdate: ProfileUpdate = {
        wallet_balance: newBalance,
        total_invested: newTotalInvested,
      };
      const { error: profileErr } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', profile.id);
      if (profileErr) throw profileErr;

      const txInsert: TransactionInsert = {
        user_id:     profile.id,
        type:        'deposit',
        amount,
        status:      'success',
        reference:   `INV-${Date.now()}`,
        description: `Investment in ${formatNGN(amount)} plan`,
      };
      await supabase.from('transactions').insert(txInsert);

      refetchProfile?.();
      toast.success(`Invested ${formatNGN(amount)} successfully! You'll earn ${formatNGN(dailyEarnings)}/day.`);
      setSelected(null);

      const { data } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', profile.id);
      if (data) setInvestments(data);

    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Investment failed');
    } finally {
      setInvesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-lime-400" /> Investment Plans
        </h1>
        <p className="mt-1 text-gray-400">Earn 1.3% daily returns on your investment</p>
      </div>

      {/* Balance notice */}
      <div className="flex items-center gap-3 bg-dark-600/40 border border-lime-400/10 rounded-xl px-5 py-4">
        <AlertCircle className="w-4 h-4 text-lime-400 flex-shrink-0" />
        <p className="text-sm text-gray-300">
          Wallet balance: <span className="text-lime-400 font-bold">{formatNGN(profile?.wallet_balance ?? 0)}</span>
          {' '}—{' '}
          <a href="/dashboard/wallet" className="text-lime-400 underline underline-offset-2">Add funds</a> to invest
        </p>
      </div>

      {/* Active investments */}
      {investments.filter((i) => i.status === 'active').length > 0 && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">Your Active Plans</h2>
          <div className="space-y-2">
            {investments.filter((i) => i.status === 'active').map((inv) => {
              const days = Math.floor((Date.now() - new Date(inv.start_date).getTime()) / 86400000);
              return (
                <div key={inv.id} className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-lime-400" />
                    <span className="text-sm text-white font-medium">{formatNGN(inv.amount)} — Day {days}</span>
                  </div>
                  <span className="text-sm text-lime-400 font-bold">+{formatNGN(inv.amount * DAILY_RATE)}/day</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Plans grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isActive   = activePlanIds.includes(plan.id);
          const isSelected = selected === plan.id;
          const canAfford  = (profile?.wallet_balance ?? 0) >= plan.amount;

          return (
            <div
              key={plan.id}
              onClick={() => !isActive && canAfford && setSelected(isSelected ? null : plan.id)}
              className={`relative bg-dark-600/40 border rounded-2xl p-5 transition-all cursor-pointer
                ${isActive    ? 'border-lime-400/40 opacity-70 cursor-not-allowed' :
                  isSelected  ? 'border-lime-400 shadow-lg shadow-lime-400/10' :
                  canAfford   ? 'border-lime-400/10 hover:border-lime-400/30' :
                                'border-dark-50/10 opacity-40 cursor-not-allowed'}`}
            >
              {plan.popular && !isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-dark-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Popular
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active
                </div>
              )}

              <div className="text-center mb-4">
                <p className="text-2xl font-bold font-serif text-white">{plan.label}</p>
                <p className="text-xs text-gray-400 mt-1">{formatNGN(plan.amount)} investment</p>
              </div>

              <div className="space-y-2 mb-4">
                {[
                  ['Daily Earnings', plan.dailyEarnings, 'text-lime-400'],
                  ['7 Days',         plan.d7,            'text-white'],
                  ['30 Days',        plan.d30,           'text-white'],
                  ['90 Days',        plan.d90,           'text-emerald-400'],
                ].map(([label, val, cls]) => (
                  <div key={String(label)} className="flex justify-between text-sm">
                    <span className="text-gray-400">{label}</span>
                    <span className={`font-bold ${cls}`}>{formatNGN(Number(val))}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <span className="inline-block bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-bold px-3 py-1 rounded-full">
                  {(DAILY_RATE * 100).toFixed(1)}% Daily ROI
                </span>
              </div>

              {isSelected && !isActive && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleInvest(plan.id, plan.amount); }}
                  disabled={investing}
                  className="mt-4 w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3 rounded-xl hover:from-lime-300 transition-all disabled:opacity-50">
                  {investing ? 'Processing…' : `Invest ${plan.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 pb-4">
        * ROI earnings are credited daily to your wallet. Investment capital is locked for 90 days.
      </p>
    </div>
  );
}
