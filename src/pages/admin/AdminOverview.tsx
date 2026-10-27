import { useEffect, useState } from 'react';
import {
  Users, TrendingUp, Wallet, ArrowDownCircle, ArrowUpCircle,
  ShieldCheck, Clock, Activity, RefreshCw, AlertCircle, Play, CheckCircle,
} from 'lucide-react';
import { useAdmin, type AdminStats } from '@/hooks/useAdmin';
import { formatNGN } from '@/lib/plans';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type Transaction = Database['public']['Tables']['transactions']['Row'] & {
  profiles?: { full_name: string | null; email: string } | null;
};

function StatCard({ icon, label, value, sub, accent = false, warn = false }: {
  icon: React.ReactNode; label: string; value: string | number;
  sub?: string; accent?: boolean; warn?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-5 border transition-all ${
      accent ? 'bg-lime-400/5  border-lime-400/20'  :
      warn   ? 'bg-yellow-400/5 border-yellow-400/20' :
               'bg-dark-600/40 border-lime-400/5'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
        accent ? 'bg-lime-400/20  text-lime-400'    :
        warn   ? 'bg-yellow-400/20 text-yellow-400' :
                 'bg-dark-500/60  text-gray-400'
      }`}>
        {icon}
      </div>
      <p className={`text-2xl font-bold font-serif ${
        accent ? 'text-lime-400' : warn ? 'text-yellow-400' : 'text-white'
      }`}>
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminOverview() {
  const { fetchStats, runDailyROI } = useAdmin();
  const [stats,      setStats]      = useState<AdminStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [recentTx,   setRecentTx]   = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [roiRunning, setRoiRunning] = useState(false);

  async function load() {
    setRefreshing(true);
    const [s, { data: tx }] = await Promise.all([
      fetchStats(),
      supabase
        .from('transactions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(8),
    ]);
    setStats(s);
    setRecentTx((tx as Transaction[]) ?? []);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  async function handleRunDailyROI() {
    const confirmed = window.confirm(
      'Run Daily ROI for ALL active investments now?\n\nThis credits 1.3% to every active investor\'s wallet. Only do this ONCE per day.'
    );
    if (!confirmed) return;

    setRoiRunning(true);
    const { error, count } = await runDailyROI();
    setRoiRunning(false);

    if (error) {
      toast.error('ROI run failed: ' + error.message);
    } else {
      toast.success(`✅ Daily ROI credited to ${count} investment${count !== 1 ? 's' : ''}!`);
      load();
    }
  }

  const txColor: Record<string, string> = {
    deposit: 'text-lime-400', withdrawal: 'text-red-400',
    roi: 'text-blue-400', referral_bonus: 'text-yellow-400',
  };
  const txBg: Record<string, string> = {
    deposit: 'bg-lime-400/10', withdrawal: 'bg-red-400/10',
    roi: 'bg-blue-400/10', referral_bonus: 'bg-yellow-400/10',
  };
  const txSign: Record<string, string> = {
    deposit: '+', withdrawal: '-', roi: '+', referral_bonus: '+',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white">Platform Overview</h1>
          <p className="text-gray-400 mt-1 text-sm">Live statistics across all users and transactions</p>
        </div>
        <div className="flex gap-3">
          {/* Daily ROI button */}
          <button
            onClick={handleRunDailyROI}
            disabled={roiRunning}
            className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            {roiRunning
              ? <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              : <Play className="w-4 h-4" />
            }
            {roiRunning ? 'Running ROI…' : 'Run Daily ROI'}
          </button>
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 bg-dark-600/60 border border-lime-400/10 text-gray-300 hover:text-lime-400 hover:border-lime-400/30 font-medium text-sm px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Paystack notice — show until they get verified */}
      <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
        <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-400">Manual Wallet Mode Active</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Paystack is not yet active. Users fund wallets via bank transfer.
            You credit them here: <strong className="text-white">Users → Manage → Credit Wallet</strong>.
            Click <strong className="text-white">Run Daily ROI</strong> once per day to credit all active investors.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {((stats?.pendingKYC ?? 0) > 0 || (stats?.pendingWithdrawals ?? 0) > 0) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {(stats?.pendingKYC ?? 0) > 0 && (
            <a href="/admin/kyc" className="flex items-center gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 hover:bg-yellow-400/10 transition-all">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">{stats?.pendingKYC} KYC Pending</p>
                <p className="text-xs text-gray-400">Awaiting review — Click to review</p>
              </div>
            </a>
          )}
          {(stats?.pendingWithdrawals ?? 0) > 0 && (
            <a href="/admin/transactions" className="flex items-center gap-3 bg-orange-400/5 border border-orange-400/20 rounded-xl p-4 hover:bg-orange-400/10 transition-all">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-400">{stats?.pendingWithdrawals} Withdrawals Pending</p>
                <p className="text-xs text-gray-400">Awaiting processing — Click to manage</p>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="w-5 h-5" />}           label="Total Users"          value={stats?.totalUsers ?? 0}                         accent />
        <StatCard icon={<Wallet className="w-5 h-5" />}          label="Platform Balance"     value={formatNGN(stats?.totalPlatformBalance ?? 0)}            />
        <StatCard icon={<ArrowDownCircle className="w-5 h-5" />} label="Total Deposited"      value={formatNGN(stats?.totalDeposited ?? 0)}          accent />
        <StatCard icon={<ArrowUpCircle className="w-5 h-5" />}   label="Total Withdrawn"      value={formatNGN(stats?.totalWithdrawn ?? 0)}                   />
        <StatCard icon={<TrendingUp className="w-5 h-5" />}      label="Active Investments"   value={stats?.activeInvestments ?? 0}                  accent />
        <StatCard icon={<Activity className="w-5 h-5" />}        label="Total ROI Paid"       value={formatNGN(stats?.totalROIPaid ?? 0)}                     />
        <StatCard icon={<ShieldCheck className="w-5 h-5" />}     label="Pending KYC"         value={stats?.pendingKYC ?? 0}    warn={(stats?.pendingKYC ?? 0) > 0} />
        <StatCard icon={<Clock className="w-5 h-5" />}           label="Pending Withdrawals" value={stats?.pendingWithdrawals ?? 0} warn={(stats?.pendingWithdrawals ?? 0) > 0} />
      </div>

      {/* Recent transactions */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-lime-400/10">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-400" /> Recent Transactions
          </h2>
          <a href="/admin/transactions" className="text-xs text-lime-400 hover:text-lime-300 transition-colors font-medium">
            View all →
          </a>
        </div>
        <div className="divide-y divide-lime-400/5">
          {recentTx.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No transactions yet</p>
          ) : recentTx.map(tx => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-4 hover:bg-dark-500/20 transition-all">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${txBg[tx.type] ?? 'bg-gray-400/10'}`}>
                <span className={`text-xs font-bold ${txColor[tx.type] ?? 'text-gray-400'}`}>
                  {txSign[tx.type] ?? '+'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white capitalize truncate">
                  {tx.type.replace('_', ' ')}
                  {tx.description ? ` — ${tx.description}` : ''}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {tx.profiles?.full_name ?? tx.profiles?.email ?? 'Unknown'}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`text-sm font-bold ${txColor[tx.type] ?? 'text-lime-400'}`}>
                  {txSign[tx.type] ?? '+'}{formatNGN(tx.amount)}
                </p>
                <p className={`text-xs mt-0.5 capitalize ${
                  tx.status === 'success' ? 'text-lime-400' :
                  tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                }`}>{tx.status}</p>
              </div>
              <div className="hidden sm:block text-right flex-shrink-0">
                <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                <p className="text-xs text-gray-600">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
