import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp, Wallet, Users, ArrowUpRight, ArrowDownLeft, Copy, Check,
  LogOut, Shield, AlertCircle, CheckCircle, Clock, Activity, BarChart3,
  Bell, Settings, ChevronRight, Plus, Minus, RefreshCw, Eye, EyeOff, Gift,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatNaira, maskAccountNumber } from '../utils/security';
import { initiatePayment, PLAN_AMOUNTS } from '../utils/paystack';

const WA_BASE = 'https://wa.me/2349054416277';

// ─── Live ROI Counter ───
function LiveROICounter({ dailyRate, totalEarned, id }: { dailyRate: number; totalEarned: number; id: string }) {
  const [earned, setEarned] = useState(totalEarned);
  const ratePerSecond = dailyRate / 86400;

  useEffect(() => {
    setEarned(totalEarned);
    const interval = setInterval(() => {
      setEarned(prev => prev + ratePerSecond);
    }, 1000);
    return () => clearInterval(interval);
  }, [id, totalEarned, ratePerSecond]);

  return (
    <span className="tabular-nums font-mono text-lime-400 font-bold text-lg">
      {formatNaira(earned)}
    </span>
  );
}

// ─── Mini Stat Card ───
function StatCard({ icon, label, value, sub, accent = false }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-5 border transition-all ${accent ? 'bg-lime-400/5 border-lime-400/20' : 'bg-dark-600/40 border-lime-400/5'}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent ? 'bg-lime-400/20 text-lime-400' : 'bg-dark-700 text-gray-400'}`}>
          {icon}
        </div>
        <span className="text-xs text-gray-400 font-medium">{label}</span>
      </div>
      <p className={`text-xl font-bold font-serif ${accent ? 'text-lime-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Invest Modal ───
function InvestModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (amount: number, plan: string) => void }) {
  const { user } = useAuth();
  const profile = user?.profile;
  const kyc = user?.kyc;
  const [selectedPlan, setSelectedPlan] = useState('₦300.5K');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = Object.entries(PLAN_AMOUNTS);

  const handlePay = async () => {
    if (!profile) return;
    if (!kyc || kyc.status !== 'verified') {
      setError('Please complete KYC verification before investing.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await initiatePayment({
        email: profile.email,
        amount: PLAN_AMOUNTS[selectedPlan],
        fullName: profile.full_name ?? '',
        phone: profile.phone ?? '',
        planLabel: selectedPlan,
        userId: profile.id,
        onSuccess: (_ref: string) => {
          setLoading(false);
          onSuccess(PLAN_AMOUNTS[selectedPlan], selectedPlan);
          onClose();
        },
        onCancel: () => {
          setLoading(false);
          setError('Payment was cancelled. Please try again.');
        },
      });
    } catch {
      setLoading(false);
      setError('Failed to initialize payment. Please contact support.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-dark-600 border border-lime-400/20 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold font-serif text-white mb-1">Start New Investment</h3>
        <p className="text-sm text-gray-400 mb-5">Choose your deposit amount. All plans earn 1.3% daily.</p>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto mb-5">
          {plans.map(([label, amount]) => (
            <button key={label} onClick={() => setSelectedPlan(label)}
              className={`p-3 rounded-xl text-left border transition-all ${selectedPlan === label ? 'border-lime-400 bg-lime-400/10' : 'border-lime-400/10 bg-dark-700/60 hover:border-lime-400/30'}`}>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-lime-400 mt-0.5">+{formatNaira(amount * 0.013)}/day</p>
            </button>
          ))}
        </div>

        <div className="bg-dark-700/60 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Investment Amount</span>
            <span className="font-bold text-white">{formatNaira(PLAN_AMOUNTS[selectedPlan])}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Daily Return (1.3%)</span>
            <span className="font-bold text-lime-400">{formatNaira(PLAN_AMOUNTS[selectedPlan] * 0.013)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">30-Day Earnings</span>
            <span className="font-bold text-lime-400">{formatNaira(PLAN_AMOUNTS[selectedPlan] * 0.013 * 30)}</span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {kyc?.status !== 'verified' && (
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3 mb-4">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            <p className="text-xs text-yellow-400">KYC verification required before investing</p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-lime-400/20 text-lime-400 text-sm font-semibold hover:bg-lime-400/10 transition-all">
            Cancel
          </button>
          <button onClick={handlePay} disabled={loading}
            className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3 rounded-xl hover:from-lime-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
            {loading ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" /> : 'Pay with Paystack'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Withdraw Modal ───
function WithdrawModal({ onClose, onRequest }: { onClose: () => void; onRequest: (amount: number) => void }) {
  const { user, requestWithdrawal } = useAuth();
  const profile = user?.profile;
  const kyc = user?.kyc;
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const walletBalance = profile?.wallet_balance ?? 0;

  const handleSubmit = async () => {
    const n = parseFloat(amount);
    if (!n || n < 500) { setError('Minimum withdrawal is ₦500'); return; }
    if (n > walletBalance) { setError('Insufficient balance'); return; }
    await requestWithdrawal(n);
    onRequest(n);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-dark-600 border border-lime-400/20 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold font-serif text-white mb-1">Request Withdrawal</h3>
        <p className="text-sm text-gray-400 mb-5">Withdrawals are processed within 24 hours to your verified bank account.</p>

        <div className="bg-dark-700/60 rounded-xl p-4 mb-5 flex justify-between items-center">
          <span className="text-sm text-gray-400">Available Balance</span>
          <span className="font-bold text-lime-400 text-lg">{formatNaira(walletBalance)}</span>
        </div>

        {kyc && (() => {
          const bankTx = user?.transactions.find(t => t.description === 'Bank details registered during KYC' && t.bank_name);
          return bankTx ? (
            <div className="bg-dark-700/60 rounded-xl p-4 mb-5 space-y-1">
              <p className="text-xs text-gray-500">Withdrawal destination</p>
              <p className="text-sm font-semibold text-white">{bankTx.bank_name}</p>
              <p className="text-sm text-gray-300">{bankTx.account_name} — {maskAccountNumber(bankTx.account_number ?? '')}</p>
            </div>
          ) : null;
        })()}

        <div className="space-y-1.5 mb-5">
          <label className="text-sm font-semibold text-gray-300">Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
            <input type="number" min="500" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-dark-700/60 border border-lime-400/10 rounded-xl pl-9 pr-4 py-3.5 text-white focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/10 transition-all text-sm"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {[500, 1000, 5000, walletBalance].map(v => (
              <button key={v} onClick={() => setAmount(v.toString())}
                className="flex-1 text-xs bg-dark-700 text-gray-400 hover:text-lime-400 py-1.5 rounded-lg transition-colors">
                {v >= 1000 ? formatNaira(v) : `₦${v}`}
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="px-5 py-3 rounded-xl border border-lime-400/20 text-lime-400 text-sm font-semibold hover:bg-lime-400/10 transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-3 rounded-xl hover:from-lime-300 transition-all">
            Request Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───
export default function Dashboard({ onLogout, onKYC }: { onLogout: () => void; onKYC: () => void }) {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'wallet' | 'investments' | 'referral' | 'settings'>('overview');
  const [showInvest, setShowInvest] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  if (!user) return null;

  const profile      = user.profile;
  const kyc          = user.kyc;
  const investments  = user.investments;
  const transactions = user.transactions;

  // Derived stats computed from real data
  const walletBalance  = profile.wallet_balance ?? 0;
  const totalEarned    = profile.total_earned ?? 0;
  const totalInvested  = profile.total_invested ?? 0;

  const totalDeposited = transactions
    .filter(t => t.type === 'deposit' && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);

  const totalWithdrawn = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);

  const referralTxs      = transactions.filter(t => t.type === 'referral_bonus');
  const referralEarnings = referralTxs.reduce((s, t) => s + t.amount, 0);
  const referralCount    = referralTxs.length;

  const referralCode = profile.referral_code;

  const kycBadge = kyc?.status === 'verified' ? '✅ Verified' : kyc?.status === 'pending' ? '⏳ Pending' : '⚠️ Not Verified';
  const kycColor = kyc?.status === 'verified' ? 'text-lime-400' : kyc?.status === 'pending' ? 'text-yellow-400' : 'text-red-400';

  const showNotif = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}${window.location.pathname}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showNotif('Referral link copied!');
  };

  const handleInvestSuccess = (_amount: number, _plan: string) => {
    refreshUser();
    showNotif('Investment activated! You are now earning 1.3% daily.');
  };

  const handleWithdrawal = (_amount: number) => {
    refreshUser();
    showNotif('Withdrawal request submitted. Processing within 24 hours.');
  };

  return (
    <div className="min-h-screen bg-dark-800 pb-20 lg:pb-0">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-lime-400 text-dark-800 font-semibold text-sm px-6 py-3 rounded-full shadow-xl animate-fade-in">
          {notification}
        </div>
      )}

      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-dark-800/95 backdrop-blur-xl border-b border-lime-400/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-lime-400/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-lime-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{(profile.full_name ?? 'User').split(' ')[0]}</p>
              <p className={`text-xs ${kycColor}`}>{kycBadge}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setBalanceHidden(!balanceHidden)} className="text-gray-400 hover:text-lime-400 transition-colors">
              {balanceHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
            <button onClick={logout} className="text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KYC Banner */}
        {!kyc && (
          <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">KYC Verification Required</p>
                <p className="text-xs text-gray-400">Complete verification to unlock deposits and withdrawals</p>
              </div>
            </div>
            <button onClick={onKYC} className="bg-yellow-400 text-dark-800 font-bold text-xs px-4 py-2 rounded-lg hover:bg-yellow-300 transition-all flex-shrink-0">
              Verify Now
            </button>
          </div>
        )}

        {/* Balance Card */}
        <div className="relative bg-gradient-to-br from-lime-400/10 via-lime-400/5 to-dark-600/40 border border-lime-400/20 rounded-2xl p-6 mb-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-lime-400/5 rounded-full blur-[60px]" />
          <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-1">Total Wallet Balance</p>
            <p className="text-4xl font-black font-serif text-white mb-1">
              {balanceHidden ? '₦ ****' : formatNaira(walletBalance)}
            </p>
            <p className="text-sm text-gray-400">
              Total Earned: <span className="text-lime-400 font-semibold">{balanceHidden ? '****' : formatNaira(totalEarned)}</span>
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowInvest(true)}
                className="flex items-center gap-2 bg-lime-400 hover:bg-lime-300 text-dark-800 font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                <Plus className="w-4 h-4" /> Invest
              </button>
              <button onClick={() => setShowWithdraw(true)} disabled={walletBalance < 500}
                className="flex items-center gap-2 border border-lime-400/30 text-lime-400 hover:bg-lime-400/10 font-bold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <Minus className="w-4 h-4" /> Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-dark-700/60 rounded-xl p-1 mb-6 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: <Activity className="w-4 h-4" /> },
            { key: 'wallet', label: 'Wallet', icon: <Wallet className="w-4 h-4" /> },
            { key: 'investments', label: 'Investments', icon: <TrendingUp className="w-4 h-4" /> },
            { key: 'referral', label: 'Referral', icon: <Gift className="w-4 h-4" /> },
            { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key ? 'bg-lime-400 text-dark-800' : 'text-gray-400 hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ─── OVERVIEW TAB ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Total ROI" value={balanceHidden ? '****' : formatNaira(totalEarned)} accent />
              <StatCard icon={<ArrowUpRight className="w-4 h-4" />} label="Total Deposited" value={balanceHidden ? '****' : formatNaira(totalDeposited)} />
              <StatCard icon={<ArrowDownLeft className="w-4 h-4" />} label="Total Withdrawn" value={balanceHidden ? '****' : formatNaira(totalWithdrawn)} />
              <StatCard icon={<Users className="w-4 h-4" />} label="Referral Earnings" value={balanceHidden ? '****' : formatNaira(referralEarnings)} sub={`${referralCount} referral${referralCount !== 1 ? 's' : ''}`} />
            </div>

            {/* Active Investments Live Counter */}
            {investments.filter(i => i.status === 'active').length > 0 && (
              <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                  <h3 className="font-bold text-white">Live Earnings Counter</h3>
                  <span className="text-xs bg-lime-400/10 text-lime-400 px-2 py-0.5 rounded-full">Real-time</span>
                </div>
                <div className="space-y-4">
                  {investments.filter(i => i.status === 'active').map(inv => (
                    <div key={inv.id} className="flex items-center justify-between bg-dark-700/60 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{inv.plan_id}</p>
                        <p className="text-xs text-gray-400">Started {new Date(inv.start_date).toLocaleDateString()}</p>
                      </div>
                      <LiveROICounter
                        id={inv.id ?? ''}
                        dailyRate={inv.amount * (inv.daily_rate ?? 0.013)}
                        totalEarned={inv.total_earned ?? 0}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {investments.length === 0 && (
              <div className="text-center py-16 bg-dark-600/20 border border-lime-400/5 rounded-2xl">
                <TrendingUp className="w-12 h-12 text-lime-400/20 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">No Active Investments</h3>
                <p className="text-gray-400 text-sm mb-6">Start your first investment to begin earning 1.3% daily</p>
                <button onClick={() => setShowInvest(true)}
                  className="bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold px-8 py-3 rounded-xl hover:from-lime-300 transition-all">
                  Invest Now
                </button>
              </div>
            )}

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
                <h3 className="font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          tx.type === 'deposit' ? 'bg-lime-400/10 text-lime-400' :
                          tx.type === 'withdrawal' ? 'bg-red-400/10 text-red-400' :
                          tx.type === 'roi' ? 'bg-emerald-400/10 text-emerald-400' :
                          'bg-purple-400/10 text-purple-400'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowUpRight className="w-4 h-4" /> :
                           tx.type === 'withdrawal' ? <ArrowDownLeft className="w-4 h-4" /> :
                           tx.type === 'roi' ? <TrendingUp className="w-4 h-4" /> :
                           <Gift className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tx.description ?? tx.type}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-lime-400'}`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatNaira(tx.amount)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          tx.status === 'success' ? 'bg-lime-400/10 text-lime-400' :
                          tx.status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                          'bg-red-400/10 text-red-400'
                        }`}>{tx.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── WALLET TAB ─── */}
        {activeTab === 'wallet' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5">
                <p className="text-xs text-gray-400 mb-1">Total Deposits</p>
                <p className="text-2xl font-bold text-white">{balanceHidden ? '****' : formatNaira(totalDeposited)}</p>
              </div>
              <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5">
                <p className="text-xs text-gray-400 mb-1">Total Withdrawn</p>
                <p className="text-2xl font-bold text-white">{balanceHidden ? '****' : formatNaira(totalWithdrawn)}</p>
              </div>
            </div>

            {kyc?.status === 'verified' && (() => {
              const bankTx = transactions.find(t => t.description === 'Bank details registered during KYC' && t.bank_name);
              return bankTx ? (
                <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5">
                  <p className="text-xs text-gray-400 mb-3">Bank Account</p>
                  <p className="font-bold text-white">{bankTx.bank_name}</p>
                  <p className="text-sm text-gray-300 mt-1">{bankTx.account_name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{maskAccountNumber(bankTx.account_number ?? '')}</p>
                </div>
              ) : null;
            })()}

            <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4">All Transactions</h3>
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between border-b border-lime-400/5 pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-white">{tx.description ?? tx.type}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleString()}</p>
                        {tx.reference && <p className="text-xs text-gray-600 font-mono">{tx.reference}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-lime-400'}`}>
                          {tx.type === 'withdrawal' ? '-' : '+'}{formatNaira(tx.amount)}
                        </p>
                        <span className={`text-xs ${tx.status === 'success' ? 'text-lime-400' : tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── INVESTMENTS TAB ─── */}
        {activeTab === 'investments' && (
          <div className="space-y-5">
            <button onClick={() => setShowInvest(true)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 transition-all">
              <Plus className="w-5 h-5" /> New Investment
            </button>

            {investments.length === 0 ? (
              <div className="text-center py-16 bg-dark-600/20 rounded-2xl border border-lime-400/5">
                <BarChart3 className="w-12 h-12 text-lime-400/20 mx-auto mb-4" />
                <p className="text-gray-400">No investments yet. Click above to start!</p>
              </div>
            ) : (
              investments.map(inv => {
                const days = (Date.now() - new Date(inv.start_date).getTime()) / 86400000;
                const progress = Math.min((days / 90) * 100, 100);
                return (
                  <div key={inv.id} className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-bold text-white">{inv.plan_id}</p>
                        <p className="text-xs text-gray-400">Started {new Date(inv.start_date).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${inv.status === 'active' ? 'bg-lime-400/10 text-lime-400' : 'bg-gray-400/10 text-gray-400'}`}>
                        {inv.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-dark-700/60 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Deposited</p>
                        <p className="text-sm font-bold text-white">{formatNaira(inv.amount)}</p>
                      </div>
                      <div className="bg-dark-700/60 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Daily Rate</p>
                        <p className="text-sm font-bold text-lime-400">1.3%</p>
                      </div>
                      <div className="bg-lime-400/5 border border-lime-400/10 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500">Total Earned</p>
                        {inv.status === 'active'
                          ? <LiveROICounter id={inv.id ?? ''} dailyRate={inv.amount * (inv.daily_rate ?? 0.013)} totalEarned={inv.total_earned ?? 0} />
                          : <p className="text-sm font-bold text-lime-400">{formatNaira(inv.total_earned ?? 0)}</p>}
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="text-gray-400">{Math.min(days, 90).toFixed(1)} / 90 days</span>
                      </div>
                      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── REFERRAL TAB ─── */}
        {activeTab === 'referral' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-lime-400/10 via-lime-400/5 to-dark-600/40 border border-lime-400/20 rounded-2xl p-6 text-center">
              <Gift className="w-12 h-12 text-lime-400 mx-auto mb-3" />
              <h3 className="text-2xl font-bold font-serif text-white mb-2">Earn ₦500 Per Referral</h3>
              <p className="text-gray-400 text-sm mb-6">Share your referral link. Earn ₦500 credited to your wallet for every friend who registers.</p>
              <div className="bg-dark-700/60 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <code className="text-lime-400 text-sm font-mono break-all">{referralCode}</code>
                <button onClick={copyReferralLink} className="ml-3 flex-shrink-0 p-2 bg-lime-400/10 hover:bg-lime-400/20 rounded-lg text-lime-400 transition-all">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button onClick={copyReferralLink}
                className="w-full bg-lime-400 hover:bg-lime-300 text-dark-800 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'Copied!' : 'Copy Referral Link'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-lime-400">{referralCount}</p>
                <p className="text-sm text-gray-400 mt-1">Total Referrals</p>
              </div>
              <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5 text-center">
                <p className="text-3xl font-black text-lime-400">{formatNaira(referralEarnings)}</p>
                <p className="text-sm text-gray-400 mt-1">Total Earned</p>
              </div>
            </div>

            <div className="bg-dark-600/40 border border-lime-400/10 rounded-xl p-5 space-y-3">
              <h4 className="font-bold text-white">How Referrals Work</h4>
              {[
                { step: '1', text: 'Share your unique referral link or code' },
                { step: '2', text: 'Friend registers using your link' },
                { step: '3', text: '₦500 is instantly credited to your wallet' },
                { step: '4', text: 'No limit on referrals — earn as much as you want!' },
              ].map(({ step, text }) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-lime-400 text-dark-800 text-xs font-bold flex items-center justify-center flex-shrink-0">{step}</div>
                  <p className="text-sm text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-lime-400/5">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-3">Account Info</p>
                {[
                  { label: 'Full Name',    value: profile.full_name ?? '—' },
                  { label: 'Email',        value: profile.email },
                  { label: 'Phone',        value: profile.phone ?? '—' },
                  { label: 'Member Since', value: new Date(profile.created_at).toLocaleDateString() },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2.5 border-b border-lime-400/5 last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className="text-sm font-medium text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={onKYC}
              className="w-full flex items-center justify-between bg-dark-600/40 border border-lime-400/10 rounded-xl p-5 hover:border-lime-400/20 transition-all">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-lime-400" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">KYC Verification</p>
                  <p className={`text-xs ${kycColor}`}>{kycBadge}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>

            <a href={`${WA_BASE}?text=Hello%20Arbalist%20Capital%2C%20I%20need%20account%20support.%20My%20email%20is%20${profile.email}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-between bg-dark-600/40 border border-lime-400/10 rounded-xl p-5 hover:border-lime-400/20 transition-all">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-lime-400" />
                <p className="text-sm font-semibold text-white">Contact Support</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </a>

            <button onClick={() => { logout(); onLogout(); }}
              className="w-full flex items-center justify-center gap-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 py-4 rounded-xl transition-all font-semibold text-sm">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-dark-800/95 backdrop-blur-xl border-t border-lime-400/10 z-40">
        <div className="flex">
          {[
            { key: 'overview', icon: <Activity className="w-5 h-5" />, label: 'Home' },
            { key: 'wallet', icon: <Wallet className="w-5 h-5" />, label: 'Wallet' },
            { key: 'investments', icon: <TrendingUp className="w-5 h-5" />, label: 'Invest' },
            { key: 'referral', icon: <Gift className="w-5 h-5" />, label: 'Refer' },
            { key: 'settings', icon: <Settings className="w-5 h-5" />, label: 'Account' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-all ${activeTab === tab.key ? 'text-lime-400' : 'text-gray-500'}`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {showInvest && <InvestModal onClose={() => setShowInvest(false)} onSuccess={handleInvestSuccess} />}
      {showWithdraw && <WithdrawModal onClose={() => setShowWithdraw(false)} onRequest={handleWithdrawal} />}
    </div>
  );
}
