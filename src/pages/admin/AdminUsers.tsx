import { useEffect, useState, useCallback } from 'react';
import {
  Search, User, ShieldCheck, Wallet, TrendingUp,
  ChevronLeft, ChevronRight, X, CheckCircle, Clock,
  XCircle, Edit3, PlusCircle, Eye,
} from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { formatNGN } from '@/lib/plans';
import toast from 'react-hot-toast';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

const KYC_BADGE: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  pending:   { label: 'Pending',   cls: 'bg-gray-400/10  text-gray-400  border-gray-400/20',   icon: <Clock      className="w-3 h-3" /> },
  submitted: { label: 'Submitted', cls: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20', icon: <Clock      className="w-3 h-3" /> },
  verified:  { label: 'Verified',  cls: 'bg-lime-400/10  text-lime-400  border-lime-400/20',   icon: <CheckCircle className="w-3 h-3" /> },
  rejected:  { label: 'Rejected',  cls: 'bg-red-400/10   text-red-400   border-red-400/20',    icon: <XCircle    className="w-3 h-3" /> },
};

function UserDetailModal({
  user, onClose, onCreditROI, onUpdateBalance,
}: {
  user: Profile;
  onClose: () => void;
  onCreditROI: (userId: string, amount: number, note: string) => Promise<void>;
  onUpdateBalance: (userId: string, balance: number) => Promise<void>;
}) {
  const [roiAmount,  setRoiAmount]  = useState('');
  const [roiNote,    setRoiNote]    = useState('');
  const [newBalance, setNewBalance] = useState(user.wallet_balance.toString());
  const [submitting, setSubmitting] = useState(false);
  const kycCfg = KYC_BADGE[user.kyc_status] ?? KYC_BADGE.pending;

  async function handleCreditROI() {
    const amt = parseFloat(roiAmount);
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return; }
    setSubmitting(true);
    await onCreditROI(user.id, amt, roiNote);
    setSubmitting(false);
    setRoiAmount(''); setRoiNote('');
  }

  async function handleSetBalance() {
    const bal = parseFloat(newBalance);
    if (isNaN(bal) || bal < 0) { toast.error('Enter a valid balance'); return; }
    setSubmitting(true);
    await onUpdateBalance(user.id, bal);
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-dark-600 border border-lime-400/15 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lime-400/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 font-bold">
              {user.full_name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-bold text-white">{user.full_name ?? 'Unknown'}</p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Wallet',   value: formatNGN(user.wallet_balance), color: 'text-lime-400' },
              { label: 'Invested', value: formatNGN(user.total_invested),  color: 'text-blue-400' },
              { label: 'Earned',   value: formatNGN(user.total_earned),    color: 'text-emerald-400' },
            ].map(s => (
              <div key={s.label} className="bg-dark-700/60 rounded-xl p-3 text-center">
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-dark-700/40 rounded-xl p-4 space-y-2">
            {[
              { k: 'Phone',        v: user.phone ?? '—'               },
              { k: 'KYC Status',   v: <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${kycCfg.cls}`}>{kycCfg.icon}{kycCfg.label}</span> },
              { k: 'Referral Code',v: user.referral_code              },
              { k: 'Referred By',  v: user.referred_by ?? '—'         },
              { k: 'Joined',       v: new Date(user.created_at).toLocaleDateString() },
            ].map(({ k, v }) => (
              <div key={k} className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>

          {/* Credit ROI */}
          <div className="bg-dark-700/40 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-lime-400" /> Credit ROI / Bonus
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Amount (₦)</label>
                <input
                  type="number" min="1" value={roiAmount} onChange={e => setRoiAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-dark-600 border border-lime-400/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400/30"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Note</label>
                <input
                  type="text" value={roiNote} onChange={e => setRoiNote(e.target.value)}
                  placeholder="e.g. Daily ROI"
                  className="w-full bg-dark-600 border border-lime-400/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-lime-400/30"
                />
              </div>
            </div>
            <button
              onClick={handleCreditROI} disabled={submitting}
              className="w-full bg-lime-400/10 border border-lime-400/20 text-lime-400 font-semibold text-sm py-2.5 rounded-lg hover:bg-lime-400/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Processing…' : 'Credit Amount'}
            </button>
          </div>

          {/* Set Balance */}
          <div className="bg-dark-700/40 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-white flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-orange-400" /> Override Wallet Balance
            </p>
            <div className="flex gap-2">
              <input
                type="number" min="0" value={newBalance} onChange={e => setNewBalance(e.target.value)}
                className="flex-1 bg-dark-600 border border-lime-400/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-orange-400/30"
              />
              <button
                onClick={handleSetBalance} disabled={submitting}
                className="bg-orange-400/10 border border-orange-400/20 text-orange-400 font-semibold text-sm px-4 py-2.5 rounded-lg hover:bg-orange-400/20 transition-all disabled:opacity-50"
              >
                Set
              </button>
            </div>
            <p className="text-xs text-gray-500">⚠️ This directly overrides the user's wallet balance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { fetchUsers, creditROI, updateUserProfile } = useAdmin();
  const [users,   setUsers]   = useState<Profile[]>([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(0);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Profile | null>(null);
  const PAGE_SIZE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchUsers(search, page, PAGE_SIZE);
    setUsers(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [search, page, fetchUsers]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    setPage(0);
  }, [search]);

  async function handleCreditROI(userId: string, amount: number, note: string) {
    const { error } = await creditROI(userId, amount, note);
    if (error) toast.error(error.message);
    else { toast.success(`Credited ${formatNGN(amount)} to user`); load(); }
  }

  async function handleUpdateBalance(userId: string, balance: number) {
    const { error } = await updateUserProfile(userId, { wallet_balance: balance });
    if (error) toast.error(error.message);
    else { toast.success('Balance updated'); load(); }
  }

  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
            <User className="w-6 h-6 text-lime-400" /> Users
          </h1>
          <p className="text-gray-400 text-sm mt-1">{total.toLocaleString()} total registered users</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-600/60 border border-lime-400/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-lime-400/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-dark-600/40 border border-lime-400/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-lime-400/10">
                {['User', 'KYC', 'Wallet', 'Invested', 'Earned', 'Joined', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5 first:pl-6 last:pr-6">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-lime-400/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <div className="w-7 h-7 border-2 border-lime-400/30 border-t-lime-400 rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">No users found</td>
                </tr>
              ) : users.map((u) => {
                const kyc = KYC_BADGE[u.kyc_status] ?? KYC_BADGE.pending;
                return (
                  <tr key={u.id} className="hover:bg-dark-500/20 transition-all">
                    <td className="px-5 py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lime-400/10 flex items-center justify-center text-lime-400 text-xs font-bold flex-shrink-0">
                          {u.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate max-w-[140px]">{u.full_name ?? '—'}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[140px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold border px-2 py-0.5 rounded-full ${kyc.cls}`}>
                        {kyc.icon}{kyc.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-lime-400">{formatNGN(u.wallet_balance)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-white">{formatNGN(u.total_invested)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-emerald-400">{formatNGN(u.total_earned)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4 pr-6">
                      <button
                        onClick={() => setSelected(u)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-lime-400 transition-colors font-medium"
                      >
                        <Eye className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-lime-400/10">
            <p className="text-xs text-gray-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="p-2 rounded-lg border border-lime-400/10 text-gray-400 hover:text-lime-400 hover:border-lime-400/30 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400">{page + 1} / {pages}</span>
              <button
                onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1}
                className="p-2 rounded-lg border border-lime-400/10 text-gray-400 hover:text-lime-400 hover:border-lime-400/30 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <UserDetailModal
          user={selected}
          onClose={() => setSelected(null)}
          onCreditROI={handleCreditROI}
          onUpdateBalance={handleUpdateBalance}
        />
      )}
    </div>
  );
}
