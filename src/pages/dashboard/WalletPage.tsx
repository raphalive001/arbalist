import { useEffect, useState } from 'react';
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, Clock, CheckCircle,
  XCircle, Copy, MessageCircle, AlertCircle, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { formatNGN } from '@/lib/plans';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type Transaction  = Database['public']['Tables']['transactions']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
type TxInsert     = Database['public']['Tables']['transactions']['Insert'];

const BANKS = [
  'Access Bank', 'GTBank', 'First Bank', 'Zenith Bank', 'UBA',
  'Fidelity Bank', 'FCMB', 'Sterling Bank', 'Opay', 'Kuda Bank',
  'Moniepoint', 'Palmpay', 'Wema Bank', 'Union Bank', 'Polaris Bank',
];

const WHATSAPP_NUMBER = '2349054416277';

export default function WalletPage() {
  const { profile, refetchProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [tab, setTab] = useState<'overview' | 'deposit' | 'withdraw'>('overview');

  // Withdraw form
  const [amount,     setAmount]     = useState('');
  const [bankName,   setBankName]   = useState('');
  const [accNumber,  setAccNumber]  = useState('');
  const [accName,    setAccName]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function loadTransactions() {
    if (!profile) return;
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setTransactions(data);
    setLoading(false);
  }

  useEffect(() => { loadTransactions(); }, [profile?.id]);

  // ── Copy bank details ────────────────────────────────────────────
  function copyBankDetails() {
    const text =
      `Bank: Opay / First Bank\nAccount Name: Arbalist Capital\nAccount Number: 8104587652\n\nSend payment proof to WhatsApp: +${WHATSAPP_NUMBER}`;
    navigator.clipboard.writeText(text);
    toast.success('Bank details copied!');
  }

  function openWhatsApp(msg: string) {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  // ── Withdrawal request ───────────────────────────────────────────
  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!profile) return;
    if (!amt || amt < 5000)                        { toast.error('Minimum withdrawal is ₦5,000'); return; }
    if (amt > (profile.wallet_balance ?? 0))       { toast.error('Insufficient wallet balance'); return; }
    if (profile.kyc_status !== 'verified')         { toast.error('Complete KYC verification before withdrawing'); return; }
    if (!bankName || !accNumber || !accName)       { toast.error('Fill in all bank account details'); return; }

    setSubmitting(true);
    const ref = `WDR-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Insert pending withdrawal transaction
    const txRow: TxInsert = {
      user_id:        profile.id,
      type:           'withdrawal',
      amount:         amt,
      status:         'pending',
      reference:      ref,
      bank_name:      bankName,
      account_number: accNumber,
      account_name:   accName,
      description:    `Withdrawal to ${bankName}`,
    };
    const { error: txErr } = await supabase.from('transactions').insert(txRow);

    if (txErr) { toast.error(txErr.message); setSubmitting(false); return; }

    // Deduct from wallet immediately (held pending admin approval)
    const profileUpdate: ProfileUpdate = {
      wallet_balance: (profile.wallet_balance ?? 0) - amt,
    };
    await supabase.from('profiles').update(profileUpdate).eq('id', profile.id);

    refetchProfile?.();
    await loadTransactions();

    toast.success('Withdrawal request submitted! Processing within 24 hrs.');
    setAmount(''); setBankName(''); setAccNumber(''); setAccName('');
    setTab('overview');
    setSubmitting(false);

    // Auto-open WhatsApp to notify admin
    openWhatsApp(
      `Hello Arbalist Capital,\n\nI have submitted a withdrawal request.\n\nName: ${profile.full_name}\nEmail: ${profile.email}\nAmount: ${formatNGN(amt)}\nBank: ${bankName}\nAccount: ${accNumber} (${accName})\nRef: ${ref}\n\nPlease process.`
    );
  }

  // ── UI helpers ───────────────────────────────────────────────────
  const txIcon: Record<string, React.ReactNode> = {
    deposit:        <ArrowDownCircle className="w-5 h-5 text-lime-400"   />,
    withdrawal:     <ArrowUpCircle   className="w-5 h-5 text-red-400"    />,
    roi:            <TrendingUp       className="w-5 h-5 text-blue-400"   />,
    referral_bonus: <ArrowDownCircle className="w-5 h-5 text-yellow-400" />,
  };
  const statusIcon = (s: string) =>
    s === 'success' ? <CheckCircle className="w-4 h-4 text-lime-400"   /> :
    s === 'pending' ? <Clock       className="w-4 h-4 text-yellow-400" /> :
                      <XCircle     className="w-4 h-4 text-red-400"    />;

  const inputCls = 'w-full bg-dark-700/60 border border-lime-400/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-lime-400/40 focus:ring-1 focus:ring-lime-400/10 transition-all text-sm';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-lime-400" /> Wallet
        </h1>
        <p className="mt-1 text-gray-400 text-sm">Manage your funds and transactions</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-lime-400/15 via-lime-400/5 to-dark-600/40 border border-lime-400/20 rounded-2xl p-6">
        <p className="text-sm text-gray-400">Available Balance</p>
        <p className="text-4xl font-bold font-serif text-white mt-1">{formatNGN(profile?.wallet_balance ?? 0)}</p>
        <div className="flex gap-6 mt-4 pt-4 border-t border-lime-400/10">
          <div>
            <p className="text-xs text-gray-500">Total Invested</p>
            <p className="text-sm font-bold text-blue-400">{formatNGN(profile?.total_invested ?? 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Earned</p>
            <p className="text-sm font-bold text-emerald-400">{formatNGN(profile?.total_earned ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-dark-600/40 border border-lime-400/10 rounded-2xl p-1">
        {([
          { key: 'overview', label: 'Transactions' },
          { key: 'deposit',  label: 'Fund Wallet'  },
          { key: 'withdraw', label: 'Withdraw'      },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              tab === t.key ? 'bg-lime-400 text-dark-800 shadow-lg' : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4">Transaction History</h2>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-4 py-3.5 border-b border-lime-400/5 last:border-0">
                  <div className="flex-shrink-0">{txIcon[tx.type] ?? txIcon.deposit}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white capitalize truncate">
                      {tx.type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{tx.description}</p>
                    <p className="text-xs text-gray-600">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${tx.type === 'withdrawal' ? 'text-red-400' : 'text-lime-400'}`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}{formatNGN(tx.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {statusIcon(tx.status)}
                      <span className="text-xs text-gray-500 capitalize">{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── DEPOSIT TAB ── */}
      {tab === 'deposit' && (
        <div className="space-y-4">
          <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Fund Your Wallet</h2>
            <p className="text-sm text-gray-400">
              Transfer to our bank account and send your payment proof via WhatsApp.
              Your wallet will be credited within <span className="text-lime-400 font-semibold">15–30 minutes</span>.
            </p>

            {/* Bank details card */}
            <div className="bg-dark-700/60 border border-lime-400/10 rounded-xl p-5 space-y-3">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Bank Transfer Details</p>
              {[
                { label: 'Bank Name',      value: 'Opay / First Bank'    },
                { label: 'Account Name',   value: 'Arbalist Capital'     },
                { label: 'Account Number', value: '8104587652'           },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-bold text-white">{value}</span>
                </div>
              ))}
            </div>

            {/* Copy + WhatsApp buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={copyBankDetails}
                className="flex items-center justify-center gap-2 bg-dark-700/60 border border-lime-400/10 hover:border-lime-400/30 text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
              >
                <Copy className="w-4 h-4" /> Copy Details
              </button>
              <button
                onClick={() => openWhatsApp(
                  `Hello Arbalist Capital,\n\nI just made a deposit.\n\nName: ${profile?.full_name}\nEmail: ${profile?.email}\n\nPlease find attached payment proof.`
                )}
                className="flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-semibold py-3.5 rounded-xl hover:bg-[#25D366]/20 transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4" /> Send Proof
              </button>
            </div>

            {/* Steps */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Steps to fund wallet:</p>
              {[
                'Copy the bank details above',
                'Transfer your desired amount',
                'Screenshot your payment receipt',
                'Tap "Send Proof" and send via WhatsApp',
                'Your wallet is credited within 15–30 minutes',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-lime-400/20 text-lime-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-300">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick amounts */}
          <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-5">
            <p className="text-sm font-semibold text-gray-300 mb-3">Common Amounts</p>
            <div className="grid grid-cols-3 gap-2">
              {[50000, 100000, 200000, 300000, 500000, 1000000].map(amt => (
                <button
                  key={amt}
                  onClick={() => openWhatsApp(
                    `Hello Arbalist Capital,\n\nI want to deposit ${formatNGN(amt)} into my wallet.\n\nName: ${profile?.full_name}\nEmail: ${profile?.email}\n\nPlease provide payment instructions.`
                  )}
                  className="py-2.5 text-xs font-semibold rounded-xl bg-dark-700/60 border border-lime-400/10 text-gray-300 hover:border-lime-400/30 hover:text-lime-400 transition-all"
                >
                  {formatNGN(amt)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WITHDRAW TAB ── */}
      {tab === 'withdraw' && (
        <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-5">Withdraw to Bank</h2>

          {profile?.kyc_status !== 'verified' && (
            <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4 mb-5">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">KYC Verification Required</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  <a href="/dashboard/kyc" className="underline hover:text-yellow-300">Complete KYC</a> before requesting withdrawals.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount (₦) <span className="text-gray-500 text-xs">— minimum ₦5,000</span>
              </label>
              <input
                type="number" min="5000" value={amount}
                onChange={e => setAmount(e.target.value)}
                className={inputCls} placeholder="Enter amount"
              />
              {/* Quick select */}
              <div className="grid grid-cols-4 gap-1.5 mt-2">
                {[5000, 10000, 50000, profile?.wallet_balance ?? 0].map(v => (
                  <button key={v} type="button" onClick={() => setAmount(v.toString())}
                    className="text-xs bg-dark-700/60 border border-lime-400/10 text-gray-400 hover:text-lime-400 py-1.5 rounded-lg transition-colors">
                    {formatNGN(v)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bank Name</label>
              <select value={bankName} onChange={e => setBankName(e.target.value)} className={inputCls}>
                <option value="">-- Select Bank --</option>
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Account Number</label>
              <input
                type="text" maxLength={10} value={accNumber}
                onChange={e => setAccNumber(e.target.value.replace(/\D/g, ''))}
                className={inputCls} placeholder="10-digit account number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Account Name</label>
              <input
                type="text" value={accName}
                onChange={e => setAccName(e.target.value)}
                className={inputCls} placeholder="Name exactly as on your bank account"
              />
            </div>

            <div className="bg-dark-700/60 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-gray-400">Available Balance</span>
              <span className="font-bold text-lime-400">{formatNGN(profile?.wallet_balance ?? 0)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || profile?.kyc_status !== 'verified'}
              className="w-full bg-gradient-to-r from-lime-400 to-lime-500 text-dark-800 font-bold py-4 rounded-xl hover:from-lime-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting
                ? <div className="w-5 h-5 border-2 border-dark-800 border-t-transparent rounded-full animate-spin" />
                : 'Request Withdrawal'
              }
            </button>
            <p className="text-xs text-center text-gray-500">
              Withdrawals are processed manually within 24 business hours.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
